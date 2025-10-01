<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'reporter',     
        'zone',
        'description',
        'photo',
        'status',
    ];

    // Optional: Virtual attributes to match "name" and "message"
    protected $appends = ['name', 'message'];

    public function getNameAttribute()
    {
        // ✅ If "reporter" exists, return it. Otherwise, fallback to zone.
        return $this->reporter ?? $this->zone;
    }

    public function getMessageAttribute()
    {
        return $this->description; // Admin table "Message" is actually "Description"
    }
}
