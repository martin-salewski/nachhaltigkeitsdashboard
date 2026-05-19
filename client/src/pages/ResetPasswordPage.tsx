import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Logo from "@/assets/icons/HSM_Logo_Dachmarke_RGB.svg";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Passwort muss mindestens 8 Zeichen haben."); return; }
    if (password !== confirm) { setError("Passwörter stimmen nicht überein."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? "Fehler"); return; }
      navigate("/login");
    } catch {
      setError("Verbindungsfehler. Bitte erneut versuchen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: '"SimStd", sans-serif' }}>
      <nav className="bg-white border-b border-gray-200 w-full z-20">
        <div className="flex items-center w-full max-w-360 mx-auto px-6 py-4">
          <img src={Logo} className="h-7" alt="Hochschule Mainz" />
        </div>
      </nav>
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-black/70">Neues Passwort festlegen</h1>
            <p className="text-sm text-black/40 mt-1">Geben Sie Ihr neues Passwort ein.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black/60">Neues Passwort</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm outline-none focus:border-chart-1 focus:ring-1 focus:ring-chart-1 transition-colors"
                  placeholder="Mindestens 8 Zeichen"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 cursor-pointer">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black/60">Passwort wiederholen</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-chart-1 focus:ring-1 focus:ring-chart-1 transition-colors"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full rounded-lg bg-chart-1 hover:bg-[#1D3A6A] text-white font-medium py-2.5 text-sm transition-colors cursor-pointer disabled:opacity-60">
              {loading ? "Speichern…" : "Passwort speichern"}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-sm text-black/40 hover:text-black/70">Zurück zum Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
