import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { mockDiscounts } from '@/data/cms-mock';
import type { Discount } from '@/data/cms-types';
import { StatusBadge } from '@/components/staff/StatusBadge';
import { useTableSort, useTablePagination, SortableHeader, PaginationControls } from '@/components/staff/TableControls';

const emptyDiscount: Omit<Discount, 'id' | 'createdAt' | 'usedCount'> = {
  code: '', type: 'percentage', value: 10, minOrder: 0, maxUses: 100,
  status: 'active', expiresAt: '2026-12-31T23:59:59Z', categories: [], description: '',
};

export default function Discounts() {
  const [discounts, setDiscounts] = useState<Discount[]>(mockDiscounts);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [form, setForm] = useState(emptyDiscount);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { sortField, sortDir, handleSort, sortData } = useTableSort<Discount>('code' as keyof Discount, 'asc');
  const pagination = useTablePagination(0, 10); // totalItems set below

  const filtered = useMemo(() => {
    let result = discounts.filter(d => {
      const matchSearch = d.code.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
    return sortData(result);
  }, [discounts, search, statusFilter, sortData]);

  const paginationWithTotal = useTablePagination(filtered.length, 10);
  const paginated = paginationWithTotal.paginateData(filtered);

  const openCreate = () => { setEditing(null); setForm(emptyDiscount); setShowForm(true); };
  const openEdit = (d: Discount) => { setEditing(d); setForm({ code: d.code, type: d.type, value: d.value, minOrder: d.minOrder, maxUses: d.maxUses, status: d.status, expiresAt: d.expiresAt, categories: d.categories, description: d.description }); setShowForm(true); };

  const handleSave = () => {
    if (!form.code.trim()) return;
    if (editing) {
      setDiscounts(prev => prev.map(d => d.id === editing.id ? { ...d, ...form, code: form.code.toUpperCase().trim() } : d));
    } else {
      const newDisc: Discount = { ...form, id: `disc-${Date.now()}`, code: form.code.toUpperCase().trim(), usedCount: 0, createdAt: new Date().toISOString() };
      setDiscounts(prev => [newDisc, ...prev]);
    }
    setShowForm(false);
  };

  const toggleStatus = (id: string) => {
    setDiscounts(prev => prev.map(d => d.id === id ? { ...d, status: d.status === 'active' ? 'disabled' as const : 'active' as const } : d));
  };

  const handleDelete = (id: string) => {
    setDiscounts(prev => prev.filter(d => d.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-heading text-2xl lg:text-3xl">Discounts</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90">
          <Plus size={14} /> Create Discount
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value.slice(0, 100)); paginationWithTotal.resetPage(); }} placeholder="Search codes..."
            className="w-full pl-9 pr-4 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'active', 'expired', 'disabled'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); paginationWithTotal.resetPage(); }} className={`px-3 py-2 text-xs font-medium letter-wide uppercase border transition-smooth ${statusFilter === s ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-background border border-border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">
                <SortableHeader<Discount> field="code" label="Code" sortField={sortField as keyof Discount} sortDir={sortDir} onSort={handleSort as any} />
              </th>
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">
                <SortableHeader<Discount> field="value" label="Discount" sortField={sortField as keyof Discount} sortDir={sortDir} onSort={handleSort as any} />
              </th>
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">
                <SortableHeader<Discount> field="minOrder" label="Min Order" sortField={sortField as keyof Discount} sortDir={sortDir} onSort={handleSort as any} />
              </th>
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">
                <SortableHeader<Discount> field="usedCount" label="Usage" sortField={sortField as keyof Discount} sortDir={sortDir} onSort={handleSort as any} />
              </th>
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">
                <SortableHeader<Discount> field="expiresAt" label="Expires" sortField={sortField as keyof Discount} sortDir={sortDir} onSort={handleSort as any} />
              </th>
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(d => (
              <tr key={d.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-smooth">
                <td className="px-5 py-3 font-mono font-medium text-xs">{d.code}</td>
                <td className="px-5 py-3">{d.type === 'percentage' ? `${d.value}%` : `$${d.value}`}</td>
                <td className="px-5 py-3 text-muted-foreground">${d.minOrder}</td>
                <td className="px-5 py-3 text-muted-foreground">{d.usedCount}/{d.maxUses}</td>
                <td className="px-5 py-3 text-muted-foreground text-xs">{new Date(d.expiresAt).toLocaleDateString()}</td>
                <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => toggleStatus(d.id)} className="p-1.5 text-muted-foreground transition-smooth hover-gold" title="Toggle">
                      {d.status === 'active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    </button>
                    <button onClick={() => openEdit(d)} className="p-1.5 text-muted-foreground transition-smooth hover-gold" title="Edit"><Edit size={14} /></button>
                    <button onClick={() => setDeleteConfirm(d.id)} className="p-1.5 text-muted-foreground transition-smooth hover:text-destructive" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-10 text-sm text-muted-foreground">No discounts found.</div>}
      </div>

      <PaginationControls {...paginationWithTotal} totalItems={filtered.length} />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-background p-6 m-4 shadow-elevated max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-lg mb-2">Delete Discount?</h3>
            <p className="text-sm text-muted-foreground mb-5">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-destructive text-destructive-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30" onClick={() => setShowForm(false)}>
          <div className="bg-background w-full max-w-xl max-h-[85vh] overflow-y-auto m-4 shadow-elevated" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h2 className="font-heading text-lg">{editing ? 'Edit Discount' : 'Create Discount'}</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground transition-smooth hover-gold text-sm">✕</button>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Code</label>
                  <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.slice(0, 20) })}
                    className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth font-mono uppercase" placeholder="e.g. SUMMER20" />
                </div>
                <div>
                  <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Value</label>
                  <input type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
                </div>
                <div>
                  <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Min Order ($)</label>
                  <input type="number" value={form.minOrder} onChange={e => setForm({ ...form, minOrder: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
                </div>
                <div>
                  <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Max Uses</label>
                  <input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Expiry Date</label>
                <input type="date" value={form.expiresAt.slice(0, 10)} onChange={e => setForm({ ...form, expiresAt: new Date(e.target.value).toISOString() })}
                  className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
              </div>
              <div>
                <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Description</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value.slice(0, 200) })} placeholder="Brief description..."
                  className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground">Cancel</button>
              <button onClick={handleSave} disabled={!form.code.trim()} className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-50">
                {editing ? 'Save Changes' : 'Create Discount'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
