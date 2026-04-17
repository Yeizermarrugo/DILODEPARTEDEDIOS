<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PushSubscriptionController extends Controller
{
    // Dominios legítimos de servicios de push por navegador:
    // Firefox: updates.push.services.mozilla.com
    // Chrome/Edge/Opera: fcm.googleapis.com, fcm.endpoints.googleapis.com
    // Safari: web.push.apple.com
    private const ALLOWED_PUSH_HOSTS = [
        'updates.push.services.mozilla.com',
        'fcm.googleapis.com',
        'fcm.endpoints.googleapis.com',
        'web.push.apple.com',
    ];

    public function subscribe(Request $request)
    {
        $request->validate([
            'endpoint'  => 'required|url|max:500',
            'publicKey' => 'nullable|string|max:200',
            'authToken' => 'nullable|string|max:100',
        ]);

        $host = parse_url($request->endpoint, PHP_URL_HOST);
        if (!in_array($host, self::ALLOWED_PUSH_HOSTS, true)) {
            throw ValidationException::withMessages([
                'endpoint' => 'El endpoint no pertenece a un servicio de push reconocido.',
            ]);
        }

        $visitorId = $request->cookie('visitor_id');

        if (!$visitorId) {
            return response()->json(['error' => 'Visitor no identificado'], 400);
        }

        // Hash SHA-256 — nunca expone el UUID real en la BD
        $visitorHash = hash('sha256', $visitorId);

        // 3. Guardar
        $visitor = Visitor::firstOrCreate([
            'visitor_id' => $visitorHash
        ]);

        $visitor->updatePushSubscription(
            $request->endpoint,
            $request->publicKey,
            $request->authToken,
            $request->contentEncoding ?? 'aesgcm'
        );

        return response()->json(['status' => 'subscribed'], 201);
    }

    public function unsubscribe(Request $request)
    {
        $visitorId = $request->cookie('visitor_id');
        $visitorHash = hash('sha256', (string) $visitorId);

        $visitor = Visitor::where('visitor_id', $visitorHash)->first();
        $visitor?->deletePushSubscription($request->endpoint);

        return response()->json(['status' => 'unsubscribed']);
    }

    public function vapidKey()
    {
        return response()->json([
            'publicKey' => config('webpush.vapid.public_key')
        ]);
    }
}