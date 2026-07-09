import { useState } from 'react';
import { useStaff, type StaffMember } from '@/contexts/staff-context';
import { useRole, type StaffRole } from '@/contexts/role-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Trash2, Users, Search, Edit2, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { toApiError } from '@/lib/api/errors';

export default function Team() {
  const { role, canEdit, canDelete } = useRole();
  const { members, addMember, removeMember, updateMember, isLoading, isSaving } = useStaff();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [memberRole, setMemberRole] = useState<StaffRole>('employee');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | StaffRole>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<StaffRole>('employee');
  const [deleteConfirm, setDeleteConfirm] = useState<StaffMember | null>(null);

  const canEditTeam = canEdit('team');
  const canDeleteTeam = canDelete('team');

  if (role !== 'admin') {
    return (
      <div className="text-center py-20">
        <Users size={40} className="mx-auto text-muted-foreground mb-4" />
        <h2 className="font-heading text-xl mb-2">Access Restricted</h2>
        <p className="text-muted-foreground text-sm">Only admins can manage team members.</p>
      </div>
    );
  }

  const filtered = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || m.role === filterRole;
    return matchSearch && matchRole;
  });

  const admins = members.filter((m) => m.role === 'admin').length;
  const managers = members.filter((m) => m.role === 'manager').length;
  const employees = members.filter((m) => m.role === 'employee').length;

  const handleAdd = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addMember({
        name: name.trim(),
        email: email.trim(),
        role: memberRole,
        password,
      });
      toast.success(`${name} added as ${memberRole}`);
      setName('');
      setEmail('');
      setPassword('');
      setMemberRole('employee');
      setOpen(false);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  const handleRemove = async (member: StaffMember) => {
    try {
      await removeMember(member.id);
      toast.success(`${member.name} removed`);
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  const startEdit = (member: StaffMember) => {
    if (member.role === 'admin') return;
    setEditingId(member.id);
    setEditRole(member.role);
  };

  const saveEdit = async (member: StaffMember) => {
    try {
      await updateMember(member.id, { role: editRole });
      toast.success(`${member.name} updated to ${editRole}`);
      setEditingId(null);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  const roleBadge = (r: string) => {
    if (r === 'admin') return 'bg-primary/10 text-primary border border-primary/20';
    if (r === 'manager') return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {admins} admin{admins !== 1 ? 's' : ''}, {managers} manager{managers !== 1 ? 's' : ''}, {employees} employee{employees !== 1 ? 's' : ''}
          </p>
        </div>
        {canEditTeam && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5" disabled={isSaving}>
                <UserPlus size={16} />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="team-name">Name</Label>
                  <Input id="team-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="team-email">Email</Label>
                  <Input id="team-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="team-password">Password</Label>
                  <Input id="team-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select value={memberRole} onValueChange={(v: StaffRole) => setMemberRole(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} className="w-full" disabled={isSaving}>
                  {isSaving ? 'Adding...' : 'Add Member'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterRole} onValueChange={(v: 'all' | StaffRole) => setFilterRole(v)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="manager">Managers</SelectItem>
            <SelectItem value="employee">Employees</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-background border border-border rounded">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Name</th>
                <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Email</th>
                <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Role</th>
                <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Added</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium">{member.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{member.email}</td>
                  <td className="px-5 py-3">
                    {editingId === member.id && member.role !== 'admin' ? (
                      <Select value={editRole} onValueChange={(v: StaffRole) => setEditRole(v)}>
                        <SelectTrigger className="h-7 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="employee">Employee</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold letter-wide uppercase rounded ${roleBadge(member.role)}`}>
                        {member.role}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{member.addedAt}</td>
                  <td className="px-5 py-3 text-right">
                    {member.role !== 'admin' && (canEditTeam || canDeleteTeam) && (
                      <div className="flex items-center justify-end gap-2">
                        {editingId === member.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(member)}
                              disabled={isSaving}
                              className="text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            {canEditTeam && (
                              <button onClick={() => startEdit(member)} className="text-muted-foreground hover:text-foreground transition-colors">
                                <Edit2 size={14} />
                              </button>
                            )}
                            {canDeleteTeam && (
                              <button
                                onClick={() => setDeleteConfirm(member)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground text-sm">
                    No team members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-background p-6 m-4 shadow-elevated max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg mb-2">Remove Team Member?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              {deleteConfirm.name} will lose access to the CMS. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground">
                Cancel
              </button>
              <button
                onClick={() => handleRemove(deleteConfirm)}
                disabled={isSaving}
                className="px-4 py-2 bg-destructive text-destructive-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
