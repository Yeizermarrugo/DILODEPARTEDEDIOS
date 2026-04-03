<?php

namespace App\Http\Controllers;

use App\Models\ContentLike;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LikeController extends Controller
{
    private array $validTypes = [
        ContentLike::TYPE_DEVOCIONAL,
        ContentLike::TYPE_ESTUDIO,
        ContentLike::TYPE_ENSENANZA,
    ];

    // GET /api/likes/{type}/{id}
    public function show(Request $request, string $type, string $id): JsonResponse
    {
        if (!in_array($type, $this->validTypes)) {
            return response()->json(['error' => 'Tipo inválido'], 422);
        }

        $hash  = $this->getVisitorHash($request, $id, $type);
        $total = ContentLike::forContent($type, $id)->count();
        $liked = ContentLike::forContent($type, $id)->where('visitor_hash', $hash)->exists();

        return response()->json(['total' => $total, 'liked' => $liked]);
    }

    // POST /api/likes/{type}/{id}
    public function toggle(Request $request, string $type, string $id): JsonResponse
    {
        if (!in_array($type, $this->validTypes)) {
            return response()->json(['error' => 'Tipo inválido'], 422);
        }

        $visitorUuid = $request->cookie('visitor_id') ?? (string) Str::uuid();
        $hash        = $this->buildHash($visitorUuid, $id, $type);
        $ipSegment   = $this->anonymizeIp($request->ip());

        $existing = ContentLike::forContent($type, $id)->where('visitor_hash', $hash)->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            try {
                ContentLike::create([
                    'content_id'   => $id,
                    'content_type' => $type,
                    'visitor_hash' => $hash,
                    'ip_segment'   => $ipSegment,
                    'created_at'   => $request->input('local_time') ?? now(),
                ]);
                $liked = true;
            } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
                $liked = true; // race condition: ya existía
            }
        }

        $total    = ContentLike::forContent($type, $id)->count();
        $response = response()->json(['liked' => $liked, 'total' => $total]);

        // Si no tenía cookie, se la asignamos ahora
        if (!$request->cookie('visitor_id')) {
            $response->cookie('visitor_id', $visitorUuid, 60 * 24 * 365, '/', null, true, true, false, 'Lax');
        }

        return $response;
    }

    private function getVisitorHash(Request $request, string $id, string $type): string
    {
        $uuid = $request->cookie('visitor_id') ?? 'no-cookie-' . Str::random(16);
        return $this->buildHash($uuid, $id, $type);
    }

    private function buildHash(string $uuid, string $id, string $type): string
    {
        return hash('sha256', $uuid . '|' . $id . '|' . $type);
    }

    private function anonymizeIp(string $ip): string
    {
        $parts = explode('.', $ip);
        if (count($parts) === 4) {
            $parts[3] = '0';
            return implode('.', $parts);
        }
        return $ip;
    }
}