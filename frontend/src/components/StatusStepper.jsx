export default function StatusStepper({ statusFlow, currentStatus }) {
  const idx = statusFlow.indexOf(currentStatus);
  return (
    <div className="stepper">
      {statusFlow.filter((s) => s !== 'Cancelled').map((s, i) => (
        <div className={`tstep ${i < idx ? 'done' : i === idx ? 'current' : ''}`} key={s}>
          <div className="dot" />
          <span>{s}</span>
        </div>
      ))}
    </div>
  );
}
