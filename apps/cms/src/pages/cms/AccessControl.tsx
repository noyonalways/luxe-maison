import { useRole, ALL_SECTIONS, DEFAULT_PERMISSIONS, type Section, type Permission } from '@/contexts/role-context';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Mail, Percent, Megaphone, MessageSquare, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const sectionMeta: Record<string, { label: string; icon: React.ElementType }> = {
  dashboard: { label: 'Dashboard', icon: LayoutDashboard },
  products: { label: 'Products', icon: Package },
  orders: { label: 'Orders', icon: ShoppingCart },
  customers: { label: 'Customers', icon: Users },
  analytics: { label: 'Analytics', icon: BarChart3 },
  newsletter: { label: 'Newsletter', icon: Mail },
  discounts: { label: 'Discounts', icon: Percent },
  campaigns: { label: 'Campaigns', icon: Megaphone },
  popup: { label: 'Welcome Popup', icon: MessageSquare },
};

const permissionOptions: { value: Permission; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'view', label: 'View' },
  { value: 'edit', label: 'Edit' },
  { value: 'full', label: 'Full' },
];

const permissionColors: Record<Permission, string> = {
  none: 'text-muted-foreground',
  view: 'text-blue-600',
  edit: 'text-amber-600',
  full: 'text-emerald-600',
};

export default function AccessControl() {
  const { getPermissions, updatePermission, resetPermissions } = useRole();
  const permissions = getPermissions();

  const handleReset = () => {
    resetPermissions();
    toast.success('Permissions reset to defaults');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Access Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage what Manager and Employee roles can access</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
          <RotateCcw size={14} />
          Reset to Defaults
        </Button>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Section</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Employee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ALL_SECTIONS.map(section => {
              const meta = sectionMeta[section];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <TableRow key={section}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} className="text-muted-foreground" />
                      <span className="font-medium text-sm">{meta.label}</span>
                    </div>
                  </TableCell>
                  {(['manager', 'employee'] as const).map(targetRole => (
                    <TableCell key={targetRole}>
                      <Select
                        value={permissions[targetRole][section]}
                        onValueChange={(val: Permission) => {
                          updatePermission(targetRole, section, val);
                          toast.success(`${meta.label} → ${targetRole}: ${val}`);
                        }}
                      >
                        <SelectTrigger className="w-[120px] h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {permissionOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className={permissionColors[opt.value]}>{opt.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Permission Levels</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div><span className="font-semibold text-muted-foreground">None</span> — No access</div>
          <div><span className="font-semibold text-blue-600">View</span> — Read only</div>
          <div><span className="font-semibold text-amber-600">Edit</span> — View + Edit</div>
          <div><span className="font-semibold text-emerald-600">Full</span> — View + Edit + Delete</div>
        </div>
      </div>
    </div>
  );
}
