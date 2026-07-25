import { Head, Link, useForm } from '@inertiajs/react';
import { Leaf, User, Mail, Lock, UserPlus, LogIn } from 'lucide-react';

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post('/register', {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  const bgImageUrl = 'https://img.magnific.com/foto-gratis/pemetik-teh-bekerja-di-kerela-india_53876-42847.jpg?semt=ais_hybrid&w=740&q=80';

  return (
    <>
      <Head title="Daftar Akun — OptimusFarm" />
      <div className="min-h-screen grid lg:grid-cols-2 bg-[#f8f7f2] text-emerald-950">
        
        {/* Panel Kiri dengan Latar Belakang Gambar (Sama dengan Login) */}
        <div 
          className="hidden lg:flex flex-col justify-between p-12 text-emerald-50 relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url('${bgImageUrl}')` }}
        >
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-900/80 to-emerald-950/70" />

          {/* Glow Effect Decorative */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 grid place-items-center shadow-xl">
              <Leaf className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div className="font-[Sora,ui-sans-serif] font-bold text-2xl">
              Optimus<span className="text-amber-300">Farm</span>
            </div>
          </div>

          {/* Headline Text */}
          <div className="relative z-10">
            <h2 className="font-[Sora,ui-sans-serif] text-4xl font-bold leading-tight tracking-tight">
              Mulai perjalanan<br />pertanian digitalmu.
            </h2>
            <p className="mt-4 text-emerald-200/90 max-w-md">
              Daftarkan diri kamu untuk mengakses pemantauan lahan, pencatatan aktivitas, serta analisis hasil panen yang mudah.
            </p>
          </div>

          {/* Footer Text */}
          <p className="text-xs text-emerald-300/80 relative z-10">
            © {new Date().getFullYear()} OptimusFarm
          </p>
        </div>

        {/* Form Registrasi Kanan */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <form onSubmit={submit} className="w-full max-w-md">
            <div className="mb-6">
              <h1 className="font-[Sora,ui-sans-serif] text-3xl font-bold tracking-tight">Buat Akun Baru</h1>
              <p className="text-emerald-800/70 mt-2 text-sm">Lengkapi data di bawah untuk bergabung di OptimusFarm.</p>
            </div>

            {/* Input Nama Lengkap */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Nama Lengkap</span>
              <div className="mt-1.5 relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/60" />
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-emerald-900/15 bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 outline-none transition"
                  placeholder="Nama lengkap kamu"
                  required
                />
              </div>
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </label>

            {/* Input Email */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Email</span>
              <div className="mt-1.5 relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/60" />
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-emerald-900/15 bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 outline-none transition"
                  placeholder="Masukkan email anda"
                  required
                />
              </div>
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </label>

            {/* Input Password */}
            <label className="block mb-4">
              <span className="text-sm font-medium">Password</span>
              <div className="mt-1.5 relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/60" />
                <input
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-emerald-900/15 bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </label>

            {/* Input Konfirmasi Password */}
            <label className="block mb-6">
              <span className="text-sm font-medium">Konfirmasi Password</span>
              <div className="mt-1.5 relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/60" />
                <input
                  type="password"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-emerald-900/15 bg-white focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
              {errors.password_confirmation && <p className="text-xs text-red-600 mt-1">{errors.password_confirmation}</p>}
            </label>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={processing}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold shadow-lg shadow-emerald-900/20 transition disabled:opacity-60"
            >
              <UserPlus className="w-4 h-4" />
              {processing ? 'Mendaftarkan…' : 'Daftar Sekarang'}
            </button>

            {/* Link Kembali ke Login */}
            <div className="mt-6 text-center text-sm text-emerald-900/70">
              Sudah punya akun?{' '}
              <Link 
                href="/login" 
                className="font-semibold text-emerald-800 hover:underline inline-flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                Masuk di sini
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}