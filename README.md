# MoveEase 3.0 — Working Full-Stack Lab Project

MoveEase is a household relocation platform: **quote → booking → simulated payment → tracking → delivery → support**.

## What was fixed

- Removed the endless `ECONNREFUSED 127.0.0.1:27017` retry loop.
- Added automatic embedded MongoDB fallback for lab/demo machines.
- If a local MongoDB is already running, MoveEase uses it.
- If `MONGO_URI` points to MongoDB Atlas or another remote server, MoveEase uses that server.
- Demo admin and vehicles are automatically created on first backend startup.
- Added working customer profile update/password change.
- Added admin shipment-status controls.
- Improved cancellation/support error handling.
- Kept free OpenStreetMap Nominatim + OSRM route calculation.
- Added Windows one-click launcher: `start-moveease.bat`.

## Requirements

- Node.js 18+ (Node 20+ recommended)
- Internet connection on the first backend installation/run because `mongodb-memory-server` may download its MongoDB binary.
- No MongoDB installation is required for the default lab/demo mode.

## Easiest Windows setup

1. Extract the ZIP.
2. Double-click `start-moveease.bat`.
3. Wait for the two terminal windows.
4. Open http://localhost:5173

The launcher installs dependencies and starts frontend + backend.

## Manual setup

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend in another terminal:
```bash
cd frontend
npm install
npm run dev
```

Backend health:
http://localhost:5000/api/health

Frontend:
http://localhost:5173

## Database modes

### Default: automatic embedded MongoDB

`backend/.env` can leave `MONGO_URI` empty:

```env
AUTO_MONGO=true
MONGO_URI=
```

If local MongoDB is unavailable, the backend starts an embedded MongoDB automatically.

### Local MongoDB

```env
AUTO_MONGO=true
MONGO_URI=mongodb://127.0.0.1:27017/moveease
```

### MongoDB Atlas

```env
AUTO_MONGO=false
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/moveease
```

## Demo admin

Email: `admin@moveease.com`
Password: `admin123`

Customers can register normally.

## Main workflow

1. Enter pickup and delivery addresses.
2. Calculate road distance.
3. Select vehicle and services.
4. Calculate estimate.
5. Register/login.
6. Confirm booking.
7. Simulate payment.
8. Receive Booking ID.
9. Track shipment publicly.
10. Driver/admin updates shipment status.
11. Customer sees updated status.
12. Customer can cancel eligible bookings, update profile, and raise support tickets.

## Free route API

MoveEase uses:
- OpenStreetMap Nominatim for address geocoding.
- OSRM for road-distance routing.

No paid API key is required. Public services have usage policies; use them responsibly.

## Payment

Payment is simulated for the Software Engineering Lab project. No real money is charged.

## Important first-run note

The first `npm install` can take a little time. On first embedded-Mongo startup, MongoDB Memory Server may download its MongoDB binary. This is normal.

If your network blocks that download, use local MongoDB or MongoDB Atlas and set `MONGO_URI`.
