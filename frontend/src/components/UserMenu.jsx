import { useState, useRef, useEffect } from "react";

export default function UserMenu({ trigger, children, className = "", direction = "down" }) {
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

  return (
    <div className={`user-menu${className ? " " + className : ""}`} ref={ref}>
      {triggerEl}
      {open && (
        <div className={`user-menu__dropdown${direction === "up" ? " user-menu__dropdown--up" : ""}`} role="menu">
          {typeof children === "function" ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}
