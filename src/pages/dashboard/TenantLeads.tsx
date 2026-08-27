import { useState } from "react";
import { Download, Filter, ChevronDown, Eye, MessageCircle, Search } from "lucide-react";
import { MOCK_LEADS } from "./mockData";

// Face 2.4 — Leads: quem chegou ao resultado e clicou em produtos.
const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  new: { label: "Novo", color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  contacted: { label: "Contatado", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  won: { label: "Ganho", color: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  lost: { label: "Perdido", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

export function TenantLeads() {
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [profileFilter, setProfileFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  const profilesAvailable = Array.from(new Set(MOCK_LEADS.map(l => l.profileLabel)));
  const statusCounts = Object.keys(STATUS_CONFIG).reduce<Record<string, number>>((acc, s) => {
    acc[s] = leads.filter(l => l.status === s).length;
    return acc;
  }, {});

  const filtered = leads.filter(l => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (profileFilter !== "all" && l.profileLabel !== profileFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return l.name.toLowerCase().includes(s) || l.product_clicked.toLowerCase().includes(s);
    }
    return true;
  });

  const updateStatus = (id: string, status: any) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const exportCSV = () => {
    const header = ["Nome", "Telefone", "Data", "Perfil", "Produto clicado", "Status", "Respostas"];
    const rows = filtered.map(l => [
      l.name, l.phone, new Date(l.created_at).toLocaleDateString("pt-BR"),
      l.profileLabel, l.product_clicked || "-", l.status,
      JSON.stringify(l.answers),
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
            Leads
          </h1>
          <p className="text-stone-500 mt-1">Quem chegou ao resultado do seu funil</p>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2"
        >
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      {/* Stats por status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.keys(STATUS_CONFIG).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
            className={`bg-white rounded-xl border p-4 text-left transition-all ${statusFilter === s ? "border-amber-400 ring-2 ring-amber-200" : "border-stone-200 hover:border-stone-300"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
              <span className="text-xs text-stone-500">{STATUS_CONFIG[s].label}</span>
            </div>
            <p className="text-2xl font-bold text-stone-950">{statusCounts[s] || 0}</p>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou produto..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <select
            value={profileFilter}
            onChange={e => setProfileFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
          >
            <option value="all">Todos os perfis</option>
            {profilesAvailable.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-left text-xs uppercase tracking-wider text-stone-500">
                <th className="px-6 py-3 font-semibold">Lead</th>
                <th className="px-6 py-3 font-semibold">Perfil</th>
                <th className="px-6 py-3 font-semibold">Produto</th>
                <th className="px-6 py-3 font-semibold">Data</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-stone-950">{l.name}</p>
                    <p className="text-xs text-stone-500">{l.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-medium">{l.profileLabel}</span>
                  </td>
                  <td className="px-6 py-4 text-stone-600">{l.product_clicked || <span className="text-stone-400">—</span>}</td>
                  <td className="px-6 py-4 text-stone-500 whitespace-nowrap">{new Date(l.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-6 py-4">
                    <select
                      value={l.status}
                      onChange={e => updateStatus(l.id, e.target.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${STATUS_CONFIG[l.status].color}`}
                    >
                      {Object.keys(STATUS_CONFIG).map(s => (
                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedLead(l)}
                        className="p-2 text-stone-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Ver respostas"
                      >
                        <Eye size={16} />
                      </button>
                      <a
                        href={`https://wa.me/55${l.phone.replace(/\D/g, "").slice(-11)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Chamar no WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-stone-500">
            Nenhum lead encontrado com os filtros atuais.
          </div>
        )}
      </div>

      {/* Modal de respostas */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-display font-bold text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
                  {selectedLead.name}
                </h3>
                <p className="text-sm text-stone-500">{selectedLead.phone}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-1 text-stone-400 hover:text-stone-600">
                <ChevronDown size={24} className="rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-xs text-stone-500">Perfil vencedor</p>
                <p className="font-medium text-stone-950">{selectedLead.profileLabel}</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-xs text-stone-500">Status</p>
                <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedLead.status].color}`}>
                  {STATUS_CONFIG[selectedLead.status].label}
                </span>
              </div>
            </div>

            <p className="text-sm font-medium text-stone-700 mb-2">Respostas do quiz (JSON)</p>
            <pre className="bg-stone-950 text-stone-100 rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap">{JSON.stringify(selectedLead.answers, null, 2)}</pre>

            <button onClick={() => setSelectedLead(null)} className="mt-5 w-full py-2.5 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}