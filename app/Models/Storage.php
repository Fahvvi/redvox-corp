<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Storage extends Model
{
    protected $fillable = [
        'user_id', 
        'name', 
        'type', 
        'vehicle_id', 
        'location_detail', 
        'package_type', 
        'capacity'
    ];

    public function inventories()
    {
        return $this->hasMany(Inventory::class);
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}