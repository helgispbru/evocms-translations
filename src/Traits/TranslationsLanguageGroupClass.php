<?php
namespace Helgispbru\EvolutionCMS\Translations\Traits;

use Carbon\Carbon;
use Helgispbru\EvolutionCMS\Translations\Models\LanguageEntry;
use Helgispbru\EvolutionCMS\Translations\Models\LanguageGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

// --- группы
trait TranslationsLanguageGroupClass
{
    private function rulesGroup(Request $request, $ignoreId = null): array
    {
        $keys = array_keys($request->all());
        $rules = [];

        foreach ($keys as $key) {
            switch ($key) {
                // group title
                case 'title':
                    $rules['title'] = 'required|max:255'; // required_without_all:code,
                    break;

                // group code
                case 'code':
                    $rules['code'] = ['required', 'max:255']; // 'required_without_all:title',
                    if ($ignoreId) {
                        // обновить
                        $rules['code'][] = Rule::unique('language_groups', 'code')
                            ->ignore($ignoreId, 'id');
                    } else {
                        // создать
                        $rules['code'][] = 'unique:language_groups,code';
                    }
                    break;
            }
        }

        return $rules;
    }

    // список языков
    public function getGroups(Request $request)
    {
        // страницы
        // $onpage = 10; // default
        $onpage = (int) $request->input('size', 10);

        $values = new LanguageGroup();

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

    // создать группу
    public function createGroup(Request $request)
    {
        $data = $request->only('code', 'title');
        $data['code'] = Str::slug($data['code'], '_');

        $validator = Validator::make($data, $this->rulesGroup($request));

        if ($validator->fails()) {
            return response()
                ->json([
                    'error' => __('evocms-translations::group.error_create'),
                    'errors' => $validator->errors(),
                    'timestamp' => Carbon::now()->toISOString(),
                ], 422); // Unprocessable Entity
        }

        $validated = $validator->validated();

        try {
            $group = LanguageGroup::create($validated);
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::group.error_create'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 500); // internal error
        }

        return response([
            'id' => $group->id,
            'added' => $added,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // удалить группу
    public function deleteGroup(Request $request, $group_id)
    {
        // проверка существования $group_id в middleware ExistsGroup

        // 1) удалить строки с языком
        try {
            $deleted = LanguageEntry::where('language_group_id', $group_id)
                ->delete();
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::group.error_delete'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 500); // internal error
        }

        // 2) удалить саму группу
        try {
            $deleted = LanguageGroup::where('id', $group_id)
                ->delete();
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::group.error_delete'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 500); // internal error
        }

        return response([
            'deleted' => $deleted,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // изменение одного поля в строке языка
    public function patchGroup(Request $request, $group_id)
    {
        // проверка существования $group_id в middleware ExistsGroup

        $data = $request->only('code', 'title');
        $data['code'] = Str::slug($data['code'], '_');

        $validator = Validator::make($data, $this->rulesGroup($request, $group_id));

        if ($validator->fails()) {
            return response()
                ->json([
                    'error' => __('evocms-translations::group.error_update'),
                    'errors' => $validator->errors(),
                    'timestamp' => Carbon::now()->toISOString(),
                ], 422); // Unprocessable Entity
        }

        $validated = $validator->validated();

        try {
            $updated = LanguageGroup::where('id', $group_id)
                ->update($validated);
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::group.error_update'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 500); // internal error
        }

        return response([
            'updated' => $updated,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }
}
