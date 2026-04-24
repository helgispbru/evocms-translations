<?php
namespace Helgispbru\EvolutionCMS\Translations\Middleware;

use Illuminate\Foundation\Http\Middleware\TrimStrings as Middleware;

class TrimStrings extends Middleware
{
    /**
     * The names of the attributes that should not be trimmed.
     *
     * @var array<int, string>
     */
    protected $except = [
        // 'password',
        // 'password_confirmation',
        // 'current_password',
        // Don't trim sensitive or formatted fields
        // 'api_key',
        // 'secret_token',
        // 'json_field' // if you need exact formatting
    ];
}
