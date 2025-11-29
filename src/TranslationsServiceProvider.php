<?php
namespace Helgispbru\EvolutionCMS\Translations;

use EvolutionCMS\ServiceProvider;
use Helgispbru\EvolutionCMS\Translations\Console\Commands\TranslationsExport;
use Helgispbru\EvolutionCMS\Translations\Console\Commands\TranslationsImport;
use Helgispbru\EvolutionCMS\Translations\Console\Commands\TranslationsNuke;

class TranslationsServiceProvider extends ServiceProvider
{
    protected $namespace = 'evocms-translations';

    // регистрация модуля
    protected $title = 'Translations';
    protected $icon  = 'fas fa-language'; // fontawesome 5
    // путь модуля
    protected $path = 'translations';

    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        // $this->app->registerRoutingModule(
        // $this->title,
        // __DIR__ . '/../routes/api.php'
        // );
        // -- или
        $this->loadRoutesFrom(__DIR__ . '/../routes/api.php');
    }

    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        $this->loadViewsFrom(__DIR__ . '/../resources/views', $this->namespace);
        $this->loadTranslationsFrom(__DIR__ . '/../resources/lang', $this->namespace);
        $this->loadMigrationsFrom(__DIR__ . '/../resources/migrations');

        // seeders
        // $this->publishes([
        // __DIR__ . '/../publishable/seeders' => EVO_CORE_PATH . 'database/seeders',
        // ], 'seeders');

        // Register the commands
        if ($this->app->runningInConsole()) {
            $this->commands([
                TranslationsImport::class,
                TranslationsExport::class,
                TranslationsNuke::class,
            ]);
        }

        // собранный фронт залить
        $this->publishes([
            __DIR__ . '/../publishable/module/dist' => MODX_BASE_PATH . 'assets/modules/' . $this->path . '/dist',
        ], 'assets');

        $modulePath = __DIR__ . '/../modules/index.php';

        if (file_exists($modulePath)) {
            $this->app->registerModule(
                $this->title,
                $modulePath,
                $this->icon,
                []
            );
        } else {
            throw new \Exception("Module file not found at: " . $modulePath);
        }
    }
}
