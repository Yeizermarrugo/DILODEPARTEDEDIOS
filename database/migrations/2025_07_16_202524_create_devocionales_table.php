<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('devocionals', function (Blueprint $table) {
            $table->id();
            $table->longText('contenido');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('devocionals');
    }
};
