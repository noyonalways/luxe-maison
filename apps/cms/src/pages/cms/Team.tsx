import { useState } from 'react';
import { useStaff, type StaffMember } from '@/context/StaffContext';
import { useRole } from '@/context/RoleContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Trash2, Users, Search, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Team() {
  const { role } = useRole();
  const { members, addMember, removeMember, updateMember } = useStaff();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [memberRole, setMemberRole] = useState<'manager' | 'employee'>('employee');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'manager' | 'employee'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<'manager' | 'employee'>('employee');

  if (role !== 'admin') {
    return (
      <div className="text-center py-20">
        <Users size={40} className="mx-auto text-muted-foreground mb-4" />
        <h2 className="font-heading text-xl mb-2">Access Restricted</h2>
        <p className="text-muted-foreground text-sm">Only admins can manage team members.</p>
      </div>
    );
  }

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || m.role === filterRole;
    return matchSearch && matchRole;
  });

  const managers = members.filter(m => m.role === 'manager').length;
  const employees = members.filter(m => m.role === 'employee').length;

  const handleAdd = () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    addMember({ name: name.trim(), email: email.trim(), role: memberRole });
    toast.success(`${name} added as ${memberRole}`);
    setName('');
    setEmail('');
    setMemberRole('employee');
    setOpen(false);
  };

  const handleRemove = (member: StaffMember) => {
    removeMember(member.id);
    toast.success(`${member.name} removed`);
  };

  const startEdit = (member: StaffMember) => {
    setEditingId(member.id);
    setEditRole(member.role);
  };

  const saveEdit = (member: StaffMember) => {
    updateMember(member.id, { role: editRole });
    toast.success(`${member.name} updated to ${editRole}`);
    setEditingId(null);
  };

  const roleBadge = (r: string) => {
    if (r === 'manager') return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {managers} manager{managers !== 1 ? 's' : ''}, {employees} employee{employees !== 1 ? 's' : ''}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5">
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
                <Input id="team-name" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="team-email">Email</Label>
                <Input id="team-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={memberRole} onValueChange={(v: 'manager' | 'employee') => setMemberRole(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full">Add Member</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterRole} onValueChange={(v: 'all' | 'manager' | 'employee') => setFilterRole(v)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="manager">Managers</SelectItem>
            <SelectItem value="employee">Employees</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
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
              {filtered.map(member => (
                <tr key={member.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium">{member.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{member.email}</td>
                  <td className="px-5 py-3">
                    {editingId === member.id ? (
                      <Select value={editRole} onValueChange={(v: 'manager' | 'employee') => setEditRole(v)}>
                        <SelectTrigger className="h-7 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                    <div className="flex items-center justify-end gap-2">
                      {editingId === member.id ? (
                        <>
                          <button onClick={() => saveEdit(member)} className="text-emerald-600 hover:text-emerald-700 transition-colors">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(member)} className="text-muted-foreground hover:text-foreground transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleRemove(member)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground text-sm">No team members found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
