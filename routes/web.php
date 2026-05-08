<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\DevocionalController;
use App\Http\Controllers\ShortUrlController;
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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Stevebauman\Location\Facades\Location;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $stats = Cache::remember('dashboard.stats', 300, function () {
            return [
                'devocionales'   => \App\Models\Devocional::where('is_devocional', 1)->whereNull('ensenanza_id')->count(),
                'estudios'       => \App\Models\Devocional::where('is_devocional', 0)->count(),
                'series'         => \App\Models\Ensenanza::count(),
                'episodios'      => \App\Models\Devocional::whereNotNull('ensenanza_id')->count(),
                'total_vistas'   => \App\Models\DevocionalView::count(),
                'total_likes'    => \App\Models\ContentLike::count(),
                'suscriptores'   => \App\Models\Visitor::has('pushSubscriptions')->count(),
                'este_mes'       => \App\Models\Devocional::where('is_devocional', 1)
                    ->whereNull('ensenanza_id')
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
            ];
        });

        $recientes = Cache::remember('dashboard.recientes', 120, function () {
            return \App\Models\Devocional::whereIn('is_devocional', [0, 1])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(['id', 'contenido', 'categoria', 'is_devocional', 'created_at', 'views_count', 'ensenanza_id'])
                ->map(function ($d) {
                    preg_match('/<h1[^>]*>(.*?)<\/h1>/is', $d->contenido, $m1);
                    preg_match('/<h2[^>]*>(.*?)<\/h2>/is', $d->contenido, $m2);
                    $clean = fn($s) => html_entity_decode(strip_tags($s), ENT_QUOTES | ENT_HTML5, 'UTF-8');
                    $titulo = isset($m1[1])
                        ? $clean($m1[1])
                        : (isset($m2[1]) ? $clean($m2[1]) : $clean(substr($d->contenido, 0, 60)) . '...');
                    $ensenanza = isset($m2[1]) ? $clean($m2[1]) : null;
                    return [
                        'id'         => $d->id,
                        'titulo'     => $titulo,
                        'ensenanza'  => $ensenanza,
                        'categoria'  => $d->categoria,
                        'tipo'       => $d->ensenanza_id ? 'episodio' : ($d->is_devocional ? 'devocional' : 'estudio'),
                        'vistas'     => $d->views_count ?? 0,
                        'created_at' => $d->created_at,
                    ];
                });
        });

        $contactMessages = \App\Models\ContactMessage::whereNull('archived_at')->latest()->take(50)->get();

        return Inertia::render('dashboard', compact('stats', 'recientes', 'contactMessages'));
    })->name('dashboard');
});


Route::middleware(['auth', 'verified'])->group(function () {
    // Agregar
    Route::get('devocionalesAgregar', function () {
        return Inertia::render('DevocionalesForm', [
            'mode'        => 'create',
            'tinymce_key' => config('services.tinymce.key'),
        ]);
    })->name('devocionales.create');

    // Editar
    Route::get('/devocionales-editar/{id}', function (string $id) {
        return Inertia::render('DevocionalesForm', [
            'mode'        => 'edit',
            'id'          => $id,
            'tinymce_key' => config('services.tinymce.key'),
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
Route::post('/upload-image', [ImageUploadController::class, 'store'])->middleware(['auth', 'verified']);
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

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/api/series', [EnsenanzaController::class, 'listSimple']);
    Route::post('/api/series', [EnsenanzaController::class, 'store']);
    Route::put('/api/series/{id}', [EnsenanzaController::class, 'update']);
});


Route::post('/upload-pdf', [PdfUploadController::class, 'store'])->middleware(['auth', 'verified'])->name('upload.pdf');


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

Route::get('/contacto', function () {
    return Inertia::render('Contacto');
});

//Editar o eliminar devocionales

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/devocionales-edit', [DevocionalController::class, 'adminIndex']);
    Route::get('/devocionales/{id}', [DevocionalController::class, 'showJson'])->name('devocionales.showJson');
    Route::put('/devocionales/{id}', [DevocionalController::class, 'update'])->name('devocionales.update');
    Route::patch('/contact-messages/{id}/read',    [ContactController::class, 'markRead']);
    Route::patch('/contact-messages/{id}/archive', [ContactController::class, 'archive']);
});

// Trackviews
Route::post('/devocionales/{id}/view', [DevocionalController::class, 'trackView'])
    ->middleware('throttle:20,1');
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

    // Campos PII que nunca deben exponerse públicamente
    $piiFields = [
        'x_customer_name',
        'x_customer_lastname',
        'x_customer_email',
        'x_customer_phone',
        'x_customer_document',
        'x_customer_ip',
        'x_customer_movil',
    ];

    $safeResponse = function ($donacion) use ($piiFields) {
        $raw = $donacion->raw_response;
        if (is_string($raw)) {
            $raw = json_decode($raw, true) ?? [];
        }
        foreach ($piiFields as $field) {
            unset($raw[$field]);
        }
        return ['raw_response' => $raw];
    };

    $cacheKey = "donation-ref-{$ref}";

    $result = Cache::remember($cacheKey, 300, function () use ($ref, $safeResponse) {
        // 1. Buscar en BD local primero
        $donacion = \App\Models\Donation::where('ref_payco', $ref)
            ->orWhere('ref_payco_hash', $ref)
            ->orWhere('transaction_id', $ref)
            ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(raw_response, '$.x_ref_payco')) = ?", [$ref])
            ->first();

        if ($donacion) {
            return ['status' => 'found', 'data' => $safeResponse($donacion)];
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

                    return ['status' => 'found', 'data' => $safeResponse($donacion)];
                }
            }
        } catch (\Exception $e) {
            Log::error("Error consultando ePayco API", ['error' => $e->getMessage(), 'ref' => $ref]);
        }

        return ['status' => 'not_found'];
    });

    if ($result['status'] === 'not_found') {
        Cache::forget($cacheKey); // no cachear 404s
        return response()->json(['error' => 'No encontrado'], 404);
    }

    return response()->json($result['data']);
});

Route::get('/gracias', function () {
    return inertia('ThanksPage');
})->name('payment.thanks');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

Route::get('/sitemap.xml', [\App\Http\Controllers\SitemapController::class, 'index']);

// Short URL redirect — debe ir al final para no interceptar rutas reales
Route::get('/{code}', [ShortUrlController::class, 'redirect'])
    ->where('code', '[A-Za-z0-9]{8}')
    ->name('short-url.redirect');