import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth, isStaffRole } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { cmsDashboard } from '@/lib/cms-navigation';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && isStaffRole(user.role)) {
      navigate({ ...cmsDashboard(user.role), replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated && user && isStaffRole(user.role)) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        const stored = localStorage.getItem('maison-auth-user');
        if (stored) {
          const u = JSON.parse(stored);
          if (isStaffRole(u.role)) {
            navigate({ ...cmsDashboard(u.role), replace: true });
          } else {
            setError('This login is for staff only. Please use the customer login.');
            localStorage.removeItem('maison-auth-user');
            window.location.reload();
          }
        }
      } else {
        setError(result.error || 'Login failed');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="bg-background rounded-lg border border-border p-8 shadow-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield size={24} className="text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-semibold">MAISON</h1>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Staff Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@maison.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-[11px] text-primary hover:underline transition-smooth">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive">{error}</motion.p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground text-center mb-3">Demo Credentials</p>
            <div className="space-y-1.5">
              {[
                { label: 'Admin', email: 'admin@maison.com' },
                { label: 'Manager', email: 'manager@maison.com' },
                { label: 'Employee', email: 'employee@maison.com' },
              ].map(cred => (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => { setEmail(cred.email); setPassword(cred.email.split('@')[0] + '123'); }}
                  className="w-full text-left px-3 py-2 rounded text-xs bg-secondary hover:bg-muted transition-smooth"
                >
                  <span className="font-medium">{cred.label}</span>
                  <span className="text-muted-foreground ml-2">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
