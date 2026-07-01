import { useState, useEffect } from "react";
import { showWarning } from "../utils/alerts";

function QuantityInput({ value, min = 1, max: maxProp, onChange, disabled = false }) {
  const max = maxProp ?? Infinity;
  const [localValue, setLocalValue] = useState(() => String(value));

  const maxLength = max === Infinity ? undefined : String(max).length;

  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const parsedLocal = parseInt(localValue, 10);
  const showHint = localValue !== "" && /^\d+$/.test(localValue) && parsedLocal > max;

  const commitValue = (raw) => {
    const trimmed = raw.trim();
    if (trimmed === "") {
      setLocalValue(String(value));
      return;
    }
    if (/[.,]/.test(trimmed)) {
      showWarning("Solo se permiten números enteros", "Por favor ingresa un número sin decimales.");
      setLocalValue(String(value));
      return;
    }
    if (!/^\d+$/.test(trimmed)) {
      showWarning("Solo se permiten números enteros", "Por favor ingresa un número válido.");
      setLocalValue(String(value));
      return;
    }
    const parsed = parseInt(trimmed, 10);
    if (parsed < min) {
      showWarning("La cantidad mínima es 1", `La cantidad mínima es ${min}.`);
      setLocalValue(String(value));
      return;
    }
    if (parsed > max) {
      showWarning("Stock insuficiente", `Solo hay ${max} unidades disponibles.`);
      setLocalValue(String(value));
      return;
    }
    if (parsed === value) return;
    setLocalValue(String(parsed));
    onChange(parsed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitValue(localValue);
      return;
    }
    if (e.key === "Escape") {
      setLocalValue(String(value));
      return;
    }
    const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (allowed.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text");
    if (!/^\d+$/.test(pasted)) {
      e.preventDefault();
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setLocalValue(val);
    }
  };

  const handleBlur = () => {
    commitValue(localValue);
  };

  const increment = () => {
    const currentVal = parseInt(localValue, 10);
    const base = isNaN(currentVal) ? value : currentVal;
    const newVal = Math.min(Math.max(base + 1, min), max);
    if (newVal !== value) {
      setLocalValue(String(newVal));
      onChange(newVal);
    }
  };

  const decrement = () => {
    const currentVal = parseInt(localValue, 10);
    const base = isNaN(currentVal) ? value : currentVal;
    const newVal = Math.min(Math.max(base - 1, min), max);
    if (newVal !== value) {
      setLocalValue(String(newVal));
      onChange(newVal);
    }
  };

  return (
    <div className="quantity-selector">
      <button
        className="quantity-btn"
        onClick={decrement}
        disabled={disabled || parseInt(localValue, 10) <= min}
        aria-label="Disminuir cantidad"
      >
        −
      </button>
      <div className="quantity-input-wrapper">
        <input
          className="quantity-input"
          type="text"
          inputMode="numeric"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={disabled}
          maxLength={maxLength}
          aria-label="Cantidad"
        />
        {showHint && (
          <span className="quantity-hint">Máximo disponible: {max}</span>
        )}
      </div>
      <button
        className="quantity-btn"
        onClick={increment}
        disabled={disabled || parseInt(localValue, 10) >= max}
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  );
}

export default QuantityInput;
