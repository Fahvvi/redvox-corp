<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    protected $fillable = ['name', 'category', 'buy_price', 'sell_price', 'image_url'];

    // Relasi: Satu barang bisa ada di banyak inventory (bagasi)
    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }
}
