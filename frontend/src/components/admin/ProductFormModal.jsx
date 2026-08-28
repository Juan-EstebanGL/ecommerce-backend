import { useRef, useState, useEffect } from "react";
import { uploadImage } from "../../api/upload";
import { createProduct, updateProduct } from "../../api/products";
import { getCategories } from "../../api/categories";
import { showError, showSuccess } from "../../utils/alerts";
import {
  ACCEPTED_IMAGE_TYPES as ACCEPTED,
  MAX_IMAGE_SIZE as MAX_SIZE,
} from "../../utils/imageUpload";
import AdminFormModal from "./AdminFormModal";

const initialForm = { name: "", price: "", stock: "", categoryId: "" };

export default function ProductFormModal({ mode = "create", product = null, isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(
    mode === "edit" && product
      ? { name: product.name, price: String(product.price), stock: String(product.stock), categoryId: product.categoryId ? String(product.categoryId) : "" }
      : { ...initialForm }
  );
  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(mode === "edit" && product?.imageUrl ? product.imageUrl : null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getCategories();
        if (!cancelled) setCategories(res.data || []);
      } catch {
        // categories optional, silent fail
      }
    })();
    return () => { cancelled = true; };
  }, []);

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

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "El nombre es obligatorio";
    const priceNum = parseFloat(form.price);
    if (!form.price || isNaN(priceNum) || priceNum <= 0) errs.price = "Debe ser mayor a 0";
    const stockNum = parseInt(form.stock, 10);
    if (form.stock === "" || isNaN(stockNum) || stockNum < 0) errs.stock = "Debe ser 0 o mayor";
    if (mode === "create" && !file) errs.image = "Selecciona una imagen";
    if (!form.categoryId) errs.categoryId = "Debes seleccionar una categoría";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);

    const payload = {
      name: form.name.trim(),
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      categoryId: form.categoryId ? parseInt(form.categoryId, 10) : null,
    };

    try {
      if (mode === "edit" && !file) {
        setPhase("Actualizando producto...");
        await updateProduct(product.id, payload);
      } else {
        setPhase("Subiendo imagen...");
        const uploadRes = await uploadImage(file);
        payload.imageUrl = uploadRes.data.imageUrl;
        payload.publicId = uploadRes.data.publicId;

        setPhase(mode === "edit" ? "Actualizando producto..." : "Creando producto...");
        if (mode === "edit") {
          await updateProduct(product.id, payload);
        } else {
          await createProduct(payload);
        }
      }

      showSuccess(mode === "edit" ? "Producto actualizado correctamente" : "Producto creado correctamente");
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

  const isEdit = mode === "edit";

  return (
    <AdminFormModal title={isEdit ? "Editar producto" : "Nuevo producto"} isOpen={isOpen} onClose={onClose}>
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
                  placeholder="Ej: Mouse gamer"
                  disabled={submitting}
                />
                {errors.name && <span className="ad-form__error">{errors.name}</span>}
              </div>

              <div className="ad-form__group">
                <label className="ad-form__label">Precio</label>
                <input
                  className={`ad-form__input${errors.price ? " ad-form__input--error" : ""}`}
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Ej: 49.99"
                  disabled={submitting}
                />
                {errors.price && <span className="ad-form__error">{errors.price}</span>}
              </div>

              <div className="ad-form__group">
                <label className="ad-form__label">Stock</label>
                <input
                  className={`ad-form__input${errors.stock ? " ad-form__input--error" : ""}`}
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Ej: 10"
                  disabled={submitting}
                />
                {errors.stock && <span className="ad-form__error">{errors.stock}</span>}
              </div>

              <div className="ad-form__group">
                <label className="ad-form__label">Categoría</label>
                <select
                  className="ad-form__input"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <span className="ad-form__error">{errors.categoryId}</span>}
              </div>
            </div>

            <div className="ad-form__right">
              <label className="ad-form__label">Imagen</label>
              <div
                className={`ad-form-upload${errors.image ? " ad-form-upload--error" : ""}`}
                onClick={() => !submitting && inputRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="ad-form-upload__preview" />
                ) : (
                  <div className="ad-form-upload__placeholder">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
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
              {errors.image && <span className="ad-form__error">{errors.image}</span>}
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
                isEdit ? "Guardar cambios" : "Crear producto"
              )}
            </button>
          </div>
      </form>
    </AdminFormModal>
  );
}
