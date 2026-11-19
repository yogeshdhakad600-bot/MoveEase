const steps = [
  ['01', 'Tell us about the move', 'Add your pickup, destination, home size and preferred date.'],
  ['02', 'See a clear estimate', 'Distance and selected services feed into a transparent quote.'],
  ['03', 'Book your move', 'Choose a vehicle, confirm details and use the simulated payment flow.'],
  ['04', 'Track every milestone', 'Follow packing, pickup, transit and delivery from one screen.'],
  ['05', 'Arrive and settle', 'The crew unloads your items and the journey closes with a review.'],
];
export default function HowItWorks() {
  return <section className="section-v2 how-v2" id="how"><div className="section-head-v2"><span className="eyebrow-v2">SIMPLE BY DESIGN</span><h2>From quote to doorstep.</h2></div><div className="how-grid-v2">{steps.map(([n,t,d]) => <div className="how-card-v2" key={n}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div></div>)}</div></section>;
}
