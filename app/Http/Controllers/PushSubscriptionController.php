<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PushSubscriptionController extends Controller
{
    // app/Http/Controllers/PushSubscriptionController.php

    public function subscribe(Request $request)
    {
        $request->validate([
            'endpoint'  => 'required|url',
            'publicKey' => 'nullable|string',
            'authToken' => 'nullable|string',
        ]);

        // 1. Desencriptar la cookie
        $rawCookie = $request->cookie('visitor_id');

        try {
            $decrypted = decrypt($rawCookie);
        } catch (\Exception $e) {
            $decrypted = $rawCookie; // ya viene plana
        }

        if (!$decrypted) {
            return response()->json(['error' => 'Visitor no identificado'], 400);
        }

        // 2. Hash SHA-256 — siempre 64 chars, nunca expone el UUID real
        $visitorHash = hash('sha256', $decrypted);

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
        $rawCookie = $request->cookie('visitor_id');

        try {
            $decrypted = decrypt($rawCookie);
        } catch (\Exception $e) {
            $decrypted = $rawCookie;
        }

        $visitorHash = hash('sha256', $decrypted);

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