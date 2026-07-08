import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useRole } from '@/contexts/role-context';
import { ArrowLeft, Plus, X, Trash2, GripVertical, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useProducts } from '@/contexts/products-context';
import { useProduct } from '@/hooks/products/use-product';
import type { AdminProduct } from '@/data/cms-types';
import type { ProductColor } from '@luxe-maison/shared/data/products';
import { cmsTo } from '@/lib/cms-navigation';
import { toApiError } from '@/lib/api/errors';
import { toast } from 'sonner';

const defaultProduct: Omit<AdminProduct, 'id' | 'createdAt'> = {
  name: '', price: 0, originalPrice: undefined, section: 'men', category: 'shirt', fit: 'regular', fabric: 'cotton',
  season: 'all-season', colors: [], sizes: [], images: [], description: '', details: [],
  badge: '', rating: 0, reviews: 0, sku: '', stock: 0, tags: [], seoTitle: '', seoDescription: '', status: 'draft',
};

const PRESET_SIZES: Record<string, string[]> = {
  punjabi: ['S', 'M', 'L', 'XL', 'XXL'],
  shirt: ['S', 'M', 'L', 'XL', 'XXL'],
  tshirt: ['S', 'M', 'L', 'XL', 'XXL'],
  pants: ['28', '30', '32', '34', '36', '38'],
};

export default function ProductForm() {
  const { id } = useParams({ strict: false });
  const { role } = useRole();
  const productsRoute = cmsTo('products', role);
  const navigate = useNavigate();
  const { addProduct, updateProduct, deleteProduct, isSaving } = useProducts();
  const productQuery = useProduct(id);
  const isEdit = Boolean(id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState<Omit<AdminProduct, 'id' | 'createdAt'>>({ ...defaultProduct });
  const [productId] = useState(() => id || `prod-${Date.now()}`);

  // Color input state
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#333333');

  // Size input state
  const [customSize, setCustomSize] = useState('');

  // Detail input state
  const [detailInput, setDetailInput] = useState('');

  // Image input state
  const [imageUrl, setImageUrl] = useState('');

  // Tag input state
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (id && productQuery.data) {
      const { id: _id, createdAt: _ca, ...rest } = productQuery.data;
      setForm(rest);
    }
  }, [id, productQuery.data]);

  useEffect(() => {
    if (id && productQuery.isError) {
      toast.error('Product not found');
      navigate(productsRoute);
    }
  }, [id, productQuery.isError, navigate, productsRoute]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // Colors
  const addColor = () => {
    if (!colorName.trim()) return;
    set('colors', [...form.colors, { name: colorName.trim(), hex: colorHex }]);
    setColorName(''); setColorHex('#333333');
  };
  const removeColor = (i: number) => set('colors', form.colors.filter((_, idx) => idx !== i));

  // Sizes
  const toggleSize = (s: string) => {
    set('sizes', form.sizes.includes(s) ? form.sizes.filter(x => x !== s) : [...form.sizes, s]);
  };
  const addCustomSize = () => {
    if (!customSize.trim() || form.sizes.includes(customSize.trim())) return;
    set('sizes', [...form.sizes, customSize.trim()]);
    setCustomSize('');
  };

  // Details
  const addDetail = () => {
    if (!detailInput.trim()) return;
    set('details', [...form.details, detailInput.trim()]);
    setDetailInput('');
  };
  const removeDetail = (i: number) => set('details', form.details.filter((_, idx) => idx !== i));

  // Images
  const addImage = () => {
    if (!imageUrl.trim()) return;
    set('images', [...form.images, imageUrl.trim()]);
    setImageUrl('');
  };
  const removeImage = (i: number) => set('images', form.images.filter((_, idx) => idx !== i));

  // Tags
  const addTag = () => {
    if (!tagInput.trim() || form.tags.includes(tagInput.trim())) return;
    set('tags', [...form.tags, tagInput.trim()]);
    setTagInput('');
  };
  const removeTag = (i: number) => set('tags', form.tags.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.name.trim()) return;

    const product: AdminProduct = {
      ...form,
      id: productId,
      seoTitle: form.seoTitle || `${form.name} — MAISON`,
      seoDescription: form.seoDescription || form.description.slice(0, 155),
      createdAt: isEdit
        ? productQuery.data?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    try {
      if (isEdit) {
        await updateProduct(product);
        toast.success('Product updated');
      } else {
        await addProduct(product);
        toast.success('Product created');
      }
      navigate(productsRoute);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      navigate(productsRoute);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  if (isEdit && productQuery.isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const presetSizes = PRESET_SIZES[form.category] || PRESET_SIZES.shirt;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(productsRoute)} className="p-2 text-muted-foreground transition-smooth hover-gold">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading text-2xl lg:text-3xl">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{isEdit ? `Editing ${form.name || 'product'}` : 'Fill in the details to create a new product'}</p>
        </div>
        <div className="flex gap-3">
          {isEdit && (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2.5 border border-destructive/30 text-destructive text-xs font-medium letter-wide uppercase transition-smooth hover:bg-destructive hover:text-destructive-foreground flex items-center gap-1.5">
              <Trash2 size={13} /> Delete
            </button>
          )}
          <button onClick={() => navigate(productsRoute)} className="px-5 py-2.5 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!form.name.trim() || isSaving}
            className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-50">
            {isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Section title="Basic Information">
            <Field label="Product Name" value={form.name} onChange={v => set('name', v)} placeholder="e.g. Royal Silk Punjabi" />
            <Field label="Description" value={form.description} onChange={v => set('description', v)} multiline placeholder="Write a compelling product description..." />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price ($)" value={String(form.price || '')} onChange={v => set('price', Number(v) || 0)} type="number" placeholder="0" />
              <Field label="Compare-at Price ($)" value={String(form.originalPrice || '')} onChange={v => set('originalPrice', Number(v) || undefined)} type="number" placeholder="Optional" />
            </div>
          </Section>

          {/* Images */}
          <Section title="Images">
            {form.images.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mb-4">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group aspect-square bg-secondary rounded overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 bg-foreground/70 text-background rounded opacity-0 group-hover:opacity-100 transition-smooth">
                      <X size={12} />
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] font-medium bg-foreground/70 text-background px-1.5 py-0.5 rounded">Main</span>}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Paste image URL..."
                className="flex-1 px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())} />
              <button onClick={addImage} disabled={!imageUrl.trim()}
                className="px-4 py-2.5 border border-border text-xs font-medium transition-smooth hover:border-foreground disabled:opacity-40 flex items-center gap-1.5">
                <ImageIcon size={14} /> Add
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">First image is the main product photo. Drag to reorder (coming soon).</p>
          </Section>

          {/* Colors */}
          <Section title="Colors">
            {form.colors.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {form.colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded border border-border">
                    <span className="w-4 h-4 rounded-full border border-border flex-shrink-0" style={{ backgroundColor: c.hex }} />
                    <span className="text-sm">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{c.hex}</span>
                    <button onClick={() => removeColor(i)} className="ml-1 text-muted-foreground transition-smooth hover:text-destructive"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Color Name</label>
                <input type="text" value={colorName} onChange={e => setColorName(e.target.value)} placeholder="e.g. Ivory"
                  className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())} />
              </div>
              <div className="w-20">
                <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Hex</label>
                <div className="flex items-center gap-1 border border-border px-2 py-1.5">
                  <input type="color" value={colorHex} onChange={e => setColorHex(e.target.value)} className="w-6 h-6 cursor-pointer border-0 p-0 bg-transparent" />
                  <span className="text-xs font-mono text-muted-foreground">{colorHex}</span>
                </div>
              </div>
              <button onClick={addColor} disabled={!colorName.trim()}
                className="px-4 py-2.5 border border-border text-xs font-medium transition-smooth hover:border-foreground disabled:opacity-40 flex items-center gap-1.5">
                <Plus size={14} /> Add
              </button>
            </div>
          </Section>

          {/* Sizes */}
          <Section title="Sizes">
            <div className="flex flex-wrap gap-2 mb-4">
              {presetSizes.map(s => (
                <button key={s} onClick={() => toggleSize(s)}
                  className={`px-3 py-2 text-xs font-medium border transition-smooth ${
                    form.sizes.includes(s) ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
            {form.sizes.filter(s => !presetSizes.includes(s)).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {form.sizes.filter(s => !presetSizes.includes(s)).map(s => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded text-xs">
                    {s}
                    <button onClick={() => toggleSize(s)} className="text-muted-foreground hover:text-destructive"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" value={customSize} onChange={e => setCustomSize(e.target.value)} placeholder="Custom size..."
                className="w-40 px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSize())} />
              <button onClick={addCustomSize} disabled={!customSize.trim()}
                className="px-3 py-2.5 border border-border text-xs font-medium transition-smooth hover:border-foreground disabled:opacity-40">
                Add Custom
              </button>
            </div>
          </Section>

          {/* Product Details / Bullet Points */}
          <Section title="Product Details">
            <p className="text-xs text-muted-foreground mb-3">Bullet-point details like fabric composition, care instructions, etc.</p>
            {form.details.length > 0 && (
              <div className="space-y-2 mb-4">
                {form.details.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-secondary rounded border border-border">
                    <GripVertical size={12} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-sm flex-1">{d}</span>
                    <button onClick={() => removeDetail(i)} className="text-muted-foreground transition-smooth hover:text-destructive"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" value={detailInput} onChange={e => setDetailInput(e.target.value)} placeholder="e.g. 100% Mulberry Silk"
                className="flex-1 px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDetail())} />
              <button onClick={addDetail} disabled={!detailInput.trim()}
                className="px-4 py-2.5 border border-border text-xs font-medium transition-smooth hover:border-foreground disabled:opacity-40 flex items-center gap-1.5">
                <Plus size={14} /> Add
              </button>
            </div>
          </Section>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          {/* Status & Visibility */}
          <Section title="Status">
            <div>
              <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Product Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value as AdminProduct['status'])}
                className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Badge (optional)</label>
              <input type="text" value={form.badge || ''} onChange={e => set('badge', e.target.value || undefined)}
                placeholder="e.g. Bestseller, New"
                className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
            </div>
          </Section>

          {/* Organization */}
          <Section title="Organization">
            <div>
              <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value as AdminProduct['category'])}
                className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground">
                <option value="punjabi">Punjabi</option>
                <option value="shirt">Shirt</option>
                <option value="tshirt">T-Shirt</option>
                <option value="pants">Pants</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Fabric</label>
              <select value={form.fabric} onChange={e => set('fabric', e.target.value as AdminProduct['fabric'])}
                className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground">
                <option value="silk">Silk</option>
                <option value="cotton">Cotton</option>
                <option value="linen">Linen</option>
                <option value="blend">Blend</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Fit</label>
              <select value={form.fit} onChange={e => set('fit', e.target.value as AdminProduct['fit'])}
                className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground">
                <option value="slim">Slim</option>
                <option value="regular">Regular</option>
                <option value="relaxed">Relaxed</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Season</label>
              <select value={form.season} onChange={e => set('season', e.target.value as AdminProduct['season'])}
                className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground">
                <option value="summer">Summer</option>
                <option value="winter">Winter</option>
                <option value="all-season">All Season</option>
              </select>
            </div>
          </Section>

          {/* Inventory */}
          <Section title="Inventory">
            <div>
              <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">SKU</label>
              <input type="text" value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="SKU-XXX"
                className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth font-mono uppercase" />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Stock Quantity</label>
              <input type="number" value={form.stock || ''} onChange={e => set('stock', Number(e.target.value) || 0)} placeholder="0"
                className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
            </div>
          </Section>

          {/* Tags */}
          <Section title="Tags">
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {form.tags.map((t, i) => (
                  <span key={i} className="flex items-center gap-1 px-2 py-1 bg-secondary border border-border rounded text-xs">
                    {t}
                    <button onClick={() => removeTag(i)} className="text-muted-foreground hover:text-destructive"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag..."
                className="flex-1 px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
              <button onClick={addTag} disabled={!tagInput.trim()}
                className="px-3 py-2.5 border border-border text-xs font-medium transition-smooth hover:border-foreground disabled:opacity-40">
                Add
              </button>
            </div>
          </Section>

          {/* SEO */}
          <Section title="SEO">
            <Field label="SEO Title" value={form.seoTitle} onChange={v => set('seoTitle', v)} placeholder="Auto-generated if blank" />
            <div className="mt-4">
              <Field label="SEO Description" value={form.seoDescription} onChange={v => set('seoDescription', v)} multiline placeholder="Auto-generated if blank" />
            </div>
          </Section>
        </div>
      </div>

      {/* Bottom save bar */}
      <div className="sticky bottom-0 bg-background border-t border-border -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 mt-8 flex justify-end gap-3">
        <button onClick={() => navigate(productsRoute)} className="px-5 py-2.5 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground">
          Discard
        </button>
        <button onClick={handleSave} disabled={!form.name.trim()}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-50">
          {isEdit ? 'Save Changes' : 'Create Product'}
        </button>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-background p-6 m-4 shadow-elevated max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-lg mb-2">Delete Product?</h3>
            <p className="text-sm text-muted-foreground mb-5">This action cannot be undone. The product will be permanently removed.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-destructive text-destructive-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-background border border-border rounded p-5">
      <h2 className="text-xs font-body font-semibold letter-wide uppercase text-muted-foreground mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, multiline, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={4} placeholder={placeholder}
          className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground resize-none transition-smooth" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
      )}
    </div>
  );
}
