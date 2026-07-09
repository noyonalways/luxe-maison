import { useRef, useState, type ReactNode } from 'react';
import {
  Upload,
  Download,
  X,
  Check,
  FileSpreadsheet,
  Loader2,
  Info,
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { AdminProduct } from '@/data/cms-types';
import { toApiError } from '@/lib/api/errors';
import { toast } from 'sonner';

export interface ImportRow {
  name: string;
  price: string;
  sku: string;
  stock: string;
  category: string;
  fabric: string;
  fit: string;
  description: string;
  tags?: string;
}

export const CSV_TEMPLATE = `name,sku,price,stock,category,fabric,fit,description,tags
"Premium Silk Kurta",SKU-NEW-001,199,50,punjabi,silk,regular,"Handcrafted silk kurta with intricate embroidery","punjabi,silk,festive"
"Classic Oxford Shirt",SKU-NEW-002,129,75,shirt,cotton,slim,"Timeless oxford weave cotton shirt","shirt,cotton,formal"`;

const TEMPLATE_COLUMNS = [
  { key: 'name', label: 'name', required: true, hint: 'Product display name' },
  { key: 'sku', label: 'sku', required: true, hint: 'Unique identifier (must not exist already)' },
  { key: 'price', label: 'price', required: true, hint: 'Number greater than 0' },
  { key: 'stock', label: 'stock', required: false, hint: 'Inventory count (defaults to 0)' },
  { key: 'category', label: 'category', required: false, hint: 'punjabi, shirt, tshirt, or pants' },
  { key: 'fabric', label: 'fabric', required: false, hint: 'silk, cotton, linen, or blend' },
  { key: 'fit', label: 'fit', required: false, hint: 'slim, regular, or relaxed' },
  { key: 'description', label: 'description', required: false, hint: 'Short product description' },
  { key: 'tags', label: 'tags', required: false, hint: 'Comma-separated tags' },
] as const;

const EXAMPLE_ROWS: ImportRow[] = [
  {
    name: 'Premium Silk Kurta',
    sku: 'SKU-NEW-001',
    price: '199',
    stock: '50',
    category: 'punjabi',
    fabric: 'silk',
    fit: 'regular',
    description: 'Handcrafted silk kurta with intricate embroidery',
    tags: 'punjabi,silk,festive',
  },
  {
    name: 'Classic Oxford Shirt',
    sku: 'SKU-NEW-002',
    price: '129',
    stock: '75',
    category: 'shirt',
    fabric: 'cotton',
    fit: 'slim',
    description: 'Timeless oxford weave cotton shirt',
    tags: 'shirt,cotton,formal',
  },
];

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'product-import-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function buildProductsFromRows(rows: ImportRow[]): AdminProduct[] {
  return rows.map((row, idx) => ({
    id: `import-${Date.now()}-${idx}`,
    name: row.name.trim(),
    price: Number(row.price),
    category: (row.category?.trim().toLowerCase() || 'shirt') as AdminProduct['category'],
    fit: (row.fit?.trim().toLowerCase() || 'regular') as AdminProduct['fit'],
    fabric: (row.fabric?.trim().toLowerCase() || 'cotton') as AdminProduct['fabric'],
    season: 'all-season' as const,
    colors: [{ name: 'Default', hex: '#333333' }],
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80'],
    description: row.description?.trim() || '',
    details: [],
    rating: 0,
    reviews: 0,
    section: 'men' as const,
    sku: row.sku.trim(),
    stock: Number(row.stock) || 0,
    tags: row.tags?.split(',').map((t) => t.trim()).filter(Boolean) || [],
    seoTitle: `${row.name.trim()} — MAISON`,
    seoDescription: row.description?.slice(0, 155) || '',
    status: 'draft' as const,
    createdAt: new Date().toISOString(),
  }));
}

type ProductBulkImportFlowProps = {
  products: AdminProduct[];
  onImport: (products: AdminProduct[]) => Promise<void>;
  trigger: (open: () => void) => ReactNode;
};

export function ProductBulkImportFlow({ products, onImport, trigger }: ProductBulkImportFlowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const openTemplate = () => setShowTemplate(true);

  const closeAll = () => {
    setShowTemplate(false);
    setShowReview(false);
    setImportData([]);
    setImportErrors([]);
  };

  const processImportData = (data: ImportRow[]) => {
    const errors: string[] = [];
    const validRows: ImportRow[] = [];

    data.forEach((row, idx) => {
      const rowNum = idx + 2;
      if (!row.name?.trim()) {
        errors.push(`Row ${rowNum}: Name is required`);
        return;
      }
      if (!row.sku?.trim()) {
        errors.push(`Row ${rowNum}: SKU is required`);
        return;
      }
      if (!row.price || Number.isNaN(Number(row.price)) || Number(row.price) <= 0) {
        errors.push(`Row ${rowNum}: Valid price is required`);
        return;
      }
      if (products.some((p) => p.sku.toLowerCase() === row.sku.trim().toLowerCase())) {
        errors.push(`Row ${rowNum}: SKU "${row.sku}" already exists`);
        return;
      }
      if (validRows.some((r) => r.sku.toLowerCase() === row.sku.trim().toLowerCase())) {
        errors.push(`Row ${rowNum}: Duplicate SKU "${row.sku}" in import`);
        return;
      }
      validRows.push(row);
    });

    setImportData(validRows);
    setImportErrors(errors);
    setShowTemplate(false);
    setShowReview(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'csv') {
      Papa.parse<ImportRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processImportData(results.data),
        error: () => {
          setImportErrors(['Failed to parse CSV file']);
          setShowTemplate(false);
          setShowReview(true);
        },
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]!];
        processImportData(XLSX.utils.sheet_to_json<ImportRow>(sheet));
      };
      reader.readAsBinaryString(file);
    } else {
      setImportErrors(['Please upload a CSV or Excel file']);
      setShowTemplate(false);
      setShowReview(true);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmImport = async () => {
    setIsImporting(true);
    try {
      const newProducts = buildProductsFromRows(importData);
      await onImport(newProducts);
      toast.success(`Imported ${newProducts.length} product${newProducts.length > 1 ? 's' : ''}`);
      closeAll();
    } catch (error) {
      toast.error(toApiError(error).message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      {trigger(openTemplate)}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />

      {showTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4"
          onClick={closeAll}
        >
          <div
            className="bg-background w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-elevated rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between sticky top-0 bg-background z-10">
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={20} className="text-primary" />
                <div>
                  <h2 className="font-heading text-lg">Bulk Import Products</h2>
                  <p className="text-xs text-muted-foreground">
                    Use the template below, then upload your completed file
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeAll}
                className="text-muted-foreground transition-smooth hover:text-foreground"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-4">
                <Info size={18} className="text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground">How to import</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Download the CSV template or copy the example format below.</li>
                    <li>Add one row per product using the same column headers.</li>
                    <li>Upload your CSV or Excel file to review and import.</li>
                  </ol>
                  <p>Imported products are created as drafts. You can edit images, sizes, and colors after import.</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Column reference</h3>
                <div className="border border-border rounded overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-secondary">
                        <th className="px-3 py-2 text-left font-semibold">Column</th>
                        <th className="px-3 py-2 text-left font-semibold">Required</th>
                        <th className="px-3 py-2 text-left font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TEMPLATE_COLUMNS.map((col) => (
                        <tr key={col.key} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 font-mono">{col.label}</td>
                          <td className="px-3 py-2">{col.required ? 'Yes' : 'No'}</td>
                          <td className="px-3 py-2 text-muted-foreground">{col.hint}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-3">Example template</h3>
                <div className="border border-border rounded overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-secondary">
                        {TEMPLATE_COLUMNS.map((col) => (
                          <th key={col.key} className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {EXAMPLE_ROWS.map((row, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 font-medium whitespace-nowrap">{row.name}</td>
                          <td className="px-3 py-2 font-mono text-muted-foreground">{row.sku}</td>
                          <td className="px-3 py-2">{row.price}</td>
                          <td className="px-3 py-2">{row.stock}</td>
                          <td className="px-3 py-2">{row.category}</td>
                          <td className="px-3 py-2">{row.fabric}</td>
                          <td className="px-3 py-2">{row.fit}</td>
                          <td className="px-3 py-2 max-w-[200px] truncate" title={row.description}>
                            {row.description}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{row.tags}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sticky bottom-0 bg-background">
              <button
                type="button"
                onClick={downloadTemplate}
                className="inline-flex items-center justify-center gap-2 text-xs text-muted-foreground transition-smooth hover:text-foreground"
              >
                <Download size={14} />
                Download CSV template
              </button>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeAll}
                  className="px-5 py-2.5 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90"
                >
                  <Upload size={14} />
                  Upload file
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4"
          onClick={closeAll}
        >
          <div
            className="bg-background w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-elevated rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={20} className="text-primary" />
                <div>
                  <h2 className="font-heading text-lg">Review Import</h2>
                  <p className="text-xs text-muted-foreground">Confirm products before importing</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeAll}
                className="text-muted-foreground transition-smooth hover:text-foreground"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-6">
              {importErrors.length > 0 && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded">
                  <p className="text-sm font-medium text-destructive mb-2">
                    {importErrors.length} error{importErrors.length > 1 ? 's' : ''} found:
                  </p>
                  <ul className="text-xs text-destructive space-y-1 max-h-24 overflow-y-auto">
                    {importErrors.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importData.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium">
                      <Check size={14} className="inline mr-1 text-emerald-600" />
                      {importData.length} product{importData.length > 1 ? 's' : ''} ready to import
                    </p>
                  </div>
                  <div className="border border-border rounded overflow-x-auto max-h-64">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-secondary">
                          <th className="px-3 py-2 text-left font-semibold">Name</th>
                          <th className="px-3 py-2 text-left font-semibold">SKU</th>
                          <th className="px-3 py-2 text-left font-semibold">Price</th>
                          <th className="px-3 py-2 text-left font-semibold">Stock</th>
                          <th className="px-3 py-2 text-left font-semibold">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importData.map((row, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="px-3 py-2 font-medium">{row.name}</td>
                            <td className="px-3 py-2 font-mono text-muted-foreground">{row.sku}</td>
                            <td className="px-3 py-2">${row.price}</td>
                            <td className="px-3 py-2">{row.stock || 0}</td>
                            <td className="px-3 py-2">{row.category || 'shirt'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Products will be imported as &quot;Draft&quot; status.
                  </p>
                </>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <p className="text-sm text-muted-foreground">No valid products to import.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReview(false);
                      setShowTemplate(true);
                    }}
                    className="text-sm text-primary underline underline-offset-2"
                  >
                    Back to template
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowReview(false);
                  setShowTemplate(true);
                  setImportData([]);
                  setImportErrors([]);
                }}
                className="text-xs text-muted-foreground transition-smooth hover:text-foreground"
              >
                ← Back to template
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeAll}
                  className="px-5 py-2.5 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground"
                >
                  Cancel
                </button>
                {importData.length > 0 && (
                  <button
                    type="button"
                    onClick={() => void confirmImport()}
                    disabled={isImporting}
                    className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-60"
                  >
                    {isImporting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Importing…
                      </span>
                    ) : (
                      `Import ${importData.length} Product${importData.length > 1 ? 's' : ''}`
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
