<?php
namespace Helgispbru\EvolutionCMS\Translations\Middleware;

use Closure;

class SetLocale
{
    public function handle($request, Closure $next)
    {
        $data = request()->only('locale');

        if (isset($data['locale'])) {
            app()->setLocale($data['locale']);
        }

        return $next($request);
    }
}
