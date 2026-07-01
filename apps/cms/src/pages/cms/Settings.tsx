import { useRole } from '@/context/RoleContext';
import { useSettings } from '@/context/SettingsContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Store, Bell, Globe, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { role } = useRole();
  const { settings, updateSettings, resetSettings } = useSettings();

  if (role !== 'admin') {
    return (
      <div className="text-center py-20">
        <Settings size={40} className="mx-auto text-muted-foreground mb-4" />
        <h2 className="font-heading text-xl mb-2">Access Restricted</h2>
        <p className="text-muted-foreground text-sm">Only admins can manage system settings.</p>
      </div>
    );
  }

  const handleReset = () => {
    resetSettings();
    toast.success('Settings reset to defaults');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your store configuration</p>
        </div>
        <Button variant="outline" onClick={handleReset} className="gap-1.5">
          <RotateCcw size={14} />
          Reset Defaults
        </Button>
      </div>

      <div className="space-y-6">
        {/* Store Information */}
        <section className="bg-background border border-border rounded p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Store size={18} className="text-muted-foreground" />
            <h2 className="font-heading text-lg">Store Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="store-name">Store Name</Label>
              <Input
                id="store-name"
                value={settings.storeName}
                onChange={e => updateSettings({ storeName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={settings.contactEmail}
                onChange={e => updateSettings({ contactEmail: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* Localization */}
        <section className="bg-background border border-border rounded p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe size={18} className="text-muted-foreground" />
            <h2 className="font-heading text-lg">Localization</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={settings.currency} onValueChange={v => updateSettings({ currency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="BDT">BDT (৳)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Language</Label>
              <Select value={settings.language} onValueChange={v => updateSettings({ language: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="bn">Bengali</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <Select value={settings.timezone} onValueChange={v => updateSettings({ timezone: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                  <SelectItem value="Asia/Dhaka">Bangladesh (BST)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-background border border-border rounded p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell size={18} className="text-muted-foreground" />
            <h2 className="font-heading text-lg">Notifications & Alerts</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Order Notifications</p>
                <p className="text-xs text-muted-foreground">Get alerted for new orders</p>
              </div>
              <Switch checked={settings.orderNotifications} onCheckedChange={v => updateSettings({ orderNotifications: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Low Stock Alerts</p>
                <p className="text-xs text-muted-foreground">Alert when products fall below threshold</p>
              </div>
              <Switch checked={settings.stockAlerts} onCheckedChange={v => updateSettings({ stockAlerts: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Newsletter Auto-Reply</p>
                <p className="text-xs text-muted-foreground">Automatically send welcome email to new subscribers</p>
              </div>
              <Switch checked={settings.newsletterAutoReply} onCheckedChange={v => updateSettings({ newsletterAutoReply: v })} />
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="space-y-1.5 flex-1 max-w-xs">
                  <Label htmlFor="low-stock">Low Stock Threshold</Label>
                  <Input
                    id="low-stock"
                    type="number"
                    min={1}
                    value={settings.lowStockThreshold}
                    onChange={e => updateSettings({ lowStockThreshold: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-6">units remaining before alert</p>
              </div>
            </div>
          </div>
        </section>

        {/* Maintenance Mode */}
        <section className="bg-background border border-border rounded p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg">Maintenance Mode</h2>
              <p className="text-sm text-muted-foreground mt-1">
                When enabled, the storefront will display a maintenance page to visitors.
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={v => {
                updateSettings({ maintenanceMode: v });
                toast(v ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
              }}
            />
          </div>
          {settings.maintenanceMode && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
              ⚠️ Your store is currently in maintenance mode. Visitors will see a maintenance page.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
