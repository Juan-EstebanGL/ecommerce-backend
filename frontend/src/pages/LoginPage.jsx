import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Input from "../components/Input";
import Button from "../components/Button";
import { showWarning } from "../utils/alerts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      showWarning("Campo requerido", "Por favor ingresa tu correo electrónico.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      showWarning("Email inválido", "El formato del correo electrónico no es válido.");
      return;
    }
    if (!password) {
      showWarning("Campo requerido", "Por favor ingresa tu contraseña.");
      return;
    }

    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      navigate("/products");
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Credenciales inválidas";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="form-card">
        <h2 style={{marginTop:0}}>Iniciar sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <Button type="submit" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</Button>
          </div>
        </form>
        {error && <p className="form-error">{error}</p>}
      </div>
    </main>
  );
}

export default LoginPage;
