<?php
namespace Helgispbru\EvolutionCMS\Translations\Middleware;

use Closure;
use Helgispbru\EvolutionCMS\Translations\Models\LanguageEntry;

class ExistsEntry
{
    public function handle($request, Closure $next)
    {
        $id = $request->route('id');

        $entry = LanguageEntry::find($id);

        if (!$entry) {
            return response()->json([
                'error' => __('evocms-translations::entry.error_notfound'),
            ], 404);
        }

        return $next($request);
    }
}
