function Loader() {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <div>Cargando...</div>
    </div>
  );
}

export default Loader;
