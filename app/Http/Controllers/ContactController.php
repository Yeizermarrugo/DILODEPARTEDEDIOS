<?php

namespace App\Http\Controllers;

use App\Mail\ContactFormMail;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|max:150',
            'whatsapp' => 'nullable|string|max:20',
            'subject'  => 'required|string|max:150',
            'body'     => 'required|string|max:2000',
        ]);

        $msg = ContactMessage::create($data);

        Mail::to('dilodepartededios@gmail.com')->send(new ContactFormMail($msg));

        return response()->json(['ok' => true]);
    }

    public function index(): JsonResponse
    {
        $messages = ContactMessage::latest()->paginate(20);
        return response()->json($messages);
    }

    public function markRead(int $id): JsonResponse
    {
        $msg = ContactMessage::findOrFail($id);
        $msg->update(['read_at' => now()]);
        return response()->json(['ok' => true]);
    }

    public function unreadCount(): JsonResponse
    {
        return response()->json(['count' => ContactMessage::unread()->count()]);
    }
}
