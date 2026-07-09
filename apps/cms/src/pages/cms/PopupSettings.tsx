import { useEffect, useState } from 'react';
import {
  usePopup,
  type PopupConfig,
  type PopupType,
  type PopupTrigger,
} from '@/contexts/popup-context';
import { useRole } from '@/contexts/role-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Gift, Percent, Megaphone, Save, Trash2, Plus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { toApiError } from '@/lib/api/errors';

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
  const { canEdit, canDelete } = useRole();
  const { popups, addPopup, updatePopup, setPopupEnabled, deletePopup, isLoading, isSaving } =
    usePopup();

  const canEditPopups = canEdit('popup');
  const canDeletePopups = canDelete('popup');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, PopupConfig>>({});

  useEffect(() => {
    setDrafts(Object.fromEntries(popups.map((p) => [p.id, { ...p }])));
  }, [popups]);

  useEffect(() => {
    if (popups.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((current) =>
      current && popups.some((p) => p.id === current) ? current : popups[0]!.id,
    );
  }, [popups]);

  const selected = selectedId ? drafts[selectedId] ?? null : null;

  const updateDraft = (field: keyof PopupConfig, value: unknown) => {
    if (!selectedId) return;
    setDrafts((prev) => ({
      ...prev,
      [selectedId]: { ...prev[selectedId]!, [field]: value },
    }));
  };

  const handleSave = async () => {
    if (!selected || !canEditPopups) return;

    try {
      await updatePopup(selected.id, {
        title: selected.title.trim(),
        message: selected.message.trim(),
        discountCode: selected.discountCode.trim().toUpperCase(),
        ctaText: selected.ctaText.trim(),
        ctaLink: selected.ctaLink.trim(),
        trigger: selected.trigger,
        priority: selected.priority,
        enabled: selected.enabled,
      });
      toast.success(`"${selected.title}" saved`);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  const handleAdd = async (type: PopupType) => {
    if (!canEditPopups) return;

    const draft = newPopup(type);
    try {
      const created = await addPopup({
        type: draft.type,
        enabled: draft.enabled,
        title: draft.title,
        message: draft.message,
        discountCode: draft.discountCode,
        ctaText: draft.ctaText,
        ctaLink: draft.ctaLink,
        trigger: draft.trigger,
        priority: draft.priority,
        id: draft.id,
      });
      setSelectedId(created.id);
      toast.success('New popup created');
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePopup(id);
      if (selectedId === id) setSelectedId(null);
      toast.success('Popup deleted');
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    if (!canEditPopups) return;

    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id]!, enabled } }));

    try {
      await setPopupEnabled(id, enabled);
    } catch (error) {
      setDrafts((prev) => ({ ...prev, [id]: { ...prev[id]!, enabled: !enabled } }));
      toast.error(toApiError(error).message);
    }
  };

  const renderList = (type: PopupType) => {
    const items = popups.filter((p) => p.type === type);
    const meta = TYPE_META[type];
    const Icon = meta.icon;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {items.length} popup{items.length !== 1 ? 's' : ''}
          </p>
          {canEditPopups && (
            <Button variant="outline" size="sm" onClick={() => void handleAdd(type)} disabled={isSaving}>
              <Plus size={14} className="mr-1.5" /> Add New
            </Button>
          )}
        </div>

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No {meta.label.toLowerCase()} popups yet.
          </p>
        )}

        {items.map((p) => {
          const isActive = selectedId === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                isActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              }`}
            >
              <Icon size={16} className={meta.color} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.title || 'Untitled'}</p>
                <p className="text-xs text-muted-foreground">
                  {TRIGGER_LABELS[p.trigger]} · Priority {p.priority}
                </p>
              </div>
              {canEditPopups && (
                <Switch
                  checked={drafts[p.id]?.enabled ?? p.enabled}
                  onCheckedChange={(v) => void handleToggle(p.id, v)}
                  onClick={(e) => e.stopPropagation()}
                  disabled={isSaving}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const Icon = selected ? TYPE_META[selected.type].icon : Gift;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="font-heading text-2xl lg:text-3xl">Popup Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage welcome, discount, and campaign popups shown on the storefront
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="welcome">
            <TabsList className="w-full">
              <TabsTrigger value="welcome" className="flex-1 gap-1.5">
                <Gift size={14} /> Welcome
              </TabsTrigger>
              <TabsTrigger value="discount" className="flex-1 gap-1.5">
                <Percent size={14} /> Discount
              </TabsTrigger>
              <TabsTrigger value="campaign" className="flex-1 gap-1.5">
                <Megaphone size={14} /> Campaign
              </TabsTrigger>
            </TabsList>
            <TabsContent value="welcome">{renderList('welcome')}</TabsContent>
            <TabsContent value="discount">{renderList('discount')}</TabsContent>
            <TabsContent value="campaign">{renderList('campaign')}</TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {!selected ? (
            <div className="flex items-center justify-center min-h-[400px] border border-dashed border-border rounded-lg text-sm text-muted-foreground">
              Select a popup to edit
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selected.enabled ? (
                      <Eye size={16} className="text-primary" />
                    ) : (
                      <EyeOff size={16} className="text-muted-foreground" />
                    )}
                    <h2 className="font-heading text-lg">Edit Popup</h2>
                  </div>
                  {canEditPopups && (
                    <div className="flex gap-2">
                      {canDeletePopups && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleDelete(selected.id)}
                          disabled={isSaving}
                        >
                          <Trash2 size={14} className="mr-1.5" /> Delete
                        </Button>
                      )}
                      <Button size="sm" onClick={() => void handleSave()} disabled={isSaving}>
                        {isSaving ? (
                          <Loader2 size={14} className="mr-1.5 animate-spin" />
                        ) : (
                          <Save size={14} className="mr-1.5" />
                        )}
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-medium mb-1.5 block">Title</Label>
                  <Input
                    value={selected.title}
                    onChange={(e) => updateDraft('title', e.target.value)}
                    placeholder="Popup title..."
                    disabled={!canEditPopups}
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium mb-1.5 block">Message</Label>
                  <Textarea
                    value={selected.message}
                    onChange={(e) => updateDraft('message', e.target.value)}
                    rows={3}
                    placeholder="Popup message..."
                    disabled={!canEditPopups}
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium mb-1.5 block">Discount Code (optional)</Label>
                  <Input
                    value={selected.discountCode}
                    onChange={(e) => updateDraft('discountCode', e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME15"
                    className="font-mono"
                    disabled={!canEditPopups}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">CTA Text</Label>
                    <Input
                      value={selected.ctaText}
                      onChange={(e) => updateDraft('ctaText', e.target.value)}
                      placeholder="Shop Now"
                      disabled={!canEditPopups}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">CTA Link</Label>
                    <Input
                      value={selected.ctaLink}
                      onChange={(e) => updateDraft('ctaLink', e.target.value)}
                      placeholder="/shop"
                      disabled={!canEditPopups}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">Trigger</Label>
                    <Select
                      value={selected.trigger}
                      onValueChange={(v) => updateDraft('trigger', v)}
                      disabled={!canEditPopups}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.entries(TRIGGER_LABELS) as [PopupTrigger, string][]).map(
                          ([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium mb-1.5 block">Priority</Label>
                    <Input
                      type="number"
                      value={selected.priority}
                      onChange={(e) => updateDraft('priority', Number(e.target.value))}
                      min={1}
                      max={100}
                      disabled={!canEditPopups}
                    />
                  </div>
                </div>
              </div>

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
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                        {selected.message || 'Your message here...'}
                      </p>
                      {selected.discountCode && (
                        <div className="mb-4 inline-flex items-center gap-2 bg-secondary border border-border rounded px-3 py-2">
                          <span className="font-mono font-semibold tracking-wider">
                            {selected.discountCode}
                          </span>
                        </div>
                      )}
                      <div>
                        <Button size="sm" className="w-full">
                          {selected.ctaText || 'Button'}
                        </Button>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          No thanks, I'll pass
                        </p>
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
