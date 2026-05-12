function Loader({ text = 'Loading...' }) {
  return (
    <div className="d-flex align-items-center justify-content-center py-5 gap-3 text-secondary">
      <div className="spinner-border text-primary" role="status" />
      <span>{text}</span>
    </div>
  );
}

export default Loader;

