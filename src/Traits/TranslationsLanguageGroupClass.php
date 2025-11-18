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
        $code_rules = ['required', 'max:255'];

        if ($ignoreId) {
            // обновить
            $code_rules[] = Rule::unique('language_groups', 'code')
                ->ignore($ignoreId, 'id');
        } else {
            // создать
            $code_rules[] = 'unique:language_groups,code';
        }

        return [
            'code' => $code_rules,
            'title' => 'required|max:255',
        ];
    }

    // список групп
    public function getGroups(Request $request)
    {
        $values = new LanguageGroup();

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
                ], 400);
        }

        $validated = $validator->validated();

        try {
            $group = LanguageGroup::create([
                'code' => $validated['code'],
                'title' => $validated['title'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::group.error_create'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 400);
        }

        return response([
            'created' => true,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // получить группу
    public function getGroup(Request $request, $group_id)
    {
        // проверка существования $group_id в middleware ExistsGroup

        return response([
            'data' => LanguageGroup::find($group_id),
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // обновить группу
    public function updateGroup(Request $request, $group_id)
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
                ], 400);
        }

        $validated = $validator->validated();

        try {
            $updated = LanguageGroup::where('id', $group_id)
                ->update([
                    'code' => $validated['code'],
                    'title' => $validated['title'],
                ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::group.error_update'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 400);
        }

        return response([
            'updated' => $updated,
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
            ], 400);
        }

        // 2) удалить саму группу
        try {
            $deleted = LanguageGroup::where('id', $group_id)
                ->delete();
        } catch (\Exception $e) {
            return response()->json([
                'error' => __('evocms-translations::group.error_delete'),
                'timestamp' => Carbon::now()->toISOString(),
            ], 400);
        }

        return response([
            'deleted' => $deleted,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }
}
