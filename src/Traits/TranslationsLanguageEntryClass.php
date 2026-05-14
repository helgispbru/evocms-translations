<?php
namespace Helgispbru\EvolutionCMS\Translations\Traits;

use Carbon\Carbon;
use Helgispbru\EvolutionCMS\Translations\Models\Language;
use Helgispbru\EvolutionCMS\Translations\Models\LanguageEntry;
use Helgispbru\EvolutionCMS\Translations\Models\LanguageGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

// --- строки
trait TranslationsLanguageEntryClass
{
    // --- rules

    private function rulesEntryCreate(Request $request, $ignoreKey = null): array
    {
        $uniqueRule = Rule::unique('language_entries', 'key')
            ->where('language_group_id', (int) $request->input('group_id'));

        if ($ignoreKey) {
            // костыль ебучий - надо получить id любой записи с парой group-key,
            // если хотя бы одна такая есть, то не уникальное
            $ignore = LanguageEntry::where('key', $ignoreKey)
                ->where('language_group_id', (int) $request->input('group_id'))
                ->first();

            $uniqueRule = $uniqueRule->ignore($ignore->id);
        }

        return [
            'group_id' => 'required|integer|exists:language_groups,id',
            'key' => ['required', 'string', 'max:255', $uniqueRule],
            'value' => 'required|string|max:255',
        ];
    }

    // правила редактирования значения
    private function rulesEntryEdit(Request $request, $ignoreKey = null): array
    {
        return [
            'value' => 'string|max:255',
        ];
    }

    // правила редактирования ключа
    private function rulesKeyEdit(Request $request, $ignoreKey = null): array
    {
        $uniqueRule = Rule::unique('language_entries', 'key')
            ->where('language_group_id', (int) $request->input('group_id'));

        if ($ignoreKey) {
            // костыль ебучий - надо получить id любой записи с парой group-key,
            // если хотя бы одна такая есть, то не уникальное
            $ignore = LanguageEntry::where('key', $ignoreKey)
                ->where('language_group_id', (int) $request->input('group_id'))
                ->first();

            $uniqueRule = $uniqueRule->ignore($ignore->id);
        }

        return [
            'key' => ['required', 'string', 'max:255', $uniqueRule],
            'keyOld' => ['required', 'string'],
        ];
    }

    // правила удаления ключа
    private function rulesKeyDelete(Request $request): array
    {
        return [
            'key' => ['required', 'string', 'max:255'],
        ];
    }

    // --- methods

    // список записей
    public function getEntries(Request $request)
    {
        // страницы
        $perPage = (int) $request->input('perPage', 25);

        $group_id = (int) $request->input('group_id');

        $group = LanguageGroup::find($group_id);

        if (!$group) {
            return response()->json([
                'error' => __('evocms-translations::group.error_notfound'),
            ], 404); // not found
        }

        $entriesQuery = LanguageEntry::query()
            ->with('language')
            ->where('language_group_id', $group_id)
            ->orderBy('key', 'asc');

        $paginator = $entriesQuery->paginate($perPage);

        return $paginator;
    }

    // создать строку перевода
    public function createEntry(Request $request)
    {
        $data = $request->only('group_id', 'key', 'value');
        $data['key'] = Str::slug($data['key'], '_');

        $validator = Validator::make($data, $this->rulesEntryCreate($request));

        if ($validator->fails()) {
            return response()
                ->json([
                    'error' => __('evocms-translations::entry.error_create'),
                    'errors' => $validator->errors(),
                    'timestamp' => Carbon::now()->toISOString(),
                ], 422); // Unprocessable Entity
        }

        $validated = $validator->validated();

        $languages = Language::all();
        $created = 0;

        // создать для всех языков
        foreach ($languages->toArray() as $el) {
            $entry = LanguageEntry::create([
                'language_id' => $el['id'],
                'language_group_id' => $validated['group_id'],
                'key' => $validated['key'],
                'value' => $validated['value'],
            ]);

            if (!$entry) {
                return response()->json([
                    'error' => __('evocms-translations::entry.error_create'),
                    'timestamp' => Carbon::now()->toISOString(),
                ], 500); // internal error
            }

            $created++;
        }

        return response([
            'created' => $created,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // изменение одного поля в строке языка
    public function patchEntry(Request $request, $entry_id)
    {
        // проверка существования $entry_id в middleware ExistsEntry

        $data = $request->only('value');

        $validator = Validator::make($data, $this->rulesEntryEdit($request, $entry_id));

        if ($validator->fails()) {
            return response()
                ->json([
                    'error' => __('evocms-translations::entry.error_update'),
                    'errors' => $validator->errors(),
                    'timestamp' => Carbon::now()->toISOString(),
                ], 422); // Unprocessable Entity
        }

        $validated = $validator->validated();

        $validated['value'] = trim($validated['value']);

        try {
            $updated = LanguageEntry::query()
                ->where('id', $entry_id)
                ->update($validated);
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::entry.error_update'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 500); // internal error
        }

        return response([
            'updated' => $updated,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // обновить ключ
    public function patchKey(Request $request, $group_id)
    {
        // проверка существования $group_id в middleware ExistsGroup

        $request->merge(['group_id' => $group_id]);

        $data = $request->only('key', 'keyOld');
        $data['key'] = Str::slug($data['key'], '_');

        $validator = Validator::make($data, $this->rulesKeyEdit($request, $data['key']));

        if ($validator->fails()) {
            return response()
                ->json([
                    'error' => __('evocms-translations::entry.error_update'),
                    'errors' => $validator->errors(),
                    'timestamp' => Carbon::now()->toISOString(),
                ], 422); // Unprocessable Entity
        }

        $validated = $validator->validated();

        try {
            $updated = LanguageEntry::query()
                ->where('key', $validated['keyOld'])
                ->where('language_group_id', $group_id)
                ->update([
                    'key' => $validated['key'],
                ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::entry.error_update'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 500); // internal error
        }

        return response([
            'updated' => $updated,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // удалить ключ
    public function deleteKey(Request $request, $group_id)
    {
        // проверка $group_id в middleware

        $data = $request->only('key');

        $validator = Validator::make($data, $this->rulesKeyDelete($request));

        if ($validator->fails()) {
            return response()
                ->json([
                    'error' => __('evocms-translations::entry.error_delete'),
                    'errors' => $validator->errors(),
                    'timestamp' => Carbon::now()->toISOString(),
                ], 422); // Unprocessable Entity
        }

        $validated = $validator->validated();

        try {
            $deleted = LanguageEntry::where('key', $validated['key'])
                ->where('language_group_id', $group_id)
                ->delete();
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::entry.error_delete'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 500); // internal error
        }

        return response([
            'deleted' => $deleted,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }
}
