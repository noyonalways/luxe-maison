import { useState, useMemo } from 'react';
import { Search, Send, Download, Mail, Users, Eye, MailOpen } from 'lucide-react';
import { mockSubscribers, mockNewsletterEmails } from '@/data/cms-mock';
import type { Subscriber, NewsletterEmail } from '@/data/cms-types';
import { StatusBadge } from '@/components/staff/StatusBadge';
import { useTableSort, useTablePagination, SortableHeader, PaginationControls } from '@/components/staff/TableControls';
import Papa from 'papaparse';

export default function Newsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(mockSubscribers);
  const [emails, setEmails] = useState<NewsletterEmail[]>(mockNewsletterEmails);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCompose, setShowCompose] = useState(false);
  const [tab, setTab] = useState<'subscribers' | 'history'>('subscribers');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<'all' | 'active'>('active');

  const { sortField, sortDir, handleSort, sortData } = useTableSort<Subscriber>('name' as keyof Subscriber, 'asc');

  const filteredSubs = useMemo(() => {
    let result = subscribers.filter(s => {
      const matchSearch = s.email.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
    return sortData(result);
  }, [subscribers, search, statusFilter, sortData]);

  const pagination = useTablePagination(filteredSubs.length, 10);
  const paginatedSubs = pagination.paginateData(filteredSubs);

  const activeCount = subscribers.filter(s => s.status === 'active').length;

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) return;
    const recipientCount = audience === 'active' ? activeCount : subscribers.length;
    const newEmail: NewsletterEmail = {
      id: `nl-${Date.now()}`, subject: subject.trim(), body: body.trim(), audience, recipientCount,
      openRate: Math.floor(Math.random() * 30) + 40, sentAt: new Date().toISOString(),
    };
    setEmails(prev => [newEmail, ...prev]);
    setSubject(''); setBody(''); setShowCompose(false);
  };

  const exportCSV = () => {
    const csv = Papa.unparse(subscribers.map(s => ({
      Name: s.name, Email: s.email, Status: s.status, 'Subscribed Date': new Date(s.subscribedAt).toLocaleDateString(),
    })));
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'subscribers.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-heading text-2xl lg:text-3xl">Newsletter</h1>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground">
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShowCompose(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90">
            <Send size={14} /> Compose
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Subscribers', value: subscribers.length, icon: Users },
          { label: 'Active', value: activeCount, icon: Mail },
          { label: 'Emails Sent', value: emails.length, icon: Send },
          { label: 'Avg Open Rate', value: `${emails.length ? Math.round(emails.reduce((a, e) => a + e.openRate, 0) / emails.length) : 0}%`, icon: MailOpen },
        ].map(s => (
          <div key={s.label} className="bg-background border border-border rounded p-4">
            <s.icon size={16} className="text-muted-foreground mb-3" />
            <p className="text-xl font-heading font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-6 border-b border-border">
        {(['subscribers', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`pb-3 text-sm font-medium letter-wide uppercase transition-smooth ${tab === t ? 'border-b-2 border-foreground text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t === 'subscribers' ? 'Subscribers' : 'Email History'}
          </button>
        ))}
      </div>

      {tab === 'subscribers' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value.slice(0, 100)); pagination.resetPage(); }} placeholder="Search subscribers..."
                className="w-full pl-9 pr-4 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'unsubscribed'].map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); pagination.resetPage(); }} className={`px-3 py-2 text-xs font-medium letter-wide uppercase border transition-smooth ${statusFilter === s ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-background border border-border rounded overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">
                    <SortableHeader<Subscriber> field="name" label="Name" sortField={sortField as keyof Subscriber} sortDir={sortDir} onSort={handleSort as any} />
                  </th>
                  <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">
                    <SortableHeader<Subscriber> field="email" label="Email" sortField={sortField as keyof Subscriber} sortDir={sortDir} onSort={handleSort as any} />
                  </th>
                  <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-xs font-body font-semibold letter-wide uppercase text-muted-foreground">
                    <SortableHeader<Subscriber> field="subscribedAt" label="Subscribed" sortField={sortField as keyof Subscriber} sortDir={sortDir} onSort={handleSort as any} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubs.map(s => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-smooth">
                    <td className="px-5 py-3 font-medium">{s.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.email}</td>
                    <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{new Date(s.subscribedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSubs.length === 0 && <div className="text-center py-10 text-sm text-muted-foreground">No subscribers found.</div>}
          </div>
          <PaginationControls {...pagination} totalItems={filteredSubs.length} />
        </>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          {emails.map(e => (
            <div key={e.id} className="bg-background border border-border rounded p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{e.subject}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{e.body}</p>
                </div>
                <div className="text-right flex-shrink-0"><p className="text-xs text-muted-foreground">{new Date(e.sentAt).toLocaleDateString()}</p></div>
              </div>
              <div className="flex gap-6 mt-3 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Users size={12} /> {e.recipientCount} recipients</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye size={12} /> {e.openRate}% opened</span>
                <span className="text-xs text-muted-foreground capitalize">{e.audience} audience</span>
              </div>
            </div>
          ))}
          {emails.length === 0 && <div className="text-center py-10 text-sm text-muted-foreground">No emails sent yet.</div>}
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30" onClick={() => setShowCompose(false)}>
          <div className="bg-background w-full max-w-2xl max-h-[85vh] overflow-y-auto m-4 shadow-elevated" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h2 className="font-heading text-lg">Compose Newsletter</h2>
              <button onClick={() => setShowCompose(false)} className="text-muted-foreground transition-smooth hover-gold text-sm">✕</button>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div>
                <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Audience</label>
                <select value={audience} onChange={e => setAudience(e.target.value as 'all' | 'active')}
                  className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground">
                  <option value="active">Active subscribers ({activeCount})</option>
                  <option value="all">All subscribers ({subscribers.length})</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Subject</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value.slice(0, 200))} placeholder="Email subject line..."
                  className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth" />
              </div>
              <div>
                <label className="block text-xs font-body font-medium letter-wide uppercase text-muted-foreground mb-1.5">Body</label>
                <textarea value={body} onChange={e => setBody(e.target.value.slice(0, 5000))} rows={8} placeholder="Write your email content..."
                  className="w-full px-3 py-2.5 border border-border text-sm bg-background focus:outline-none focus:border-foreground transition-smooth resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowCompose(false)} className="px-5 py-2.5 border border-border text-xs font-medium letter-wide uppercase transition-smooth hover:border-foreground">Cancel</button>
              <button onClick={handleSend} disabled={!subject.trim() || !body.trim()}
                className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-medium letter-wide uppercase transition-smooth hover:opacity-90 disabled:opacity-50">
                <span className="flex items-center gap-2"><Send size={12} /> Send Newsletter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
