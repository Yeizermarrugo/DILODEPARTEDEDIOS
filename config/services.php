<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'epayco' => [
        'customer_id' => env('EPAYCO_CUSTOMER_ID'),
        'p_key' => env('EPAYCO_P_KEY'),
        'public_key' => env('EPAYCO_PUBLIC_KEY'),
    ],

    'tinymce' => [
        'key' => env('TINYMCE_API_KEY'),
    ],

    'azure_speech' => [
        'key' => env('AZURE_SPEECH_KEY'),
        'region' => env('AZURE_SPEECH_REGION', 'eastus'),
        'output_format' => env('AZURE_SPEECH_OUTPUT_FORMAT', 'audio-24khz-48kbitrate-mono-mp3'),
        'timed_timeout_seconds' => env('AZURE_SPEECH_TIMED_TIMEOUT_SECONDS', 15),
    ],

];
