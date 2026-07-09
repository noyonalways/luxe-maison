import { useRole, ALL_SECTIONS, type Section, type Permission } from '@/contexts/role-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Mail,
  Percent,
  Megaphone,
  MessageSquare,
  Shield,
  Settings,
  Home,
  FileText,
  RotateCcw,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const sectionMeta: Record<Section, { label: string; icon: React.ElementType }> = {
  dashboard: { label: 'Dashboard', icon: LayoutDashboard },
  products: { label: 'Products', icon: Package },
  orders: { label: 'Orders', icon: ShoppingCart },
  customers: { label: 'Customers', icon: Users },
  analytics: { label: 'Analytics', icon: BarChart3 },
  newsletter: { label: 'Newsletter', icon: Mail },
  discounts: { label: 'Discounts', icon: Percent },
  campaigns: { label: 'Campaigns', icon: Megaphone },
  popup: { label: 'Welcome Popup', icon: MessageSquare },
  homepage: { label: 'Homepage', icon: Home },
  pages: { label: 'Store Pages', icon: FileText },
  team: { label: 'Team', icon: Users },
  settings: { label: 'Settings', icon: Settings },
  'access-control': { label: 'Access Control', icon: Shield },
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
  const {
    roles,
    canEdit,
    updatePermission,
    createRole,
    deleteRole,
    resetPermissions,
    isLoadingPermissions,
    isSavingPermissions,
  } = useRole();

  const [createOpen, setCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleSlug, setNewRoleSlug] = useState('');

  const canManage = canEdit('access-control');

  const handleReset = () => {
    resetPermissions();
    toast.success('System roles reset to defaults');
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast.error('Role name is required');
      return;
    }
    try {
      await createRole({
        name: newRoleName.trim(),
        slug: newRoleSlug.trim() || undefined,
      });
      toast.success(`Role "${newRoleName}" created`);
      setNewRoleName('');
      setNewRoleSlug('');
      setCreateOpen(false);
    } catch {
      toast.error('Failed to create role');
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    try {
      await deleteRole(roleId);
      toast.success(`Role "${roleName}" deleted`);
    } catch {
      toast.error('Failed to delete role. Remove staff assigned to this role first.');
    }
  };

  if (isLoadingPermissions) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Shield size={40} className="mx-auto mb-4 opacity-50" />
        <h2 className="font-heading text-xl mb-2 text-foreground">Access Restricted</h2>
        <p className="text-sm">You do not have permission to manage access control.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Access Control</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Grant module access per role. Create custom roles and assign them to team members.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus size={14} />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Custom Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="role-name">Role name</Label>
                  <Input
                    id="role-name"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. Support Agent"
                  />
                </div>
                <div>
                  <Label htmlFor="role-slug">URL slug (optional)</Label>
                  <Input
                    id="role-slug"
                    value={newRoleSlug}
                    onChange={(e) => setNewRoleSlug(e.target.value)}
                    placeholder="e.g. support-agent"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Lowercase letters, numbers, and hyphens. Used in the CMS URL.
                  </p>
                </div>
                <Button onClick={handleCreateRole} disabled={isSavingPermissions} className="w-full">
                  Create Role
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isSavingPermissions}
            className="gap-2"
          >
            {isSavingPermissions ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
            Reset Defaults
          </Button>
        </div>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] sticky left-0 bg-background">Section</TableHead>
              {roles.map((cmsRole) => (
                <TableHead key={cmsRole.id} className="min-w-[140px]">
                  <div className="flex items-center justify-between gap-2">
                    <span>{cmsRole.name}</span>
                    {!cmsRole.isSystem && (
                      <button
                        type="button"
                        title={`Delete ${cmsRole.name}`}
                        onClick={() => handleDeleteRole(cmsRole.id, cmsRole.name)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] font-normal text-muted-foreground">/{cmsRole.slug}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ALL_SECTIONS.map((section) => {
              const meta = sectionMeta[section];
              const Icon = meta.icon;
              return (
                <TableRow key={section}>
                  <TableCell className="sticky left-0 bg-background">
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} className="text-muted-foreground" />
                      <span className="font-medium text-sm">{meta.label}</span>
                    </div>
                  </TableCell>
                  {roles.map((cmsRole) => (
                    <TableCell key={cmsRole.id}>
                      <Select
                        value={cmsRole.permissions[section]}
                        disabled={isSavingPermissions}
                        onValueChange={(val: Permission) => {
                          updatePermission(cmsRole.id, section, val);
                          toast.success(`${meta.label} → ${cmsRole.name}: ${val}`);
                        }}
                      >
                        <SelectTrigger className="w-[120px] h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {permissionOptions.map((opt) => (
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
