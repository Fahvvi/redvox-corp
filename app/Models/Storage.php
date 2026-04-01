<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Storage extends Model
{
    protected $fillable = ['name', 'type', 'plate_number', 'pic_user_id'];

    // Siapa pemegang kunci bagasi ini?
    public function pic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pic_user_id');
    }

    // Isi bagasinya apa saja?
    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }
}