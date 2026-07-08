import { useState } from 'react';
import { usePopup, type PopupConfig, type PopupType, type PopupTrigger } from '@/contexts/popup-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gift, Percent, Megaphone, Save, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TRIGGER_LABELS: Record<PopupTrigger, string> = {
  page_load: 'On Page Load (1.2s delay)',
  exit_intent: 'Exit Intent',
  scroll_50: 'Scroll 50%',
  delay_10s: 'After 10 Seconds',
};

const TYPE_META: Record<PopupType, { label: string; icon: React.ElementType; color: string }> = {
  welcome: { label: 'Welcome', icon: Gift, color: 'text-primary' },
  discount: { label: 'Discount', icon: Percent, color: 'text-orange-500' },
  campaign: { label: 'Campaign', icon: Megaphone, color: 'text-blue-500' },
};

function generateId() {
  return `popup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function newPopup(type: PopupType): PopupConfig {
  return {
    id: generateId(),
    type,
    enabled: false,
    title: '',
    message: '',
    discountCode: '',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    trigger: 'page_load',
    priority: 1,
  };
}

export default function PopupSettings() {
  const { popups, addPopup, updatePopup, deletePopup } = usePopup();
  const [selectedId, setSelectedId] = useState<string | null>(popups[0]?.id ?? null);
  const [drafts, setDrafts] = useState<Record<string, PopupConfig>>(() =>
    Object.fromEntries(popups.map(p => [p.id, { ...p }]))
  );
  const { toast } = useToast();

  // Keep drafts in sync when popups change (add/delete)
  const syncDraft = (popup: PopupConfig) => {
    setDrafts(prev => ({ ...prev, [popup.id]: { ...popup } }));
  };

  const selected = selectedId ? drafts[selectedId] ?? null : null;

  const updateDraft = (field: keyof PopupConfig, value: unknown) => {
    if (!selectedId) return;
    setDrafts(prev => ({
      ...prev,
      [selectedId]: { ...prev[selectedId], [field]: value },
    }));
  };

  const handleSave = () => {
    if (!selected) return;
    updatePopup(selected.id, selected);
    toast({ title: 'Popup saved', description: `"${selected.title}" settings are now live.` });
  };

  const handleAdd = (type: PopupType) => {
    const p = newPopup(type);
    addPopup(p);
    syncDraft(p);
    setSelectedId(p.id);
    toast({ title: 'New popup created', description: 'Edit and save to publish.' });
  };

  const handleDelete = (id: string) => {
    deletePopup(id);
    setDrafts(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (selectedId === id) setSelectedId(null);
    toast({ title: 'Popup deleted' });
  };

  const handleToggle = (id: string, enabled: boolean) => {
    updatePopup(id, { enabled });
    setDrafts(prev => ({ ...prev, [id]: { ...prev[id], enabled } }));
  };

  const renderList = (type: PopupType) => {
    const items = popups.filter(p => p.type === type);
    const meta = TYPE_META[type];
    const Icon = meta.icon;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{items.length} popup{items.length !== 1 ? 's' : ''}</p>
          <Button variant="outline" size="sm" onClick={() => handleAdd(type)}>
            <Plus size={14} className="mr-1.5" /> Add New
          </Button>
        </div>

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">No {meta.label.toLowerCase()} popups yet.</p>
        )}

        {items.map(p => {
          const isActive = selectedId === p.id;
          return (
            <div
              key={p.id}
              onClick={() => { setSelectedId(p.id); if (!drafts[p.id]) syncDraft(p); }}
              className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                isActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              }`}
            >
              <Icon size={16} className={meta.color} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.title || 'Untitled'}</p>
                <p className="text-xs text-muted-foreground">{TRIGGER_LABELS[p.trigger]} · Priority {p.priority}</p>
              </div>
              <Switch
                checked={drafts[p.id]?.enabled ?? p.enabled}
                onCheckedChange={v => handleToggle(p.id, v)}
                onClick={e => e.stopPropagation()}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const Icon = selected ? TYPE_META[selected.type].icon : Gift;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl lg:text-3xl">Popup Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage welcome, discount, and campaign popups shown on the storefront
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left — list & tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="welcome">
            <TabsList className="w-full">
              <TabsTrigger value="welcome" className="flex-1 gap-1.5"><Gift size={14} /> Welcome</TabsTrigger>
              <TabsTrigger value="discount" className="flex-1 gap-1.5"><Percent size={14} /> Discount</TabsTrigger>
              <TabsTrigger value="campaign" className="flex-1 gap-1.5"><Megaphone size={14} /> Campaign</TabsTrigger>
            </TabsList>
            <TabsContent value="welcome">{renderList('welcome')}</TabsContent>
            <TabsContent value="discount">{renderList('discount')}</TabsContent>
            <TabsContent value="campaign">{renderList('campaign')}</TabsContent>
          </Tabs>
        </div>

        {/* Right — edit + preview */}
        <div className="lg:col-span-3 space-y-6">
          {!selected ? (
            <div className="flex items-center justify-center min-h-[400px] border border-dashed border-border rounded-lg text-sm text-muted-foreground">
              Select a popup to edit
            </div>
          ) : (
            <>
              {/* Edit form */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selected.enabled ? <Eye size={16} className="text-primary" /> : <EyeOff size={16} className="text-muted-foreground" />}
                    <h2 className="font-heading text-lg">Edit Popup</h2>
                  </div>
                  <div className="flex gap-2">
                    {!selected.id.startsWith('default-') && (
                      <Button variant="outline" size="sm" onClick={() => handleDelete(selected.id)}>
                        <Trash2 size={14} className="mr-1.5" /> Delete
                      </Button>
                    )}
                    <Button size="sm" onClick={handleSave}>
                      <Save size={14} className="mr-1.5" /> Save
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium mb-1.5 block">Title</Label>
                  <Input value={selected.title} onChange={e => updateDraft('title', e.target.value)} placeholder="Popup title..." />
                </div>
                <div>
                  <Label className="text-xs font-medium mb-1.5 block">Message</Label>
                  <Textarea value={selected.message} onChange={e => updateDraft('message', e.target.value)} rows={3} placeholder="Popup message..." />
                </div>
                <div>
                  <Label className="text-xs font-medium mb-1.5 block">Discount Code (optional)</Label>
                  <Input value={selected.discountCode} onChange={e => updateDraft('discountCode', e.target.value.toUpperCase())} placeholder="e.g. WELCOME15" className="font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">CTA Text</Label>
                    <Input value={selected.ctaText} onChange={e => updateDraft('ctaText', e.target.value)} placeholder="Shop Now" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">CTA Link</Label>
                    <Input value={selected.ctaLink} onChange={e => updateDraft('ctaLink', e.target.value)} placeholder="/shop" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">Trigger</Label>
                    <Select value={selected.trigger} onValueChange={v => updateDraft('trigger', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.entries(TRIGGER_LABELS) as [PopupTrigger, string][]).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">Priority</Label>
                    <Input type="number" value={selected.priority} onChange={e => updateDraft('priority', Number(e.target.value))} min={1} max={100} />
                  </div>
                </div>
              </div>

              {/* Live preview */}
              <div>
                <Label className="text-xs font-medium mb-3 block">Preview</Label>
                <div className="bg-muted/50 border border-border rounded-lg p-6 flex items-center justify-center min-h-[340px]">
                  <div className="bg-background rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-primary via-gold-light to-primary" />
                    <div className="p-6 text-center">
                      <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <h3 className="font-heading text-xl mb-2">{selected.title || 'Title'}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{selected.message || 'Your message here...'}</p>
                      {selected.discountCode && (
                        <div className="mb-4 inline-flex items-center gap-2 bg-secondary border border-border rounded px-3 py-2">
                          <span className="font-mono font-semibold tracking-wider">{selected.discountCode}</span>
                        </div>
                      )}
                      <div>
                        <Button size="sm" className="w-full">{selected.ctaText || 'Button'}</Button>
                        <p className="text-[10px] text-muted-foreground mt-2">No thanks, I'll pass</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
