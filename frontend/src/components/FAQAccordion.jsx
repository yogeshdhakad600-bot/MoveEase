import { useState } from 'react';

const faqs = [
  ['Do you provide packing materials?', 'Yes — boxes, bubble wrap and tape are included whenever packing is selected in your quote.'],
  ['Can I change my moving date?', 'You can reschedule from your Booking ID up to 48 hours before pickup at no charge.'],
  ['Is my shipment insured?', 'Transit insurance is optional and can be added at quote time for full-value cover.'],
  ['How is the price calculated?', 'Vehicle type, distance, floors without a lift, and any packing or loading help you select.'],
];

export default function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <section className="section" id="faq">
      <div className="section-head"><h2>Frequently asked</h2></div>
      {faqs.map(([q, a], i) => (
        <div className={`faq-item ${openIdx === i ? 'open' : ''}`} key={q}>
          <div className="faq-q" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
            {q}<span className="faq-plus">+</span>
          </div>
          {openIdx === i && <div className="faq-a"><p>{a}</p></div>}
        </div>
      ))}
    </section>
  );
}
