<?php
namespace Helgispbru\EvolutionCMS\Translations\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Language extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'languages';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'code',
        'title',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the language entries for the language.
     */
    public function languageEntries(): HasMany
    {
        return $this->hasMany(LanguageEntry::class);
    }

    /**
     * Find a language by its code.
     *
     * @param string $code
     * @return Language|null
     */
    public static function findByCode(string $code): ?Language
    {
        return static::where('code', $code)->first();
    }
}
