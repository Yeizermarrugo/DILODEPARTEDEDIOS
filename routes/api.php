<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BulkUploadController;
use App\Http\Controllers\LikeController;

Route::post('/bulk-upload', [BulkUploadController::class, 'store']);
Route::get('/bucket/images', [BulkUploadController::class, 'index']);

//-------- Likes API ---------
Route::get('/likes/{type}/{id}',  [LikeController::class, 'show']);
Route::post('/likes/{type}/{id}', [LikeController::class, 'toggle']);