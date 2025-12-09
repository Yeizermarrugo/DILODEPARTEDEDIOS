<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BulkUploadController;

Route::post('/bulk-upload', [BulkUploadController::class, 'store']);
Route::get('/bucket/images', [BulkUploadController::class, 'index']);
