<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollectionLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'collector_id',
        'zone_code',
        'collected_at',
    ];

    public function collector()
    {
        return $this->belongsTo(User::class, 'collector_id');
    }
}
