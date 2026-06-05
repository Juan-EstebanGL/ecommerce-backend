import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import Input from "../components/Input";
import Button from "../components/Button";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await register({ email, password });
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
