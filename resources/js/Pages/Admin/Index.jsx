import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import {
  MapPin,
  Users,
  Sprout,
  Wallet,
  ChevronRight,
  BadgeCheck,
  Clock,
  Check,
  X,
  XCircle,
  AlertTriangle,
  Trash2,
  FileText,
  Download,
  Printer,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';

const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

// Helper untuk format angka panen agar pecahan desimal tetap tampil
const formatPanen = (n) => {
  const num = Number(n || 0);
  return num.toLocaleString('id-ID', { maximumFractionDigits: 2 });
};

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

  // State untuk Filter & Pencarian Laporan
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');

  // Logic Penyaringan Data Laporan (Realtime)
  const filteredLaporan = laporanTerbaru.filter((r) => {
    const query = search.toLowerCase();
    const matchSearch =
      (r.petani || '').toLowerCase().includes(query) ||
      (r.blok || '').toLowerCase().includes(query) ||
      (r.jenis || '').toLowerCase().includes(query) ||
      (r.catatan || '').toLowerCase().includes(query);

    const matchStatus =
      filterStatus === 'semua' || r.status === filterStatus;

    return matchSearch && matchStatus;
  });

  const confirmValidation = (e, item, actionStatus) => {
    if (e) e.preventDefault();
    setModal({ show: true, item, actionStatus });
  };

  // Trigger download / cetak PDF via Native Print
  const handleDownloadPDF = () => {
    window.print();
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
      router.delete(`/admin/laporan/${id}`, {
        preserveScroll: true,
        onError: (err) => console.error("Error delete:", err)
      });
    }
  };

  return (
    <AppLayout title="Dashboard Admin">
      <Head title="Dashboard Admin — OptimusFarm" />

      {/* Style CSS khusus Cetak/PDF */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Sembunyikan tombol, aksi, filter, modal, dan elemen non-cetak */
          .print\\:hidden, button, .no-print {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .shadow-sm, .shadow-lg, .shadow-2xl {
            box-shadow: none !important;
          }
          .border {
            border-color: #e2e8f0 !important;
          }
        }
      `}</style>

      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-[Sora,ui-sans-serif] text-3xl font-bold tracking-tight">Ringkasan Operasional</h2>
        </div>
        {stats.menungguValidasi > 0 && (
          <Link
            href="/admin/laporan"
            className="print:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-emerald-950 font-semibold text-sm shadow-lg shadow-amber-500/20 transition"
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
        <StatCard icon={Sprout} label="Total Panen"    value={`${formatPanen(stats.totalPanen)} kg`} tone="slate" />
        <StatCard icon={Wallet} label="Finansial"      value={rupiah(stats.finansial)}              tone="amber" />
      </div>

      {/* Section Manajemen Baru: Tombol Unduh Laporan PDF */}
      <div className="mt-10 print:hidden">
        <h3 className="font-[Sora,ui-sans-serif] text-xl font-bold tracking-tight mb-4">Manajemen & Ekspor</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div
            onClick={handleDownloadPDF}
            className="group relative cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 p-6 text-white shadow-md hover:shadow-xl hover:shadow-emerald-900/20 transition-all duration-300 border border-emerald-700/30 flex items-center justify-between"
          >
            {/* Hiasan background kilau */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all"></div>
            
            <div className="flex items-center gap-4 z-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-emerald-950 grid place-items-center shadow-lg shadow-amber-400/20 group-hover:scale-105 transition-transform duration-300">
                <Download className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 font-[Sora,ui-sans-serif] font-bold text-lg tracking-tight text-emerald-50">
                  Unduh Laporan
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div className="text-xs text-emerald-200/80 mt-1">
                  Cetak rekap operasional & ringkasan laporan ke file PDF.
                </div>
              </div>
            </div>

            <div className="z-10 p-2.5 rounded-xl bg-white/10 group-hover:bg-amber-400 group-hover:text-emerald-950 text-white transition-all duration-300">
              <Printer className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Laporan terbaru */}
      <div className="mt-10 rounded-3xl bg-white border border-emerald-900/10 overflow-hidden shadow-sm">
        {/* Header Tabel & Control Filter */}
        <div className="p-6 border-b border-emerald-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-[Sora,ui-sans-serif] font-bold text-lg text-emerald-950 tracking-tight">
              Laporan Terbaru
            </h3>
            <p className="text-xs text-emerald-900/60 mt-0.5">
              Manajemen data aktivitas & hasil panen petani.
            </p>
          </div>

          {/* Input Search & Dropdown Status */}
          <div className="print:hidden flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-900/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari petani, blok, atau catatan..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-emerald-900/15 bg-emerald-50/30 text-xs text-emerald-950 placeholder-emerald-900/40 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-3 pr-8 py-1.5 rounded-xl border border-emerald-900/15 bg-emerald-50/30 text-xs text-emerald-950 focus:bg-white focus:border-emerald-600 outline-none transition appearance-none cursor-pointer font-medium"
              >
                <option value="semua">Semua Status</option>
                <option value="Tervalidasi">Tervalidasi</option>
                <option value="Menunggu Validasi">Menunggu Validasi</option>
                <option value="Ditolak">Ditolak</option>
              </select>
              <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-900/40 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tabel Data Laporan */}
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
                <th className="text-right px-6 py-3 font-semibold print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {filteredLaporan.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-emerald-900/50">
                    Tidak ada laporan yang sesuai dengan pencarian.
                  </td>
                </tr>
              )}
              {filteredLaporan.map((r) => {
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
                    <td className="px-6 py-3.5 text-right print:hidden">
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
        <div className="print:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4">
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