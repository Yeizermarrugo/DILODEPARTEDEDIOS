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
    // Agregar
    Route::get('devocionalesAgregar', function () {
        return Inertia::render('DevocionalesForm', ['mode' => 'create']);
    })->name('devocionales.create');

    // Editar
    Route::get('/devocionales-editar/{id}', function (string $id) {
        return Inertia::render('DevocionalesForm', [
            'mode' => 'edit',
            'id'   => $id,
        ]);
    })->name('devocionales.editPage');
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


Route::get('/estudios', function () {
    return Inertia::render('Estudios');
});
Route::get('/estudiosbiblicos', [DevocionalController::class, 'estudios']);


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


Route::get('/libreria', function () {
    return Inertia::render('Libreria');
});


Route::get('/obras', function () {
    return Inertia::render('Obras');
});

//Editar o eliminar devocionales

Route::get('/devocionales-edit', [DevocionalController::class, 'adminIndex']);

Route::get('/devocionales/{id}', [DevocionalController::class, 'showJson'])->name('devocionales.showJson');

Route::put('/devocionales/{id}', [DevocionalController::class, 'update'])->name('devocionales.update');

// Route::get('/devocionales-editar/{id}', function ($id) {
//     return Inertia::render('Devocionales/Editar', ['id' => (int) $id]);
// })->name('devocionales.editPage');



require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';