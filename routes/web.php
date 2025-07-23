<?php

use App\Http\Controllers\DevocionalController;
use App\Http\Controllers\ImageUploadController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('devocionalesAgregar', function () {
        return Inertia::render('DevocionalesAgregar');
    })->name('DevocionalesAgregar');
});

Route::get('/devocionals', [DevocionalController::class, 'latest']);
Route::post('/devocionalesadd', [DevocionalController::class, 'store'])->middleware(['auth', 'verified']);
Route::post('/upload-image', [ImageUploadController::class, 'store']);
Route::get('/devocional/{id}', [DevocionalController::class, 'show']);

Route::inertia('/BlogDetails', 'BlogDetails');


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
