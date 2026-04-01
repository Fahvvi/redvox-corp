<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
    protected $fillable = ['user_id','storage_id', 'item_id', 'quantity'];

    public function storage(): BelongsTo
    {
        return $this->belongsTo(Storage::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}