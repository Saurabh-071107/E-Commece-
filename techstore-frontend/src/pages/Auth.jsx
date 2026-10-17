import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Auth({ mode = "login" }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (isRegister) await register(form);
      else await login(form);
      navigate(location.state?.from || "/account", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const handleQuickDemo = async (role = "customer") => {
    setBusy(true);
    setError("");
    try {
      const demoUser = role === "admin"
        ? { email: "admin@form.store", password: "password123" }
        : { email: "customer@form.store", password: "password123" };
      await login(demoUser);
      navigate(role === "admin" ? "/admin" : (location.state?.from || "/account"), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-image">
        <img
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85"
          alt="Considered modern workspace"
        />
        <div className="auth-image-content">
          <p className="eyebrow text-accent">FORM / YOUR SPACE</p>
          <h2>Good things,<br /><em>kept together.</em></h2>
          <p className="text-zinc-300 text-xs max-w-sm mt-2">
            Access curated audio profiles, live order tracking, and bespoke hardware warranty records.
          </p>
        </div>
      </div>

      <div className="auth-panel">
        <p className="eyebrow flex items-center gap-2">
          <span className="eyebrow-dot" /> {isRegister ? "JOIN THE COLLECTION" : "WELCOME BACK"}
        </p>
        <h1>{isRegister ? "Make yourself at home." : "Good to see you."}</h1>
        <p className="text-muted text-xs mt-2">
          {isRegister
            ? "Create an account to keep track of the hardware you love."
            : "Sign in to access your orders and saved shipping coordinates."}
        </p>

        {/* ONE-CLICK DEMO LOGIN BUTTONS */}
        {!isRegister && (
          <div className="demo-login-shortcuts mt-5 p-3.5 bg-paper rounded border border-line">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1 mb-2">
              <Sparkles size={12} className="text-accent" /> One-Click Demo Access
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("customer")}
                className="button button-outline text-xs flex-1 py-2 justify-center"
                disabled={busy}
              >
                Shopper Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("admin")}
                className="button button-dark text-xs flex-1 py-2 justify-center"
                disabled={busy}
              >
                Admin Demo
              </button>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="auth-form">
          {isRegister && (
            <label>
              Full name
              <input
                name="name"
                value={form.name}
                onChange={change}
                required
                placeholder="e.g. Aarav Sharma"
              />
            </label>
          )}

          <label>
            Email address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={change}
              required
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <div className="password-field">
              <input
                name="password"
                type={show ? "text" : "password"}
                value={form.password}
                onChange={change}
                minLength={isRegister ? 8 : 1}
                required
                placeholder={isRegister ? "At least 8 characters" : "Your password"}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="button button-dark w-full justify-center py-3.5 mt-2" disabled={busy}>
            {busy ? "Please wait…" : isRegister ? "Create Account" : "Sign In"}{" "}
            <ArrowRight size={17} />
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already registered with FORM?" : "New to FORM?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in instead" : "Create an account"}
          </Link>
        </p>

        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-line text-[11px] text-muted">
          <ShieldCheck size={14} />
          <span>Local mock session. No personal data shared or transmitted.</span>
        </div>
      </div>
    </div>
  );
}
