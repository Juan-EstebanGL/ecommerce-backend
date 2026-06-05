function Badge({ children, status = '' }) {
  const cls = `badge ${status ? `badge--${status}` : ''}`;
  return <span className={cls}>{children}</span>;
}

export default Badge;
