import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import Input from "../components/Input";
import Button from "../components/Button";
import { showWarning } from "../utils/alerts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      showWarning("Campo requerido", "Por favor ingresa tu correo electrónico.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      showWarning("Email inválido", "El formato del correo electrónico no es válido.");
      return;
    }
    if (!password) {
      showWarning("Campo requerido", "Por favor ingresa una contraseña.");
      return;
    }
    if (password.length < 6) {
      showWarning("Contraseña débil", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      showWarning("Contraseñas no coinciden", "Las contraseñas ingresadas no son iguales.");
      return;
    }

    setLoading(true);

    try {
      const response = await register({ email: email.trim(), password });
      setSuccessMessage(response.data?.message || "Registro exitoso");
      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error en el registro";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="form-card">
        <h2 style={{marginTop:0}}>Registro</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <Button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</Button>
          </div>
        </form>
        {error && <p className="form-error">{error}</p>}
        {successMessage && <p style={{color:'green'}}>{successMessage}</p>}
      </div>
    </main>
  );
}

export default RegisterPage;
