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
    private function rulesEntry(Request $request, $ignoreKey = null): array
    {
        $uniqueRule = Rule::unique('language_entries', 'key')
            ->where('language_group_id', (int) $request->input('group'));

        if ($ignoreKey) {
            // костыль ебучий - надо получить id любой записи с парой group-key,
            // если хотя бы одна такая есть, то не уникальное
            $ignore = LanguageEntry::where('key', $ignoreKey)
                ->where('language_group_id', (int) $request->input('group_id'))
                ->first();

            $uniqueRule = $uniqueRule->ignore($ignore->id);
        }

        return [
            'group' => 'required|integer|exists:language_groups,id',
            'key' => ['required', 'string', 'max:255', $uniqueRule],
            'value' => 'string|max:255',
        ];
    }

    private function rulesEntryKey(Request $request, $ignoreKey = null): array
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
        ];
    }

    // список записей
    public function getEntries(Request $request)
    {
        $values = new LanguageEntry();

        $req = $request->all();

        // фильтр снаружи таблицы - не используется
        /*
        if (isset($req['search']['value']) && !empty($req['search']['value'])) {
            $values = $values->where('code', 'like', '%' . $req['search']['value'] . '%')
                ->orWhere('title', 'like', '%' . $req['search']['value'] . '%');
        }
        */

        // подстановка полей
        $substfields = [
            // в таблице => в базе
            'group' => 'language_group_id',
            'key' => 'key',
        ];

        // фильтр по колонкам
        foreach ($req['columns'] as $col) {
            if (!isset($col['columnControl'])) {
                continue;
            }

            $colname = $substfields[$col['data']];

            // выбор из списка заданных значений
            if (isset($col['columnControl']['list'])) {
                $values = $values->whereIn($colname, array_values($col['columnControl']['list']));
            }
            // свободный поиск
            if (isset($col['columnControl']['search'])) {
                // value logic type
                $type = $col['columnControl']['search']['type'];
                $logic = $col['columnControl']['search']['logic'];
                $value = $col['columnControl']['search']['value'];

                switch ($logic) {
                    case 'contains':
                        $values = $values->where($colname, 'like', '%' . $value . '%');
                        break;
                    case 'notContains':
                        $values = $values->where($colname, 'not like', '%' . $value . '%');
                        break;
                    case 'equal':
                        $values = $values->where($colname, $value);
                        break;
                    case 'notEqual':
                        $values = $values->where($colname, '!=', $value);
                        break;
                    case 'starts':
                        $values = $values->where($colname, 'like', $value . '%');
                        break;
                    case 'ends':
                        $values = $values->where($colname, 'like', '%' . $value);
                        break;
                    case 'empty':
                        $values = $values->where($colname, '');
                        break;
                    case 'notEmpty':
                        $values = $values->where($colname, '!=', '');
                        break;
                }
            }
        }

        // сортировка
        if (isset($req['order'])) {
            // только по 1 колонке
            $col_id = $req['order'][0]['column'];
            $field = $req['columns'][$col_id]['data'];

            switch ($req['order'][0]['dir']) {
                case 'asc':
                    $values = $values->orderBy($substfields[$field], 'asc');
                    break;
                case 'desc':
                    $values = $values->orderBy($substfields[$field], 'desc');
                    break;
            }
        }

        // один (первый) язык
        $language = Language::oldest()
            ->first();
        $values = $values->where('language_id', $language->id);

        // общее количество
        $count = $values->count();

        // страницы
        if (isset($req['start'])) {
            $values = $values->skip($req['start']);
        }
        if (isset($req['length'])) {
            $values = $values->take($req['length']);
        }

        // сколько отфильтровано
        $filtered = $values->count();

        $values = $values
            ->get();

        // добавить списки строк
        $rows = LanguageEntry::whereIn('key', $values->pluck('key'))
            ->join('languages', 'language_entries.language_id', '=', 'languages.id')
            ->select('language_entries.*')
            ->with('language')
            ->orderBy('languages.title', 'asc')
            ->get()
            ->groupBy(['language_group_id', 'key']);

        $languages = Language::orderBy('title', 'asc')
            ->pluck('title', 'id')
            ->toArray();
        $groups = LanguageGroup::orderBy('title', 'asc')
            ->pluck('title', 'id')
            ->toArray();

        $values = $values->map(function ($item) use ($rows, $languages, $groups) {
            // все строки по языкам
            $item->rows = $rows[$item->language_group_id][$item->key];
            //
            // $item->language = $languages[$item->language_id];
            $item->group = $groups[$item->language_group_id];
            return $item;
        });

        // добавить ColumnControl для DataTables
        $column_control = [];
        // по группе
        $column_control['group'] = LanguageGroup::orderBy('title', 'asc')
            ->pluck('title', 'id')
            ->map(function ($val, $key) {
                return ['label' => $val, 'value' => $key];
            })
            ->values();

        return response([
            'draw' => (int) $request->input('draw'),
            'recordsTotal' => $count, // всего
            'recordsFiltered' => $filtered, // отфильтровано
            'data' => $values->toArray(),
            "columnControl" => $column_control,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // создать строку перевода
    public function createEntry(Request $request)
    {
        $data = $request->only('group', 'key', 'value');
        $data['key'] = Str::slug($data['key'], '_');

        $validator = Validator::make($data, $this->rulesEntry($request));

        if ($validator->fails()) {
            return response()
                ->json([
                    'error' => __('evocms-translations::entry.error_create'),
                    'errors' => $validator->errors(),
                    'timestamp' => Carbon::now()->toISOString(),
                ], 400);
        }

        $validated = $validator->validated();

        $languages = Language::all();
        $created = 0;

        // создать для всех языков
        foreach ($languages->toArray() as $el) {
            $entry = LanguageEntry::create([
                'language_id' => $el['id'],
                'language_group_id' => $validated['group'],
                'key' => $validated['key'],
                'value' => $validated['value'],
            ]);

            if (!$entry) {
                return response()->json([
                    'error' => __('evocms-translations::entry.error_create'),
                    'timestamp' => Carbon::now()->toISOString(),
                ], 400);
            }

            $created++;
        }

        return response([
            'created' => $created,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // обновить ключ
    public function updateEntryKey(Request $request, $group_id, $key_id)
    {
        // проверка существования $group_id, $key_id в middleware ExistsKey
        $request->merge(['group_id' => $group_id]);

        $data = $request->only('key');
        $data['key'] = Str::slug($data['key'], '_');

        $validator = Validator::make($data, $this->rulesEntryKey($request, $data['key']));

        if ($validator->fails()) {
            return response()
                ->json([
                    'error' => __('evocms-translations::entry.error_update'),
                    'errors' => $validator->errors(),
                    'timestamp' => Carbon::now()->toISOString(),
                ], 400);
        }

        $validated = $validator->validated();

        $res = LanguageEntry::where('id', $key_id)
            ->where('language_group_id', $group_id)
            ->first();

        $entry = LanguageEntry::where('key', $res->key)
            ->where('language_group_id', $group_id)
            ->update([
                'key' => $validated['key'],
            ]);

        if (!$entry) {
            return response()->json([
                'error' => __('evocms-translations::entry.error_update'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 400);
        }

        return response([
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // удалить ключ
    public function deleteEntryKey(Request $request, $group_id, $key_id)
    {
        // проверка $group_id, $key_id, в middleware

        $entry = LanguageEntry::find($key_id);

        try {
            $deleted = LanguageEntry::where('key', $entry->key)
                ->where('language_group_id', $group_id)
                ->delete();
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::entry.error_delete'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 400);
        }

        return response([
            'updated' => $updated,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // обновить значение
    public function updateEntryValue(Request $request, $group_id, $key_id, $language_id)
    {
        // проверка существования $group_id, $key_id, $language_id в middleware ExistsEntry

        $data = $request->only('value');

        $validator = Validator::make($data, [
            'value' => 'string|max:255',
        ]);

        if ($validator->fails()) {
            return response()
                ->json([
                    'error' => __('evocms-translations::entry.error_update'),
                    'errors' => $validator->errors(),
                    'timestamp' => Carbon::now()->toISOString(),
                ], 400);
        }

        $validated = $validator->validated();

        $entry = LanguageEntry::where('id', $key_id)
        // ->where('language_group_id', $group_id)
        // ->where('language_id', $language_id)
            ->update([
                'value' => $validated['value'],
            ]);

        if (!$entry) {
            return response()->json([
                'error' => __('evocms-translations::entry.error_update'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 400);
        }

        return response([
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // удалить значение
    public function deleteEntryValue(Request $request, $group_id, $key_id, $language_id)
    {
        // проверка $group_id, $key_id, $language_id в middleware

        try {
            $updated = LanguageEntry::where('id', $key_id)
            // ->where('language_group_id', $group_id)
            // ->where('language_id', $language_id)
                ->update([
                    'value' => null,
                ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::entry.error_delete'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 400);
        }

        return response([
            'updated' => $updated,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }
}
