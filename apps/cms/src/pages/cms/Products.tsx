import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Search, Edit, Archive, Eye, AlertTriangle, Upload, Trash2, Loader2 } from 'lucide-react';
import { useProducts } from '@/contexts/products-context';
import type { AdminProduct } from '@/data/cms-types';
import { useTableSort, useTablePagination, SortableHeader, PaginationControls } from '@/components/staff/TableControls';
import { useRole } from '@/contexts/role-context';
import { cmsProductEdit, cmsProductNew } from '@/lib/cms-navigation';
import { toApiError } from '@/lib/api/errors';
import { toast } from 'sonner';
import { ProductBulkImportFlow } from '@/components/products/ProductBulkImportFlow';

export default function Products() {
  const { roleSlug, canEdit: canEditFn, canDelete: canDeleteFn } = useRole();
  const canEditProducts = canEditFn('products');
  const canDeleteProducts = canDeleteFn('products');
  const { products, toggleStatus, deleteProduct, addProduct, isLoading, isSaving } = useProducts();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { sortField, sortDir, handleSort, sortData } = useTableSort<AdminProduct>('name' as keyof AdminProduct, 'asc');

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
    return sortData(result);
  }, [products, search, statusFilter, sortData]);

  const pagination = useTablePagination(filtered.length, 10);
  const paginated = pagination.paginateData(filtered);

  const handleBulkImport = async (newProducts: AdminProduct[]) => {
    await Promise.all(newProducts.map((product) => addProduct(product)));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-heading text-2xl lg:text-3xl">Products</h1>
        {canEditProducts && (
        <div className="flex gap-2">
          <ProductBulkImportFlow
            products={products}
            onImport={handleBulkImport}
            trigger={(open) => (
              <button
                type="button"
                onClick={open}
                className="flex items-center gap-2 px-4 py-2.5 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground"
              >
                <Upload size={14} /> Import
              </button>
            )}
          />
          <button onClick={() => navigate(cmsProductNew(roleSlug))} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90">
            <Plus size={14} /> Add Product
          </button>
        </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value.slice(0, 100)); pagination.resetPage(); }} placeholder="Search products or SKU..."
            className="w-full pl-9 pr-4 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'draft', 'archived'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); pagination.resetPage(); }}
              className={`px-3 py-2 text-xs font-medium letter-wide uppercase border transition-smooth ${statusFilter === s ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}>
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
                <SortableHeader<AdminProduct> field="name" label="Product" sortField={sortField as keyof AdminProduct} sortDir={sortDir} onSort={handleSort as any} />
              </th>
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">
                <SortableHeader<AdminProduct> field="sku" label="SKU" sortField={sortField as keyof AdminProduct} sortDir={sortDir} onSort={handleSort as any} />
              </th>
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">
                <SortableHeader<AdminProduct> field="price" label="Price" sortField={sortField as keyof AdminProduct} sortDir={sortDir} onSort={handleSort as any} />
              </th>
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">
                <SortableHeader<AdminProduct> field="stock" label="Stock" sortField={sortField as keyof AdminProduct} sortDir={sortDir} onSort={handleSort as any} />
              </th>
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-smooth">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-secondary rounded overflow-hidden flex-shrink-0">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category} · {p.fabric} · {p.colors.length} color{p.colors.length !== 1 ? 's' : ''} · {p.sizes.length} size{p.sizes.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{p.sku}</td>
                <td className="px-5 py-3 font-medium">${p.price}</td>
                <td className="px-5 py-3">
                  <span className={`flex items-center gap-1 ${p.stock < 15 ? 'text-amber-600' : 'text-foreground'}`}>
                    {p.stock < 15 && <AlertTriangle size={12} />}{p.stock}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold letter-wide uppercase border rounded ${
                    p.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    p.status === 'draft' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-muted text-muted-foreground border-border'
                  }`}>{p.status}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  {canEditProducts && (
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => navigate(cmsProductEdit(roleSlug, p.id))} className="p-1.5 text-muted-foreground transition-smooth hover-gold" title="Edit"><Edit size={14} /></button>
                    <button
                      onClick={async () => {
                        try {
                          await toggleStatus(p.id);
                        } catch (error) {
                          toast.error(toApiError(error).message);
                        }
                      }}
                      disabled={isSaving}
                      className="p-1.5 text-muted-foreground transition-smooth hover-gold"
                      title="Toggle status"
                    >
                      {p.status === 'active' ? <Archive size={14} /> : <Eye size={14} />}
                    </button>
                    {canDeleteProducts && (
                    <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 text-muted-foreground transition-smooth hover:text-destructive" title="Delete"><Trash2 size={14} /></button>
                    )}
                  </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-10 text-sm text-muted-foreground">No products found.</div>}
      </div>

      <PaginationControls {...pagination} totalItems={filtered.length} />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-background p-6 m-4 shadow-elevated max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-lg mb-2">Delete Product?</h3>
            <p className="text-sm text-muted-foreground mb-5">This action cannot be undone. The product will be permanently removed.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground">Cancel</button>
              <button
                onClick={async () => {
                  if (!deleteConfirm) return;
                  try {
                    await deleteProduct(deleteConfirm);
                    setDeleteConfirm(null);
                    toast.success('Product deleted');
                  } catch (error) {
                    toast.error(toApiError(error).message);
                  }
                }}
                disabled={isSaving}
                className="px-4 py-2 bg-destructive text-destructive-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
