<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Akun Admin (Pengurus)
        User::updateOrCreate(
            ['email' => 'admin@optimusfarm.com'], 
            [
                'name' => 'Admin Optimus',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        // 2. Akun Petani (User/Anggota)
        User::updateOrCreate(
            ['email' => 'petani@optimusfarm.com'],
            [
                'name' => 'Petani Pak Ujang',
                'password' => Hash::make('password'),
                'role' => 'petani', 
            ]
        );
    }
}