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
    // --- rules

    private function rulesLanguage(Request $request, $ignoreId = null): array
    {
        $keys = array_keys($request->all());
        $rules = [];

        foreach ($keys as $key) {
            switch ($key) {
                // language title
                case 'title':
                    $rules['title'] = 'required|max:20';
                    break;

                // language code
                case 'code':
                    $rules['code'] = ['required', 'max:2'];
                    if ($ignoreId) {
                        // обновить
                        $rules['code'][] = Rule::unique('languages', 'code')
                            ->ignore($ignoreId, 'id');
                    } else {
                        // создать
                        $rules['code'][] = 'unique:languages,code';
                    }
                    break;
            }
        }

        return $rules;
    }

    // --- methods

    // список языков
    public function getLanguages(Request $request)
    {
        // страницы
        // $onpage = 10; // default
        $onpage = (int) $request->input('size', 10);

        $values = new Language();

        $req = $request->all();

        // не реализовано
        // фильтр
        if (isset($req['search']['value']) && !empty($req['search']['value'])) {
            $values = $values->where('code', 'like', $req['search']['value'] . '%')
                ->orWhere('title', 'like', $req['search']['value'] . '%');
        }

        // сортировка (только по 1 параметру)
        if (isset($req['sort'])) {
            $values = $values->orderBy($req['sort'][0]['field'], $req['sort'][0]['dir']);
        }

        $paginator = $values->paginate($onpage);

        return response($paginator);
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
                ], 422); // Unprocessable Entity
        }

        $validated = $validator->validated();

        // 1) добавить язык
        try {
            $language = Language::create($validated);
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::language.error_create'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 500); // internal error
        }

        // 2) добавить строки для языка
        $added = LanguageEntry::createEntriesForNewLanguage($language->id);

        return response([
            'id' => $language->id,
            'added' => $added,
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
            ], 500); // internal error
        }

        // 2) удалить сам язык
        try {
            $deleted = Language::where('id', $language_id)
                ->delete();
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::language.error_delete'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 500); // internal error
        }

        return response([
            'deleted' => $deleted,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // изменение одного поля в строке языка
    public function patchLanguage(Request $request, $language_id)
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
                ], 422); // Unprocessable Entity
        }

        $validated = $validator->validated();

        try {
            $updated = Language::where('id', $language_id)
                ->update($validated);
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::language.error_update'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 500); // internal error
        }

        return response([
            'updated' => $updated,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }
}
