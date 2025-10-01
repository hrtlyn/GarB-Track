<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RouteAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'collector_id',
        'route_name',
        'schedule_date',
        'instructions',
    ];

    /**
     * Get the collector that this route is assigned to.
     */
    public function collector()
    {
        return $this->belongsTo(User::class, 'collector_id');
    }
}
