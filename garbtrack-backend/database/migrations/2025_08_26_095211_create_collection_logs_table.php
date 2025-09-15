<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('collection_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('collector_id')->constrained('users')->onDelete('cascade');
    $table->string('zone_code'); // changed from zone_id INT to zone_code STRING
    $table->timestamp('collected_at')->nullable();
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collection_logs');
    }
};
