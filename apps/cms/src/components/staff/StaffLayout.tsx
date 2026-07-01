import { Link, useLocation, useNavigate, Outlet, Navigate } from '@tanstack/react-router';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, ArrowLeft, Mail, Percent, Megaphone, Users, MessageSquare, ChevronDown, Shield, ShieldAlert, Settings, PanelLeftClose, PanelLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRole, pathToSection, type StaffRole } from '@/context/RoleContext';
import { useAuth, isStaffRole } from '@/context/AuthContext';
import { cmsDashboard, cmsTo, type CmsSection } from '@/lib/cms-navigation';
import { useStaffUrlRole } from '@/lib/use-staff-url-role';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3000';

const sectionLinks = [
  { path: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'dashboard' as const },
  { path: 'products', icon: Package, label: 'Products', section: 'products' as const },
  { path: 'orders', icon: ShoppingCart, label: 'Orders', section: 'orders' as const },
  { path: 'customers', icon: Users, label: 'Customers', section: 'customers' as const },
  { path: 'analytics', icon: BarChart3, label: 'Analytics', section: 'analytics' as const },
  { path: 'newsletter', icon: Mail, label: 'Newsletter', section: 'newsletter' as const },
  { path: 'discounts', icon: Percent, label: 'Discounts', section: 'discounts' as const },
  { path: 'campaigns', icon: Megaphone, label: 'Campaigns', section: 'campaigns' as const },
  { path: 'popup', icon: MessageSquare, label: 'Welcome Popup', section: 'popup' as const },
  { path: 'team', icon: Users, label: 'Team', section: 'team' as const },
  
  { path: 'access-control', icon: Shield, label: 'Access Control', section: 'access-control' as const },
];

const roleLabels: Record<StaffRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  employee: 'Employee',
};

const roleBadgeStyles: Record<StaffRole, string> = {
  admin: 'bg-primary text-primary-foreground',
  manager: 'bg-amber-100 text-amber-800',
  employee: 'bg-secondary text-muted-foreground',
};

export default function StaffLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlRole = useStaffUrlRole();
  const { role, hasAccess } = useRole();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: '/login', replace: true });
  };

  const authRole = user && isStaffRole(user.role) ? user.role : null;
  const isValidRole = authRole !== null && urlRole === authRole;

  useEffect(() => {
    if (authRole && urlRole !== authRole) {
      navigate({ ...cmsDashboard(authRole), replace: true });
    }
  }, [authRole, urlRole, navigate]);

  // Check if current route is accessible
  const currentSection = pathToSection(location.pathname);
  const hasCurrentAccess = currentSection ? hasAccess(currentSection) : true;

  // Redirect invalid roles
  if (!isValidRole || !urlRole) {
    return <Navigate to="/login" replace />;
  }

  if (!hasCurrentAccess) {
    return (
      <div className="min-h-screen flex bg-secondary">
        <aside className="w-60 bg-background border-r border-border flex flex-col flex-shrink-0 hidden lg:flex">
          <div className="px-5 py-6 border-b border-border">
            <h1 className="font-heading text-lg font-semibold">MAISON</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] font-body letter-wide uppercase text-muted-foreground">{user?.name || 'Staff'}</p>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${roleBadgeStyles[role]}`}>
                {roleLabels[role]}
              </span>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {sectionLinks
              .filter(link => hasAccess(link.section))
              .map(link => (
                  <Link
                    key={link.path}
                    {...cmsTo(link.path as CmsSection, urlRole)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth"
                  >
                    <link.icon size={16} />
                    {link.label}
                  </Link>
                ))}
          </nav>
          <div className="px-3 py-4 border-t border-border">
            <a href={STOREFRONT_URL} className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground transition-smooth hover-gold">
              <ArrowLeft size={14} /> Back to Store
            </a>
          </div>
        </aside>
        <main className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5"
            >
              <ShieldAlert size={28} className="text-destructive" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-2xl font-heading font-bold mb-2"
            >
              Access Denied
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-muted-foreground text-sm mb-6"
            >
              The <span className="font-semibold text-foreground">{roleLabels[role]}</span> role does not have permission to access this section.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Button variant="outline" onClick={() => navigate(cmsDashboard(urlRole))} className="gap-2">
                <ArrowLeft size={14} />
                Back to Dashboard
              </Button>
            </motion.div>
          </motion.div>
        </main>
      </div>
    );
  }

  // Build sidebar links with current role prefix
  const sidebarLinks = sectionLinks
    .filter(link => hasAccess(link.section))
    .map(link => ({ ...link, section: link.path as CmsSection }));

  const isActive = (section: CmsSection) => {
    const path = `/${urlRole}/${section}`;
    return section === 'dashboard'
      ? location.pathname === path || location.pathname === `/${urlRole}`
      : location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-secondary">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-background border-r border-border flex flex-col flex-shrink-0 hidden lg:flex sticky top-0 h-screen overflow-y-auto transition-all duration-300`}>
        <div className={`${collapsed ? 'px-2' : 'px-5'} py-4 border-b border-border`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {collapsed ? (
              <button
                onClick={() => setCollapsed(false)}
                title="Expand sidebar"
                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth"
              >
                <PanelLeft size={18} />
              </button>
            ) : (
              <>
                <div>
                  <h1 className="font-heading text-lg font-semibold">MAISON</h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] font-body letter-wide uppercase text-muted-foreground">{user?.name || 'Staff'}</p>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${roleBadgeStyles[role]}`}>
                      {roleLabels[role]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setCollapsed(true)}
                  title="Collapse sidebar"
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth"
                >
                  <PanelLeftClose size={16} />
                </button>
              </>
            )}
          </div>
          {!collapsed && (
            <div className="mt-3 flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex-1 flex items-center justify-between px-3 py-2 text-xs font-medium border border-border rounded hover:border-foreground transition-smooth">
                  <span>{user?.email || 'Staff'}</span>
                  <ChevronDown size={12} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem disabled className="text-[10px] text-muted-foreground">
                    Signed in as {roleLabels[role]}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut size={14} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        <nav className={`flex-1 ${collapsed ? 'px-1.5' : 'px-3'} py-4 space-y-1`}>
          {sidebarLinks.map(link => {
            const active = isActive(link.section);
            return (
              <Link
                key={link.section}
                {...cmsTo(link.section, urlRole)}
                title={collapsed ? link.label : undefined}
                className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded text-sm font-medium transition-smooth ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <link.icon size={16} />
                {!collapsed && link.label}
              </Link>
            );
          })}
        </nav>
        <div className={`${collapsed ? 'px-1.5' : 'px-3'} py-4 border-t border-border space-y-1`}>
          {hasAccess('settings') && (() => {
            const active = isActive('settings');
            return (
              <Link
                {...cmsTo('settings', urlRole)}
                title={collapsed ? 'Settings' : undefined}
                className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded text-sm font-medium transition-smooth ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Settings size={16} />
                {!collapsed && 'Settings'}
              </Link>
            );
          })()}
          <a
            href={STOREFRONT_URL}
            title={collapsed ? 'Back to Store' : undefined}
            className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'} px-3 py-2 text-xs text-muted-foreground transition-smooth hover-gold`}
          >
            <ArrowLeft size={14} />
            {!collapsed && 'Back to Store'}
          </a>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="font-heading text-base font-semibold">MAISON</h1>
            <p className="text-[9px] letter-wide uppercase text-muted-foreground">Store Manager</p>
          </div>
          <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded ${roleBadgeStyles[role]}`}>
            {roleLabels[role]}
          </span>
        </div>
        <a href={STOREFRONT_URL} className="text-xs text-muted-foreground flex items-center gap-1">
          <ArrowLeft size={12} /> Store
        </a>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border flex overflow-x-auto">
        {sidebarLinks.slice(0, 5).map(link => {
          const active = isActive(link.section);
          return (
            <Link
              key={link.section}
              {...cmsTo(link.section, urlRole)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-smooth ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto pt-14 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
