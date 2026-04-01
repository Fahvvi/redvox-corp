<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Recipe extends Model
{
    protected $fillable = ['result_item_id', 'description'];

    // Barang jadinya apa? (Contoh: Batang Emas)
    public function resultItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'result_item_id');
    }

    // Bahan-bahannya apa saja?
    public function ingredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class);
    }
}