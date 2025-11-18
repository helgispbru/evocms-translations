<?php
namespace Helgispbru\EvolutionCMS\Translations\Middleware;

use Closure;
use Helgispbru\EvolutionCMS\Translations\Models\LanguageGroup;

class ExistsGroup
{
    public function handle($request, Closure $next)
    {
        $id = $request->route('group_id');

        $group = LanguageGroup::find($id);

        if (!$group) {
            return response()->json([
                'error' => __('evocms-translations::group.error_notfound'),
            ], 404);
        }

        return $next($request);
    }
}
