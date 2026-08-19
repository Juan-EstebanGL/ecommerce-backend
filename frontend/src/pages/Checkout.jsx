import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCart } from "../api/cart";
import { checkout } from "../api/orders";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../api/users";
import Loader from "../components/Loader";
import { showSuccess, showError, showConfirm, showWarning } from "../utils/alerts";
import { useCartContext } from "../context/CartContext";

const EXPRESS_SHIPPING_COST = 5000;

const formatPrice = (price) =>
  Number(price).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const DELIVERY_OPTIONS = [
  {
    id: "standard",
    label: "Envío estándar",
    desc: "Entrega en 3-5 días hábiles",
    price: 0,
    priceLabel: "Gratis",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: "express",
    label: "Envío express",
    desc: "Entrega en 24 horas",
    price: EXPRESS_SHIPPING_COST,
    priceLabel: `$${formatPrice(EXPRESS_SHIPPING_COST)}`,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
];

const PAYMENT_OPTIONS = [
  {
    id: "credit",
    label: "Tarjeta de crédito",
    desc: "Visa, Mastercard, Amex",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    id: "debit",
    label: "Tarjeta de débito",
    desc: "Débito directo",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
        <line x1="6" y1="15" x2="10" y2="15" />
      </svg>
    ),
  },
  {
    id: "cash",
    label: "Contra entrega",
    desc: "Paga al recibir",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    id: "transfer",
    label: "Transferencia bancaria",
    desc: "Nequi, Daviplata, Bancolombia",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 17h20" />
        <path d="M6 17V7l6-4 6 4v10" />
        <path d="M10 17v-4h4v4" />
        <circle cx="2" cy="17" r="1" />
        <circle cx="22" cy="17" r="1" />
      </svg>
    ),
  },
];

const EMPTY_ADDRESS = {
  label: "",
  recipient: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  instructions: "",
  isDefault: false,
};

function Checkout() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [imgErrors, setImgErrors] = useState(new Set());
  const { refreshCartCount } = useCartContext();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressFormMode, setAddressFormMode] = useState(null);
  const [addressForm, setAddressForm] = useState({ ...EMPTY_ADDRESS });
  const [addressSaving, setAddressSaving] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("credit");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await getCart();
        if (!cancelled) setItems(res.data?.items || []);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Error al cargar el carrito");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadAddresses() {
      try {
        const res = await getAddresses();
        if (!cancelled) {
          setAddresses(res.data);
          const defaultAddr = res.data.find((a) => a.isDefault);
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          else if (res.data.length > 0) setSelectedAddressId(res.data[0].id);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setAddressesLoading(false);
      }
    }
    loadAddresses();
    return () => { cancelled = true; };
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingCost = deliveryMethod === "express" ? EXPRESS_SHIPPING_COST : 0;
  const total = subtotal + shippingCost;

  function handleStartAddAddress() {
    setAddressFormMode("new");
    setAddressForm({ ...EMPTY_ADDRESS });
  }

  function handleStartEditAddress(addr) {
    setAddressFormMode(addr.id);
    setAddressForm({
      label: addr.label || "",
      recipient: addr.recipient || "",
      phone: addr.phone || "",
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      instructions: addr.instructions || "",
      isDefault: addr.isDefault || false,
    });
  }

  function handleCancelAddressForm() {
    setAddressFormMode(null);
    setAddressForm({ ...EMPTY_ADDRESS });
  }

  async function handleSaveAddress(e) {
    e.preventDefault();
    if (!addressForm.label.trim()) { showWarning("Campo requerido", "Ingresa un nombre para la dirección."); return; }
    if (!addressForm.recipient.trim()) { showWarning("Campo requerido", "Ingresa el destinatario."); return; }
    if (!addressForm.street.trim()) { showWarning("Campo requerido", "Ingresa la dirección."); return; }
    if (!addressForm.city.trim()) { showWarning("Campo requerido", "Ingresa la ciudad."); return; }
    if (!addressForm.state.trim()) { showWarning("Campo requerido", "Ingresa el departamento."); return; }

    setAddressSaving(true);
    try {
      const payload = {
        label: addressForm.label.trim(),
        recipient: addressForm.recipient.trim(),
        phone: addressForm.phone.trim() || null,
        street: addressForm.street.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        postalCode: addressForm.postalCode.trim() || null,
        instructions: addressForm.instructions.trim() || null,
        isDefault: addressForm.isDefault,
      };

      if (addressFormMode === "new") {
        const res = await createAddress(payload);
        setAddresses((prev) => {
          const next = [res.data, ...prev];
          if (res.data.isDefault) return next.map((a) => (a.id === res.data.id ? a : { ...a, isDefault: false }));
          return next;
        });
        setSelectedAddressId(res.data.id);
        showSuccess("Dirección creada");
      } else {
        const res = await updateAddress(addressFormMode, payload);
        setAddresses((prev) =>
          prev.map((a) => {
            if (a.id === res.data.id) return res.data;
            if (res.data.isDefault) return { ...a, isDefault: false };
            return a;
          })
        );
        showSuccess("Dirección actualizada");
      }
      handleCancelAddressForm();
    } catch (err) {
      showError(err?.response?.data?.message || "Error al guardar la dirección");
    } finally {
      setAddressSaving(false);
    }
  }

  async function handleDeleteAddress(id) {
    const result = await showConfirm("Eliminar dirección", "¿Estás seguro?");
    if (!result.isConfirmed) return;
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (selectedAddressId === id) {
        setSelectedAddressId(null);
      }
      showSuccess("Dirección eliminada");
    } catch (err) {
      showError(err?.response?.data?.message || "Error al eliminar");
    }
  }

  async function handleSetDefaultAddress(id) {
    try {
      const res = await setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => (a.id === res.data.id ? { ...a, isDefault: true } : { ...a, isDefault: false }))
      );
    } catch {
      // silent
    }
  }

  const handleConfirm = useCallback(async () => {
    if (addresses.length > 0 && !selectedAddressId) {
      showWarning("Dirección requerida", "Selecciona una dirección de envío para continuar.");
      return;
    }

    const result = await showConfirm(
      "Confirmar pedido",
      "¿Deseas confirmar este pedido?",
      "Confirmar",
      "Cancelar"
    );
    if (!result.isConfirmed) return;

    setCheckoutLoading(true);
    try {
      await checkout({ addressId: selectedAddressId || undefined });
      await refreshCartCount();
      showSuccess("Pedido confirmado");
      navigate("/orders");
    } catch (err) {
      const msg = err?.response?.data?.message || "Error al procesar el pedido";
      showError(msg);
    } finally {
      setCheckoutLoading(false);
    }
  }, [addresses, selectedAddressId, refreshCartCount, navigate]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <main className="co-page">
      <div className="co-page__glow co-page__glow--teal" />
      <div className="co-page__glow co-page__glow--purple" />

      <div className="app-container">
        <div className="co-header">
          <h1 className="co-header__title">Finalizar compra</h1>
          <p className="co-header__sub">Completa los pasos para confirmar tu pedido</p>
        </div>

        {loading && <Loader />}

        {error && <div className="co-message co-message--error">{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="co-empty">
            <div className="co-empty__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <h2 className="co-empty__title">El carrito está vacío</h2>
            <p className="co-empty__desc">Agrega productos al carrito antes de continuar.</p>
            <button className="co-empty__btn" onClick={() => navigate("/products")}>
              Ir al catálogo
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div className="co-layout">
            <div className="co-main">
              {/* Section 1: Shipping Address */}
              <section className="co-section">
                <div className="co-section__header">
                  <span className="co-section__step">1</span>
                  <h2 className="co-section__title">Dirección de envío</h2>
                </div>

                {addressesLoading && (
                  <div className="co-section__loading">
                    <span className="co-spinner-dark" />
                  </div>
                )}

                {!addressesLoading && addresses.length === 0 && addressFormMode === null && (
                  <div className="co-address-empty">
                    <p className="co-address-empty__text">No tienes direcciones guardadas</p>
                    <button className="co-btn co-btn--brand" onClick={handleStartAddAddress}>
                      Agregar dirección
                    </button>
                  </div>
                )}

                {!addressesLoading && (addresses.length > 0 || addressFormMode !== null) && (
                  <>
                    {addressFormMode !== null && (
                      <div className="co-address-form-card">
                        <h3 className="co-address-form-card__title">
                          {addressFormMode === "new" ? "Nueva dirección" : "Editar dirección"}
                        </h3>
                        <form className="co-address-form" onSubmit={handleSaveAddress} noValidate>
                          <div className="co-address-form__grid">
                            <div className="co-form-group">
                              <label className="co-form-group__label" htmlFor="co-addr-label">Nombre</label>
                              <input id="co-addr-label" className="co-input" type="text" value={addressForm.label} onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))} placeholder="Casa, Trabajo, etc." />
                            </div>
                            <div className="co-form-group">
                              <label className="co-form-group__label" htmlFor="co-addr-recipient">Destinatario</label>
                              <input id="co-addr-recipient" className="co-input" type="text" value={addressForm.recipient} onChange={(e) => setAddressForm((p) => ({ ...p, recipient: e.target.value }))} placeholder="Nombre completo" />
                            </div>
                            <div className="co-form-group">
                              <label className="co-form-group__label" htmlFor="co-addr-phone">Teléfono</label>
                              <input id="co-addr-phone" className="co-input" type="tel" value={addressForm.phone} onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Opcional" />
                            </div>
                            <div className="co-form-group co-form-group--full">
                              <label className="co-form-group__label" htmlFor="co-addr-street">Dirección</label>
                              <input id="co-addr-street" className="co-input" type="text" value={addressForm.street} onChange={(e) => setAddressForm((p) => ({ ...p, street: e.target.value }))} placeholder="Calle, número, barrio" />
                            </div>
                            <div className="co-form-group">
                              <label className="co-form-group__label" htmlFor="co-addr-city">Ciudad</label>
                              <input id="co-addr-city" className="co-input" type="text" value={addressForm.city} onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))} placeholder="Ciudad" />
                            </div>
                            <div className="co-form-group">
                              <label className="co-form-group__label" htmlFor="co-addr-state">Departamento</label>
                              <input id="co-addr-state" className="co-input" type="text" value={addressForm.state} onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))} placeholder="Departamento" />
                            </div>
                            <div className="co-form-group">
                              <label className="co-form-group__label" htmlFor="co-addr-postal">Código postal</label>
                              <input id="co-addr-postal" className="co-input" type="text" value={addressForm.postalCode} onChange={(e) => setAddressForm((p) => ({ ...p, postalCode: e.target.value }))} placeholder="Opcional" />
                            </div>
                            <div className="co-form-group co-form-group--full">
                              <label className="co-form-group__label" htmlFor="co-addr-instructions">Instrucciones</label>
                              <textarea id="co-addr-instructions" className="co-input co-input--textarea" value={addressForm.instructions} onChange={(e) => setAddressForm((p) => ({ ...p, instructions: e.target.value }))} placeholder="Ej: Tocar timbre 3B, dejar en portería..." rows={2} />
                            </div>
                          </div>
                          <div className="co-address-form__checkbox">
                            <label className="co-checkbox">
                              <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))} />
                              <span>Establecer como dirección predeterminada</span>
                            </label>
                          </div>
                          <div className="co-address-form__actions">
                            <button type="button" className="co-btn co-btn--ghost" onClick={handleCancelAddressForm} disabled={addressSaving}>Cancelar</button>
                            <button type="submit" className="co-btn co-btn--brand" disabled={addressSaving}>
                              {addressSaving ? (<span className="co-btn__inner"><span className="co-spinner-btn" /> Guardando...</span>) : (addressFormMode === "new" ? "Crear dirección" : "Guardar cambios")}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {addressFormMode === null && (
                      <div className="co-address-grid">
                        {addresses.map((addr) => (
                          <div key={addr.id} className={`co-address-card ${selectedAddressId === addr.id ? "co-address-card--selected" : ""} ${addr.isDefault ? "co-address-card--default" : ""}`}>
                            <button className="co-address-card__select" onClick={() => setSelectedAddressId(addr.id)}>
                              <span className={`co-radio ${selectedAddressId === addr.id ? "co-radio--checked" : ""}`}>
                                <span className="co-radio__dot" />
                              </span>
                              <div className="co-address-card__content">
                                <div className="co-address-card__top">
                                  <span className="co-address-card__label">{addr.label}</span>
                                  {addr.isDefault && <span className="co-address-card__badge">Predeterminada</span>}
                                </div>
                                <p className="co-address-card__name">{addr.recipient}</p>
                                <p className="co-address-card__line">{addr.street}</p>
                                <p className="co-address-card__line">{addr.city}, {addr.state}</p>
                                {addr.phone && <p className="co-address-card__line co-address-card__line--muted">Tel: {addr.phone}</p>}
                              </div>
                            </button>
                            <div className="co-address-card__actions">
                              {selectedAddressId === addr.id && !addr.isDefault && (
                                <button className="co-address-card__action" onClick={(e) => { e.stopPropagation(); handleSetDefaultAddress(addr.id); }}>Predeterminar</button>
                              )}
                              <button className="co-address-card__action" onClick={(e) => { e.stopPropagation(); handleStartEditAddress(addr); }}>Editar</button>
                              <button className="co-address-card__action co-address-card__action--danger" onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }}>Eliminar</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {addressFormMode === null && (
                      <button className="co-add-address-btn" onClick={handleStartAddAddress}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Agregar nueva dirección
                      </button>
                    )}
                  </>
                )}
              </section>

              {/* Section 2: Delivery Method */}
              <section className="co-section">
                <div className="co-section__header">
                  <span className="co-section__step">2</span>
                  <h2 className="co-section__title">Método de entrega</h2>
                </div>
                <div className="co-option-grid">
                  {DELIVERY_OPTIONS.map((opt) => (
                    <button key={opt.id} className={`co-option-card ${deliveryMethod === opt.id ? "co-option-card--selected" : ""}`} onClick={() => setDeliveryMethod(opt.id)}>
                      <span className={`co-radio co-radio--lg ${deliveryMethod === opt.id ? "co-radio--checked" : ""}`}>
                        <span className="co-radio__dot" />
                      </span>
                      <span className="co-option-card__icon">{opt.icon}</span>
                      <div className="co-option-card__text">
                        <span className="co-option-card__label">{opt.label}</span>
                        <span className="co-option-card__desc">{opt.desc}</span>
                      </div>
                      <span className={`co-option-card__price ${opt.price === 0 ? "co-option-card__price--free" : ""}`}>
                        {opt.priceLabel}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Section 3: Payment Method */}
              <section className="co-section">
                <div className="co-section__header">
                  <span className="co-section__step">3</span>
                  <h2 className="co-section__title">Método de pago</h2>
                </div>
                <div className="co-option-grid co-option-grid--payment">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <button key={opt.id} className={`co-option-card co-option-card--payment ${paymentMethod === opt.id ? "co-option-card--selected" : ""}`} onClick={() => setPaymentMethod(opt.id)}>
                      <span className={`co-radio ${paymentMethod === opt.id ? "co-radio--checked" : ""}`}>
                        <span className="co-radio__dot" />
                      </span>
                      <span className="co-option-card__icon">{opt.icon}</span>
                      <div className="co-option-card__text">
                        <span className="co-option-card__label">{opt.label}</span>
                        <span className="co-option-card__desc">{opt.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar: Summary */}
            <aside className="co-sidebar">
              <div className="co-summary">
                <h2 className="co-summary__title">Resumen del pedido</h2>

                <div className="co-summary__products">
                  {items.map((item) => {
                    const imgErr = imgErrors.has(item.id);
                    return (
                      <div key={item.id} className="co-summary__product">
                        <div className="co-summary__product-img">
                          {item.product?.imageUrl && !imgErr ? (
                            <img src={item.product.imageUrl} alt={item.product.name} loading="lazy" onError={() => setImgErrors((prev) => new Set(prev).add(item.id))} />
                          ) : (
                            <span className="co-summary__product-placeholder">
                              {item.product?.name?.slice(0, 2).toUpperCase() || "PR"}
                            </span>
                          )}
                          <span className="co-summary__product-qty">{item.quantity}</span>
                        </div>
                        <div className="co-summary__product-info">
                          <span className="co-summary__product-name">{item.product?.name || "Producto"}</span>
                          <span className="co-summary__product-price">${formatPrice((item.product?.price || 0) * item.quantity)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="co-summary__rows">
                  <div className="co-summary__row">
                    <span>Productos ({totalItems})</span>
                    <span>${formatPrice(subtotal)}</span>
                  </div>
                  <div className="co-summary__row">
                    <span>Envío</span>
                    {shippingCost === 0 ? (
                      <span className="co-summary__shipping">Gratis</span>
                    ) : (
                      <span>${formatPrice(shippingCost)}</span>
                    )}
                  </div>
                  {deliveryMethod === "standard" && (
                    <div className="co-summary__row co-summary__row--savings">
                      <span>Ahorro en envío</span>
                      <span className="co-summary__savings">${formatPrice(EXPRESS_SHIPPING_COST)}</span>
                    </div>
                  )}
                </div>

                <div className="co-summary__total">
                  <span>Total</span>
                  <span className="co-summary__total-value">${formatPrice(total)}</span>
                </div>

                {selectedAddress && (
                  <div className="co-summary__address">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                      <span className="co-summary__address-label">{selectedAddress.label}</span>
                      <span className="co-summary__address-line">{selectedAddress.street}, {selectedAddress.city}</span>
                    </div>
                  </div>
                )}

                <button
                  className="co-confirm-btn"
                  disabled={checkoutLoading || loading}
                  onClick={handleConfirm}
                >
                  {checkoutLoading ? (
                    <span className="co-btn-inner">
                      <span className="co-spinner" />
                      Procesando...
                    </span>
                  ) : (
                    "Confirmar pedido"
                  )}
                </button>

                <button className="co-back-btn" onClick={() => navigate("/cart")}>
                  ← Volver al carrito
                </button>

                <div className="co-security">
                  <svg className="co-security__icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <div className="co-security__info">
                    <strong>Compra segura</strong>
                    <p>Tus datos serán procesados de forma segura.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default Checkout;
