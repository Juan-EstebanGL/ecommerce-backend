import { useState, useRef, useEffect } from "react";

export default function UserMenu({ trigger, children, className = "", dropdownClassName = "", direction = "down" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const close = () => setOpen(false);

  const triggerEl = (
    <div className="user-menu__trigger" onClick={() => setOpen((p) => !p)}>
      {trigger}
    </div>
  );

  const dropdownClasses = [
    "user-menu__dropdown",
    direction === "up" ? "user-menu__dropdown--up" : "",
    dropdownClassName,
  ].filter(Boolean).join(" ");

  return (
    <div className={`user-menu${className ? " " + className : ""}`} ref={ref}>
      {triggerEl}
      {open && (
        <div className={dropdownClasses} role="menu">
          {typeof children === "function" ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}
