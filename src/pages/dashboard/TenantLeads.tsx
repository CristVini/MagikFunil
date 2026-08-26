import { useState, useEffect } from "react";
import { supabase } from "@lib/supabase";
import { useAuth } from "@hooks/useAuth";
import { Search, Filter, Download, Loader2, MoreVertical, Edit, MessageSquare, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { formatCurrency, formatNumber } from "@lib/utils";
import { cn } from "@lib/utils";

type LeadStatus = "new" | "contacted" | "won" | "lost";

interface Lead {
  id: string;
  name: string | null;
  phone: string | null;
  winning_profile: string | null;
  secondary_profile: string | null;
  answers: Record<string, any> | null;
  source_url: string | null;
  status: LeadStatus;
  created_at: string;
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; icon: any }> = {
  new: { label: "Novo", color: "bg-blue-500/10 text-blue-600", icon: Clock },
  contacted: { label: "Em contato", color: "bg-amber-500/10 text-amber-600", icon: MessageSquare },
  won: { label: "Convertido", color: "bg-green-500/10 text-green-600", icon: CheckCircle },
  lost: { label: "Perdido", color: "bg-red-500/10 text-red-600", icon: XCircle },
};

export function TenantLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"created_at" | "name" | "status">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  const tenantId = user?.user_metadata?.tenant_id;

  useEffect(() => {
    loadLeads();
  }, [tenantId]);

  const loadLeads = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      setLeads(data || []);
    } catch (err) {
      console.error("Erro ao carregar leads:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await supabase.from("leads").update({ status: newStatus }).eq("id", leadId);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const filteredLeads = leads
    .filter(l => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          l.name?.toLowerCase().includes(s) ||
          l.phone?.toLowerCase().includes(s) ||
          l.winning_profile?.toLowerCase().includes(s)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortBy] || "";
      const bVal = b[sortBy] || "";
      const cmp = aVal > bVal ? 1 : -1;
      return sortOrder === "asc" ? cmp : -cmp;
    });

  const statusCounts = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {} as Record<LeadStatus, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-950" style={{ fontFamily: "var(--font-display)" }}>
            Leads
          </h1>
          <p className="text-stone-500 mt-1">Gerencie e acompanhe seus contatos</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-stone-950 text-stone-50 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center gap-2">
            <Download size={18} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map(status => (
          <div key={status} className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <p className="text-2xl font-bold text-stone-950">{statusCounts[status] || 0}</p>
            <p className="text-xs text-stone-500 capitalize">{STATUS_CONFIG[status].label}</p>
          </div>
        ))}
        <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
          <p className="text-2xl font-bold text-stone-950">{leads.length}</p>
          <p className="text-xs text-stone-500">Total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, telefone, perfil..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as LeadStatus | "all")}
            className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Todos os status</option>
            <option value="new">Novo</option>
            <option value="contacted">Em contato</option>
            <option value="won">Convertido</option>
            <option value="lost">Perdido</option>
          </select>
          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={e => {
              const [sb, so] = e.target.value.split(":");
              setSortBy(sb as any);
              setSortOrder(so as any);
            }}
            className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="created_at:desc">Mais recentes</option>
            <option value="created_at:asc">Mais antigos</option>
            <option value="name:asc">Nome A-Z</option>
            <option value="name:desc">Nome Z-A</option>
            <option value="status:asc">Status A-Z</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <p className="mb-4">Nenhum lead encontrado.</p>
            <p className="text-sm">Divulgue seu funil para começar a receber leads.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Perfil</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Origem</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-stone-950">{lead.name || "Não informado"}</p>
                        <p className="text-sm text-stone-500">{lead.phone || "Sem telefone"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.winning_profile && (
                        <span className="px-2 py-1 bg-stone-100 text-stone-700 rounded-full text-xs font-medium">
                          {lead.winning_profile}
                        </span>
                      )}
                      {lead.secondary_profile && (
                        <span className="ml-1 px-2 py-1 bg-stone-100 text-stone-500 rounded-full text-xs font-medium">
                          + {lead.secondary_profile}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-stone-500 truncate max-w-xs">{lead.source_url || "Direto"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={e => updateStatus(lead.id, e.target.value as LeadStatus)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-semibold border",
                          STATUS_CONFIG[lead.status].color,
                          "border-transparent"
                        )}
                      >
                        {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map(s => (
                          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      {new Date(lead.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-stone-400 hover:text-amber-500 hover:bg-amber-50/50 rounded-lg transition-colors" title="Ver detalhes">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredLeads.length === 0 && leads.length > 0 && (
          <div className="p-12 text-center text-stone-500">
            Nenhum lead encontrado com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
}