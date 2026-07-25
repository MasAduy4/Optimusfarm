<?php

namespace App\Http\Controllers;

use App\Models\Laporan;
use Illuminate\Http\Request;

class LaporanController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'jenis'            => 'nullable|string',
            'tanggal'          => 'required|date',
            'biaya'            => 'nullable|numeric',
            'total_pendapatan' => 'nullable|numeric',
            'catatan'          => 'required|string',
        ]);

        $user = $request->user();

        Laporan::create([
            'user_id'          => auth()->id(),
            'blok'             => $request->blok, 
            'jenis'            => $request->jenis,
            'tanggal'          => $request->tanggal,
            'catatan'          => $request->catatan,
            'biaya'            => $request->biaya ?? 0,
            'total_pendapatan' => $request->total_pendapatan ?? 0,
            'status'           => 'Menunggu Validasi',
        ]);

        return back()->with('success', 'Laporan berhasil dikirim!');
    }
    public function updateStatus(Request $request, Laporan $laporan)
{
    $request->validate([
        'status' => 'required|in:Tervalidasi,Ditolak',
    ]);

    $laporan->update([
        'status' => $request->status,
    ]);

    return back()->with('success', 'Status laporan berhasil diperbarui.');
}
}