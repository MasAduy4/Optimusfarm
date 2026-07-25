import { Link, usePage, router } from '@inertiajs/react';
import {
  LayoutDashboard,
  MapPin,
  Users,
  ClipboardList,
  Sprout,
  LogOut,
  Leaf,
  ShieldCheck,
} from 'lucide-react';

export default function AppLayout({ children, title = 'OptimusFarm' }) {
  const { auth } = usePage().props;
  const user = auth?.user;
  const role = user?.role ?? 'user';
  const url = usePage().url;

  // Navigasi untuk Admin
  const adminNav = [
    { label: 'Dashboard',     href: '/dashboard-universal', icon: LayoutDashboard },
    { label: 'Console Admin', href: '/admin/dashboard',    icon: ShieldCheck },
    { label: 'Kelola Lahan',  href: '/admin/lahan',        icon: MapPin },
    { label: 'Kelompok Tani', href: '/admin/poktan',       icon: Users },
    { label: 'Laporan',       href: '/admin/laporan',      icon: ClipboardList },
  ];

  // Navigasi untuk Petani / User
  const userNav = [
    { label: 'Dashboard',  href: '/dashboard-universal', icon: LayoutDashboard },
    { label: 'Lahan', href: '/user/dashboard',      icon: Sprout },
  ];

  const nav = role === 'admin' ? adminNav : userNav;

  const logout = (e) => {
    e.preventDefault();
    router.post('/logout');
  };

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-emerald-950 font-['Manrope',sans-serif]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-emerald-950/95 backdrop-blur text-emerald-50 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/90 text-emerald-950 grid place-items-center shadow-lg shadow-amber-500/20">
              <Leaf className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-['Sora',sans-serif] font-bold tracking-tight text-lg leading-none">
                Optimus<span className="text-amber-300">Farm</span>
              </div>
              <div className="text-xs text-emerald-300/80 mt-0.5 font-['Manrope',sans-serif]">
                {url === '/dashboard-universal'
                  ? 'Dashboard Utama'
                  : (role === 'admin' ? 'Admin Console' : 'Petani Dashboard')}
              </div>
            </div>
          </Link>

          {/* Menu Navigasi */}
          <nav className="hidden md:flex items-center gap-1 font-['Manrope',sans-serif]">
            {nav.map((item) => {
              const Icon = item.icon;
              const isActive = url === item.href;

              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors inline-flex items-center gap-2 ${
                    isActive
                      ? 'bg-emerald-900 text-amber-300 shadow-inner font-bold'
                      : 'text-emerald-100/90 hover:bg-emerald-900/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3 font-['Manrope',sans-serif]">
            {user && (
              <div className="hidden sm:block text-right">
                <div className="text-sm font-semibold text-white leading-tight">{user.name}</div>
                <div className="text-xs text-emerald-300/80">{user.email}</div>
              </div>
            )}
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 text-sm font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 font-['Manrope',sans-serif]">
        {title && (
          <h1 className="sr-only">{title}</h1>
        )}
        {children}
      </main>
    </div>
  );
}