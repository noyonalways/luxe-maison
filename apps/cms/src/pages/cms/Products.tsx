import { useState, useRef, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Search, Edit, Archive, Eye, AlertTriangle, Upload, Download, X, Check, FileSpreadsheet, Trash2 } from 'lucide-react';
import { useProducts } from '@/context/ProductsContext';
import type { AdminProduct } from '@/data/cms-types';
import { useTableSort, useTablePagination, SortableHeader, PaginationControls } from '@/components/staff/TableControls';
import { useRole } from '@/context/RoleContext';
import { cmsProductEdit, cmsProductNew } from '@/lib/cms-navigation';
import { useStaffUrlRole } from '@/lib/use-staff-url-role';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ImportRow {
  name: string; price: string; sku: string; stock: string; category: string; fabric: string; fit: string; description: string; tags?: string;
}

const CSV_TEMPLATE = `name,sku,price,stock,category,fabric,fit,description,tags
"Premium Silk Kurta",SKU-NEW-001,199,50,punjabi,silk,regular,"Handcrafted silk kurta with intricate embroidery","punjabi,silk,festive"
"Classic Oxford Shirt",SKU-NEW-002,129,75,shirt,cotton,slim,"Timeless oxford weave cotton shirt","shirt,cotton,formal"`;

export default function Products() {
  const urlRole = useStaffUrlRole();
  const { canEdit: canEditFn, canDelete: canDeleteFn } = useRole();
  const canEditProducts = canEditFn('products');
  const canDeleteProducts = canDeleteFn('products');
  const { products, toggleStatus, deleteProduct, setProducts } = useProducts();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'csv') {
      Papa.parse<ImportRow>(file, { header: true, skipEmptyLines: true, complete: (results) => processImportData(results.data), error: () => setImportErrors(['Failed to parse CSV file']) });
    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => { const data = evt.target?.result; const workbook = XLSX.read(data, { type: 'binary' }); const sheet = workbook.Sheets[workbook.SheetNames[0]]; processImportData(XLSX.utils.sheet_to_json<ImportRow>(sheet)); };
      reader.readAsBinaryString(file);
    } else { setImportErrors(['Please upload a CSV or Excel file']); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processImportData = (data: ImportRow[]) => {
    const errors: string[] = []; const validRows: ImportRow[] = [];
    data.forEach((row, idx) => {
      const rowNum = idx + 2;
      if (!row.name?.trim()) { errors.push(`Row ${rowNum}: Name is required`); return; }
      if (!row.sku?.trim()) { errors.push(`Row ${rowNum}: SKU is required`); return; }
      if (!row.price || isNaN(Number(row.price)) || Number(row.price) <= 0) { errors.push(`Row ${rowNum}: Valid price is required`); return; }
      if (products.some(p => p.sku.toLowerCase() === row.sku.trim().toLowerCase())) { errors.push(`Row ${rowNum}: SKU "${row.sku}" already exists`); return; }
      if (validRows.some(r => r.sku.toLowerCase() === row.sku.trim().toLowerCase())) { errors.push(`Row ${rowNum}: Duplicate SKU "${row.sku}" in import`); return; }
      validRows.push(row);
    });
    setImportData(validRows); setImportErrors(errors); setShowImport(true);
  };

  const confirmImport = () => {
    setIsImporting(true);
    const newProducts: AdminProduct[] = importData.map((row, idx) => ({
      id: `import-${Date.now()}-${idx}`, name: row.name.trim(), price: Number(row.price),
      category: (row.category?.trim().toLowerCase() || 'shirt') as AdminProduct['category'],
      fit: (row.fit?.trim().toLowerCase() || 'regular') as AdminProduct['fit'],
      fabric: (row.fabric?.trim().toLowerCase() || 'cotton') as AdminProduct['fabric'],
      season: 'all-season' as const, colors: [{ name: 'Default', hex: '#333333' }], sizes: ['S', 'M', 'L', 'XL'],
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80'],
      description: row.description?.trim() || '', details: [], rating: 0, reviews: 0, section: 'men' as const,
      sku: row.sku.trim(), stock: Number(row.stock) || 0,
      tags: row.tags?.split(',').map(t => t.trim()).filter(Boolean) || [],
      seoTitle: `${row.name.trim()} — MAISON`, seoDescription: row.description?.slice(0, 155) || '',
      status: 'draft' as const, createdAt: new Date().toISOString(),
    }));
    setProducts(prev => [...newProducts, ...prev]);
    setTimeout(() => { setIsImporting(false); setShowImport(false); setImportData([]); setImportErrors([]); }, 500);
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'product-import-template.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-heading text-2xl lg:text-3xl">Products</h1>
        {canEditProducts && (
        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2.5 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground cursor-pointer">
            <Upload size={14} /> Import
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="hidden" />
          </label>
          <button onClick={() => navigate(cmsProductNew(urlRole))} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90">
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
                    <button onClick={() => navigate(cmsProductEdit(urlRole, p.id))} className="p-1.5 text-muted-foreground transition-smooth hover-gold" title="Edit"><Edit size={14} /></button>
                    <button onClick={() => toggleStatus(p.id)} className="p-1.5 text-muted-foreground transition-smooth hover-gold" title="Toggle status">
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

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30" onClick={() => { setShowImport(false); setImportData([]); setImportErrors([]); }}>
          <div className="bg-background w-full max-w-3xl max-h-[85vh] overflow-y-auto m-4 shadow-elevated" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={20} className="text-primary" />
                <div><h2 className="font-heading text-lg">Import Products</h2><p className="text-xs text-muted-foreground">Review data before importing</p></div>
              </div>
              <button onClick={() => { setShowImport(false); setImportData([]); setImportErrors([]); }} className="text-muted-foreground transition-smooth hover-gold"><X size={18} /></button>
            </div>
            <div className="px-6 py-6">
              {importErrors.length > 0 && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded">
                  <p className="text-sm font-medium text-destructive mb-2">{importErrors.length} error{importErrors.length > 1 ? 's' : ''} found:</p>
                  <ul className="text-xs text-destructive space-y-1 max-h-24 overflow-y-auto">{importErrors.map((err, i) => <li key={i}>• {err}</li>)}</ul>
                </div>
              )}
              {importData.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium"><Check size={14} className="inline mr-1 text-emerald-600" />{importData.length} product{importData.length > 1 ? 's' : ''} ready to import</p>
                  </div>
                  <div className="border border-border rounded overflow-x-auto max-h-64">
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-border bg-secondary"><th className="px-3 py-2 text-left font-semibold">Name</th><th className="px-3 py-2 text-left font-semibold">SKU</th><th className="px-3 py-2 text-left font-semibold">Price</th><th className="px-3 py-2 text-left font-semibold">Stock</th><th className="px-3 py-2 text-left font-semibold">Category</th></tr></thead>
                      <tbody>{importData.map((row, i) => (<tr key={i} className="border-b border-border last:border-0"><td className="px-3 py-2 font-medium">{row.name}</td><td className="px-3 py-2 font-mono text-muted-foreground">{row.sku}</td><td className="px-3 py-2">${row.price}</td><td className="px-3 py-2">{row.stock || 0}</td><td className="px-3 py-2">{row.category || 'shirt'}</td></tr>))}</tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Products will be imported as "Draft" status.</p>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">No valid products to import.</p>
                  <button onClick={downloadTemplate} className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-2"><Download size={14} /> Download CSV template</button>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <button onClick={downloadTemplate} className="flex items-center gap-2 text-xs text-muted-foreground transition-smooth hover-gold"><Download size={12} /> Download template</button>
              <div className="flex gap-3">
                <button onClick={() => { setShowImport(false); setImportData([]); setImportErrors([]); }} className="px-5 py-2.5 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground">Cancel</button>
                {importData.length > 0 && (
                  <button onClick={confirmImport} disabled={isImporting} className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-60">
                    {isImporting ? 'Importing...' : `Import ${importData.length} Product${importData.length > 1 ? 's' : ''}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-background p-6 m-4 shadow-elevated max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-lg mb-2">Delete Product?</h3>
            <p className="text-sm text-muted-foreground mb-5">This action cannot be undone. The product will be permanently removed.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground">Cancel</button>
              <button onClick={() => { deleteProduct(deleteConfirm); setDeleteConfirm(null); }} className="px-4 py-2 bg-destructive text-destructive-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
