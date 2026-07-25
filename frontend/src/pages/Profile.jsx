import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  getMyStats,
  updateAvatar,
  deleteAvatar,
  updateProfile,
  changePassword,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../api/users";
import { showSuccess, showError, showConfirm, showWarning } from "../utils/alerts";
import {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePhone,
  filterPhoneDigits,
} from "../utils/validators";

const ROLES = {
  admin: "Administrador",
  user: "Usuario",
  moderator: "Moderador",
};

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

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

function Profile() {
  const { user, logout, updateUser } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [stats, setStats] = useState({ orders: 0, favorites: 0, reviews: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [originalForm, setOriginalForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [profileTouched, setProfileTouched] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({ ...EMPTY_ADDRESS });
  const [addressLoading, setAddressLoading] = useState(false);

  const profileErrors = useMemo(() => ({
    firstName: profileTouched.firstName ? validateFirstName(profileForm.firstName) : "",
    lastName: profileTouched.lastName ? validateLastName(profileForm.lastName) : "",
    email: profileTouched.email ? validateEmail(profileForm.email) : "",
    phone: profileTouched.phone ? validatePhone(profileForm.phone) : "",
  }), [profileForm.firstName, profileForm.lastName, profileForm.email, profileForm.phone, profileTouched]);

  const isProfileValid = useMemo(() => (
    !validateFirstName(profileForm.firstName) &&
    !validateLastName(profileForm.lastName) &&
    !validateEmail(profileForm.email) &&
    !validatePhone(profileForm.phone)
  ), [profileForm.firstName, profileForm.lastName, profileForm.email, profileForm.phone]);

  const isProfileDirty = useMemo(() => (
    profileForm.firstName.trim() !== originalForm.firstName.trim() ||
    profileForm.lastName.trim() !== originalForm.lastName.trim() ||
    profileForm.email.trim() !== originalForm.email.trim() ||
    profileForm.phone.trim() !== originalForm.phone.trim()
  ), [profileForm, originalForm]);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await getMyStats();
        if (!cancelled) setStats(res.data);
      } catch {
        // stats stay at 0
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function loadAddresses() {
      try {
        const res = await getAddresses();
        if (!cancelled) setAddresses(res.data);
      } catch {
        // addresses stay empty
      } finally {
        if (!cancelled) setAddressesLoading(false);
      }
    }
    loadAddresses();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Unsaved changes: warn on tab close / refresh
  useEffect(() => {
    if (!editingProfile || !isProfileDirty) return;
    function onBeforeUnload(e) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [editingProfile, isProfileDirty]);

  function markProfileTouched(field) {
    setProfileTouched((prev) => ({ ...prev, [field]: true }));
  }

  function profileInputClass(field) {
    const base = "pf-input";
    if (!profileTouched[field]) return base;
    if (profileErrors[field]) return `${base} pf-input--error`;
    return `${base} pf-input--valid`;
  }

  function isFieldChanged(field) {
    return editingProfile && profileForm[field].trim() !== originalForm[field].trim();
  }

  function profileFieldClass(field) {
    let cls = "pf-form-group";
    if (isFieldChanged(field)) cls += " pf-form-group--changed";
    return cls;
  }

  if (!user) return null;

  const avatarLetter = (user.firstName?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase();
  const roleLabel = ROLES[user.role?.toLowerCase()] || user.role || "Usuario";
  const isAdmin = user.role?.toLowerCase() === "admin";
  const createdDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      showError("Formato no válido. Usa JPG, PNG o WebP.");
      return;
    }

    if (file.size > MAX_SIZE) {
      showError("La imagen supera los 5 MB.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    handleUpload(file);
  }

  async function handleUpload(file) {
    setAvatarUploading(true);
    try {
      const res = await updateAvatar(file);
      updateUser(res.data);
      showSuccess("Avatar actualizado");
    } catch (err) {
      showError(err?.response?.data?.message || "Error al subir la imagen");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleDeleteAvatar() {
    const result = await showConfirm(
      "Eliminar avatar",
      "¿Estás seguro de que quieres eliminar tu foto de perfil?"
    );
    if (!result.isConfirmed) return;

    setAvatarUploading(true);
    try {
      const res = await deleteAvatar();
      updateUser(res.data);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      showSuccess("Avatar eliminado");
    } catch (err) {
      showError(err?.response?.data?.message || "Error al eliminar el avatar");
    } finally {
      setAvatarUploading(false);
    }
  }

  function handleStartEditProfile() {
    const form = {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
    };
    setProfileForm(form);
    setOriginalForm(form);
    setProfileTouched({});
    setEditingProfile(true);
    setProfileSuccess(false);
    setProfileSaved(false);
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setProfileSuccess(false);

    if (!isProfileDirty) {
      showWarning("Sin cambios", "No hay cambios para guardar.");
      return;
    }

    const allTouched = { firstName: true, lastName: true, email: true, phone: true };
    setProfileTouched(allTouched);

    const fErr = validateFirstName(profileForm.firstName);
    const lErr = validateLastName(profileForm.lastName);
    const eErr = validateEmail(profileForm.email);
    const pErr = validatePhone(profileForm.phone);

    if (fErr) { showWarning("Campo requerido", fErr); return; }
    if (lErr) { showWarning("Campo requerido", lErr); return; }
    if (eErr) { showWarning("Email inválido", eErr); return; }
    if (pErr) { showWarning("Teléfono inválido", pErr); return; }

    setProfileLoading(true);
    try {
      const res = await updateProfile({
        firstName: profileForm.firstName.trim() || null,
        lastName: profileForm.lastName.trim() || null,
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim() || null,
      });
      updateUser(res.data);
      setOriginalForm({ ...profileForm });
      setProfileSuccess(true);
      setProfileSaved(true);
      setEditingProfile(false);
      showSuccess("Perfil actualizado");
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      showError(err?.response?.data?.message || "Error al actualizar el perfil");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwSuccess(false);

    if (!pwForm.currentPassword) {
      showWarning("Campo requerido", "Ingresa tu contraseña actual.");
      return;
    }
    if (!pwForm.newPassword) {
      showWarning("Campo requerido", "Ingresa una nueva contraseña.");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      showWarning("Contraseña corta", "La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showWarning("Contraseñas no coinciden", "Las contraseñas nuevas no coinciden.");
      return;
    }

    setPwLoading(true);
    try {
      await changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess(true);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showSuccess("Contraseña actualizada");
    } catch (err) {
      showError(err?.response?.data?.message || "Error al cambiar la contraseña");
    } finally {
      setPwLoading(false);
    }
  }

  function handleStartAddAddress() {
    setEditingAddress("new");
    setAddressForm({ ...EMPTY_ADDRESS });
  }

  function handleStartEditAddress(addr) {
    setEditingAddress(addr.id);
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

  function handleCancelAddress() {
    setEditingAddress(null);
    setAddressForm({ ...EMPTY_ADDRESS });
  }

  async function handleSaveAddress(e) {
    e.preventDefault();

    if (!addressForm.label.trim()) {
      showWarning("Campo requerido", "Ingresa un nombre para la dirección.");
      return;
    }
    if (!addressForm.recipient.trim()) {
      showWarning("Campo requerido", "Ingresa el nombre del destinatario.");
      return;
    }
    if (!addressForm.street.trim()) {
      showWarning("Campo requerido", "Ingresa la dirección.");
      return;
    }
    if (!addressForm.city.trim()) {
      showWarning("Campo requerido", "Ingresa la ciudad.");
      return;
    }
    if (!addressForm.state.trim()) {
      showWarning("Campo requerido", "Ingresa el departamento.");
      return;
    }

    setAddressLoading(true);
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

      if (editingAddress === "new") {
        const res = await createAddress(payload);
        setAddresses((prev) => {
          const next = [res.data, ...prev];
          if (res.data.isDefault) {
            return next.map((a) =>
              a.id === res.data.id ? a : { ...a, isDefault: false }
            );
          }
          return next;
        });
        showSuccess("Dirección creada");
      } else {
        const res = await updateAddress(editingAddress, payload);
        setAddresses((prev) =>
          prev.map((a) => {
            if (a.id === res.data.id) return res.data;
            if (res.data.isDefault) return { ...a, isDefault: false };
            return a;
          })
        );
        showSuccess("Dirección actualizada");
      }
      handleCancelAddress();
    } catch (err) {
      showError(err?.response?.data?.message || "Error al guardar la dirección");
    } finally {
      setAddressLoading(false);
    }
  }

  async function handleDeleteAddress(id) {
    const result = await showConfirm(
      "Eliminar dirección",
      "¿Estás seguro de que quieres eliminar esta dirección?"
    );
    if (!result.isConfirmed) return;

    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showSuccess("Dirección eliminada");
    } catch (err) {
      showError(err?.response?.data?.message || "Error al eliminar la dirección");
    }
  }

  async function handleSetDefault(id) {
    try {
      const res = await setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === res.data.id ? { ...a, isDefault: true } : { ...a, isDefault: false }
        )
      );
      showSuccess("Dirección predeterminada actualizada");
    } catch (err) {
      showError(err?.response?.data?.message || "Error al cambiar la dirección predeterminada");
    }
  }

  const displayAvatar = previewUrl || user.avatarUrl;

  return (
    <main className="pf-page">
      <div className="pf-page__glow pf-page__glow--teal" />
      <div className="pf-page__glow pf-page__glow--purple" />
      <div className="app-container">
        <div className="pf-header">
          <h1 className="pf-header__title">Mi cuenta</h1>
          <p className="pf-header__sub">Gestiona tu perfil y actividad</p>
        </div>

        {/* Section 1: User Info */}
        <section className="pf-user-section">
          <div className="pf-user-card">
            <div className="pf-user-card__left">
              <div className="pf-avatar pf-avatar--interactive">
                {displayAvatar ? (
                  <img src={displayAvatar} alt={user.email} />
                ) : (
                  <span className="pf-avatar__letter">{avatarLetter}</span>
                )}
                {avatarUploading && (
                  <div className="pf-avatar__spinner">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                      </path>
                    </svg>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="pf-avatar__input"
                onChange={handleFileSelect}
                disabled={avatarUploading}
              />
              <div className="pf-avatar-actions">
                <button
                  className="pf-avatar-action"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Cambiar foto
                </button>
                {user.avatarUrl && (
                  <button
                    className="pf-avatar-action pf-avatar-action--danger"
                    onClick={handleDeleteAvatar}
                    disabled={avatarUploading}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    Eliminar foto
                  </button>
                )}
              </div>
            </div>
            <div className="pf-user-card__info">
              <p className="pf-user-card__email">{user.email}</p>
              <div className="pf-user-card__meta">
                <span className="pf-user-card__role">{roleLabel}</span>
                {createdDate && (
                  <span className="pf-user-card__date">
                    Miembro desde {createdDate}
                  </span>
                )}
              </div>
            </div>
            <button className="pf-logout-btn" onClick={() => logout()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </section>

        {/* Stats Row */}
        <section className="pf-stats">
          <div className="pf-stat">
            <span className="pf-stat__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </span>
            <span className="pf-stat__number">{statsLoading ? "—" : stats.orders}</span>
            <span className="pf-stat__label">Pedidos</span>
          </div>
          <div className="pf-stat">
            <span className="pf-stat__icon pf-stat__icon--heart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </span>
            <span className="pf-stat__number">{statsLoading ? "—" : stats.favorites}</span>
            <span className="pf-stat__label">Favoritos</span>
          </div>
          <div className="pf-stat">
            <span className="pf-stat__icon pf-stat__icon--star">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
            <span className="pf-stat__number">{statsLoading ? "—" : stats.reviews}</span>
            <span className="pf-stat__label">Reseñas</span>
          </div>
        </section>

        {/* Section 2: Edit Profile */}
        <section className="pf-section">
          <div className="pf-section__header">
            <h2 className="pf-section__title">Información personal</h2>
            {!editingProfile && (
              <button className="pf-section__edit-btn" onClick={handleStartEditProfile}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar
              </button>
            )}
          </div>

          {editingProfile ? (
            <form className="pf-profile-form" onSubmit={handleSaveProfile} noValidate>
              <div className="pf-profile-form__grid">
                <div className={profileFieldClass("firstName")}>
                  <label className="pf-form-group__label" htmlFor="pf-firstName">
                    Nombre
                    {isFieldChanged("firstName") && <span className="pf-form-group__dot" />}
                  </label>
                  <input
                    id="pf-firstName"
                    className={profileInputClass("firstName")}
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
                    onBlur={() => markProfileTouched("firstName")}
                    placeholder="Tu nombre"
                    disabled={profileLoading}
                  />
                  {profileErrors.firstName && <span className="pf-form-group__err">{profileErrors.firstName}</span>}
                </div>
                <div className={profileFieldClass("lastName")}>
                  <label className="pf-form-group__label" htmlFor="pf-lastName">
                    Apellido
                    {isFieldChanged("lastName") && <span className="pf-form-group__dot" />}
                  </label>
                  <input
                    id="pf-lastName"
                    className={profileInputClass("lastName")}
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
                    onBlur={() => markProfileTouched("lastName")}
                    placeholder="Tu apellido"
                    disabled={profileLoading}
                  />
                  {profileErrors.lastName && <span className="pf-form-group__err">{profileErrors.lastName}</span>}
                </div>
                <div className={profileFieldClass("email")}>
                  <label className="pf-form-group__label" htmlFor="pf-email">
                    Correo electrónico
                    {isFieldChanged("email") && <span className="pf-form-group__dot" />}
                  </label>
                  <input
                    id="pf-email"
                    className={profileInputClass("email")}
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                    onBlur={() => markProfileTouched("email")}
                    placeholder="tu@correo.com"
                    required
                    disabled={profileLoading}
                  />
                  {profileErrors.email && <span className="pf-form-group__err">{profileErrors.email}</span>}
                </div>
                <div className={profileFieldClass("phone")}>
                  <label className="pf-form-group__label" htmlFor="pf-phone">
                    Teléfono
                    {isFieldChanged("phone") && <span className="pf-form-group__dot" />}
                  </label>
                  <input
                    id="pf-phone"
                    className={profileInputClass("phone")}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: filterPhoneDigits(e.target.value) }))}
                    onBlur={() => markProfileTouched("phone")}
                    placeholder="Solo números (7-15 dígitos)"
                    disabled={profileLoading}
                  />
                  {profileErrors.phone && <span className="pf-form-group__err">{profileErrors.phone}</span>}
                </div>
              </div>
              <div className="pf-profile-form__actions">
                <button type="button" className="pf-btn pf-btn--ghost" onClick={() => setEditingProfile(false)} disabled={profileLoading}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`pf-btn pf-btn--primary${profileSaved ? " pf-btn--saved" : ""}`}
                  disabled={profileLoading || !isProfileValid || !isProfileDirty}
                >
                  {profileLoading ? (
                    <span className="pf-btn__inner">
                      <span className="pf-spinner--sm" />
                      Guardando...
                    </span>
                  ) : profileSaved ? (
                    <span className="pf-btn__inner">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Cambios guardados
                    </span>
                  ) : !isProfileDirty ? (
                    "Sin cambios"
                  ) : (
                    "Guardar cambios"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="pf-info-grid">
              <div className="pf-info-item">
                <span className="pf-info-item__label">Nombre</span>
                <span className="pf-info-item__value">{user.firstName || "—"}</span>
              </div>
              <div className="pf-info-item">
                <span className="pf-info-item__label">Apellido</span>
                <span className="pf-info-item__value">{user.lastName || "—"}</span>
              </div>
              <div className="pf-info-item">
                <span className="pf-info-item__label">Correo</span>
                <span className="pf-info-item__value">{user.email}</span>
              </div>
              <div className="pf-info-item">
                <span className="pf-info-item__label">Teléfono</span>
                <span className="pf-info-item__value">{user.phone || "—"}</span>
              </div>
            </div>
          )}
        </section>

        {/* Section 3: Activity */}
        <section className="pf-section">
          <h2 className="pf-section__title">Actividad</h2>
          <div className="pf-activity-grid">
            <button className="pf-activity" onClick={() => navigate("/orders")}>
              <div className="pf-activity__icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <div className="pf-activity__text">
                <span className="pf-activity__name">Mis pedidos</span>
                <span className="pf-activity__desc">Revisa el estado de tus compras</span>
              </div>
              <div className="pf-activity__right">
                <span className="pf-activity__count">{stats.orders}</span>
                <svg className="pf-activity__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>

            <button className="pf-activity" onClick={() => navigate("/favorites")}>
              <div className="pf-activity__icon pf-activity__icon--heart">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <div className="pf-activity__text">
                <span className="pf-activity__name">Favoritos</span>
                <span className="pf-activity__desc">Productos que guardaste</span>
              </div>
              <div className="pf-activity__right">
                <span className="pf-activity__count">{stats.favorites}</span>
                <svg className="pf-activity__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>

            <button className="pf-activity" onClick={() => navigate("/products")}>
              <div className="pf-activity__icon pf-activity__icon--star">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="pf-activity__text">
                <span className="pf-activity__name">Mis reseñas</span>
                <span className="pf-activity__desc">Opiniones que dejaste</span>
              </div>
              <div className="pf-activity__right">
                <span className="pf-activity__count">{stats.reviews}</span>
                <svg className="pf-activity__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          </div>
        </section>

        {/* Section 4: Theme Preferences */}
        <section className="pf-section">
          <h2 className="pf-section__title">Preferencias</h2>
          <div className="pf-theme-selector">
            <button
              className={`pf-theme-option${theme === "light" ? " pf-theme-option--active" : ""}`}
              onClick={() => setTheme("light")}
              aria-label="Tema claro"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              <span className="pf-theme-option__label">Claro</span>
            </button>
            <button
              className={`pf-theme-option${theme === "dark" ? " pf-theme-option--active" : ""}`}
              onClick={() => setTheme("dark")}
              aria-label="Tema oscuro"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
              <span className="pf-theme-option__label">Oscuro</span>
            </button>
            <button
              className={`pf-theme-option${theme === "system" ? " pf-theme-option--active" : ""}`}
              onClick={() => setTheme("system")}
              aria-label="Tema del sistema"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <span className="pf-theme-option__label">Sistema</span>
            </button>
          </div>
        </section>

        {/* Section 5: Change Password */}
        <section className="pf-section">
          <h2 className="pf-section__title">Seguridad</h2>
          <div className="pf-password-card">
            <div className="pf-password-card__header">
              <div className="pf-settings-card__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <div>
                <h3 className="pf-password-card__title">Cambiar contraseña</h3>
                <p className="pf-password-card__desc">Mantén tu cuenta segura con una contraseña fuerte</p>
              </div>
            </div>

            {pwSuccess && (
              <div className="pf-alert pf-alert--success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Contraseña actualizada correctamente.
              </div>
            )}

            <form className="pf-password-form" onSubmit={handleChangePassword} noValidate>
              <div className="pf-form-group">
                <label className="pf-form-group__label" htmlFor="pw-current">Contraseña actual</label>
                <div className="pf-input-wrap">
                  <input
                    id="pw-current"
                    className="pf-input"
                    type={showCurrentPw ? "text" : "password"}
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="pf-toggle-pw"
                    onClick={() => setShowCurrentPw((p) => !p)}
                    tabIndex={-1}
                  >
                    {showCurrentPw ? (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="pf-form-group">
                <label className="pf-form-group__label" htmlFor="pw-new">Nueva contraseña</label>
                <div className="pf-input-wrap">
                  <input
                    id="pw-new"
                    className="pf-input"
                    type={showNewPw ? "text" : "password"}
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="pf-toggle-pw"
                    onClick={() => setShowNewPw((p) => !p)}
                    tabIndex={-1}
                  >
                    {showNewPw ? (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="pf-form-group">
                <label className="pf-form-group__label" htmlFor="pw-confirm">Confirmar contraseña</label>
                <input
                  id="pw-confirm"
                  className="pf-input"
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Repite la nueva contraseña"
                  autoComplete="new-password"
                />
              </div>
              <div className="pf-password-form__actions">
                <button type="submit" className="pf-btn pf-btn--primary" disabled={pwLoading}>
                  {pwLoading ? (
                    <span className="pf-btn__inner">
                      <span className="pf-spinner--sm" />
                      Actualizando...
                    </span>
                  ) : (
                    "Actualizar contraseña"
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Section 6: Addresses */}
        <section className="pf-section">
          <div className="pf-section__header">
            <h2 className="pf-section__title">Mis direcciones</h2>
            {editingAddress === null && (
              <button className="pf-section__add-btn" onClick={handleStartAddAddress}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Agregar dirección
              </button>
            )}
          </div>

          {editingAddress !== null && (
            <div className="pf-address-form-card">
              <h3 className="pf-address-form-card__title">
                {editingAddress === "new" ? "Nueva dirección" : "Editar dirección"}
              </h3>
              <form className="pf-address-form" onSubmit={handleSaveAddress} noValidate>
                <div className="pf-address-form__grid">
                  <div className="pf-form-group">
                    <label className="pf-form-group__label" htmlFor="addr-label">Nombre</label>
                    <input
                      id="addr-label"
                      className="pf-input"
                      type="text"
                      value={addressForm.label}
                      onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))}
                      placeholder="Casa, Trabajo, etc."
                    />
                  </div>
                  <div className="pf-form-group">
                    <label className="pf-form-group__label" htmlFor="addr-recipient">Destinatario</label>
                    <input
                      id="addr-recipient"
                      className="pf-input"
                      type="text"
                      value={addressForm.recipient}
                      onChange={(e) => setAddressForm((p) => ({ ...p, recipient: e.target.value }))}
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div className="pf-form-group">
                    <label className="pf-form-group__label" htmlFor="addr-phone">Teléfono</label>
                    <input
                      id="addr-phone"
                      className="pf-input"
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="pf-form-group pf-form-group--full">
                    <label className="pf-form-group__label" htmlFor="addr-street">Dirección</label>
                    <input
                      id="addr-street"
                      className="pf-input"
                      type="text"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm((p) => ({ ...p, street: e.target.value }))}
                      placeholder="Calle, número, barrio"
                    />
                  </div>
                  <div className="pf-form-group">
                    <label className="pf-form-group__label" htmlFor="addr-city">Ciudad</label>
                    <input
                      id="addr-city"
                      className="pf-input"
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                      placeholder="Ciudad"
                    />
                  </div>
                  <div className="pf-form-group">
                    <label className="pf-form-group__label" htmlFor="addr-state">Departamento</label>
                    <input
                      id="addr-state"
                      className="pf-input"
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                      placeholder="Departamento"
                    />
                  </div>
                  <div className="pf-form-group">
                    <label className="pf-form-group__label" htmlFor="addr-postal">Código postal</label>
                    <input
                      id="addr-postal"
                      className="pf-input"
                      type="text"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm((p) => ({ ...p, postalCode: e.target.value }))}
                      placeholder="Opcional"
                    />
                  </div>
                  <div className="pf-form-group pf-form-group--full">
                    <label className="pf-form-group__label" htmlFor="addr-instructions">Instrucciones</label>
                    <textarea
                      id="addr-instructions"
                      className="pf-input pf-input--textarea"
                      value={addressForm.instructions}
                      onChange={(e) => setAddressForm((p) => ({ ...p, instructions: e.target.value }))}
                      placeholder="Ej: Tocar timbre 3B, dejar en portería..."
                      rows={2}
                    />
                  </div>
                </div>
                <div className="pf-address-form__checkbox">
                  <label className="pf-checkbox">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))}
                    />
                    <span>Establecer como dirección predeterminada</span>
                  </label>
                </div>
                <div className="pf-address-form__actions">
                  <button type="button" className="pf-btn pf-btn--ghost" onClick={handleCancelAddress} disabled={addressLoading}>
                    Cancelar
                  </button>
                  <button type="submit" className="pf-btn pf-btn--primary" disabled={addressLoading}>
                    {addressLoading ? (
                      <span className="pf-btn__inner">
                        <span className="pf-spinner--sm" />
                        Guardando...
                      </span>
                    ) : (
                      editingAddress === "new" ? "Crear dirección" : "Guardar cambios"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {addressesLoading && editingAddress === null && (
            <div className="pf-addresses-loading">
              <span className="pf-spinner" />
            </div>
          )}

          {!addressesLoading && editingAddress === null && addresses.length === 0 && (
            <div className="pf-addresses-empty">
              <div className="pf-addresses-empty__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <p className="pf-addresses-empty__text">No tienes direcciones guardadas</p>
              <p className="pf-addresses-empty__sub">Agrega una dirección para usarla en tus compras</p>
            </div>
          )}

          {!addressesLoading && editingAddress === null && addresses.length > 0 && (
            <div className="pf-addresses-grid">
              {addresses.map((addr) => (
                <div key={addr.id} className={`pf-address-card ${addr.isDefault ? "pf-address-card--default" : ""}`}>
                  {addr.isDefault && (
                    <span className="pf-address-card__badge">Predeterminada</span>
                  )}
                  <div className="pf-address-card__header">
                    <span className="pf-address-card__label">{addr.label}</span>
                  </div>
                  <div className="pf-address-card__body">
                    <p className="pf-address-card__recipient">{addr.recipient}</p>
                    <p className="pf-address-card__street">{addr.street}</p>
                    <p className="pf-address-card__city">{addr.city}, {addr.state}</p>
                    {addr.postalCode && <p className="pf-address-card__postal">CP: {addr.postalCode}</p>}
                    {addr.phone && <p className="pf-address-card__phone">Tel: {addr.phone}</p>}
                    {addr.instructions && <p className="pf-address-card__instructions">{addr.instructions}</p>}
                  </div>
                  <div className="pf-address-card__actions">
                    {!addr.isDefault && (
                      <button className="pf-address-card__action" onClick={() => handleSetDefault(addr.id)}>
                        Predeterminar
                      </button>
                    )}
                    <button className="pf-address-card__action" onClick={() => handleStartEditAddress(addr)}>
                      Editar
                    </button>
                    <button className="pf-address-card__action pf-address-card__action--danger" onClick={() => handleDeleteAddress(addr.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 7: Admin */}
        {isAdmin && (
          <section className="pf-section">
            <h2 className="pf-section__title">Administración</h2>
            <div className="pf-settings-grid">
              <button className="pf-settings-card pf-settings-card--admin" onClick={() => navigate("/admin")}>
                <div className="pf-settings-card__icon pf-settings-card__icon--admin">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
                <div className="pf-settings-card__text">
                  <span className="pf-settings-card__name">Panel de Administración</span>
                  <span className="pf-settings-card__desc">Gestiona productos, pedidos y usuarios</span>
                </div>
                <svg className="pf-settings-card__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </section>
        )}

        {/* Section 8: Danger Zone */}
        <section className="pf-section pf-section--danger">
          <h2 className="pf-section__title pf-section__title--danger">Zona de peligro</h2>
          <div className="pf-danger-card">
            <div className="pf-danger-card__info">
              <h3 className="pf-danger-card__title">Eliminar cuenta</h3>
              <p className="pf-danger-card__desc">
                Esta acción es permanente y no se puede deshacer. Se eliminarán todos tus datos, pedidos y reseñas.
              </p>
            </div>
            <button className="pf-btn pf-btn--danger-disabled" disabled>
              Próximamente
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Profile;
