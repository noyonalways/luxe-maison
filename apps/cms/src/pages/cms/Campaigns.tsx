import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Eye, BarChart3, Megaphone, MousePointer, Users, DollarSign } from 'lucide-react';
import { useTablePagination, PaginationControls } from '@/components/staff/TableControls';
import { mockDiscounts } from '@/data/cms-mock';
import { useCampaigns } from '@/context/CampaignsContext';
import type { Campaign, CampaignType, CampaignStatus } from '@/data/cms-types';
import { StatusBadge } from '@/components/staff/StatusBadge';

const campaignTypes: CampaignType[] = ['sale', 'seasonal', 'flash', 'launch'];

const emptyCampaign = {
  name: '', type: 'sale' as CampaignType, description: '', startDate: '', endDate: '',
  discountCode: '', targetAudience: 'All subscribers', budget: 0,
};

export default function Campaigns() {
  const { campaigns, addCampaign, updateCampaign } = useCampaigns();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState(emptyCampaign);
  const [detail, setDetail] = useState<Campaign | null>(null);

  const filtered = useMemo(() => campaigns.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  }), [campaigns, search, statusFilter]);

  const pagination = useTablePagination(filtered.length, 5);
  const paginated = pagination.paginateData(filtered);

  const openCreate = () => { setEditing(null); setForm(emptyCampaign); setShowForm(true); };
  const openEdit = (c: Campaign) => {
    setEditing(c);
    setForm({ name: c.name, type: c.type, description: c.description, startDate: c.startDate.slice(0, 10), endDate: c.endDate.slice(0, 10), discountCode: c.discountCode || '', targetAudience: c.targetAudience, budget: c.budget });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.startDate || !form.endDate) return;
    const now = new Date();
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const status: CampaignStatus = end < now ? 'ended' : start > now ? 'scheduled' : 'active';

    if (editing) {
      updateCampaign({ ...editing, ...form, status, startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString() });
    } else {
      const newCamp: Campaign = {
        id: `camp-${Date.now()}`, ...form, status,
        startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString(),
        revenue: 0, impressions: 0, clicks: 0, conversions: 0, createdAt: new Date().toISOString(),
      };
      addCampaign(newCamp);
    }
    setShowForm(false);
  };

  const totalBudget = campaigns.reduce((a, c) => a + c.budget, 0);
  const totalRevenue = campaigns.reduce((a, c) => a + c.revenue, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-heading text-2xl lg:text-3xl">Campaigns</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90">
          <Plus size={14} /> New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Campaigns', value: campaigns.length, icon: Megaphone },
          { label: 'Active', value: campaigns.filter(c => c.status === 'active').length, icon: BarChart3 },
          { label: 'Total Budget', value: `$${(totalBudget / 1000).toFixed(1)}k`, icon: DollarSign },
          { label: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign },
        ].map(s => (
          <div key={s.label} className="bg-background border border-border rounded p-4">
            <s.icon size={16} className="text-muted-foreground mb-3" />
            <p className="text-xl font-heading font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value.slice(0, 100)); pagination.resetPage(); }} placeholder="Search campaigns..."
            className="w-full pl-9 pr-4 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'active', 'scheduled', 'ended'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); pagination.resetPage(); }} className={`px-3 py-2 text-xs font-medium letter-wide uppercase border transition-smooth ${statusFilter === s ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}>
              {s}
            </button>
          ))}
          <div className="border-l border-border mx-1" />
          <button onClick={() => setView('table')} className={`px-3 py-2 text-xs border transition-smooth ${view === 'table' ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}>Table</button>
          <button onClick={() => setView('cards')} className={`px-3 py-2 text-xs border transition-smooth ${view === 'cards' ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}>Cards</button>
        </div>
      </div>

      {/* Table View */}
      {view === 'table' && (<>
        <div className="bg-background border border-border rounded overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Campaign</th>
                <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Type</th>
                <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Period</th>
                <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Budget</th>
                <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground text-right">Revenue</th>
                <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-smooth">
                  <td className="px-5 py-3">
                    <p className="font-medium">{c.name}</p>
                    {c.discountCode && <p className="text-xs text-muted-foreground font-mono">{c.discountCode}</p>}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground capitalize text-xs">{c.type}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{new Date(c.startDate).toLocaleDateString()} — {new Date(c.endDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3">${c.budget.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-medium">${c.revenue.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setDetail(c)} className="p-1.5 text-muted-foreground transition-smooth hover-gold" title="View"><Eye size={14} /></button>
                      <button onClick={() => openEdit(c)} className="p-1.5 text-muted-foreground transition-smooth hover-gold" title="Edit"><Edit size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-10 text-sm text-muted-foreground">No campaigns found.</div>}
        </div>
        <PaginationControls {...pagination} totalItems={filtered.length} />
      </>)}

      {/* Cards View */}
      {view === 'cards' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map(c => (
              <div key={c.id} className="bg-background border border-border rounded p-5 transition-smooth hover:shadow-soft">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{c.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{c.type}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{c.description}</p>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Eye size={12} /> {c.impressions.toLocaleString()} views</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MousePointer size={12} /> {c.clicks.toLocaleString()} clicks</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Users size={12} /> {c.conversions} converts</div>
                  <div className="flex items-center gap-1.5 text-xs font-medium"><DollarSign size={12} /> ${c.revenue.toLocaleString()}</div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                  <button onClick={() => setDetail(c)} className="flex-1 py-2 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground text-center">View</button>
                  <button onClick={() => openEdit(c)} className="flex-1 py-2 bg-foreground text-background text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90 text-center">Edit</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="col-span-full text-center py-10 text-sm text-muted-foreground">No campaigns found.</div>}
          </div>
          <PaginationControls {...pagination} totalItems={filtered.length} />
        </>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30" onClick={() => setDetail(null)}>
          <div className="bg-background w-full max-w-lg max-h-[85vh] overflow-y-auto m-4 shadow-elevated" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h2 className="font-heading text-lg">{detail.name}</h2>
              <button onClick={() => setDetail(null)} className="text-muted-foreground transition-smooth hover-gold text-sm">✕</button>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div className="flex items-center gap-3">
                <StatusBadge status={detail.status} />
                <span className="text-xs text-muted-foreground capitalize">{detail.type}</span>
              </div>
              <p className="text-sm text-muted-foreground">{detail.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-1">Start</p><p className="text-sm">{new Date(detail.startDate).toLocaleDateString()}</p></div>
                <div><p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-1">End</p><p className="text-sm">{new Date(detail.endDate).toLocaleDateString()}</p></div>
                <div><p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-1">Budget</p><p className="text-sm font-medium">${detail.budget.toLocaleString()}</p></div>
                <div><p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-1">Revenue</p><p className="text-sm font-medium">${detail.revenue.toLocaleString()}</p></div>
              </div>
              {detail.discountCode && (
                <div><p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-1">Linked Discount</p><p className="text-sm font-mono">{detail.discountCode}</p></div>
              )}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-3">Performance</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-secondary rounded"><p className="text-lg font-heading font-semibold">{detail.impressions.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Impressions</p></div>
                  <div className="text-center p-3 bg-secondary rounded"><p className="text-lg font-heading font-semibold">{detail.clicks.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Clicks</p></div>
                  <div className="text-center p-3 bg-secondary rounded"><p className="text-lg font-heading font-semibold">{detail.conversions}</p><p className="text-[10px] text-muted-foreground">Conversions</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30" onClick={() => setShowForm(false)}>
          <div className="bg-background w-full max-w-xl max-h-[85vh] overflow-y-auto m-4 shadow-elevated" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h2 className="font-heading text-lg">{editing ? 'Edit Campaign' : 'New Campaign'}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground transition-smooth hover-gold text-sm">✕</button>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div>
                <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value.slice(0, 100) })} placeholder="Campaign name..."
                  className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as CampaignType })}
                    className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground">
                    {campaignTypes.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Budget ($)</label>
                  <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
                </div>
                <div>
                  <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Link Discount Code</label>
                <select value={form.discountCode} onChange={e => setForm({ ...form, discountCode: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground">
                  <option value="">None</option>
                  {mockDiscounts.filter(d => d.status === 'active').map(d => <option key={d.id} value={d.code}>{d.code} — {d.description}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Target Audience</label>
                <input type="text" value={form.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value.slice(0, 100) })}
                  className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" placeholder="e.g. All subscribers, VIP members" />
              </div>
              <div>
                <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value.slice(0, 500) })} rows={3}
                  className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth resize-none" placeholder="Campaign details..." />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground">Cancel</button>
              <button onClick={handleSave} disabled={!form.name.trim() || !form.startDate || !form.endDate}
                className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-50">
                {editing ? 'Save Changes' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
