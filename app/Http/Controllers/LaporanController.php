<?php

namespace App\Http\Controllers;

use App\Models\Laporan;
use Illuminate\Http\Request;

class LaporanController extends Controller
{
    /**
     * Menyimpan data laporan baru dari petani (User)
     */
    public function store(Request $request)
    {
        $request->validate([
            'blok'    => 'required|string',
            'jenis'   => 'required|string',
            'tanggal' => 'required|date',
        ]);

        $jenis = strtolower($request->jenis ?? '');
        $isPanen = str_contains($jenis, 'panen');

        // Tangkap nilai pendapatan (uang) jika jenis laporan adalah panen
        $totalPendapatan = $request->total_pendapatan 
            ?? $request->pendapatan 
            ?? $request->nominal 
            ?? 0;

        // Tangkap berat panen (KG)
        $jumlahPanenKg = $request->jumlah_panen_kg 
            ?? $request->hasil_panen 
            ?? $request->panen_kg 
            ?? 0;

        // Tangkap biaya operasional jika jenis laporan adalah aktivitas harian
        $biaya = $request->biaya 
            ?? $request->biaya_operasional 
            ?? ($isPanen ? 0 : ($request->nominal ?? 0));

        Laporan::create([
            'user_id'          => auth()->id(),
            'blok'             => $request->blok,
            'jenis'            => $request->jenis,
            'tanggal'          => $request->tanggal,
            'catatan'          => $request->catatan,
            'biaya'            => $biaya,
            'total_pendapatan' => $isPanen ? $totalPendapatan : 0,
            'jumlah_panen_kg'  => $isPanen ? $jumlahPanenKg : 0,
            'status'           => 'Menunggu Validasi',
        ]);

        return redirect()->back();
    }

    /**
     * Memperbarui status laporan (Tervalidasi / Ditolak) oleh Admin
     */
    public function updateStatus(Request $request, Laporan $laporan)
    {
        $request->validate([
            'status' => 'required|in:Tervalidasi,Ditolak,Menunggu Validasi',
        ]);

        $laporan->update([
            'status' => $request->status,
        ]);

        return back()->with('success', 'Status laporan berhasil diperbarui.');
    }

    /**
     * Menghapus laporan berdasarkan ID
     */
    public function destroy($id)
    {
        $laporan = Laporan::findOrFail($id);
        $laporan->delete();

        return back()->with('success', 'Laporan berhasil dihapus.');
    }
}