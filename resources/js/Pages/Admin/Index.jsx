import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import {
  MapPin,
  Users,
  Sprout,
  Wallet,
  ClipboardList,
  ChevronRight,
  BadgeCheck,
  Clock,
  Check,
  X,
  XCircle,
  AlertTriangle,
  Trash2,
  FileText,
} from 'lucide-react';

const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

function StatCard({ icon: Icon, label, value, sub, tone = 'emerald' }) {
  const tones = {
    emerald: 'from-emerald-800 to-emerald-950 text-emerald-50',
    amber:   'from-amber-400 to-amber-500 text-emerald-950',
    cream:   'from-[#f5efdf] to-[#ece3c9] text-emerald-950',
    slate:   'from-slate-100 to-slate-200 text-emerald-950',
  };
  return (
    <div className={`rounded-3xl p-5 bg-gradient-to-br ${tones[tone]} shadow-sm border border-emerald-900/5`}>
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-black/10 grid place-items-center">
          <Icon className="w-5 h-5" />
        </div>
        {sub && <span className="text-xs opacity-80">{sub}</span>}
      </div>
      <div className="mt-4 text-3xl font-[Sora,ui-sans-serif] font-bold tracking-tight">{value}</div>
      <div className="text-sm opacity-80 mt-1">{label}</div>
    </div>
  );
}

function QuickLink({ href, icon: Icon, title, desc }) {
  return (
    <Link
      href={href}
      className="group rounded-3xl bg-white border border-emerald-900/10 p-6 hover:border-emerald-700/40 hover:shadow-lg hover:shadow-emerald-900/5 transition-all flex items-start gap-4"
    >
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 grid place-items-center group-hover:bg-emerald-800 group-hover:text-amber-300 transition-colors">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="font-[Sora,ui-sans-serif] font-semibold text-lg tracking-tight">{title}</div>
        <div className="text-sm text-emerald-900/60 mt-1">{desc}</div>
      </div>
      <ChevronRight className="w-5 h-5 text-emerald-900/30 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

function StatusPill({ status }) {
  const map = {
    'Tervalidasi':       'bg-emerald-100 text-emerald-800 border border-emerald-200',
    'Menunggu Validasi': 'bg-amber-100 text-amber-800 border border-amber-200',
    'Ditolak':           'bg-red-100 text-red-700 border border-red-200',
  };
  const Icon = status === 'Tervalidasi' ? BadgeCheck : status === 'Ditolak' ? XCircle : Clock;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${map[status] ?? 'bg-slate-100 text-slate-700'}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}

export default function AdminIndex({ stats = {}, laporanTerbaru = [] }) {
  // State Pop-Up Modal Validasi
  const [modal, setModal] = useState({ show: false, item: null, actionStatus: '' });

  const confirmValidation = (e, item, actionStatus) => {
    if (e) e.preventDefault();
    setModal({ show: true, item, actionStatus });
  };

  // 1. Eksekusi Validasi Laporan (PATCH)
  const executeUpdateStatus = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!modal.item || !modal.item.id) {
      alert("ID Laporan tidak valid!");
      return;
    }

    // Menembak endpoint khusus update status laporan
    router.patch(`/admin/laporan/${modal.item.id}/status`, { 
      status: modal.actionStatus 
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setModal({ show: false, item: null, actionStatus: '' });
      },
      onError: (err) => console.error("Error status:", err)
    });
  };

  // 2. Eksekusi Hapus Laporan (DELETE)
  const handleDelete = (e, id) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!id) {
      alert("ID Laporan tidak valid!");
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
      // Menembak endpoint khusus hapus laporan
      router.delete(`/admin/laporan/${id}`, {
        preserveScroll: true,
        onError: (err) => console.error("Error delete:", err)
      });
    }
  };

  return (
    <AppLayout title="Dashboard Admin">
      <Head title="Dashboard Admin — OptimusFarm" />

      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="text-sm text-emerald-800/70">Selamat datang kembali,</p>
          <h2 className="font-[Sora,ui-sans-serif] text-3xl font-bold tracking-tight">Ringkasan Operasional</h2>
        </div>
        {stats.menungguValidasi > 0 && (
          <Link
            href="/admin/laporan"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-emerald-950 font-semibold text-sm shadow-lg shadow-amber-500/20 transition"
          >
            <Clock className="w-4 h-4" />
            {stats.menungguValidasi} laporan menunggu validasi
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MapPin} label="Total Lahan"    value={stats.totalLahan ?? 0}                tone="emerald" />
        <StatCard icon={Users}  label="Total Petani"   value={stats.totalPetani ?? 0}               tone="cream" />
        <StatCard icon={Sprout} label="Total Panen"    value={`${(stats.totalPanen ?? 0).toLocaleString('id-ID')} kg`} tone="slate" />
        <StatCard icon={Wallet} label="Finansial"      value={rupiah(stats.finansial)}              tone="amber" />
      </div>

      {/* Quick nav */}
      <div className="mt-10">
        <h3 className="font-[Sora,ui-sans-serif] text-xl font-bold tracking-tight mb-4">Manajemen</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <QuickLink href="/admin/lahan"   icon={MapPin}         title="Kelola Lahan"       desc="Tambah, edit, dan validasi profil lahan pertanian." />
          <QuickLink href="/admin/poktan"  icon={Users}          title="Kelompok Tani"      desc="Data poktan, anggota, dan penanggung jawab lapangan." />
          <QuickLink href="/admin/laporan" icon={ClipboardList}  title="Laporan & Validasi" desc="Tinjau aktivitas harian & hasil panen dari petani." />
        </div>
      </div>

      {/* Laporan terbaru */}
      <div className="mt-10 rounded-3xl bg-white border border-emerald-900/10 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/10">
          <h3 className="font-[Sora,ui-sans-serif] text-lg font-bold tracking-tight">Laporan Terbaru</h3>
          <Link href="/admin/laporan" className="text-sm font-semibold text-emerald-800 hover:text-emerald-900 inline-flex items-center gap-1">
            Lihat semua <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-emerald-50/60 text-emerald-900/70 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3 font-semibold">Petani</th>
                <th className="text-left px-6 py-3 font-semibold">Blok</th>
                <th className="text-left px-6 py-3 font-semibold">Jenis</th>
                <th className="text-left px-6 py-3 font-semibold">Nominal</th>
                <th className="text-left px-6 py-3 font-semibold">Catatan Aktivitas</th>
                <th className="text-left px-6 py-3 font-semibold">Tanggal</th>
                <th className="text-left px-6 py-3 font-semibold">Status</th>
                <th className="text-right px-6 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {laporanTerbaru.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-emerald-900/50">Belum ada laporan.</td></tr>
              )}
              {laporanTerbaru.map((r) => {
                const nominal = Number(r.biaya || r.total_pendapatan || 0);
                return (
                  <tr key={r.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-emerald-950">{r.petani}</td>
                    <td className="px-6 py-3.5">
                      <span className="font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs">{r.blok ?? '-'}</span>
                    </td>
                    <td className="px-6 py-3.5">{r.jenis}</td>
                    <td className="px-6 py-3.5 font-semibold text-emerald-900">{rupiah(nominal)}</td>
                    <td className="px-6 py-3.5 max-w-xs">
                      <div className="flex items-start gap-1.5 text-xs text-emerald-950 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{r.catatan ?? '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-emerald-900/70">{r.tanggal}</td>
                    <td className="px-6 py-3.5"><StatusPill status={r.status} /></td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {r.status === 'Menunggu Validasi' ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => confirmValidation(e, r, 'Tervalidasi')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-sm cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Terima
                            </button>
                            <button
                              type="button"
                              onClick={(e) => confirmValidation(e, r, 'Ditolak')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition shadow-sm cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" /> Tolak
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-emerald-900/40 italic mr-1">Selesai</span>
                        )}

                        {/* Tombol Hapus Laporan */}
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, r.id)}
                          title="Hapus Laporan"
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* POP-UP MODAL KONFIRMASI */}
      {modal.show && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${modal.actionStatus === 'Tervalidasi' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {modal.actionStatus === 'Tervalidasi' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <h4 className="font-bold text-lg text-slate-800">
                  {modal.actionStatus === 'Tervalidasi' ? 'Konfirmasi Penerimaan' : 'Konfirmasi Penolakan'}
                </h4>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setModal({ show: false, item: null, actionStatus: '' });
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 text-sm text-slate-600">
              Apakah Anda yakin ingin <strong className={modal.actionStatus === 'Tervalidasi' ? 'text-emerald-700' : 'text-red-600'}>
                {modal.actionStatus === 'Tervalidasi' ? 'menerima (validasi)' : 'menolak'}
              </strong> laporan dari <strong>{modal.item?.petani}</strong> untuk lokasi/blok <strong>{modal.item?.blok}</strong>?
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setModal({ show: false, item: null, actionStatus: '' });
                }}
                className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={(e) => executeUpdateStatus(e)}
                className={`px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition cursor-pointer ${
                  modal.actionStatus === 'Tervalidasi' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Ya, Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}