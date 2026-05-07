import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "@/assets/icons/HSM_Logo_Dachmarke_RGB.svg";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem("auth_token", data.token);
        navigate("/admin");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? t("login.error"));
      }
    } catch {
      setError(t("login.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: '"SimStd", sans-serif' }}>
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 w-full z-20">
        <div className="flex items-center justify-between w-full max-w-360 mx-auto px-6 py-4">
          <a href="https://www.hs-mainz.de/" className="flex items-center space-x-3">
            <img src={Logo} className="h-7" alt="Hochschule Mainz" />
          </a>
        </div>
      </nav>

      {/* Main */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-xl font-bold text-black/70">{t("login.title")}</h1>
              <p className="text-sm text-black/40 mt-1">{t("login.subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-black/60">
                  {t("login.username")}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-chart-1 focus:ring-1 focus:ring-chart-1 transition-colors"
                  placeholder={t("login.usernamePlaceholder")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-black/60">
                  {t("login.password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm outline-none focus:border-chart-1 focus:ring-1 focus:ring-chart-1 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-black/40 hover:text-black/70">
                  Passwort vergessen?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-chart-1 hover:bg-[#1D3A6A] text-white font-medium py-2.5 text-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? t("login.loading") : t("login.submit")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
