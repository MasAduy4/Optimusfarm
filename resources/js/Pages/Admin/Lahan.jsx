import { Head, Link, useForm, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  MapPin,
  BadgeCheck,
  Clock,
} from 'lucide-react';

function StatusPill({ status }) {
  const map = {
    'Tervalidasi':       'bg-emerald-100 text-emerald-800',
    'Menunggu Validasi': 'bg-amber-100 text-amber-800',
    'Ditolak':           'bg-red-100 text-red-700',
  };
  const Icon = status === 'Tervalidasi' ? BadgeCheck : Clock;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${map[status] ?? 'bg-slate-100 text-slate-700'}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}

export default function AdminLahan({ lahan = [], filter = {} }) {
  const [q, setQ] = useState(filter.q ?? '');
  const form = useForm({
    petani: '', kelompok: '', blok: '', luas: '', komoditas: '',
  });

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return lahan;
    return lahan.filter(
      (l) =>
        l.petani.toLowerCase().includes(t) ||
        l.kelompok.toLowerCase().includes(t) ||
        l.blok.toLowerCase().includes(t) ||
        l.komoditas.toLowerCase().includes(t),
    );
  }, [q, lahan]);

  const submit = (e) => {
    e.preventDefault();
    form.post('/admin/lahan', { onSuccess: () => form.reset() });
  };

  const hapus = (id) => {
    if (!confirm('Hapus lahan ini?')) return;
    router.delete(`/admin/lahan/${id}`);
  };

  return (
    <AppLayout title="Kelola Lahan">
      <Head title="Kelola Lahan — OptimusFarm" />

      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-emerald-800 hover:text-emerald-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>

      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-[Sora,ui-sans-serif] text-3xl font-bold tracking-tight">Kelola Lahan</h2>
          <p className="text-sm text-emerald-800/70 mt-1">Tambah lahan baru dan kelola profil pertanian.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.8fr] gap-6">
        {/* Form tambah */}
        <form onSubmit={submit} className="rounded-3xl p-6 bg-gradient-to-br from-emerald-900 to-emerald-950 text-emerald-50 shadow-lg shadow-emerald-900/20">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 grid place-items-center">
              <Plus className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <h3 className="font-[Sora,ui-sans-serif] font-bold text-lg tracking-tight">Tambah Lahan</h3>
          </div>

          {[
            { key: 'petani',    label: 'Nama Petani',    type: 'text' },
            { key: 'kelompok',  label: 'Kelompok Tani',  type: 'text' },
            { key: 'blok',      label: 'Blok Lahan',     type: 'text' },
            { key: 'luas',      label: 'Luas (ha)',      type: 'number', step: '0.1' },
            { key: 'komoditas', label: 'Komoditas',      type: 'text' },
          ].map((f) => (
            <label key={f.key} className="block mb-3">
              <span className="text-xs font-medium text-emerald-200/80">{f.label}</span>
              <input
                type={f.type}
                step={f.step}
                value={form.data[f.key]}
                onChange={(e) => form.setData(f.key, e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-700/40 text-emerald-50 placeholder-emerald-200/40 focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 outline-none transition"
                required
              />
              {form.errors[f.key] && <span className="text-xs text-red-300 mt-1 block">{form.errors[f.key]}</span>}
            </label>
          ))}

          <button
            type="submit"
            disabled={form.processing}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-emerald-950 font-semibold transition disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            {form.processing ? 'Menyimpan…' : 'Simpan Lahan'}
          </button>
        </form>

        {/* Tabel */}
        <div className="rounded-3xl bg-white border border-emerald-900/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-emerald-900/10 flex items-center justify-between gap-4 flex-wrap">
            <h3 className="font-[Sora,ui-sans-serif] font-bold text-lg tracking-tight">Daftar Lahan</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-800/50" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari petani, blok, komoditas…"
                className="pl-9 pr-3 py-2 rounded-xl border border-emerald-900/15 bg-white text-sm focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 outline-none transition w-64 max-w-full"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50/60 text-emerald-900/70 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold">Petani</th>
                  <th className="text-left px-6 py-3 font-semibold">Kelompok</th>
                  <th className="text-left px-6 py-3 font-semibold">Blok</th>
                  <th className="text-left px-6 py-3 font-semibold">Luas</th>
                  <th className="text-left px-6 py-3 font-semibold">Komoditas</th>
                  <th className="text-left px-6 py-3 font-semibold">Status</th>
                  <th className="text-right px-6 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/5">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-emerald-900/50">Belum ada lahan yang cocok.</td></tr>
                )}
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="px-6 py-3 font-medium">{l.petani}</td>
                    <td className="px-6 py-3">{l.kelompok}</td>
                    <td className="px-6 py-3 inline-flex items-center gap-1.5 text-emerald-900/80">
                      <MapPin className="w-3.5 h-3.5" /> {l.blok}
                    </td>
                    <td className="px-6 py-3">{l.luas} ha</td>
                    <td className="px-6 py-3">{l.komoditas}</td>
                    <td className="px-6 py-3"><StatusPill status={l.status} /></td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => hapus(l.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-red-700 hover:bg-red-50 text-xs font-medium transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
