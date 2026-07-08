import { useState, useMemo } from 'react';
import { mockCustomers, mockOrders } from '@/data/cms-mock';
import type { Customer } from '@/data/cms-types';
import { useRole } from '@/contexts/role-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Download, Eye, ShieldBan, ShieldCheck, Users, ShoppingCart, DollarSign, Calendar, TrendingUp, UserCheck, BarChart3, Package, Truck, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, startOfMonth } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['hsl(40, 45%, 56%)', 'hsl(0, 0%, 20%)', 'hsl(0, 0%, 50%)', 'hsl(0, 0%, 75%)', 'hsl(40, 30%, 70%)'];

type StatusFilter = 'all' | 'active' | 'blocked';
type SortField = 'name' | 'totalOrders' | 'totalSpent' | 'joinedAt';
type SortDir = 'asc' | 'desc';
// --- Analytics sub-component ---
function CustomerAnalytics({ customers }: { customers: Customer[] }) {
  const topSpenders = useMemo(() =>
    [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 6).map(c => ({
      name: c.name.split(' ')[0] + ' ' + (c.name.split(' ')[1]?.[0] ?? '') + '.',
      spent: c.totalSpent,
      orders: c.totalOrders,
    })),
    [customers]
  );

  const acquisitionTrend = useMemo(() => {
    const monthMap = new Map<string, number>();
    customers.forEach(c => {
      const key = format(startOfMonth(parseISO(c.joinedAt)), 'MMM yyyy');
      monthMap.set(key, (monthMap.get(key) || 0) + 1);
    });
    return Array.from(monthMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([month, count]) => ({ month: month.split(' ')[0], newCustomers: count }));
  }, [customers]);

  const retentionData = useMemo(() => {
    const now = new Date();
    let loyal = 0, returning = 0, oneTime = 0, inactive = 0;
    customers.forEach(c => {
      const daysSinceLast = (now.getTime() - new Date(c.lastOrderAt).getTime()) / (1000 * 60 * 60 * 24);
      if (c.totalOrders >= 8) loyal++;
      else if (c.totalOrders >= 3) returning++;
      else if (daysSinceLast > 90) inactive++;
      else oneTime++;
    });
    return [
      { name: 'Loyal (8+)', value: loyal },
      { name: 'Returning (3-7)', value: returning },
      { name: 'New / One-time', value: oneTime },
      { name: 'Inactive (90d+)', value: inactive },
    ].filter(d => d.value > 0);
  }, [customers]);

  const spendBuckets = useMemo(() => {
    const buckets = [
      { range: '$0–500', min: 0, max: 500, count: 0 },
      { range: '$500–1k', min: 500, max: 1000, count: 0 },
      { range: '$1k–2k', min: 1000, max: 2000, count: 0 },
      { range: '$2k–3k', min: 2000, max: 3000, count: 0 },
      { range: '$3k+', min: 3000, max: Infinity, count: 0 },
    ];
    customers.forEach(c => {
      const b = buckets.find(b => c.totalSpent >= b.min && c.totalSpent < b.max);
      if (b) b.count++;
    });
    return buckets.map(b => ({ range: b.range, customers: b.count }));
  }, [customers]);

  const avgSpent = customers.length ? Math.round(customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length) : 0;
  const avgOrders = customers.length ? (customers.reduce((s, c) => s + c.totalOrders, 0) / customers.length).toFixed(1) : '0';
  const repeatRate = customers.length ? Math.round((customers.filter(c => c.totalOrders > 1).length / customers.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: 'Avg. Lifetime Value', value: `$${avgSpent.toLocaleString()}` },
          { icon: ShoppingCart, label: 'Avg. Orders', value: avgOrders },
          { icon: UserCheck, label: 'Repeat Rate', value: `${repeatRate}%` },
          { icon: TrendingUp, label: 'New This Month', value: acquisitionTrend[acquisitionTrend.length - 1]?.newCustomers ?? 0 },
        ].map(s => (
          <div key={s.label} className="bg-background border border-border rounded-lg p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-secondary"><s.icon size={16} className="text-muted-foreground" /></div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-semibold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background border border-border rounded-lg p-5">
          <h3 className="font-heading text-base font-semibold mb-4">Top Spenders</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSpenders} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={65} />
                <Tooltip
                  contentStyle={{ border: '1px solid hsl(0,0%,90%)', borderRadius: 4, fontSize: 12 }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spent']}
                />
                <Bar dataKey="spent" fill="hsl(40, 45%, 56%)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-5">
          <h3 className="font-heading text-base font-semibold mb-4">Customer Acquisition</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={acquisitionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ border: '1px solid hsl(0,0%,90%)', borderRadius: 4, fontSize: 12 }} />
                <Area type="monotone" dataKey="newCustomers" stroke="hsl(40, 45%, 56%)" fill="hsl(40, 45%, 56%)" fillOpacity={0.15} strokeWidth={2} name="New Customers" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-5">
          <h3 className="font-heading text-base font-semibold mb-4">Customer Segments</h3>
          <div className="h-56 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={retentionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                  fontSize={11}
                >
                  {retentionData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ border: '1px solid hsl(0,0%,90%)', borderRadius: 4, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-5">
          <h3 className="font-heading text-base font-semibold mb-4">Spend Distribution</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ border: '1px solid hsl(0,0%,90%)', borderRadius: 4, fontSize: 12 }} />
                <Bar dataKey="customers" fill="hsl(0, 0%, 20%)" radius={[3, 3, 0, 0]} name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main page ---
export default function Customers() {
  const { canDelete } = useRole();
  const canDeleteCustomers = canDelete('customers');
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [toggleCustomer, setToggleCustomer] = useState<Customer | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = customers.filter(c => {
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'totalOrders': cmp = a.totalOrders - b.totalOrders; break;
        case 'totalSpent': cmp = a.totalSpent - b.totalSpent; break;
        case 'joinedAt': cmp = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [customers, search, statusFilter, sortField, sortDir]);

  // Reset page when filters change
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage, perPage]);

  const stats = useMemo(() => ({
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    blocked: customers.filter(c => c.status === 'blocked').length,
    totalSpent: customers.reduce((s, c) => s + c.totalSpent, 0),
  }), [customers]);

  const handleToggleStatus = () => {
    if (!toggleCustomer) return;
    setCustomers(prev => prev.map(c =>
      c.id === toggleCustomer.id
        ? { ...c, status: c.status === 'active' ? 'blocked' : 'active' }
        : c
    ));
    setToggleCustomer(null);
  };

  const exportCSV = () => {
    const header = 'Name,Email,Phone,Total Orders,Total Spent,Status,Joined';
    const rows = filtered.map(c =>
      `"${c.name}","${c.email}","${c.phone}",${c.totalOrders},${c.totalSpent},${c.status},"${format(new Date(c.joinedAt), 'MMM d, yyyy')}"`
    );
    const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'customers.csv';
    a.click();
  };

  const filterBtns: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Blocked', value: 'blocked' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-semibold">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your customer base</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2 self-start">
          <Download size={14} /> Export CSV
        </Button>
      </div>

      <Tabs defaultValue="directory" className="w-full">
        <TabsList>
          <TabsTrigger value="directory" className="gap-2 text-xs"><Users size={14} /> Directory</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 text-xs"><BarChart3 size={14} /> Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="mt-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Customers', value: stats.total, icon: Users },
              { label: 'Active', value: stats.active, icon: ShieldCheck },
              { label: 'Blocked', value: stats.blocked, icon: ShieldBan },
              { label: 'Lifetime Revenue', value: `$${stats.totalSpent.toLocaleString()}`, icon: DollarSign },
            ].map(s => (
              <div key={s.label} className="bg-background border border-border rounded-lg p-4 flex items-center gap-3">
                <div className="p-2 rounded-md bg-secondary"><s.icon size={16} className="text-muted-foreground" /></div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-semibold">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            <div className="flex gap-1">
              {filterBtns.map(f => (
                <Button key={f.value} variant={statusFilter === f.value ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(f.value)} className="text-xs">
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Customer {sortField === 'name' ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-40" />}
                    </button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="text-center">
                    <button onClick={() => handleSort('totalOrders')} className="flex items-center gap-1 mx-auto hover:text-foreground transition-colors">
                      Orders {sortField === 'totalOrders' ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-40" />}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button onClick={() => handleSort('totalSpent')} className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors">
                      Spent {sortField === 'totalSpent' ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-40" />}
                    </button>
                  </TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <button onClick={() => handleSort('joinedAt')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Joined {sortField === 'joinedAt' ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-40" />}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground">
                          {c.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.phone}</TableCell>
                    <TableCell className="text-center text-sm">{c.totalOrders}</TableCell>
                    <TableCell className="text-right text-sm font-medium">${c.totalSpent.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={c.status === 'active' ? 'default' : 'destructive'} className="text-[10px]">
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {format(new Date(c.joinedAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedCustomer(c)}>
                          <Eye size={14} />
                        </Button>
                        {canDeleteCustomers && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setToggleCustomer(c)}>
                          {c.status === 'active' ? <ShieldBan size={14} /> : <ShieldCheck size={14} />}
                        </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No customers found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Rows per page:</span>
                <select
                  value={perPage}
                  onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="ml-2">
                  {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft size={14} />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === 'ellipsis' ? (
                      <span key={`e-${i}`} className="px-1 text-muted-foreground">…</span>
                    ) : (
                      <Button
                        key={p}
                        variant={currentPage === p ? 'default' : 'outline'}
                        size="icon"
                        className="h-8 w-8 text-xs"
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </Button>
                    )
                  )}
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <CustomerAnalytics customers={customers} />
        </TabsContent>
      </Tabs>

      {/* View Customer Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Customer Profile</DialogTitle>
            <DialogDescription>Full details, lifetime stats & order history</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (() => {
            const customerOrders = mockOrders.filter(
              o => o.customerEmail.toLowerCase() === selectedCustomer.email.toLowerCase()
            );
            const statusColors: Record<string, string> = {
              pending: 'bg-yellow-100 text-yellow-800',
              processing: 'bg-blue-100 text-blue-800',
              shipped: 'bg-purple-100 text-purple-800',
              delivered: 'bg-green-100 text-green-800',
              returned: 'bg-red-100 text-red-800',
            };
            return (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-lg font-semibold text-muted-foreground">
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedCustomer.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                    <Badge variant={selectedCustomer.status === 'active' ? 'default' : 'destructive'} className="mt-1 text-[10px]">
                      {selectedCustomer.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: ShoppingCart, label: 'Total Orders', value: selectedCustomer.totalOrders },
                    { icon: DollarSign, label: 'Total Spent', value: `$${selectedCustomer.totalSpent.toLocaleString()}` },
                    { icon: Calendar, label: 'Joined', value: format(new Date(selectedCustomer.joinedAt), 'MMM d, yyyy') },
                    { icon: Calendar, label: 'Last Order', value: format(new Date(selectedCustomer.lastOrderAt), 'MMM d, yyyy') },
                  ].map(s => (
                    <div key={s.label} className="border border-border rounded-lg p-3">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <s.icon size={12} />
                        <span className="text-[10px] uppercase tracking-wider">{s.label}</span>
                      </div>
                      <p className="text-sm font-semibold">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Contact & Address</p>
                  <p>{selectedCustomer.phone}</p>
                  <p className="text-muted-foreground">{selectedCustomer.address}</p>
                </div>

                {/* Order History */}
                <div className="space-y-3">
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Order History</p>
                  {customerOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No orders found in recent records.</p>
                  ) : (
                    customerOrders.map(order => (
                      <div key={order.id} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package size={14} className="text-muted-foreground" />
                            <span className="text-sm font-semibold">{order.id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] ?? ''}`}>
                              {order.status}
                            </span>
                            <span className="text-xs text-muted-foreground">{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <img src={item.image} alt={item.productName} className="w-10 h-10 rounded object-cover bg-secondary" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.productName}</p>
                                <p className="text-[11px] text-muted-foreground">{item.size} · {item.color} · Qty {item.quantity}</p>
                              </div>
                              <p className="text-sm font-medium">${(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {order.trackingNumber && (
                              <span className="flex items-center gap-1"><Truck size={11} /> {order.carrier} · {order.trackingNumber}</span>
                            )}
                          </div>
                          <p className="text-sm font-semibold">${order.total.toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Block/Unblock Confirmation */}
      <AlertDialog open={!!toggleCustomer} onOpenChange={() => setToggleCustomer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleCustomer?.status === 'active' ? 'Block' : 'Unblock'} {toggleCustomer?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleCustomer?.status === 'active'
                ? 'This customer will be blocked from placing new orders.'
                : 'This customer will be able to place orders again.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              {toggleCustomer?.status === 'active' ? 'Block' : 'Unblock'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
