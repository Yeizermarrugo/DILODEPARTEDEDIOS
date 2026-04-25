<?php

namespace App\Http\Controllers;

use App\Models\Devocional;
use App\Models\DevocionalView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Jenssegers\Agent\Agent;
use Stevebauman\Location\Facades\Location;
use HTMLPurifier;
use HTMLPurifier_Config;

class DevocionalController extends Controller
{
    private function purifyHtml(string $html): string
    {
        static $purifier = null;
        if ($purifier === null) {
            $config = HTMLPurifier_Config::createDefault();
            $config->set('HTML.Allowed', 'h1,h2,h3,h4,h5,h6,p,br,strong,em,u,s,ul,ol,li,blockquote,a[href|target|rel],img[src|alt|width|height],span[style],div[style],table,thead,tbody,tr,th[colspan|rowspan],td[colspan|rowspan],pre,code,hr');
            $config->set('HTML.AllowedAttributes', 'a.href,a.target,a.rel,img.src,img.alt,img.width,img.height,*.style,*.class');
            $config->set('CSS.AllowedProperties', 'color,background-color,font-weight,font-style,text-decoration,text-align,font-size,line-height,margin,padding');
            $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'mailto' => true]);
            $config->set('Attr.AllowedRel', 'noopener noreferrer nofollow');
            $config->set('AutoFormat.RemoveEmpty', true);
            $config->set('Cache.DefinitionImpl', null);
            $purifier = new HTMLPurifier($config);
        }
        return $purifier->purify($html);
    }

    /**
     * Display a listing of the resource.
     * Soporta: ?sort=latest|likes|views  ?search=texto  ?per_page=16
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 16);
        $sort    = $request->input('sort', 'latest');
        $search  = $request->input('search');           // ← NUEVO

        // ── Base query con filtro de búsqueda ──────────────────────────────
        $base = Devocional::where('is_devocional', 1)
            ->where('ensenanza_id', null);

        if ($search) {
            $base->where(function ($q) use ($search) {
                $q->where('contenido', 'like', "%{$search}%")
                    ->orWhere('categoria', 'like', "%{$search}%")
                    ->orWhere('autor', 'like', "%{$search}%");
            });
        }

        // ── Ordenar ────────────────────────────────────────────────────────
        if ($sort === 'likes') {
            $devocionales = (clone $base)
                ->leftJoin('content_likes', function ($join) {
                    $join->on('content_likes.content_id', '=', 'devocionals.id')
                        ->where('content_likes.content_type', '=', \App\Models\ContentLike::TYPE_DEVOCIONAL);
                })
                ->selectRaw('devocionals.*, COUNT(content_likes.id) as likes_count')
                ->groupBy('devocionals.id')
                ->orderBy('likes_count', 'desc')
                ->paginate($perPage);
        } elseif ($sort === 'views') {
            $devocionales = (clone $base)
                ->orderBy('views_count', 'desc')
                ->paginate($perPage);
        } elseif ($sort === 'shares') {
            $devocionales = (clone $base)
                ->orderBy('shares_count', 'desc')
                ->paginate($perPage);
        } else {
            $devocionales = (clone $base)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        }

        // ── Categorías y autores (cacheados 1 hora) ───────────────────────
        [$categoriasSinSerie, $series] = Cache::remember('devocional-categorias', 3600, function () {
            $categoriasRaw = Devocional::whereNotNull('categoria')
                ->where('categoria', '!=', '')
                ->where('is_devocional', 1)
                ->where('ensenanza_id', '=', null)
                ->selectRaw('categoria, serie, COUNT(*) as count')
                ->groupBy('categoria', 'serie')
                ->get();

            $series             = [];
            $categoriasSinSerie = [];
            foreach ($categoriasRaw as $row) {
                if ($row->serie) {
                    if (!isset($series[$row->serie])) {
                        $series[$row->serie] = ['nombre' => $row->serie, 'categorias' => []];
                    }
                    $series[$row->serie]['categorias'][] = ['categoria' => $row->categoria, 'count' => $row->count];
                } else {
                    $categoriasSinSerie[] = ['categoria' => $row->categoria, 'count' => $row->count];
                }
            }
            return [$categoriasSinSerie, array_values($series)];
        });

        $autores = Cache::remember('devocional-autores', 3600, fn () =>
            Devocional::whereNotNull('autor')
                ->where('autor', '!=', '')
                ->where('is_devocional', 1)
                ->groupBy('autor')
                ->selectRaw('autor, COUNT(*) as count')
                ->get()
        );

        return response()->json([
            'devocionales' => $devocionales,
            'categorias'   => $categoriasSinSerie,
            'series'       => $series,
            'autores'      => $autores,
        ]);
    }
    public function searchCategories(Request $request)
    {
        $perPage = $request->input('per_page', 16);
        $devocionales = Devocional::orderBy('created_at', 'desc')->paginate($perPage);

        [$todasLasCategorias, $series] = Cache::remember('search-categorias-series', 3600, function () {
            $todasLasCategorias = Devocional::whereNotNull('categoria')
                ->where('categoria', '!=', '')
                ->selectRaw('categoria, COUNT(*) as count')
                ->groupBy('categoria')
                ->get();

            $categoriasRaw = Devocional::whereNotNull('categoria')
                ->where('categoria', '!=', '')
                ->selectRaw('categoria, serie, COUNT(*) as count')
                ->groupBy('categoria', 'serie')
                ->get();

            $series = [];
            foreach ($categoriasRaw as $row) {
                if ($row->serie) {
                    if (!isset($series[$row->serie])) {
                        $series[$row->serie] = ['nombre' => $row->serie, 'categorias' => []];
                    }
                    $series[$row->serie]['categorias'][] = ['categoria' => $row->categoria, 'count' => $row->count];
                }
            }

            return [$todasLasCategorias, array_values($series)];
        });

        $autores = Cache::remember('devocional-autores', 3600, fn () =>
            Devocional::whereNotNull('autor')
                ->where('autor', '!=', '')
                ->groupBy('autor')
                ->selectRaw('autor, COUNT(*) as count')
                ->get()
        );

        return response()->json([
            'devocionales' => $devocionales,
            'categorias'   => $todasLasCategorias,
            'series'       => $series,
            'autores'      => $autores,
        ]);
    }


    public function porCategoria(Request $request, $categoria)
    {
        $perPage = $request->input('per_page', 16);
        $sort = $request->input('sort', 'latest');

        if ($sort === 'likes') {
            $devocionales = Devocional::where('categoria', $categoria)
                ->where('is_devocional', 1)
                ->where('ensenanza_id', null)
                ->leftJoin('content_likes', function ($join) {
                    $join->on('content_likes.content_id', '=', 'devocionals.id')
                        ->where('content_likes.content_type', '=', \App\Models\ContentLike::TYPE_DEVOCIONAL);
                })
                ->selectRaw('devocionals.*, COUNT(content_likes.id) as likes_count')
                ->groupBy('devocionals.id')
                ->orderBy('likes_count', 'desc')
                ->paginate($perPage);
        } elseif ($sort === 'views') {
            $devocionales = Devocional::where('categoria', $categoria)
                ->where('is_devocional', 1)
                ->where('ensenanza_id', null)
                ->orderBy('views_count', 'desc')
                ->paginate($perPage);
        } elseif ($sort === 'shares') {
            $devocionales = Devocional::where('categoria', $categoria)
                ->where('is_devocional', 1)
                ->where('ensenanza_id', null)
                ->orderBy('shares_count', 'desc')
                ->paginate($perPage);
        } else {
            $devocionales = Devocional::where('categoria', $categoria)
                ->where('is_devocional', 1)
                ->where('ensenanza_id', null)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        }

        return response()->json([
            'devocionales' => $devocionales,
            'categoria'    => $categoria,
        ]);
    }
    //devolver los ultimos 5 devocionales
    public function latest()
    {
        $devocionales = Devocional::orderBy('created_at', 'desc')->where('is_devocional', 1)
            ->where('ensenanza_id', '=', null)
            ->take(5)->get();
        return response()->json($devocionales);
    }

    public function estudios()
    {
        $devocionales = Devocional::where('is_devocional', 0)
            ->orderBy('categoria', 'asc')
            ->orderBy('created_at', 'asc')
            ->get();
        return response()->json($devocionales);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $devocional = Devocional::find($id);
        if (!$devocional) {
            abort(404);
        }
        return Inertia::render('DevocionalDetails', [
            'devocional' => $devocional,
            'is_devocional' => $devocional->is_devocional
        ]);
    }

    public function details($id)
    {
        $devocional = Devocional::findOrFail($id);

        return Inertia::render('DevocionalDetailsPage', [
            'devocional' => $devocional,
            'is_devocional' => $devocional->is_devocional,

            'meta' => [
                'title' => $devocional->titulo,
                'description' => Str::limit(strip_tags($devocional->contenido), 150),
                'image' => $devocional->imagen,
                'url' => url()->current(),
            ]
        ]);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        Devocional::create([
            'contenido' => $request->input('contenido')
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'contenido'     => 'required|string',
            'categoria'     => 'required|string',
            'imagen'        => 'nullable|string',
            'autor'         => 'nullable|string|max:255',
            'is_devocional' => 'required|integer|in:0,1,2',
            'serie'         => 'nullable|string|max:255',
            'created_at'    => 'nullable|date',
            'pdf'           => 'nullable|string|max:255',
            'instagram'     => 'nullable|string|max:255',
            'tiktok'        => 'nullable|string|max:255',
            'ensenanza_id'  => 'nullable|uuid|exists:ensenanzas,id',
        ]);

        // Creamos el registro usando SOLO los campos que existen en la DB
        $devocional = Devocional::create([
            'contenido'     => $this->purifyHtml($validated['contenido']),
            'categoria'     => $validated['categoria'],
            'imagen'        => $validated['imagen'] ?? null,
            'autor'         => $validated['autor'] ?? null,
            'is_devocional' => $validated['is_devocional'],
            'serie'         => $validated['serie'] ?? null,
            'created_at'    => ($validated['created_at'] ?? null) ?: now(),
            'pdf'           => $validated['pdf'] ?? null,
            'instagram'     => $validated['instagram'] ?? null,
            'tiktok'        => $validated['tiktok'] ?? null,
            'ensenanza_id'  => $validated['ensenanza_id'] ?? null,
        ]);

        Cache::forget('devocional-categorias');
        Cache::forget('devocional-autores');
        Cache::forget('search-categorias-series');

        return response()->json([
            'message' => '¡Guardado con éxito!',
            'devocional' => $devocional
        ], 201);
    }

    public function adminIndex(Request $request)
    {
        $perPage   = $request->input('per_page', 50);
        $search    = $request->input('search');
        $categoria = $request->input('categoria');
        $autor     = $request->input('autor');

        // Base query con filtros comunes
        $baseQuery = Devocional::query();

        if ($search) {
            $baseQuery->where(function ($q) use ($search) {
                $q->where('contenido', 'like', "%{$search}%")
                    ->orWhere('categoria', 'like', "%{$search}%");
            });
        }

        if ($categoria) {
            $baseQuery->where('categoria', $categoria);
        }

        if ($autor) {
            $baseQuery->where('autor', $autor);
        }

        // Clonar la query base para cada grupo
        $devocionales = (clone $baseQuery)
            ->where('is_devocional', 1)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'devocionales_page')
            ->withQueryString();

        $estudios = (clone $baseQuery)
            ->where('is_devocional', 0)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'estudios_page')
            ->withQueryString();

        $ocultos = (clone $baseQuery)
            ->where('is_devocional', 2)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'ocultos_page')
            ->withQueryString();

        $categorias = Devocional::whereNotNull('categoria')
            ->where('categoria', '!=', '')
            ->groupBy('categoria')
            ->selectRaw('categoria, COUNT(*) as count')
            ->get();

        $autores = Devocional::whereNotNull('autor')
            ->where('autor', '!=', '')
            ->groupBy('autor')
            ->selectRaw('autor, COUNT(*) as count')
            ->get();

        return Inertia::render('Edit', [
            'devocionales' => $devocionales,   // is_devocional = 1
            'estudios'     => $estudios,       // is_devocional = 0
            'ocultos'      => $ocultos,        // is_devocional = 2
            'categorias'   => $categorias,
            'autores'      => $autores,
            'filters'      => [
                'search'    => $search,
                'categoria' => $categoria,
                'autor'     => $autor,
            ],
        ]);
    }


    public function showJson($id)
    {
        $devocional = Devocional::findOrFail($id);
        return response()->json($devocional);
    }

    public function update(Request $request, $id)
    {
        $devocional = Devocional::findOrFail($id);

        $request->validate([
            'contenido'     => 'required|string',
            'categoria'     => 'required|string',
            // permite que imagen venga null o string; si viene vacía, conservamos la anterior
            'imagen'        => 'nullable|string|url',
            'autor'         => 'nullable|string|max:255',
            'is_devocional' => 'required|integer|in:0,1,2',
            'serie'         => 'nullable|string|max:255',
            'created_at'    => 'nullable|date',
            'pdf'           => 'nullable|string|max:255',
            'instagram'     => 'nullable|string|max:255',
            'tiktok'        => 'nullable|string|max:255',
            'ensenanza_id'  => 'nullable|uuid|exists:ensenanzas,id',
        ]);

        $createdAt = $request->input('created_at');

        $devocional->update([
            'contenido'     => $this->purifyHtml($request->input('contenido')),
            'categoria'     => $request->input('categoria'),
            'imagen'        => $request->input('imagen') ?: $devocional->imagen,
            'autor'         => $request->input('autor'),
            'is_devocional' => $request->input('is_devocional'),
            'serie'         => $request->input('serie'),
            'created_at'    => $createdAt
                ? Carbon::createFromFormat('Y-m-d\TH:i', $createdAt)->format('Y-m-d H:i:s')
                : $devocional->created_at,
            'pdf'           => $request->input('pdf'),
            'instagram'     => $request->input('instagram'),
            'tiktok'        => $request->input('tiktok'),
            'ensenanza_id'  => $request->input('ensenanza_id'),
        ]);

        Cache::forget('devocional-categorias');
        Cache::forget('devocional-autores');
        Cache::forget('search-categorias-series');

        return response()->json([
            'message'    => 'Devocional actualizado correctamente',
            'devocional' => $devocional,
        ]);
    }
    // public function trackView(Request $request, $id)
    // {
    //     $rawIp = $request->ip();

    //     // --- ANONIMIZACIÓN DE IP ---
    //     $ipParts = explode('.', $rawIp);
    //     if (count($ipParts) === 4) {
    //         $ipParts[3] = '0';
    //         $ip = implode('.', $ipParts);
    //     } else {
    //         $ip = $rawIp;
    //     }

    //     $agent = new Agent();
    //     $agent->setUserAgent($request->userAgent());

    //     // 1. FILTRO: Ignorar tus IPs
    //     $ignoredIps = explode(',', env('RECORDS_IGNORE_IPS', ''));
    //     if (in_array($rawIp, $ignoredIps)) {
    //         return response()->json(['status' => 'ignored_dev']);
    //     }

    //     // 2. ANALÍTICA (Filtro 1 hora)
    //     $recentAnalytic = DevocionalView::where('devocional_id', $id)
    //         ->where('ip_address', $ip)
    //         ->where('created_at', '>', now()->subHour())
    //         ->exists();

    //     if (!$recentAnalytic) {
    //         $loc = Location::get($rawIp);

    //         $browserName = $agent->browser();
    //         $browserVersion = $agent->version($browserName);
    //         $platformName = $agent->platform();

    //         // -------------------------------------------------------
    //         // CAPTURAMOS LA HORA LOCAL ENVIADA DESDE EL FRONTEND
    //         // -------------------------------------------------------

    //         // Creamos el registro detallado
    //         DevocionalView::create([
    //             'devocional_id'  => $id,
    //             'ip_address'     => $ip,
    //             'country'        => $loc ? $loc->countryName : 'Desconocido',
    //             'browser'        => $browserName . ' ' . $browserVersion,
    //             'platform'       => $platformName,
    //             'accepted_terms' => true,
    //             'local_time'     => $request->input('local_time'), // <-- Guardamos la hora del país del usuario
    //         ]);

    //         // 3. CONTADOR PÚBLICO (Filtro 24 horas)
    //         $dayCheck = DevocionalView::where('devocional_id', $id)
    //             ->where('ip_address', $ip)
    //             ->where('created_at', '>', now()->subDay())
    //             ->count();

    //         if ($dayCheck === 1) {
    //             $devocional = Devocional::find($id);
    //             if ($devocional) {
    //                 $devocional->increment('views_count');
    //             }
    //         }

    //         return response()->json([
    //             'status' => 'recorded',
    //             'browser' => $browserName,
    //             'platform' => $platformName,
    //             'local_time_saved' => $request->input('local_time'), // Para verificar en consola
    //         ]);
    //     }

    //     return response()->json(['status' => 'throttled']);
    // }

    public function trackView(Request $request, $id)
    {
        $rawIp = $request->ip();
        $localTime = $request->input('local_time');
        $agent = new Agent();
        $agent->setUserAgent($request->userAgent());

        // 1. DETERMINAR SI ES UNA IP DE TRABAJO (Tú o tu pareja)
        $ignoredIps = explode(',', env('RECORDS_IGNORE_IPS', ''));
        $isWorkIp = in_array($rawIp, $ignoredIps);

        // 2. DEFINIR LA IP QUE SE GUARDARÁ EN BD
        // Si eres tú, guardamos la REAL. Si es otro, ANONIMIZAMOS con .0
        if ($isWorkIp) {
            $ipToSave = $rawIp;
        } else {
            $ipParts = explode('.', $rawIp);
            $ipToSave = (count($ipParts) === 4) ? implode('.', array_slice($ipParts, 0, 3)) . '.0' : $rawIp;
        }

        // 3. REGLA ESPECIAL PARA TU EQUIPO (isWorkIp)
        if ($isWorkIp) {
            $alreadyExists = DevocionalView::where('devocional_id', $id)
                ->where('ip_address', $ipToSave)
                ->exists();

            if ($alreadyExists) {
                return response()->json(['status' => 'work_ip_already_tracked']);
            }
        }

        // 4. ANALÍTICA GENERAL (Filtro 1 hora para evitar duplicidad de logs rápida)
        $recentAnalytic = DevocionalView::where('devocional_id', $id)
            ->where('ip_address', $ipToSave)
            ->where('created_at', '>', Carbon::parse($localTime)->subHour())
            ->exists();

        if (!$recentAnalytic) {
            \App\Jobs\TrackDevocionalView::dispatch(
                $id,
                $ipToSave,
                $rawIp,
                $agent->browser() . ' ' . $agent->version($agent->browser()),
                $agent->platform(),
                $localTime,
                $isWorkIp,
            )->afterResponse();

            return response()->json([
                'status'     => 'recorded',
                'is_work_log' => $isWorkIp,
                'ip_stored'  => $ipToSave,
            ]);
        }

        return response()->json(['status' => 'throttled']);
    }

    public function acceptPrivacy(Request $request)
    {
        $rawIp = $request->ip();

        // Aplicamos la misma anonimización para encontrar el registro
        $ipParts = explode('.', $rawIp);
        if (count($ipParts) === 4) {
            $ipParts[3] = '0';
            $anonIp = implode('.', $ipParts);
        } else {
            $anonIp = $rawIp;
        }

        // Actualizamos el registro más reciente de esta IP que esté en false
        DevocionalView::where('ip_address', $anonIp)
            ->where('accepted_terms', false)
            ->update(['accepted_terms' => true]);

        return response()->json(['status' => 'consent_recorded']);
    }
}