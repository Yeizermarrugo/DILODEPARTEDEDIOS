<?php

use App\Http\Controllers\DevocionalController;
use App\Http\Controllers\EnsenanzaController;
use App\Http\Controllers\PdfUploadController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\TTSController;
use App\Http\Controllers\YouTubeController;
use App\Models\DevocionalView;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Stevebauman\Location\Facades\Location;

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
Route::get('/devocional/{id}', [DevocionalController::class, 'details'])->name('devocional.details');
Route::get('/estudio-biblico/{id}', [DevocionalController::class, 'details'])->name('estudio-biblico.details');

// Route::inertia('/BlogDetails', 'BlogDetails');

Route::get('/podcast', function () {
    return Inertia::render('Podcast');
});


Route::get('/estudios', function () {
    return Inertia::render('Estudios');
});
Route::get('/estudiosbiblicos', [DevocionalController::class, 'estudios']);

// Redirecciones de /ensenanzas → /series (301 permanente)
Route::redirect('/ensenanzas', '/series', 301);
Route::get('/ensenanzas/{id}', function (string $id) {
    return redirect("/series/{$id}", 301);
});
Route::get('/ensenanzas-search', function (Request $request) {
    return redirect('/series-search?' . $request->getQueryString(), 301);
});

Route::get('/series', function () {
    return Inertia::render('Enseñanzas');
});

Route::get('/series-search', [EnsenanzaController::class, 'index']);
Route::get('/series/{id}', [EnsenanzaController::class, 'details'])
    ->name('ensenanza.details');


Route::get('/podcast', function () {
    return Inertia::render('Podcast');
});

Route::get('/api/series', [EnsenanzaController::class, 'listSimple']);
Route::post('/api/series', [EnsenanzaController::class, 'store']);
Route::put('/api/series/{id}', [EnsenanzaController::class, 'update']);


Route::post('/upload-pdf', [PdfUploadController::class, 'store'])->name('upload.pdf');


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


Route::get('/recursos', function () {
    return Inertia::render('Libreria');
});


Route::get('/obras', function () {
    return Inertia::render('Obras');
});

//Editar o eliminar devocionales

Route::get('/devocionales-edit', [DevocionalController::class, 'adminIndex']);

Route::get('/devocionales/{id}', [DevocionalController::class, 'showJson'])->name('devocionales.showJson');

Route::put('/devocionales/{id}', [DevocionalController::class, 'update'])->middleware(['auth', 'verified'])->name('devocionales.update');

// Trackviews
Route::post('/devocionales/{id}/view', [DevocionalController::class, 'trackView']);
Route::post('/privacy/accept', [DevocionalController::class, 'acceptPrivacy']);

Route::get('/reparar-ciudades', function () {
    $viewsSinCiudad = DevocionalView::whereNull('city')->get();
    $contador = 0;

    foreach ($viewsSinCiudad as $view) {
        // Ignoramos IPs locales porque no tienen ubicación geográfica
        if ($view->ip_address !== '127.0.0.1' && $view->ip_address !== '127.0.0.0' && !str_ends_with($view->ip_address, '.0')) {

            $loc = Location::get($view->ip_address);

            if ($loc && $loc->cityName) {
                $view->timestamps = false; // Para no alterar created_at
                $view->city = $loc->cityName;
                $view->country = $loc->countryName;
                $view->save();
                $contador++;
            }
        }
    }

    return "Se actualizaron $contador registros con éxito.";
});

Route::get('/content-usage', function () {
    return Inertia::render('PaginaLegal');
});

Route::post('/recaudo/confirmacion', [PaymentController::class, 'confirmation'])->name('epayco.confirmation');
// routes/web.php

Route::get('/donacion-by-params', function (Request $request) {
    $ref = $request->query('ref_payco') ?? $request->query('x_ref_payco');

    if (!$ref) {
        return response()->json(['error' => 'Sin parámetros'], 400);
    }

    // 1. Buscar en BD local primero
    $donacion = \App\Models\Donation::where('ref_payco', $ref)
        ->orWhere('ref_payco_hash', $ref)
        ->orWhere('transaction_id', $ref)
        ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(raw_response, '$.x_ref_payco')) = ?", [$ref])
        ->first();

    if ($donacion) {
        return response()->json($donacion);
    }

    // 2. Si no está en BD, consultar API de ePayco directamente
    try {
        $apiResponse = \Illuminate\Support\Facades\Http::get(
            "https://secure.epayco.co/validation/v1/reference/{$ref}"
        );

        if ($apiResponse->successful()) {
            $body = $apiResponse->json();

            if (isset($body['data']) && $body['success'] === true) {
                $d = $body['data'];

                // Guardar en BD para futuras consultas
                $donacion = \App\Models\Donation::updateOrCreate(
                    ['ref_payco' => (string) $d['x_ref_payco']],
                    [
                        'ref_payco_hash' => $ref,
                        'transaction_id' => (string) $d['x_transaction_id'],
                        'amount'         => $d['x_amount'],
                        'currency'       => $d['x_currency_code'],
                        'status'         => $d['x_transaction_state'],
                        'description'    => $d['x_description'],
                        'bank_name'      => $d['x_bank_name'],
                        'customer_name'  => trim(($d['x_customer_name'] ?? '') . ' ' . ($d['x_customer_lastname'] ?? '')),
                        'customer_email' => $d['x_customer_email'] ?? null,
                        'raw_response'   => $d,
                    ]
                );

                return response()->json($donacion);
            }
        }
    } catch (\Exception $e) {
        Log::error("Error consultando ePayco API", ['error' => $e->getMessage(), 'ref' => $ref]);
    }

    return response()->json(['error' => 'No encontrado'], 404);
});

Route::get('/gracias', function () {
    return inertia('ThanksPage');
})->name('payment.thanks');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';