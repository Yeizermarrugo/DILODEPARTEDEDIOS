<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BulkUploadController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\PushSubscriptionController;

Route::post('/bulk-upload', [BulkUploadController::class, 'store']);
Route::post('/bulk-upload/video', [BulkUploadController::class, 'storeVideo']);
Route::get('/bucket/images', [BulkUploadController::class, 'index']);

//-------- Likes API ---------
Route::get('/likes/{type}/{id}',  [LikeController::class, 'show']);
Route::post('/likes/{type}/{id}', [LikeController::class, 'toggle']);


Route::post('/push/subscribe',   [PushSubscriptionController::class, 'subscribe']);
Route::post('/push/unsubscribe', [PushSubscriptionController::class, 'unsubscribe']);
Route::get('/push/vapid-key',    [PushSubscriptionController::class, 'vapidKey']);