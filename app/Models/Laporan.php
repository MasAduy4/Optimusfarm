<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Laporan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'lahan_id',
        'jenis',
        'tanggal',
        'biaya',
        'jumlah_panen_kg',
        'total_pendapatan',
        'catatan',
        'blok',
        'status',
    ];

    // Relasi Laporan milik satu User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi Laporan terhubung ke satu Lahan
    public function lahan()
    {
        return $this->belongsTo(Lahan::class);
    }
}