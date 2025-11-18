<?php
namespace Helgispbru\EvolutionCMS\Translations\Traits;

use Carbon\Carbon;
use Helgispbru\EvolutionCMS\Translations\Models\Language;
use Helgispbru\EvolutionCMS\Translations\Models\LanguageEntry;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

// --- языки
trait TranslationsLanguageClass
{
    private function rulesLanguage(Request $request, $ignoreId = null): array
    {
        $code_rules = ['required', 'max:2'];

        if ($ignoreId) {
            // обновить
            $code_rules[] = Rule::unique('languages', 'code')
                ->ignore($ignoreId, 'id');
        } else {
            // создать
            $code_rules[] = 'unique:languages,code';
        }

        return [
            'code' => $code_rules,
            'title' => 'required|max:20',
        ];
    }

    // список языков
    public function getLanguages(Request $request)
    {
        $values = new Language();

        // общее количество
        $count = $values->count();

        $req = $request->all();

        // фильтр
        if (isset($req['search']['value']) && !empty($req['search']['value'])) {
            $values = $values->where('code', 'like', '%' . $req['search']['value'] . '%')
                ->orWhere('title', 'like', '%' . $req['search']['value'] . '%');
        }

        // сколько отфильтровано
        $filtered = $values->count();

        // сортировка (только по 1 параметру)
        if (isset($req['order'])) {
            $col_id = $req['order'][0]['column'];
            $field = $req['columns'][$col_id]['data'];

            switch ($req['order'][0]['dir']) {
                case 'asc':
                    $values = $values->orderBy($field, 'asc');
                    break;
                case 'desc':
                    $values = $values->orderBy($field, 'desc');
                    break;
            }
        }

        // страницы
        if (isset($req['start'])) {
            $values = $values->skip($req['start']);
        }
        if (isset($req['length'])) {
            $values = $values->take($req['length']);
        }

        $values = $values->get();

        return response([
            'draw' => (int) $request->input('draw'),
            'recordsTotal' => $count, // всего
            'recordsFiltered' => $filtered, // отфильтровано
            'data' => $values->toArray(),
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // создать язык
    public function createLanguage(Request $request)
    {
        $data = $request->only('code', 'title');
        $data['code'] = Str::slug($data['code'], '_');

        $validator = Validator::make($data, $this->rulesLanguage($request));

        if ($validator->fails()) {
            return response()
                ->json([
                    'error' => __('evocms-translations::language.error_create'),
                    'errors' => $validator->errors(),
                    'timestamp' => Carbon::now()->toISOString(),
                ], 400);
        }

        $validated = $validator->validated();

        // 1) добавить язык
        try {
            $language = Language::create([
                'code' => $validated['code'],
                'title' => $validated['title'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::language.error_create'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 400);
        }

        // 2) добавить строки для языка
        $added = LanguageEntry::createEntriesForNewLanguage($language->id);

        return response([
            'created' => true,
            'added' => $added,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // получить язык
    public function getLanguage(Request $request, $language_id)
    {
        // проверка существования $language_id в middleware ExistsLanguage

        return response([
            'data' => Language::find($language_id),
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // обновить язык
    public function updateLanguage(Request $request, $language_id)
    {
        // проверка существования $language_id в middleware ExistsLanguage

        $data = $request->only('code', 'title');
        $data['code'] = Str::slug($data['code'], '_');

        $validator = Validator::make($data, $this->rulesLanguage($request, $language_id));

        if ($validator->fails()) {
            return response()
                ->json([
                    'error' => __('evocms-translations::language.error_update'),
                    'errors' => $validator->errors(),
                    'timestamp' => Carbon::now()->toISOString(),
                ], 400);
        }

        $validated = $validator->validated();

        try {
            $updated = Language::where('id', $language_id)
                ->update([
                    'code' => $validated['code'],
                    'title' => $validated['title'],
                ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::language.error_update'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 400);
        }

        return response([
            'updated' => $updated,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // удалить язык
    public function deleteLanguage(Request $request, $language_id)
    {
        // проверка существования $language_id в middleware ExistsLanguage

        // 1) удалить строки с языком
        try {
            $deleted = LanguageEntry::where('language_id', $language_id)
                ->delete();
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::language.error_delete'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 400);
        }

        // 2) удалить сам язык
        try {
            $deleted = Language::where('id', $language_id)
                ->delete();
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::language.error_delete'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 400);
        }

        return response([
            'deleted' => $deleted,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }
}
