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
     * Redirect dashboard berdasarkan role user
     */
    public function index(Request $request)
    {
        $user = $request->user();

        return $user->role === 'admin'
            ? redirect()->route('admin.dashboard')
            : redirect()->route('user.dashboard');
    }

    /**
     * Dashboard Universal (Tampilan gabungan laporan panen & aktivitas)
     */
    public function universal(Request $request)
    {
        $user = $request->user();

        $totalLahan = class_exists(Lahan::class) ? Lahan::count() : 0;
        if ($totalLahan === 0 && class_exists(Laporan::class)) {
            $totalLahan = Laporan::whereNotNull('blok')->where('blok', '!=', '-')->distinct('blok')->count('blok');
        }

        $allLaporan = class_exists(Laporan::class) ? Laporan::with('user')->latest()->get() : collect([]);

        // Filter Laporan Hasil Panen (Gunakan str_contains tanpa peduli huruf besar/kecil)
        $laporanPanen = $allLaporan->filter(function ($item) {
            $jenis = strtolower(trim($item->jenis ?? ''));
            return str_contains($jenis, 'panen');
        });

        // Filter Laporan Aktivitas Harian
        $laporanAktivitas = $allLaporan->filter(function ($item) {
            $jenis = strtolower(trim($item->jenis ?? ''));
            return !str_contains($jenis, 'panen');
        });

        // Hitung total panen (KG)
        $totalPanenKg = $allLaporan->where('status', 'Tervalidasi')->sum(function ($item) {
            return floatval($item->jumlah_panen_kg ?? $item->hasil_panen ?? 0);
        });

        // Hitung total pendapatan panen (Rp)
        $totalPendapatan = $laporanPanen->where('status', 'Tervalidasi')->sum(function ($item) {
            return floatval($item->total_pendapatan ?? $item->biaya ?? 0);
        });

        // Hitung total biaya operasional (Rp)
        $totalBiaya = $laporanAktivitas->where('status', 'Tervalidasi')->sum(function ($item) {
            return floatval($item->biaya ?? 0);
        });

        $stats = [
            'totalLahan'       => $totalLahan,
            'totalPetani'      => User::where('role', 'user')->count(),
            'totalPanen'       => $totalPanenKg,
            'finansial'        => $totalPendapatan - $totalBiaya,
            'totalPendapatan'  => $totalPendapatan,
            'totalBiaya'       => $totalBiaya,
        ];

        // Mapping Data Aktivitas Harian
        $dataAktivitas = $laporanAktivitas->take(10)->map(function ($item) {
            return [
                'id'        => $item->id,
                'petani'    => $item->user->name ?? 'Petani',
                'blok'      => $item->blok ?? '-',
                'jenis'     => $item->jenis ?? 'Aktivitas Harian',
                'biaya'     => floatval($item->biaya ?? 0),
                'catatan'   => $item->catatan ?? '-',
                'tanggal'   => $item->tanggal ?? ($item->created_at ? $item->created_at->format('Y-m-d') : '-'),
                'status'    => $item->status ?? 'Menunggu Validasi',
            ];
        })->values()->toArray();

        // Mapping Data Hasil Panen
        $dataPanen = $laporanPanen->take(10)->map(function ($item) {
            // Ambil nominal pendapatan secara fleksibel
            $pendapatan = floatval($item->total_pendapatan ?? 0);
            if ($pendapatan == 0) {
                $pendapatan = floatval($item->biaya ?? 0);
            }

            // Ambil berat panen secara fleksibel
            $beratKg = floatval($item->jumlah_panen_kg ?? $item->hasil_panen ?? 0);

            return [
                'id'               => $item->id,
                'petani'           => $item->user->name ?? 'Petani',
                'blok'             => $item->blok ?? '-',
                'komoditas'        => $item->komoditas ?? 'Padi',
                'jenis'            => $item->jenis ?? 'Hasil Panen',
                'hasil_panen'      => $beratKg,
                'jumlah_panen_kg'  => $beratKg,
                'total_pendapatan' => $pendapatan,
                'biaya'            => $pendapatan,
                'catatan'          => $item->catatan ?? '-',
                'tanggal'          => $item->tanggal ?? ($item->created_at ? $item->created_at->format('Y-m-d') : '-'),
                'status'           => $item->status ?? 'Menunggu Validasi',
            ];
        })->values()->toArray();

        return Inertia::render('DashboardUniversal', [
            'user'             => [
                'name' => $user->name,
                'role' => $user->role,
            ],
            'stats'            => $stats,
            'laporanAktivitas' => $dataAktivitas,
            'laporanPanen'     => $dataPanen,
            'laporanTerbaru'   => array_merge($dataAktivitas, $dataPanen),
        ]);
    }

    /**
     * Dashboard Khusus Admin
     */
    public function admin()
    {
        $totalLahan = class_exists(Lahan::class) ? Lahan::count() : 0;
        if ($totalLahan === 0 && class_exists(Laporan::class)) {
            $totalLahan = Laporan::whereNotNull('blok')->where('blok', '!=', '-')->distinct('blok')->count('blok');
        }

        $allLaporan = class_exists(Laporan::class) ? Laporan::with('user')->latest()->get() : collect([]);

        $laporanPanen = $allLaporan->filter(fn($item) => str_contains(strtolower($item->jenis ?? ''), 'panen'));
        $laporanAktivitas = $allLaporan->filter(fn($item) => !str_contains(strtolower($item->jenis ?? ''), 'panen'));

        $totalPanenKg = $allLaporan->where('status', 'Tervalidasi')->sum(function ($item) {
            return floatval($item->jumlah_panen_kg ?? $item->hasil_panen ?? 0);
        });

        $totalPendapatan = $laporanPanen->where('status', 'Tervalidasi')->sum(function ($item) {
            return floatval($item->total_pendapatan ?? $item->biaya ?? 0);
        });

        $totalBiaya = $laporanAktivitas->where('status', 'Tervalidasi')->sum(function ($item) {
            return floatval($item->biaya ?? 0);
        });

        $stats = [
            'totalLahan'       => $totalLahan,
            'totalPetani'      => User::where('role', 'user')->count(),
            'totalPanen'       => $totalPanenKg,
            'finansial'        => $totalPendapatan - $totalBiaya,
            'menungguValidasi' => $allLaporan->where('status', 'Menunggu Validasi')->count(),
        ];

        $laporanTerbaru = $allLaporan->take(15)->map(function ($item) {
            $isPanen = str_contains(strtolower($item->jenis ?? ''), 'panen');
            $pendapatan = floatval($item->total_pendapatan ?? 0);
            if ($pendapatan == 0 && $isPanen) {
                $pendapatan = floatval($item->biaya ?? 0);
            }
            $biaya = floatval($item->biaya ?? 0);

            return [
                'id'               => $item->id,
                'petani'           => $item->user->name ?? 'Petani',
                'blok'             => $item->blok ?? '-',
                'komoditas'        => $item->komoditas ?? 'Padi',
                'jenis'            => $item->jenis ?? '-',
                'catatan'          => $item->catatan ?? '-',
                'tanggal'          => $item->tanggal ?? ($item->created_at ? $item->created_at->format('Y-m-d') : '-'),
                'biaya'            => $biaya,
                'total_pendapatan' => $pendapatan,
                'nominal'          => $isPanen ? $pendapatan : $biaya,
                'hasil_panen'      => floatval($item->jumlah_panen_kg ?? $item->hasil_panen ?? 0),
                'status'           => $item->status ?? 'Menunggu Validasi',
            ];
        })->values()->toArray();

        return Inertia::render('Admin/Index', [
            'stats'          => $stats,
            'laporanTerbaru' => $laporanTerbaru,
        ]);
    }

    /**
     * Update Status Laporan dari Dashboard Admin
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

        return redirect()->route('admin.dashboard', [], 303);
    }

    /**
     * Hapus Laporan dari Dashboard Admin
     */
    public function destroy($id)
    {
        if (class_exists(Laporan::class)) {
            $laporan = Laporan::findOrFail($id);
            $laporan->delete();
        }

        return redirect()->route('admin.dashboard', [], 303);
    }

    /**
     * Dashboard Khusus Petani (User)
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
                            'komoditas'        => $item->komoditas ?? 'Padi',
                            'tanggal'          => $item->tanggal ?? ($item->created_at ? $item->created_at->format('Y-m-d') : '-'),
                            'biaya'            => floatval($item->biaya ?? 0),
                            'total_pendapatan' => floatval($item->total_pendapatan ?? $item->biaya ?? 0),
                            'hasil_panen'      => floatval($item->jumlah_panen_kg ?? $item->hasil_panen ?? 0),
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