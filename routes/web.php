<?php

use App\Http\Controllers\DevocionalController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\TTSController;
use App\Http\Controllers\YouTubeController;
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

// -----Inicio-----

Route::get('/youtube/latest', [YouTubeController::class, 'latestVideos']);

// ----------

Route::get('/about', function () {
    return Inertia::render('About');
});

Route::get('/devocionales', function () {
    return Inertia::render('Devocionals');
});
Route::get('/devocionals-latest', [DevocionalController::class, 'latest']);
Route::post('/devocionalesadd', [DevocionalController::class, 'store'])->middleware(['auth', 'verified']);
Route::post('/upload-image', [ImageUploadController::class, 'store']);
Route::get('/devocionales-search', [DevocionalController::class, 'index']);
Route::get('/devocionales-searchCategories', [DevocionalController::class, 'searchCategories']);
Route::get('/devocionales/categoria/{categoria}', [DevocionalController::class, 'porCategoria']);
Route::get('/devocional/{id}', [DevocionalController::class, 'details']);

// Route::inertia('/BlogDetails', 'BlogDetails');

Route::get('/podcast', function () {
    return Inertia::render('Podcast');
});


Route::get('/libros', function () {
    return Inertia::render('Libros');
});
Route::get('/estudios', [DevocionalController::class, 'libros']);


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('postImage', function () {
        return Inertia::render('PostImage');
    })->name('PostImage');
});

Route::post('/upload-post-image', [ImageUploadController::class, 'post'])->middleware(['auth', 'verified']);
Route::get('/post-images', [PostController::class, 'index']);
Route::delete('/post-image/{id}', [PostController::class, 'delete'])->middleware(['auth', 'verified']);

Route::get('/api/tts', [TTSController::class, 'voiceRss']);
Route::get('/api/tts/voices', [TTSController::class, 'voices']);


require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
