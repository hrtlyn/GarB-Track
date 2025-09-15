<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome'); // Guest dashboard
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin/dashboard', function () {
        return view('admin.dashboard');
    });
});

Route::middleware(['auth', 'role:collector'])->group(function () {
    Route::get('/collector/dashboard', function () {
        return view('collector.dashboard');
    });
});
