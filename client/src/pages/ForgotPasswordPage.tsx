import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/assets/icons/HSM_Logo_Dachmarke_RGB.svg";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
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
          {sent ? (
            <div className="text-center space-y-3">
              <h1 className="text-xl font-bold text-black/70">E-Mail gesendet</h1>
              <p className="text-sm text-black/40">Falls ein Account mit dieser E-Mail existiert, wurde ein Reset-Link gesendet.</p>
              <Link to="/login" className="text-sm text-chart-1 hover:underline">Zurück zum Login</Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-xl font-bold text-black/70">Passwort vergessen</h1>
                <p className="text-sm text-black/40 mt-1">Geben Sie Ihre E-Mail-Adresse ein. Sie erhalten einen Link zum Zurücksetzen.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-black/60">E-Mail-Adresse</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-chart-1 focus:ring-1 focus:ring-chart-1 transition-colors"
                    placeholder="name@hs-mainz.de"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full rounded-lg bg-chart-1 hover:bg-[#1D3A6A] text-white font-medium py-2.5 text-sm transition-colors cursor-pointer disabled:opacity-60">
                  {loading ? "Senden…" : "Reset-Link senden"}
                </button>
                <div className="text-center">
                  <Link to="/login" className="text-sm text-black/40 hover:text-black/70">Zurück zum Login</Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
