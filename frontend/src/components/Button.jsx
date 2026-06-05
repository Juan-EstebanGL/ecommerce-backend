function Button({ children, disabled = false, onClick, type = "button", variant = "primary" }) {
  const cls = `btn ${variant === 'ghost' ? 'btn--ghost' : 'btn--primary'}`;

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export default Button;
