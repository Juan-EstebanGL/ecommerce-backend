import { useRef, useState } from "react";
import { uploadImage } from "../../api/upload";
import { createCategory, updateCategory } from "../../api/categories";
import { showError, showSuccess } from "../../utils/alerts";

const ACCEPTED = "image/jpeg,image/jpg,image/png,image/webp";
const MAX_SIZE = 5 * 1024 * 1024;

const initialForm = { name: "", description: "" };

export default function CategoryFormModal({ mode = "create", category = null, isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(
    mode === "edit" && category
      ? { name: category.name, description: category.description || "" }
      : { ...initialForm }
  );
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(mode === "edit" && category?.imageUrl ? category.imageUrl : null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState("");
  const inputRef = useRef(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!ACCEPTED.includes(f.type)) {
      showError("Solo se permiten imágenes JPG, JPEG, PNG o WebP");
      e.target.value = "";
      return;
    }

    if (f.size > MAX_SIZE) {
      showError("La imagen no debe superar los 5 MB");
      e.target.value = "";
      return;
    }

    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  }

  function handleRemoveImage() {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "El nombre es obligatorio";
    if (form.description && form.description.length > 500) errs.description = "Máximo 500 caracteres";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);

    try {
      if (mode === "edit" && !file) {
        const payload = {
          name: form.name.trim(),
          description: form.description.trim() || null,
          imageUrl: category.imageUrl || null,
          publicId: category.publicId || null,
        };
        setPhase("Actualizando categoría...");
        await updateCategory(category.id, payload);
      } else {
        setPhase("Subiendo imagen...");
        const uploadRes = await uploadImage(file);
        const payload = {
          name: form.name.trim(),
          description: form.description.trim() || null,
          imageUrl: uploadRes.data.imageUrl,
          publicId: uploadRes.data.publicId,
        };

        setPhase(mode === "edit" ? "Actualizando categoría..." : "Creando categoría...");
        if (mode === "edit") {
          await updateCategory(category.id, payload);
        } else {
          await createCategory(payload);
        }
      }

      showSuccess(mode === "edit" ? "Categoría actualizada correctamente" : "Categoría creada correctamente");
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Error inesperado";
      showError(msg);
    } finally {
      setSubmitting(false);
      setPhase("");
    }
  }

  if (!isOpen) return null;

  const isEdit = mode === "edit";

  return (
    <div className="ad-form-overlay" onClick={onClose}>
      <div className="ad-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-form-modal__header">
          <h2>{isEdit ? "Editar categoría" : "Nueva categoría"}</h2>
          <button className="ad-form-modal__close" onClick={onClose} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form className="ad-form" onSubmit={handleSubmit} noValidate>
          <div className="ad-form__body">
            <div className="ad-form__left">
              <div className="ad-form__group">
                <label className="ad-form__label">Nombre</label>
                <input
                  className={`ad-form__input${errors.name ? " ad-form__input--error" : ""}`}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Electrónica"
                  disabled={submitting}
                  autoFocus
                />
                {errors.name && <span className="ad-form__error">{errors.name}</span>}
              </div>

              <div className="ad-form__group">
                <label className="ad-form__label">Descripción</label>
                <textarea
                  className={`ad-form__input ad-form__textarea${errors.description ? " ad-form__input--error" : ""}`}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Descripción opcional de la categoría"
                  rows={4}
                  disabled={submitting}
                />
                <span className="ad-form__hint">{form.description.length}/500</span>
                {errors.description && <span className="ad-form__error">{errors.description}</span>}
              </div>
            </div>

            <div className="ad-form__right">
              <label className="ad-form__label">Imagen</label>
              <div
                className="ad-form-upload"
                onClick={() => !submitting && inputRef.current?.click()}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="ad-form-upload__preview" />
                    {!submitting && (
                      <button
                        type="button"
                        className="ad-form-upload__remove"
                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="ad-form-upload__placeholder">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                    </svg>
                    <span>Haz clic para seleccionar</span>
                    <span className="ad-form-upload__hint">JPG, JPEG, PNG o WebP • Máx 5 MB</span>
                  </div>
                )}
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                onChange={handleFile}
                style={{ display: "none" }}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="ad-form__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="ad-form__spinner" />
                  {phase}
                </>
              ) : (
                isEdit ? "Guardar cambios" : "Crear categoría"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
