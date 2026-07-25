<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\LahanController;
use App\Http\Controllers\LaporanController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes — OptimusFarm
|--------------------------------------------------------------------------
*/

// Home → redirect sesuai status login
Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {

    // Dashboard umum (dispatch ke admin.dashboard / user.dashboard)
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // Route untuk Dashboard Universal (diakses lewat tombol Navbar "Dashboard")
    Route::get('/dashboard-universal', [DashboardController::class, 'universal'])
        ->name('dashboard.universal');

    /* ---------- API / AKSI LAPORAN (Tanpa Sekat Middleware Role) ---------- */
    // Ditaruh di luar middleware role agar request PATCH/DELETE dari Inertia langsung masuk tanpa tertahan redirect
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::patch('/laporan/{id}/status', [DashboardController::class, 'updateStatus'])->name('laporan.status');
        Route::delete('/laporan/{id}',        [DashboardController::class, 'destroy'])->name('laporan.destroy');
    });

    /* ---------- ADMIN PAGES ---------- */
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/',            [DashboardController::class, 'admin'])->name('index');
        Route::get('/dashboard',   [DashboardController::class, 'admin'])->name('dashboard');

        // Kelola Lahan
        Route::get('/lahan',         [LahanController::class, 'index'])->name('lahan.index');
        Route::post('/lahan',        [LahanController::class, 'store'])->name('lahan.store');
        Route::put('/lahan/{id}',    [LahanController::class, 'update'])->name('lahan.update');
        Route::delete('/lahan/{id}', [LahanController::class, 'destroy'])->name('lahan.destroy');

        // Navigation links
        Route::get('/poktan',      fn () => Inertia::render('Admin/Poktan'))->name('poktan.index');
        Route::get('/laporan',     fn () => Inertia::render('Admin/Laporan'))->name('laporan.index');
    });

    /* ---------- USER / PETANI ---------- */
    Route::middleware('role:user')->prefix('user')->name('user.')->group(function () {
        Route::get('/',           [DashboardController::class, 'user'])->name('index');
        Route::get('/dashboard',  [DashboardController::class, 'user'])->name('dashboard');
        
        // Simpan Laporan Harian Petani
        Route::post('/laporan',   [LaporanController::class, 'store'])->name('laporan.store');
    });

    // Logout
    Route::post('/logout', function () {
        auth()->logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return redirect()->route('login');
    })->name('logout');
});

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/
require __DIR__.'/auth.php';