<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function confirmation(Request $request)
    {
        // Log de entrada: Primer paso de auditoría (saber que ePayco tocó el server)
        Log::info("Webhook ePayco Iniciado", ['ref' => $request->input('x_ref_payco')]);

        $p_cust_id_cliente = config('services.epayco.customer_id');
        $p_key = config('services.epayco.p_key');

        // Datos crudos de ePayco
        $x_ref_payco = $request->input('x_ref_payco');
        $x_transaction_id = $request->input('x_transaction_id');
        $x_amount = $request->input('x_amount');
        $x_currency_code = $request->input('x_currency_code');
        $x_signature = $request->input('x_signature');

        // VALIDACIÓN DE FIRMA CORREGIDA
        // Nota: ePayco a veces manda el monto como "5000.00", eso debe coincidir exacto.
        $signature_local = hash('sha256', $p_cust_id_cliente . '^' . $p_key . '^' . $x_ref_payco . '^' . $x_transaction_id . '^' . $x_amount . '^' . $x_currency_code);

        if ($x_signature !== $signature_local) {
            Log::warning("Firma inválida - Posible intento de fraude", [
                'ref' => $x_ref_payco,
                'ip' => $request->ip()
            ]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $states = [
            1 => 'Aceptada',
            2 => 'Rechazada',
            3 => 'Pendiente',
            4 => 'Fallida',
            6 => 'Reversada'
        ];

        $cod_state = (int) $request->input('x_cod_transaction_state');
        $status_text = $states[$cod_state] ?? 'Desconocido';

        try {
            DB::beginTransaction();

            $donation = Donation::updateOrCreate(
                ['ref_payco' => $x_ref_payco],
                [
                    'ref_payco_hash' => $request->input('x_ref_payco_hash'), // hash del JSON
                    'transaction_id' => $x_transaction_id,
                    'amount'         => $x_amount,
                    'currency'       => $x_currency_code,
                    'status'         => $status_text,
                    'description'    => $request->input('x_description'),

                    // Campos de Auditoría extraídos de ePayco
                    'bank_name'      => $request->input('x_bank_name'),
                    'receipt_number' => $request->input('x_approval_code'), // Código de aprobación del banco
                    'ip_address'     => $request->input('x_ip'),

                    // Datos del Donante
                    'customer_name'  => trim($request->input('x_customer_name') . ' ' . $request->input('x_customer_lastname')),
                    'customer_email' => $request->input('x_customer_email'),
                    'customer_phone' => $request->input('x_customer_phone'),

                    // Guardamos el JSON completo por si ePayco cambia parámetros en el futuro
                    'raw_response'   => $request->all()
                ]
            );

            DB::commit();

            // Si el pago es exitoso, aquí puedes lanzar un Job para el correo
            if ($cod_state === 1) {
                // Mail::to($donation->customer_email)->send(new ThanksForDonation($donation));
            }

            return response('OK', 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::critical("Fallo crítico en Webhook ePayco", [
                'error' => $e->getMessage(),
                'ref' => $x_ref_payco
            ]);
            return response('Error', 500);
        }
    }
}