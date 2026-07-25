import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

/**
 * Fallback dashboard — biasanya user akan di-redirect oleh DashboardController
 * ke Admin/Index atau User/Index. File ini dipertahankan sebagai safety net.
 */
export default function Dashboard() {
  return (
    <AppLayout title="Dashboard">
      <Head title="Dashboard — OptimusFarm" />
      <div className="rounded-3xl bg-white border border-emerald-900/10 p-10 text-center">
        <h2 className="font-[Sora,ui-sans-serif] text-2xl font-bold">Menyiapkan dashboard…</h2>
        <p className="text-emerald-800/70 mt-2 text-sm">Kamu akan diarahkan ke halaman sesuai role.</p>
      </div>
    </AppLayout>
  );
}
