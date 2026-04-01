<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionItem extends Model
{
    protected $fillable = ['transaction_id', 'item_id', 'quantity', 'subtotal_price'];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}