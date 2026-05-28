<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateDevocionalAudio;
use App\Models\Devocional;
use App\Models\DevocionalCategory;
use App\Models\DevocionalView;
use App\Services\TextToSpeechService;
use Carbon\Carbon;
use HTMLPurifier;
use HTMLPurifier_Config;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Jenssegers\Agent\Agent;
use Stevebauman\Location\Facades\Location;

class DevocionalController extends Controller
{
    private function categoriesWithDescriptions($categories)
    {
        $descriptions = DevocionalCategory::whereIn('name', $categories->pluck('categoria')->filter()->unique())
            ->pluck('description', 'name');

        return $categories->map(fn ($category) => [
            'categoria' => $category->categoria,
            'count' => $category->count,
            'description' => $descriptions[$category->categoria] ?? null,
        ]);
    }

    private function syncCategory(string $name, ?string $description = null): void
    {
        $name = trim($name);
        if ($name === '') {
            return;
        }

        $category = DevocionalCategory::firstOrNew(['name' => $name]);
        if ($description !== null && trim($description) !== '') {
            $category->description = trim($description);
        }
        $category->save();
    }

    private function forgetCategoryCaches(): void
    {
        Cache::forget('devocional-categorias');
        Cache::forget('devocional-autores');
        Cache::forget('search-categorias-series');
        Cache::forget('estudios-list');
    }

    private function queueAudioIfVisible(Devocional $devocional): void
    {
        if (! $devocional->hidden) {
            GenerateDevocionalAudio::dispatch($devocional->id)->afterCommit();
        }
    }

    private function deleteAudioForContent(string $html): void
    {
        app(TextToSpeechService::class)->deleteForHtml($html);
    }

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
        $sort = $request->input('sort', 'latest');
        $search = $request->input('search');           // ← NUEVO

        // ── Base query con filtro de búsqueda ──────────────────────────────
        $base = Devocional::where('is_devocional', 1)
            ->where('hidden', false)
            ->where('ensenanza_id', null);

        if ($search) {
            $base->where(function ($q) use ($search) {
                $q->where('contenido', 'like', "%{$search}%")
                    ->orWhere('categoria', 'like', "%{$search}%")
                    ->orWhere('autor', 'like', "%{$search}%");
            });
        }

        // Columns needed for list cards — contenido truncated to extract title only
        $listColumns = [
            'id', 'imagen', 'categoria', 'autor', 'is_devocional',
            'serie', 'created_at', 'views_count', 'shares_count', 'ensenanza_id',
            DB::raw('SUBSTRING(contenido, 1, 800) as contenido'),
        ];

        // ── Ordenar ────────────────────────────────────────────────────────
        if ($sort === 'likes') {
            $devocionales = (clone $base)
                ->leftJoin('content_likes', function ($join) {
                    $join->on('content_likes.content_id', '=', 'devocionals.id')
                        ->where('content_likes.content_type', '=', \App\Models\ContentLike::TYPE_DEVOCIONAL);
                })
                ->selectRaw('devocionals.id, devocionals.imagen, devocionals.categoria, devocionals.autor,
                    devocionals.is_devocional, devocionals.serie, devocionals.created_at,
                    devocionals.views_count, devocionals.shares_count, devocionals.ensenanza_id,
                    SUBSTRING(devocionals.contenido, 1, 800) as contenido,
                    COUNT(content_likes.id) as likes_count')
                ->groupBy('devocionals.id')
                ->orderBy('likes_count', 'desc')
                ->paginate($perPage);
        } elseif ($sort === 'views') {
            $devocionales = (clone $base)
                ->select($listColumns)
                ->orderBy('views_count', 'desc')
                ->paginate($perPage);
        } elseif ($sort === 'shares') {
            $devocionales = (clone $base)
                ->select($listColumns)
                ->orderBy('shares_count', 'desc')
                ->paginate($perPage);
        } else {
            $devocionales = (clone $base)
                ->select($listColumns)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        }

        // ── Categorías y autores (cacheados 1 hora) ───────────────────────
        [$categoriasSinSerie, $series] = Cache::remember('devocional-categorias', 3600, function () {
            $categoriasRaw = Devocional::whereNotNull('categoria')
                ->where('categoria', '!=', '')
                ->where('is_devocional', 1)
                ->where('hidden', false)
                ->where('ensenanza_id', '=', null)
                ->selectRaw('categoria, serie, COUNT(*) as count')
                ->groupBy('categoria', 'serie')
                ->get();

            $series = [];
            $categoriasSinSerie = [];
            $descriptionMap = DevocionalCategory::pluck('description', 'name');

            foreach ($categoriasRaw as $row) {
                $categoryData = [
                    'categoria' => $row->categoria,
                    'count' => $row->count,
                    'description' => $descriptionMap[$row->categoria] ?? null,
                ];

                if ($row->serie) {
                    if (! isset($series[$row->serie])) {
                        $series[$row->serie] = ['nombre' => $row->serie, 'categorias' => []];
                    }
                    $series[$row->serie]['categorias'][] = $categoryData;
                } else {
                    $categoriasSinSerie[] = $categoryData;
                }
            }

            return [$categoriasSinSerie, array_values($series)];
        });

        $autores = Cache::remember('devocional-autores', 3600, fn () => Devocional::whereNotNull('autor')
            ->where('autor', '!=', '')
            ->where('is_devocional', 1)
            ->where('hidden', false)
            ->groupBy('autor')
            ->selectRaw('autor, COUNT(*) as count')
            ->get()
        );

        return response()->json([
            'devocionales' => $devocionales,
            'categorias' => $categoriasSinSerie,
            'series' => $series,
            'autores' => $autores,
        ]);
    }

    public function searchCategories(Request $request)
    {
        $perPage = $request->input('per_page', 16);
        $devocionales = Devocional::where('is_devocional', 1)
            ->where('hidden', false)
            ->where('ensenanza_id', null)
            ->select([
                'id', 'imagen', 'categoria', 'autor', 'is_devocional',
                'serie', 'created_at', 'views_count', 'shares_count', 'ensenanza_id',
                DB::raw('SUBSTRING(contenido, 1, 800) as contenido'),
            ])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

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
            $descriptionMap = DevocionalCategory::pluck('description', 'name');
            foreach ($categoriasRaw as $row) {
                if ($row->serie) {
                    if (! isset($series[$row->serie])) {
                        $series[$row->serie] = ['nombre' => $row->serie, 'categorias' => []];
                    }
                    $series[$row->serie]['categorias'][] = [
                        'categoria' => $row->categoria,
                        'count' => $row->count,
                        'description' => $descriptionMap[$row->categoria] ?? null,
                    ];
                }
            }

            return [$this->categoriesWithDescriptions($todasLasCategorias), array_values($series)];
        });

        $autores = Cache::remember('devocional-autores', 3600, fn () => Devocional::whereNotNull('autor')
            ->where('autor', '!=', '')
            ->groupBy('autor')
            ->selectRaw('autor, COUNT(*) as count')
            ->get()
        );

        return response()->json([
            'devocionales' => $devocionales,
            'categorias' => $todasLasCategorias,
            'series' => $series,
            'autores' => $autores,
        ]);
    }

    public function porCategoria(Request $request, $categoria)
    {
        $perPage = $request->input('per_page', 16);
        $sort = $request->input('sort', 'latest');

        $listColumns = [
            'id', 'imagen', 'categoria', 'autor', 'is_devocional',
            'serie', 'created_at', 'views_count', 'shares_count', 'ensenanza_id',
            DB::raw('SUBSTRING(contenido, 1, 800) as contenido'),
        ];

        $base = Devocional::where('categoria', $categoria)
            ->where('is_devocional', 1)
            ->where('ensenanza_id', null);

        if ($sort === 'likes') {
            $devocionales = (clone $base)
                ->leftJoin('content_likes', function ($join) {
                    $join->on('content_likes.content_id', '=', 'devocionals.id')
                        ->where('content_likes.content_type', '=', \App\Models\ContentLike::TYPE_DEVOCIONAL);
                })
                ->selectRaw('devocionals.id, devocionals.imagen, devocionals.categoria, devocionals.autor,
                    devocionals.is_devocional, devocionals.serie, devocionals.created_at,
                    devocionals.views_count, devocionals.shares_count, devocionals.ensenanza_id,
                    SUBSTRING(devocionals.contenido, 1, 800) as contenido,
                    COUNT(content_likes.id) as likes_count')
                ->groupBy('devocionals.id')
                ->orderBy('likes_count', 'desc')
                ->paginate($perPage);
        } elseif ($sort === 'views') {
            $devocionales = (clone $base)
                ->select($listColumns)
                ->orderBy('views_count', 'desc')
                ->paginate($perPage);
        } elseif ($sort === 'shares') {
            $devocionales = (clone $base)
                ->select($listColumns)
                ->orderBy('shares_count', 'desc')
                ->paginate($perPage);
        } else {
            $devocionales = (clone $base)
                ->select($listColumns)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        }

        return response()->json([
            'devocionales' => $devocionales,
            'categoria' => $categoria,
            'category' => DevocionalCategory::where('name', $categoria)->first(['name', 'description']),
        ]);
    }

    // devolver los ultimos 5 devocionales
    public function latest()
    {
        $devocionales = Devocional::orderBy('created_at', 'desc')->where('is_devocional', 1)
            ->where('hidden', false)
            ->where('ensenanza_id', '=', null)
            ->take(5)->get();

        return response()->json($devocionales);
    }

    public function estudios()
    {
        $devocionales = Cache::remember('estudios-list', 3600, function () {
            $orderMap = array_flip(self::$biblicalOrder);

            return Devocional::where('is_devocional', Devocional::TYPE_ESTUDIO)
                ->where('hidden', false)
                ->select('id', 'categoria', 'contenido', 'views_count', 'shares_count', 'created_at')
                ->get()
                ->sortBy(function ($e) use ($orderMap) {
                    $book = strtoupper(trim($e->categoria ?? ''));
                    $bookPos = $orderMap[$book] ?? 999;
                    [$cap, $ver] = self::parseChapterVerse($e->contenido ?? '');

                    return [$bookPos, $cap, $ver];
                })
                ->values();
        });

        return response()->json($devocionales);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $devocional = Devocional::find($id);
        if (! $devocional) {
            abort(404);
        }

        return Inertia::render('DevocionalDetails', [
            'devocional' => $devocional,
            'is_devocional' => $devocional->is_devocional,
        ]);
    }

    private static function parseChapterVerse(string $contenido): array
    {
        if (preg_match('/<h1[^>]*>(.*?)<\/h1>/is', $contenido, $m)) {
            $h1 = strip_tags($m[1]);
            if (preg_match('/(\d+):\s*(\d+)/', $h1, $ref)) {
                return [(int) $ref[1], (int) $ref[2]];
            }
            if (preg_match('/\b(\d+)\b/', $h1, $ref)) {
                return [(int) $ref[1], 0];
            }
        }

        return [9999, 9999];
    }

    private static array $biblicalOrder = [
        'GÉNESIS', 'ÉXODO', 'LEVÍTICO', 'NÚMEROS', 'DEUTERONOMIO',
        'JOSUÉ', 'JUECES', 'RUT', '1 SAMUEL', '2 SAMUEL',
        '1 REYES', '2 REYES', '1 CRÓNICAS', '2 CRÓNICAS', 'ESDRAS',
        'NEHEMÍAS', 'ESTER', 'JOB', 'SALMOS', 'PROVERBIOS',
        'ECLESIASTÉS', 'CANTARES', 'ISAÍAS', 'JEREMÍAS', 'LAMENTACIONES',
        'EZEQUIEL', 'DANIEL', 'OSEAS', 'JOEL', 'AMÓS', 'ABDÍAS',
        'JONÁS', 'MIQUEAS', 'NAHÚM', 'HABACUC', 'SOFONÍAS',
        'HAGEO', 'ZACARÍAS', 'MALAQUÍAS',
        'MATEO', 'MARCOS', 'LUCAS', 'JUAN', 'HECHOS',
        'ROMANOS', '1 CORINTIOS', '2 CORINTIOS', 'GÁLATAS', 'EFESIOS',
        'FILIPENSES', 'COLOSENSES', '1 TESALONICENSES', '2 TESALONICENSES',
        '1 TIMOTEO', '2 TIMOTEO', 'TITO', 'FILEMÓN', 'HEBREOS',
        'SANTIAGO', '1 PEDRO', '2 PEDRO', '1 JUAN', '2 JUAN', '3 JUAN',
        'JUDAS', 'APOCALIPSIS',
    ];

    public function details($id)
    {
        $devocional = Devocional::findOrFail($id);

        $nav = null;
        if ((int) $devocional->is_devocional === Devocional::TYPE_ESTUDIO) {
            $nav = $this->computeStudyNav($id, $devocional->categoria);
        }

        return Inertia::render('DevocionalDetailsPage', [
            'devocional' => $devocional,
            'is_devocional' => $devocional->is_devocional,
            'nav' => $nav,

            'meta' => [
                'title' => $devocional->titulo,
                'description' => Str::limit(strip_tags($devocional->contenido), 150),
                'image' => $devocional->imagen,
                'url' => url()->current(),
            ],
        ]);
    }

    private function computeStudyNav(string $id, ?string $currentBook): array
    {
        $orderMap = array_flip(self::$biblicalOrder);

        // Only visible estudios (is_devocional=3); sorted by biblical book then chapter:verse
        $allEstudios = Devocional::where('is_devocional', Devocional::TYPE_ESTUDIO)
            ->get(['id', 'categoria', 'contenido'])
            ->sortBy(function ($e) use ($orderMap) {
                $book = strtoupper(trim($e->categoria ?? ''));
                $bookPos = $orderMap[$book] ?? 999;
                [$cap, $ver] = self::parseChapterVerse($e->contenido ?? '');

                return [$bookPos, $cap, $ver];
            })
            ->values();

        // Sorted books in biblical order (preserving insertion order from sorted collection)
        $sortedBooks = $allEstudios->pluck('categoria')->unique()->values()->toArray();

        // Studies in current book
        $bookEstudios = $allEstudios->filter(fn ($e) => $e->categoria === $currentBook)->values();
        $bookIds = $bookEstudios->pluck('id')->toArray();
        $posInBook = array_search($id, $bookIds);
        $totalInBook = count($bookIds);

        $isFirstInBook = $posInBook === 0;
        $isLastInBook = $posInBook === $totalInBook - 1;
        $currentBookIdx = array_search($currentBook, $sortedBooks);

        // Prev: within book or jump to first of previous book
        $prevData = null;
        $prevCrossesBook = false;
        if (! $isFirstInBook) {
            $prevData = $bookEstudios[$posInBook - 1];
        } elseif ($currentBookIdx > 0) {
            $prevBook = $sortedBooks[$currentBookIdx - 1];
            $prevData = $allEstudios->first(fn ($e) => $e->categoria === $prevBook);
            $prevCrossesBook = true;
        }

        // Next: within book or jump to first of next book
        $nextData = null;
        $nextCrossesBook = false;
        if (! $isLastInBook) {
            $nextData = $bookEstudios[$posInBook + 1];
        } elseif ($currentBookIdx !== false && $currentBookIdx < count($sortedBooks) - 1) {
            $nextBook = $sortedBooks[$currentBookIdx + 1];
            $nextData = $allEstudios->first(fn ($e) => $e->categoria === $nextBook);
            $nextCrossesBook = true;
        }

        return [
            'prev' => $prevData ? [
                'id' => $prevData->id,
                'categoria' => $prevData->categoria,
                'crosses_book' => $prevCrossesBook,
            ] : null,
            'next' => $nextData ? [
                'id' => $nextData->id,
                'categoria' => $nextData->categoria,
                'crosses_book' => $nextCrossesBook,
            ] : null,
            'current_book' => $currentBook,
            'position_in_book' => $posInBook !== false ? $posInBook + 1 : null,
            'total_in_book' => $totalInBook,
        ];
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        Devocional::create([
            'contenido' => $request->input('contenido'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'contenido' => 'required|string',
            'categoria' => 'required|string',
            'imagen' => 'nullable|string',
            'autor' => 'nullable|string|max:255',
            'is_devocional' => 'required|integer|in:1,2,3',
            'hidden' => 'boolean',
            'serie' => 'nullable|string|max:255',
            'created_at' => 'nullable|date',
            'pdf' => 'nullable|string|max:255',
            'instagram' => 'nullable|string|max:255',
            'tiktok' => 'nullable|string|max:255',
            'ensenanza_id' => 'nullable|uuid|exists:ensenanzas,id',
            'category_description' => 'nullable|string|max:1000',
        ]);

        if (
            ! DevocionalCategory::where('name', $validated['categoria'])->exists()
            && trim((string) ($validated['category_description'] ?? '')) === ''
        ) {
            return response()->json([
                'message' => 'La descripción de la nueva categoría es obligatoria.',
                'errors' => [
                    'category_description' => ['La descripción de la nueva categoría es obligatoria.'],
                ],
            ], 422);
        }

        $this->syncCategory($validated['categoria'], $validated['category_description'] ?? null);

        // Creamos el registro usando SOLO los campos que existen en la DB
        $devocional = Devocional::create([
            'contenido' => $this->purifyHtml($validated['contenido']),
            'categoria' => $validated['categoria'],
            'imagen' => $validated['imagen'] ?? null,
            'autor' => $validated['autor'] ?? null,
            'is_devocional' => $validated['is_devocional'],
            'hidden' => $validated['hidden'] ?? false,
            'serie' => $validated['serie'] ?? null,
            'created_at' => ($validated['created_at'] ?? null) ?: now(),
            'pdf' => $validated['pdf'] ?? null,
            'instagram' => $validated['instagram'] ?? null,
            'tiktok' => $validated['tiktok'] ?? null,
            'ensenanza_id' => $validated['ensenanza_id'] ?? null,
        ]);

        $this->forgetCategoryCaches();
        $this->queueAudioIfVisible($devocional);

        return response()->json([
            'message' => '¡Guardado con éxito!',
            'devocional' => $devocional,
        ], 201);
    }

    /**
     * Builds a MySQL REGEXP pattern that matches a word regardless of whether
     * accented vowels are stored as UTF-8 chars or HTML entities (HTMLPurifier converts é→&eacute;).
     */
    private static function accentRegexp(string $word): string
    {
        static $map = [
            'a' => '(a|á|à|â|ã|ä|&aacute;|&agrave;|&acirc;|&atilde;|&auml;)',
            'á' => '(a|á|&aacute;)', 'à' => '(a|à|&agrave;)',
            'â' => '(a|â|&acirc;)', 'ã' => '(a|ã|&atilde;)', 'ä' => '(a|ä|&auml;)',
            'e' => '(e|é|è|ê|ë|&eacute;|&egrave;|&ecirc;|&euml;)',
            'é' => '(e|é|&eacute;)', 'è' => '(e|è|&egrave;)',
            'ê' => '(e|ê|&ecirc;)', 'ë' => '(e|ë|&euml;)',
            'i' => '(i|í|ì|î|ï|&iacute;|&igrave;|&icirc;|&iuml;)',
            'í' => '(i|í|&iacute;)', 'ì' => '(i|ì|&igrave;)',
            'î' => '(i|î|&icirc;)', 'ï' => '(i|ï|&iuml;)',
            'o' => '(o|ó|ò|ô|õ|ö|&oacute;|&ograve;|&ocirc;|&otilde;|&ouml;)',
            'ó' => '(o|ó|&oacute;)', 'ò' => '(o|ò|&ograve;)',
            'ô' => '(o|ô|&ocirc;)', 'õ' => '(o|õ|&otilde;)', 'ö' => '(o|ö|&ouml;)',
            'u' => '(u|ú|ù|û|ü|&uacute;|&ugrave;|&ucirc;|&uuml;)',
            'ú' => '(u|ú|&uacute;)', 'ù' => '(u|ù|&ugrave;)',
            'û' => '(u|û|&ucirc;)', 'ü' => '(u|ü|&uuml;)',
            'ñ' => '(ñ|&ntilde;)',
        ];

        $pattern = '';
        foreach (mb_str_split(mb_strtolower($word)) as $char) {
            $pattern .= $map[$char] ?? preg_quote($char, null);
        }

        return $pattern;
    }

    public function adminIndex(Request $request)
    {
        $perPage = $request->input('per_page', 50);
        $search = $request->input('search');
        $categoria = $request->input('categoria');
        $autor = $request->input('autor');

        // Base query con filtros comunes
        $baseQuery = Devocional::query();

        if ($search) {
            $words = array_filter(array_map('trim', explode(' ', $search)));
            foreach ($words as $word) {
                $like = "%{$word}%";
                $pattern = self::accentRegexp($word);
                $baseQuery->where(function ($q) use ($pattern, $like) {
                    // contenido stored with HTML entities (HTMLPurifier) → REGEXP match
                    $q->whereRaw('REGEXP_LIKE(contenido, ?, "i")', [$pattern])
                        ->orWhereRaw('categoria COLLATE utf8mb4_0900_ai_ci LIKE ?', [$like])
                        ->orWhereRaw('autor COLLATE utf8mb4_0900_ai_ci LIKE ?', [$like]);
                });
            }
        }

        if ($categoria) {
            $baseQuery->where('categoria', $categoria);
        }

        if ($autor) {
            $baseQuery->where('autor', $autor);
        }

        // Clonar la query base para cada grupo
        $devocionales = (clone $baseQuery)
            ->where('is_devocional', Devocional::TYPE_DEVOCIONAL)
            ->where('hidden', false)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'devocionales_page')
            ->withQueryString();

        $estudios = (clone $baseQuery)
            ->where('is_devocional', Devocional::TYPE_ESTUDIO)
            ->where('hidden', false)
            ->orderBy('categoria', 'asc')
            ->orderBy('created_at', 'asc')
            ->paginate($perPage, ['*'], 'estudios_page')
            ->withQueryString();

        $series = (clone $baseQuery)
            ->where('is_devocional', Devocional::TYPE_SERIE)
            ->where('hidden', false)
            ->orderBy('ensenanza_id', 'asc')
            ->orderBy('created_at', 'asc')
            ->paginate($perPage, ['*'], 'series_page')
            ->withQueryString();

        $ocultos = (clone $baseQuery)
            ->where('hidden', true)
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
            'devocionales' => $devocionales,
            'estudios' => $estudios,
            'series' => $series,
            'ocultos' => $ocultos,
            'categorias' => $categorias,
            'autores' => $autores,
            'filters' => [
                'search' => $search,
                'categoria' => $categoria,
                'autor' => $autor,
            ],
        ]);
    }

    public function showJson($id)
    {
        $devocional = Devocional::findOrFail($id);

        return response()->json($devocional);
    }

    public function toggleHidden(Request $request, $id)
    {
        $devocional = Devocional::findOrFail($id);
        $devocional->update(['hidden' => $request->boolean('hidden')]);

        $this->forgetCategoryCaches();
        $this->queueAudioIfVisible($devocional);

        return response()->json([
            'hidden' => $devocional->hidden,
        ]);
    }

    public function update(Request $request, $id)
    {
        $devocional = Devocional::findOrFail($id);

        $request->validate([
            'contenido' => 'required|string',
            'categoria' => 'required|string',
            // permite que imagen venga null o string; si viene vacía, conservamos la anterior
            'imagen' => 'nullable|string|url',
            'autor' => 'nullable|string|max:255',
            'is_devocional' => 'required|integer|in:1,2,3',
            'hidden' => 'boolean',
            'serie' => 'nullable|string|max:255',
            'created_at' => 'nullable|date',
            'pdf' => 'nullable|string|max:255',
            'instagram' => 'nullable|string|max:255',
            'tiktok' => 'nullable|string|max:255',
            'ensenanza_id' => 'nullable|uuid|exists:ensenanzas,id',
            'category_description' => 'nullable|string|max:1000',
        ]);

        $categoryName = $request->input('categoria');
        if (
            ! DevocionalCategory::where('name', $categoryName)->exists()
            && trim((string) $request->input('category_description')) === ''
        ) {
            return response()->json([
                'message' => 'La descripción de la nueva categoría es obligatoria.',
                'errors' => [
                    'category_description' => ['La descripción de la nueva categoría es obligatoria.'],
                ],
            ], 422);
        }

        $this->syncCategory($categoryName, $request->input('category_description'));

        $createdAt = $request->input('created_at');
        $previousContenido = (string) $devocional->contenido;
        $previousHidden = (bool) $devocional->hidden;
        $newContenido = $this->purifyHtml($request->input('contenido'));

        $devocional->update([
            'contenido' => $newContenido,
            'categoria' => $request->input('categoria'),
            'imagen' => $request->input('imagen') ?: $devocional->imagen,
            'autor' => $request->input('autor'),
            'is_devocional' => $request->input('is_devocional'),
            'hidden' => $request->boolean('hidden', false),
            'serie' => $request->input('serie'),
            'created_at' => $createdAt
                ? Carbon::createFromFormat('Y-m-d\TH:i', $createdAt)->format('Y-m-d H:i:s')
                : $devocional->created_at,
            'pdf' => $request->input('pdf'),
            'instagram' => $request->input('instagram'),
            'tiktok' => $request->input('tiktok'),
            'ensenanza_id' => $request->input('ensenanza_id'),
        ]);

        $this->forgetCategoryCaches();
        if (! $previousHidden && $previousContenido !== $newContenido) {
            $this->deleteAudioForContent($previousContenido);
        }
        $this->queueAudioIfVisible($devocional);

        return response()->json([
            'message' => 'Devocional actualizado correctamente',
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
        $agent = new Agent;
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
            $ipToSave = (count($ipParts) === 4) ? implode('.', array_slice($ipParts, 0, 3)).'.0' : $rawIp;
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

        if (! $recentAnalytic) {
            \App\Jobs\TrackDevocionalView::dispatch(
                $id,
                $ipToSave,
                $rawIp,
                $agent->browser().' '.$agent->version($agent->browser()),
                $agent->platform(),
                $localTime,
                $isWorkIp,
            )->afterResponse();

            return response()->json([
                'status' => 'recorded',
                'is_work_log' => $isWorkIp,
                'ip_stored' => $ipToSave,
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
