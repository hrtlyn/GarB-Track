<?php  

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\RouteController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\CollectionLogController;

// Public routes
Route::get('/announcements', [AnnouncementController::class, 'index']);
Route::get('/schedules', [ScheduleController::class, 'index']);
Route::post('/reports', [ReportController::class, 'store']);

// Auth routes
Route::post('/login', [LoginController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [LoginController::class, 'logout']);

// Admin-only routes
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('announcements', AnnouncementController::class)->except(['index']);
    Route::apiResource('reports', ReportController::class)->except(['store']); 
    Route::apiResource('schedules', ScheduleController::class)->except(['index']);

    Route::post('/routes', [RouteController::class, 'store']);
    Route::get('/routes/history', [RouteController::class, 'history']);
    Route::delete('/routes/{id}', [RouteController::class, 'destroy']);
    Route::patch('/routes/{id}', [RouteController::class, 'update']);

    // Admin dashboard + logs
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'dashboardData']);
    Route::get('/admin/collection-logs', [CollectionLogController::class, 'adminIndex']); // <-- NEW
});

// Collector-only routes
Route::middleware(['auth:sanctum', 'role:collector'])->group(function () {
    Route::get('/routes', [RouteController::class, 'index']);
    Route::post('/collection-logs', [CollectionLogController::class, 'store']);
    Route::get('/collection-logs', [CollectionLogController::class, 'index']);
});
