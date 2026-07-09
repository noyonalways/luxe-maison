import { Link, useLocation, useNavigate, Outlet } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  ArrowLeft,
  Mail,
  Percent,
  Megaphone,
  Users,
  MessageSquare,
  ChevronDown,
  Shield,
  ShieldAlert,
  Settings,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  Loader2,
  Home,
  FileText,
  Cookie,
  BookOpen,
  Gem,
  Leaf,
  Briefcase,
  Ruler,
  Truck,
  Shirt,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRole, pathToSection, type Section } from '@/contexts/role-context';
import { useAuth, isStaffRole } from '@/contexts/auth-context';
import { useLogout } from '@/hooks/auth/use-logout';
import { cmsDashboard, cmsNavPath, cmsTo, resolveRoleSlug } from '@/lib/cms-navigation';
import { useStaffUrlRole } from '@/lib/use-staff-url-role';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3000';

type NavItem = {
  path: string;
  icon: LucideIcon;
  label: string;
  section: Section;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const mainNavItems: NavItem[] = [
  { path: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'dashboard' },
  { path: 'products', icon: Package, label: 'Products', section: 'products' },
  { path: 'orders', icon: ShoppingCart, label: 'Orders', section: 'orders' },
  { path: 'customers', icon: Users, label: 'Customers', section: 'customers' },
  { path: 'analytics', icon: BarChart3, label: 'Analytics', section: 'analytics' },
  { path: 'newsletter', icon: Mail, label: 'Newsletter', section: 'newsletter' },
  { path: 'discounts', icon: Percent, label: 'Discounts', section: 'discounts' },
  { path: 'campaigns', icon: Megaphone, label: 'Campaigns', section: 'campaigns' },
  { path: 'popup', icon: MessageSquare, label: 'Welcome Popup', section: 'popup' },
];

const pagesNavGroup: NavGroup = {
  label: 'Pages',
  items: [
    { path: 'homepage', icon: Home, label: 'Homepage', section: 'homepage' },
    { path: 'pages/privacy', icon: Shield, label: 'Privacy', section: 'pages' },
    { path: 'pages/terms', icon: FileText, label: 'Terms', section: 'pages' },
    { path: 'pages/cookies', icon: Cookie, label: 'Cookies', section: 'pages' },
    { path: 'pages/our-story', icon: BookOpen, label: 'Our Story', section: 'pages' },
    { path: 'pages/craftsmanship', icon: Gem, label: 'Craftsmanship', section: 'pages' },
    { path: 'pages/sustainability', icon: Leaf, label: 'Sustainability', section: 'pages' },
    { path: 'pages/careers', icon: Briefcase, label: 'Careers', section: 'pages' },
    { path: 'pages/sizing-guide', icon: Ruler, label: 'Sizing Guide', section: 'pages' },
    { path: 'pages/shipping-returns', icon: Truck, label: 'Shipping & Returns', section: 'pages' },
    { path: 'pages/care-instructions', icon: Shirt, label: 'Care Instructions', section: 'pages' },
    { path: 'pages/contact', icon: Mail, label: 'Contact', section: 'pages' },
  ],
};

const bottomNavItems: NavItem[] = [
  { path: 'team', icon: Users, label: 'Team', section: 'team' },
  { path: 'access-control', icon: Shield, label: 'Access Control', section: 'access-control' },
];

function roleBadgeClass(roleId: string) {
  if (roleId === 'admin') return 'bg-primary text-primary-foreground';
  if (roleId === 'manager') return 'bg-amber-100 text-amber-800';
  if (roleId === 'employee') return 'bg-secondary text-muted-foreground';
  return 'bg-violet-100 text-violet-800';
}

function navItemActive(pathname: string, roleSlug: string, path: string) {
  const fullPath = `/${roleSlug}/${path}`;
  if (path === 'dashboard') {
    return pathname === fullPath || pathname === `/${roleSlug}`;
  }
  return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
}

function NavLink({
  item,
  roleSlug,
  pathname,
  collapsed,
}: {
  item: NavItem;
  roleSlug: string;
  pathname: string;
  collapsed: boolean;
}) {
  const active = navItemActive(pathname, roleSlug, item.path);
  const linkProps = item.path.includes('/')
    ? cmsNavPath(roleSlug, item.path)
    : cmsTo(item.section, roleSlug);

  return (
    <Link
      {...linkProps}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center rounded text-sm font-medium transition-smooth',
        collapsed ? 'justify-center px-3 py-2.5' : 'gap-3 px-3 py-2.5',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
      )}
    >
      <item.icon size={16} />
      {!collapsed && item.label}
    </Link>
  );
}

export default function StaffLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlRole = useStaffUrlRole();
  const { roleSlug, role, roles: cmsRoles, hasAccess } = useRole();
  const { user, isRestoringSession } = useAuth();
  const { logout } = useLogout();
  const [collapsed, setCollapsed] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(true);

  const authRole = user && isStaffRole(user.role) ? user.role : null;
  const expectedSlug = user ? resolveRoleSlug(user) : null;
  const roleDisplayName = useMemo(() => {
    if (role === 'admin') return 'Admin';
    return cmsRoles.find((r) => r.id === role)?.name ?? role;
  }, [role, cmsRoles]);

  const visibleMainItems = useMemo(
    () => mainNavItems.filter((item) => hasAccess(item.section)),
    [hasAccess],
  );
  const visiblePageItems = useMemo(
    () => pagesNavGroup.items.filter((item) => hasAccess(item.section)),
    [hasAccess],
  );
  const visibleBottomItems = useMemo(
    () => bottomNavItems.filter((item) => hasAccess(item.section)),
    [hasAccess],
  );
  const sidebarLinks = useMemo(
    () => [...visibleMainItems, ...visiblePageItems, ...visibleBottomItems],
    [visibleMainItems, visiblePageItems, visibleBottomItems],
  );

  const pagesGroupActive = visiblePageItems.some((item) =>
    navItemActive(location.pathname, urlRole ?? roleSlug, item.path),
  );

  if (isRestoringSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!authRole || !urlRole || urlRole !== expectedSlug) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const currentSection = pathToSection(location.pathname);
  const hasCurrentAccess = currentSection ? hasAccess(currentSection) : true;

  const renderNav = (navCollapsed: boolean) => (
    <>
      {visibleMainItems.map((item) => (
        <NavLink
          key={item.path}
          item={item}
          roleSlug={urlRole}
          pathname={location.pathname}
          collapsed={navCollapsed}
        />
      ))}

      {visiblePageItems.length > 0 && (
        navCollapsed ? (
          visiblePageItems.map((item) => (
            <NavLink
              key={item.path}
              item={item}
              roleSlug={urlRole}
              pathname={location.pathname}
              collapsed
            />
          ))
        ) : (
          <Collapsible open={pagesOpen || pagesGroupActive} onOpenChange={setPagesOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-semibold letter-wide uppercase text-muted-foreground hover:text-foreground transition-smooth">
              <span>{pagesNavGroup.label}</span>
              <ChevronDown
                size={14}
                className={cn('transition-transform', (pagesOpen || pagesGroupActive) && 'rotate-180')}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pl-2">
              {visiblePageItems.map((item) => (
                <NavLink
                  key={item.path}
                  item={item}
                  roleSlug={urlRole}
                  pathname={location.pathname}
                  collapsed={false}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )
      )}

      {visibleBottomItems.map((item) => (
        <NavLink
          key={item.path}
          item={item}
          roleSlug={urlRole}
          pathname={location.pathname}
          collapsed={navCollapsed}
        />
      ))}
    </>
  );

  if (!hasCurrentAccess) {
    return (
      <div className="min-h-screen flex bg-secondary">
        <aside className="w-60 bg-background border-r border-border flex flex-col flex-shrink-0 hidden lg:flex h-screen overflow-hidden">
          <div className="px-5 py-6 border-b border-border flex-shrink-0">
            <h1 className="font-heading text-lg font-semibold">MAISON</h1>
          </div>
          <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1">{renderNav(false)}</nav>
        </aside>
        <main className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
              <ShieldAlert size={28} className="text-destructive" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground text-sm mb-6">
              The <span className="font-semibold text-foreground">{roleDisplayName}</span> role does not have permission to access this section.
            </p>
            <Button variant="outline" onClick={() => navigate(cmsDashboard(urlRole))} className="gap-2">
              <ArrowLeft size={14} />
              Back to Dashboard
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-secondary">
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-background border-r border-border flex flex-col flex-shrink-0 hidden lg:flex sticky top-0 h-screen overflow-hidden transition-all duration-300`}>
        <div className={`${collapsed ? 'px-2' : 'px-5'} py-4 border-b border-border flex-shrink-0`}>
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
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${roleBadgeClass(role)}`}>
                      {roleDisplayName}
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
                    Signed in as {roleDisplayName}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut size={14} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        <nav className={`flex-1 min-h-0 overflow-y-auto ${collapsed ? 'px-1.5' : 'px-3'} py-4 space-y-1`}>
          {renderNav(collapsed)}
        </nav>
        <div className={`${collapsed ? 'px-1.5' : 'px-3'} py-4 border-t border-border space-y-1 flex-shrink-0`}>
          {hasAccess('settings') && (
            <NavLink
              item={{ path: 'settings', icon: Settings, label: 'Settings', section: 'settings' }}
              roleSlug={urlRole}
              pathname={location.pathname}
              collapsed={collapsed}
            />
          )}
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

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="font-heading text-base font-semibold">MAISON</h1>
            <p className="text-[9px] letter-wide uppercase text-muted-foreground">Store Manager</p>
          </div>
          <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded ${roleBadgeClass(role)}`}>
            {roleDisplayName}
          </span>
        </div>
        <a href={STOREFRONT_URL} className="text-xs text-muted-foreground flex items-center gap-1">
          <ArrowLeft size={12} /> Store
        </a>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border flex overflow-x-auto">
        {sidebarLinks.slice(0, 5).map((link) => {
          const active = navItemActive(location.pathname, urlRole, link.path);
          const linkProps = link.path.includes('/')
            ? cmsNavPath(urlRole, link.path)
            : cmsTo(link.section, urlRole);
          return (
            <Link
              key={link.path}
              {...linkProps}
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

      <main className="flex-1 overflow-auto pt-14 lg:pt-0 pb-20 lg:pb-0 min-w-0">
        <div className="w-full min-w-0 p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
