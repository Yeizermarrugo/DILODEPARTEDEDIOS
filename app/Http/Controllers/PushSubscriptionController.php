<?php

namespace App\Http\Controllers;

use App\Models\Visitor;
use Illuminate\Http\Request;

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