<?php
namespace Helgispbru\EvolutionCMS\Translations\Middleware;

use Closure;

class Auth
{
    public function handle($request, Closure $next)
    {
        if (!isset($_SESSION['mgrValidated'])) {
            return response()->json([
                'error' => __('evocms-translations::middleware.error_nologin'),
            ], 401);
        }

        // define('IN_MANAGER_MODE', true);
        evo()->setContext('mgr');

        if (!evo()->getLoginUserID()) { // 'mgr'
            return response()->json([
                'error' => __('evocms-translations::middleware.error_nologin'),
            ], 401);
        }

        return $next($request);
    }
}
