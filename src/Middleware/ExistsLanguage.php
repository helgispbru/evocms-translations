<?php
namespace Helgispbru\EvolutionCMS\Translations\Middleware;

use Closure;
use Helgispbru\EvolutionCMS\Translations\Models\Language;

class ExistsLanguage
{
    public function handle($request, Closure $next)
    {
        $id = $request->route('language_id');

        $language = Language::find($id);

        if (!$language) {
            return response()->json([
                'error' => __('evocms-translations::language.error_notfound'),
            ], 404);
        }

        return $next($request);
    }
}
