import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Logo from "@/assets/icons/HSM_Logo_Dachmarke_RGB.svg";
import { useTranslation } from "react-i18next";
import { CheckCircle, Circle, Plus, LogOut, Trash2, UserPlus, PlusCircle, MinusCircle, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/utils/auth";
import { signOut } from "@/lib/auth-client";

const API = "";

// Eingabefelder laufen auf der Hausschrift, der Rest der Seite auf SimStd
const inputFont = { fontFamily: '"HelveticaNowText", sans-serif' };

interface SustainabilityGoal {
  id: number;
  title: string;
  description: string | null;
  targetYear: number;
  targetValue: number | null;
  unit: string | null;
  isCompleted: number;
}

interface GoalLog {
  id: number;
  action: "created" | "deleted";
  goalTitle: string;
  username: string;
  timestamp: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
}

// ── Goals tab ──────────────────────────────────────────────────────────────

function GoalsTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", description: "", targetYear: new Date().getFullYear() + 1, targetValue: "" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const { data: goals = [], isLoading } = useQuery<SustainabilityGoal[]>({
    queryKey: ["sustainability_goals"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/sustainability_goals`);
      return res.json();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API}/api/sustainability_goals/${id}/toggle`, { method: "PATCH" });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sustainability_goals"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`${API}/api/sustainability_goals/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sustainability_goals"] }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; targetYear: number; targetValue: number | null }) => {
      const res = await fetch(`${API}/api/sustainability_goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sustainability_goals"] });
      setForm({ title: "", description: "", targetYear: new Date().getFullYear() + 1, targetValue: "" });
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);
    },
    onError: () => setFormError("Fehler beim Speichern."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim()) { setFormError("Titel ist erforderlich."); return; }
    createMutation.mutate({
      title: form.title.trim(),
      description: form.description.trim(),
      targetYear: Number(form.targetYear),
      targetValue: form.targetValue !== "" ? Number(form.targetValue) : null,
    });
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-bold text-black/70 mb-4">{t("goals.title")}</h2>
        {isLoading ? (
          <p className="text-sm text-black/40">{t("loading")}</p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            {goals.map((goal) => {
              const completed = goal.isCompleted === 1;
              return (
                <div key={goal.id} className="flex items-start gap-4 px-5 py-4">
                  <button onClick={() => toggleMutation.mutate(goal.id)} disabled={toggleMutation.isPending}
                    className="mt-0.5 shrink-0 cursor-pointer disabled:opacity-50">
                    {completed ? <CheckCircle className="size-5 text-chart-1" /> : <Circle className="size-5 text-black/25" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${completed ? "text-black/40 line-through" : "text-black/70"}`}>
                      {goal.title}
                      {goal.targetValue && goal.unit ? ` (${goal.targetValue}${goal.unit}, ${goal.targetYear})` : ` (${goal.targetYear})`}
                      {completed && <span className="ml-2 text-black/40 no-underline font-normal">(abgeschlossen)</span>}
                    </p>
                    {goal.description && <p className="text-xs text-black/40 mt-0.5">{goal.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${completed ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-chart-1"}`}>
                      {completed ? "Abgeschlossen" : "Aktiv"}
                    </span>
                    <button onClick={() => deleteMutation.mutate(goal.id)} disabled={deleteMutation.isPending}
                      className="text-black/20 hover:text-red-500 transition-colors cursor-pointer">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && <p className="px-5 py-4 text-sm text-black/40">{t("noData")}</p>}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-bold text-black/70 mb-4">Neues Ziel hinzufügen</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-black/60">Titel *</label>
                <input type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-chart-1 focus:ring-1 focus:ring-chart-1 transition-colors"
                  placeholder="z.B. CO₂-Reduktion um 50 %" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-black/60">Zieljahr *</label>
                <input type="number" value={form.targetYear} onChange={(e) => setForm(f => ({ ...f, targetYear: Number(e.target.value) }))}
                  required min={2024} max={2100}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-chart-1 focus:ring-1 focus:ring-chart-1 transition-colors" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black/60">Beschreibung *</label>
              <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={2} required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-chart-1 focus:ring-1 focus:ring-chart-1 transition-colors resize-none"
                placeholder="Kurze Beschreibung…" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black/60">CO₂-Einsparung (t) *</label>
              <input type="number" value={form.targetValue} onChange={(e) => setForm(f => ({ ...f, targetValue: e.target.value }))}
                required min={0} step="0.1"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-chart-1 focus:ring-1 focus:ring-chart-1 transition-colors"
                placeholder="z.B. 120.5" />
            </div>
            {formError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
            {formSuccess && <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">Ziel erfolgreich gespeichert.</p>}
            <button type="submit" disabled={createMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-chart-1 hover:bg-[#1D3A6A] text-white font-medium px-4 py-2.5 text-sm transition-colors cursor-pointer disabled:opacity-60">
              <Plus className="size-4" />
              {createMutation.isPending ? "Speichern…" : "Ziel hinzufügen"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

// ── Logs tab ───────────────────────────────────────────────────────────────

function LogsTab() {
  const { data: logs = [], isLoading } = useQuery<GoalLog[]>({
    queryKey: ["goal_logs"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/goal_logs`);
      return res.json();
    },
    refetchInterval: 30000,
  });

  function formatTimestamp(ts: number) {
    const d = new Date(ts * 1000);
    return d.toLocaleString("de-DE", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-black/70">Aktivitätsprotokoll</h2>
      {isLoading ? (
        <p className="text-sm text-black/40">Laden…</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="shrink-0">
                {log.action === "created"
                  ? <PlusCircle className="size-4 text-green-500" />
                  : <MinusCircle className="size-4 text-red-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-black/70 truncate">
                  <span className="font-medium">{log.username}</span>
                  {log.action === "created" ? " hat das Ziel " : " hat das Ziel "}
                  <span className="font-medium">„{log.goalTitle}"</span>
                  {log.action === "created" ? " hinzugefügt" : " entfernt"}
                </p>
              </div>
              <span className="text-xs text-black/35 shrink-0 tabular-nums">{formatTimestamp(log.timestamp)}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="px-5 py-4 text-sm text-black/40">Noch keine Aktivitäten vorhanden.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Users tab (nur admin) ──────────────────────────────────────────────────

function UsersTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", role: "mitarbeiterin" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const res = await fetch(`${API}/api/admin/users`);
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`${API}/api/admin/users/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin_users"] }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; role: string }) => {
      const res = await fetch(`${API}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw await res.json();
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_users"] });
      setForm({ name: "", email: "", role: "mitarbeiterin" });
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);
    },
    onError: (err: any) => setFormError(err?.message ?? "Fehler beim Erstellen."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    createMutation.mutate(form);
  }

  const { user: currentUser } = useAuth();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-bold text-black/70 mb-4">Alle Benutzer</h2>
        {isLoading ? (
          <p className="text-sm text-black/40">Laden…</p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black/70">{user.name}</p>
                  <p className="text-xs text-black/40">{user.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  user.role === "admin" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-chart-1"
                }`}>
                  {user.role === "admin" ? "Admin" : "MitarbeiterIn"}
                </span>
                {user.banned && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0 bg-red-50 text-red-600">
                    Gesperrt
                  </span>
                )}
                {user.id !== currentUser?.id && (
                  <button onClick={() => deleteMutation.mutate(user.id)}
                    className="text-black/20 hover:text-red-500 transition-colors cursor-pointer shrink-0">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))}
            {users.length === 0 && <p className="px-5 py-4 text-sm text-black/40">Keine Benutzer gefunden.</p>}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-bold text-black/70 mb-4">Neuen Benutzer einladen</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-black/60">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-chart-1 focus:ring-1 focus:ring-chart-1 transition-colors"
                  style={inputFont}
                  placeholder="Max Mustermann" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-black/60">E-Mail-Adresse *</label>
                <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-chart-1 focus:ring-1 focus:ring-chart-1 transition-colors"
                  style={inputFont}
                  placeholder="m.mustermann@hs-mainz.de" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-black/60">Rolle *</label>
              <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-chart-1 focus:ring-1 focus:ring-chart-1 transition-colors bg-white"
                style={inputFont}>
                <option value="mitarbeiterin">MitarbeiterIn</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {formError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
            {formSuccess && <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">Einladung wurde gesendet.</p>}
            <button type="submit" disabled={createMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-chart-1 hover:bg-[#1D3A6A] text-white font-medium px-4 py-2.5 text-sm transition-colors cursor-pointer disabled:opacity-60">
              <UserPlus className="size-4" />
              {createMutation.isPending ? "Senden…" : "Einladung senden"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

// ── Main AdminPage ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin: admin } = useAuth();
  const [activeTab, setActiveTab] = useState<"goals" | "logs" | "users">("goals");

  async function handleLogout() {
    // Löscht das Session-Cookie serverseitig; im Browser liegt nichts mehr,
    // was hier aufgeräumt werden müsste.
    await signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: '"SimStd", sans-serif' }}>
      <nav className="bg-white border-b border-gray-200 w-full sticky top-0 z-20">
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto px-6 py-4">
          <a href="https://www.hs-mainz.de/" className="flex items-center space-x-3">
            <img src={Logo} className="h-7" alt="Hochschule Mainz" />
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-black/50">Admin</span>
            <button onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-sm text-black/40 hover:text-black/70 transition-colors cursor-pointer">
              <LayoutDashboard className="size-4" />
              Dashboard
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-black/40 hover:text-black/70 transition-colors cursor-pointer">
              <LogOut className="size-4" />
              Abmelden
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-gray-200">
          <button onClick={() => setActiveTab("goals")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
              activeTab === "goals" ? "border-chart-1 text-chart-1" : "border-transparent text-black/40 hover:text-black/70"
            }`}>
            Ziele
          </button>
          <button onClick={() => setActiveTab("logs")}
            className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
              activeTab === "logs" ? "border-chart-1 text-chart-1" : "border-transparent text-black/40 hover:text-black/70"
            }`}>
            Logs
          </button>
          {admin && (
            <button onClick={() => setActiveTab("users")}
              className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
                activeTab === "users" ? "border-chart-1 text-chart-1" : "border-transparent text-black/40 hover:text-black/70"
              }`}>
              Rollen & Rechte
            </button>
          )}
        </div>

        {activeTab === "goals" && <GoalsTab />}
        {activeTab === "logs" && <LogsTab />}
        {activeTab === "users" && admin && <UsersTab />}
      </div>
    </div>
  );
}
