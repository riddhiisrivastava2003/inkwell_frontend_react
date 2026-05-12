function EmptyState({ title, subtitle, action }) {
  return (
    <div className="card glass-card p-4 text-center border-0">
      <h5 className="mb-2">{title}</h5>
      <p className="text-secondary mb-3">{subtitle}</p>
      {action}
    </div>
  );
}

export default EmptyState;

