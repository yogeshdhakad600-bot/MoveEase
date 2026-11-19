# MoveEase — Software Engineering Documentation

## 1. Requirement Analysis

### 1.1 Functional Requirements
- FR1: A visitor can request an instant quote by entering property type, vehicle, distance, floors, and optional services.
- FR2: A registered customer can convert a quote into a booking with pickup/delivery addresses and a moving date.
- FR3: A customer can pay for a booking via UPI, Card, Net Banking, or Cash, optionally applying a coupon code.
- FR4: The system generates a unique Booking ID on booking creation.
- FR5: Anyone with a Booking ID can view its current status without logging in.
- FR6: A driver can view assigned deliveries, advance shipment status, and upload delivery proof.
- FR7: An admin can view platform-wide statistics, assign drivers/vehicles to bookings, and manage users and vehicles.
- FR8: A customer can raise a support ticket and leave a review after delivery.
- FR9: Authentication is required for booking, payment, and all dashboard actions; roles gate which actions are permitted.

### 1.2 Non-Functional Requirements
- NFR1 (Security): Passwords hashed with bcrypt; JWT-based session; role-based authorization on every protected route; input validation on auth endpoints.
- NFR2 (Usability): Mobile-responsive UI; clear status labels; instant quote feedback.
- NFR3 (Performance): Quote calculation and status lookups resolve in a single indexed query (`bookingId` is unique-indexed).
- NFR4 (Maintainability): Layered structure (routes → controllers → models) with a single source of truth for pricing logic (`utils/calculateQuote.js`).
- NFR5 (Availability): Stateless API behind Express, horizontally scalable; MongoDB replica set recommended for production.

## 2. Use Case Diagram

```mermaid
flowchart LR
  Customer((Customer))
  Driver((Driver))
  Admin((Admin))
  Guest((Guest))

  Guest --> UC1[Get Quote]
  Guest --> UC2[Track Shipment]
  Customer --> UC3[Book Move]
  Customer --> UC4[Make Payment]
  Customer --> UC5[Manage My Bookings]
  Customer --> UC6[Raise Support Ticket]
  Customer --> UC7[Leave Review]
  Driver --> UC8[View Assigned Deliveries]
  Driver --> UC9[Update Shipment Status]
  Driver --> UC10[Upload Delivery Proof]
  Admin --> UC11[Manage Bookings]
  Admin --> UC12[Assign Driver and Vehicle]
  Admin --> UC13[Manage Users and Vehicles]
  Admin --> UC14[View Revenue and Reports]
```

## 3. Entity-Relationship Diagram

```mermaid
erDiagram
  USER ||--o{ BOOKING : "places (customer)"
  USER ||--o{ BOOKING : "delivers (driver)"
  VEHICLE ||--o{ BOOKING : "assigned to"
  BOOKING ||--|| PAYMENT : "paid by"
  BOOKING ||--o{ TRACKING : "has events"
  BOOKING ||--o{ REVIEW : "receives"
  BOOKING ||--o{ SUPPORT_TICKET : "may raise"
  USER ||--o{ NOTIFICATION : "receives"

  USER {
    ObjectId id PK
    string name
    string email UK
    string phone
    string passwordHash
    string role "customer|driver|admin"
    string licenseNumber
    ObjectId vehicleAssigned FK
  }
  VEHICLE {
    ObjectId id PK
    string type
    string registrationNumber UK
    number baseFare
    number perKmRate
    string status
  }
  BOOKING {
    ObjectId id PK
    string bookingId UK
    ObjectId customer FK
    ObjectId driver FK
    ObjectId vehicle FK
    string pickupAddress
    string deliveryAddress
    date movingDate
    string propertyType
    number distanceKm
    number estimatedCost
    string status
  }
  PAYMENT {
    ObjectId id PK
    ObjectId booking FK
    number amount
    string method
    string transactionRef UK
  }
  TRACKING {
    ObjectId id PK
    ObjectId booking FK
    string status
    date timestamp
  }
  REVIEW {
    ObjectId id PK
    ObjectId booking FK
    ObjectId customer FK
    number rating
  }
  SUPPORT_TICKET {
    ObjectId id PK
    ObjectId customer FK
    string subject
    string status
  }
  NOTIFICATION {
    ObjectId id PK
    ObjectId user FK
    boolean read
  }
```

## 4. Class Diagram (backend domain model)

```mermaid
classDiagram
  class User {
    +String name
    +String email
    +String role
    +comparePassword(candidate)
  }
  class Vehicle {
    +String type
    +Number baseFare
    +Number perKmRate
    +String status
  }
  class Booking {
    +String bookingId
    +String status
    +Number estimatedCost
    +Object quoteBreakdown
    +STATUS_FLOW
  }
  class Payment {
    +Number amount
    +String method
    +String transactionRef
  }
  class Tracking {
    +String status
    +Date timestamp
  }
  User "1" --> "many" Booking : places
  Vehicle "1" --> "many" Booking : fulfills
  Booking "1" --> "1" Payment : settles via
  Booking "1" --> "many" Tracking : logs
```

## 5. Data Flow Diagram (Level 0 & 1)

```mermaid
flowchart TD
  subgraph L0[Level 0 — Context]
    C1[Customer] --> S0((MoveEase System))
    D1[Driver] --> S0
    A1[Admin] --> S0
    S0 --> C1
    S0 --> D1
    S0 --> A1
  end
```

```mermaid
flowchart TD
  Cust[Customer] -->|quote request| P1[1.0 Calculate Quote]
  P1 -->|reads| DVeh[(Vehicle DB)]
  P1 -->|quote| Cust
  Cust -->|booking details| P2[2.0 Create Booking]
  P2 -->|writes| DBook[(Booking DB)]
  Cust -->|payment info| P3[3.0 Process Payment]
  P3 -->|writes| DPay[(Payment DB)]
  P3 -->|update status| DBook
  Driver[Driver] -->|status update| P4[4.0 Update Tracking]
  P4 -->|writes| DTrack[(Tracking DB)]
  P4 -->|updates| DBook
  AnyUser[Guest/Customer] -->|booking ID| P5[5.0 Track Shipment]
  P5 -->|reads| DBook
  P5 -->|reads| DTrack
```

## 6. Sequence Diagram — Quote to Delivery

```mermaid
sequenceDiagram
  actor Customer
  participant FE as React Frontend
  participant API as Express API
  participant DB as MongoDB
  actor Driver

  Customer->>FE: Fill quote form
  FE->>API: POST /api/quote
  API->>DB: Find vehicle, compute breakdown
  API-->>FE: { breakdown, total }
  Customer->>FE: Confirm booking details
  FE->>API: POST /api/bookings (JWT)
  API->>DB: Create Booking + initial Tracking event
  API-->>FE: { bookingId, estimatedCost }
  Customer->>FE: Choose payment method
  FE->>API: POST /api/payments
  API->>DB: Create Payment record
  API-->>FE: Receipt
  Driver->>API: PATCH /api/tracking/:bookingId (status)
  API->>DB: Append status + Tracking event
  Customer->>FE: Enter Booking ID
  FE->>API: GET /api/tracking/:bookingId
  API-->>FE: Current status + history
```

## 7. Activity Diagram — Booking Lifecycle

```mermaid
flowchart TD
  Start([Start]) --> A[Get quote]
  A --> B{Logged in?}
  B -- No --> C[Register / Login]
  C --> D[Create booking]
  B -- Yes --> D
  D --> E[Choose payment method]
  E --> F{Payment success?}
  F -- No --> E
  F -- Yes --> G[Booking Confirmed]
  G --> H[Packing]
  H --> I[Picked Up]
  I --> J[In Transit]
  J --> K[Out for Delivery]
  K --> L[Delivered]
  L --> M[Leave review]
  M --> End([End])
```

## 8. System Architecture

```mermaid
flowchart LR
  subgraph Client
    RC[React SPA - Vite]
  end
  subgraph Server
    EX[Express REST API]
    MW[JWT Auth + Role Middleware]
  end
  subgraph Data
    MDB[(MongoDB)]
  end
  RC <-->|HTTPS / JSON| EX
  EX --> MW
  MW --> EX
  EX <-->|Mongoose ODM| MDB
```

## 9. Database Schema (collections)

| Collection | Key fields | Notes |
|---|---|---|
| users | email (unique), role, passwordHash | role ∈ {customer, driver, admin} |
| vehicles | type, baseFare, perKmRate, status | seeded via `seed/seedVehicles.js` |
| bookings | bookingId (unique), customer, driver, vehicle, status | status enum drives the tracking stepper |
| payments | booking, amount, method, transactionRef (unique) | one payment per booking in this MVP |
| trackings | booking, status, timestamp | append-only audit trail |
| reviews | booking, customer, rating | one review per completed booking (not enforced at schema level) |
| supporttickets | customer, booking, status | admin responds via `reply` field |
| notifications | user, title, read | model present; delivery channel not yet wired |

## 10. Test Cases (sample)

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| TC01 | Quote calculation | Submit vehicle + distance + services | Breakdown and total returned, matches formula |
| TC02 | Duplicate registration | Register with an email already in use | 400 "Email already registered" |
| TC03 | Booking without auth | POST /api/bookings with no token | 401 "Not authorized, no token" |
| TC04 | Coupon discount | Pay with couponCode=MOVE10 | Amount reduced by 10% of estimatedCost |
| TC05 | Cross-customer access | Customer A requests Customer B's booking by ID | 403 Forbidden |
| TC06 | Driver status update | Driver PATCHes a booking not assigned to them | 403 "Not your assigned booking" |
| TC07 | Tracking lookup | GET /api/tracking/:bookingId with valid ID | 200 with booking, history, statusFlow |
| TC08 | Admin driver assignment | Admin assigns driver+vehicle to a booking | Booking.driver set, Vehicle.status = assigned |

## 11. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| JWT secret leakage | Low | High | Store in environment variables / secrets manager, rotate periodically |
| Double payment on retry | Medium | Medium | Add idempotency key on POST /api/payments before production use |
| Driver over-assignment (double-booked) | Medium | Medium | Add a vehicle-availability check before assignment |
| No rate limiting on auth routes | Medium | Medium | Add `express-rate-limit` on /api/auth/* |
| Delivery proof stored as raw URL | Low | Low | Replace with signed upload (multer + S3/Cloudinary) before production |
| Single payment record per booking | Low | Low | Fine for MVP; extend schema for partial/split payments if needed |
