<?php
namespace Helgispbru\EvolutionCMS\Translations\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LanguageEntry extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'language_entries';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'language_id',
        'language_group_id',
        'key',
        'value',
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
     * Get the language that owns the language entry.
     */
    public function language(): BelongsTo
    {
        return $this->belongsTo(Language::class);
    }

    /**
     * Get the language group that owns the language entry.
     */
    public function languageGroup(): BelongsTo
    {
        return $this->belongsTo(LanguageGroup::class);
    }

    /**
     * Find a language entry by language, group, and key.
     *
     * @param int $languageId
     * @param int $languageGroupId
     * @param string $key
     * @return LanguageEntry|null
     */
    public static function findByCompositeKey(int $languageId, int $languageGroupId, string $key): ?LanguageEntry
    {
        return static::where('language_id', $languageId)
            ->where('language_group_id', $languageGroupId)
            ->where('key', $key)
            ->first();
    }

    /**
     * Scope a query to only include entries for a specific language.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $languageId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForLanguage($query, int $languageId)
    {
        return $query->where('language_id', $languageId);
    }

    /**
     * Scope a query to only include entries for a specific language group.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $languageGroupId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForLanguageGroup($query, int $languageGroupId)
    {
        return $query->where('language_group_id', $languageGroupId);
    }

    /**
     * Scope a query to only include entries for a specific key.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $key
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForKey($query, string $key)
    {
        return $query->where('key', $key);
    }

    /**
     * Copy entries for a new language based on existing language entries.
     *
     * @param int $sourceLanguageId
     * @param int $targetLanguageId
     * @return int Number of created entries
     */
    public static function copyEntriesForNewLanguage(int $sourceLanguageId, int $targetLanguageId): int
    {
        // Get all unique language_group_id and key pairs from the source language
        $existingEntries = static::where('language_id', $sourceLanguageId)
            ->select('language_group_id', 'key', 'value')
            ->get();

        $createdCount = 0;

        foreach ($existingEntries as $entry) {
            // Check if entry already exists for the target language
            $existingEntry = static::findByCompositeKey(
                $targetLanguageId,
                $entry->language_group_id,
                $entry->key
            );

            // If entry doesn't exist, create it
            if (!$existingEntry) {
                static::create([
                    'language_id' => $targetLanguageId,
                    'language_group_id' => $entry->language_group_id,
                    'key' => $entry->key,
                    'value' => $entry->value, // You might want to modify this (e.g., empty string or translated value)
                ]);
                $createdCount++;
            }
        }

        return $createdCount;
    }

    /**
     * Create entries for a new language using all existing language groups and keys.
     * This method uses all available entries as a base, not just from one source language.
     *
     * @param int $targetLanguageId
     * @return int Number of created entries
     */
    public static function createEntriesForNewLanguage(int $targetLanguageId): int
    {
        // Get all unique language_group_id and key pairs from all languages
        $existingPairs = static::select('language_group_id', 'key')
            ->distinct()
            ->get();

        $createdCount = 0;

        foreach ($existingPairs as $pair) {
            // Check if entry already exists for the target language
            $existingEntry = static::findByCompositeKey(
                $targetLanguageId,
                $pair->language_group_id,
                $pair->key
            );

            // If entry doesn't exist, create it with empty value
            if (!$existingEntry) {
                static::create([
                    'language_id' => $targetLanguageId,
                    'language_group_id' => $pair->language_group_id,
                    'key' => $pair->key,
                    'value' => '', // Empty value for new language
                ]);
                $createdCount++;
            }
        }

        return $createdCount;
    }
}
