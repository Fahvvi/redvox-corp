<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecipeIngredient extends Model
{
    protected $fillable = ['recipe_id', 'material_item_id', 'quantity'];

    public function material(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'material_item_id');
    }
}