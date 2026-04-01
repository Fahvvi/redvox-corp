<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    protected $fillable = [
        'invoice_number', 'cashier_id', 'supplier_name', 
        'location', 'total_amount', 'deposit_deduction', 
        'cash_deduction', 'notes'
    ];

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    // Detail barang yang dibeli di nota ini
    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }
}