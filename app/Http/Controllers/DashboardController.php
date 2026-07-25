<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Lahan;
use App\Models\Laporan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * /dashboard — dispatch berdasarkan role
     */
    public function index(Request $request)
    {
        $user = $request->user();

        return $user->role === 'admin'
            ? redirect()->route('admin.dashboard')
            : redirect()->route('user.dashboard');
    }

    /**
     * /admin/dashboard
     */
    public function admin()
    {
        $stats = [
            'totalLahan'       => class_exists(Lahan::class) ? Lahan::count() : 0,
            'totalPetani'      => User::where('role', 'user')->count(),
            'totalPanen'       => class_exists(Laporan::class) ? (Laporan::sum('jumlah_panen_kg') ?? 0) : 0,
            'finansial'        => class_exists(Laporan::class) ? (Laporan::sum('total_pendapatan') ?? 0) : 0,
            'menungguValidasi' => class_exists(Laporan::class) ? Laporan::where('status', 'Menunggu Validasi')->count() : 0,
        ];

        $laporanTerbaru = class_exists(Laporan::class) 
            ? Laporan::with('user')
                ->latest()
                ->take(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'id'               => $item->id,
                        'petani'           => $item->user->name ?? 'Petani',
                        'blok'             => $item->blok ?? '-',
                        'jenis'            => $item->jenis ?? '-',
                        'catatan'          => $item->catatan ?? '-',
                        'tanggal'          => $item->tanggal ?? ($item->created_at ? $item->created_at->format('Y-m-d') : '-'),
                        'biaya'            => $item->biaya ?? 0,
                        'total_pendapatan' => $item->total_pendapatan ?? 0,
                        'status'           => $item->status ?? 'Menunggu Validasi',
                    ];
                })->toArray()
            : [];

        return Inertia::render('Admin/Index', [
            'stats'          => $stats,
            'laporanTerbaru' => $laporanTerbaru,
        ]);
    }

    /**
     * Update status validasi laporan (Terima / Tolak)
     */
    /**
     * Update status validasi laporan (Terima / Tolak)
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Tervalidasi,Ditolak,Menunggu Validasi',
        ]);

        if (class_exists(Laporan::class)) {
            $laporan = Laporan::findOrFail($id);
            $laporan->update([
                'status' => $request->status,
            ]);
        }

        // Redirect eksplisit ke route admin dashboard
        return redirect()->route('admin.dashboard', [], 303);
    }

    /**
     * Hapus laporan
     */
    public function destroy($id)
    {
        if (class_exists(Laporan::class)) {
            $laporan = Laporan::findOrFail($id);
            $laporan->delete();
        }

        // Redirect eksplisit ke route admin dashboard
        return redirect()->route('admin.dashboard', [], 303);
    }

    /**
     * /user/dashboard
     */
    public function user(Request $request)
    {
        $user = $request->user();

        $lahanSaya = [];
        if (class_exists(Lahan::class)) {
            try {
                $lahanSaya = Lahan::where('user_id', $user->id)->get()->map(function ($item) {
                    return [
                        'id'        => $item->id,
                        'blok'      => $item->blok,
                        'komoditas' => $item->komoditas,
                        'luas'      => $item->luas,
                        'status'    => $item->status,
                    ];
                })->toArray();
            } catch (\Exception $e) {
                $lahanSaya = [];
            }
        }

        $riwayat = [];
        if (class_exists(Laporan::class)) {
            try {
                $riwayat = Laporan::where('user_id', $user->id)
                    ->latest()
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id'               => $item->id,
                            'jenis'            => $item->jenis,
                            'blok'             => $item->blok ?? '-',
                            'tanggal'          => $item->tanggal ?? ($item->created_at ? $item->created_at->format('Y-m-d') : '-'),
                            'biaya'            => $item->biaya ?? 0,
                            'total_pendapatan' => $item->total_pendapatan ?? 0,
                            'catatan'          => $item->catatan,
                            'status'           => $item->status,
                        ];
                    })->toArray();
            } catch (\Exception $e) {
                $riwayat = [];
            }
        }

        return Inertia::render('User/Index', [
            'user' => [
                'name'  => $user->name, 
                'email' => $user->email,
            ],
            'lahanSaya' => $lahanSaya,
            'riwayat'   => $riwayat,
        ]);
    }
}