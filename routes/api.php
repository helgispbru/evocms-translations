<?php
use Helgispbru\EvolutionCMS\Translations\Controllers\TranslationsController;
use Helgispbru\EvolutionCMS\Translations\Middleware\Auth;
use Helgispbru\EvolutionCMS\Translations\Middleware\ExistsEntry;
use Helgispbru\EvolutionCMS\Translations\Middleware\ExistsGroup;
use Helgispbru\EvolutionCMS\Translations\Middleware\ExistsLanguage;
use Helgispbru\EvolutionCMS\Translations\Middleware\SetLocale;

// -- группа api
Route::group([
    'prefix' => 'api',
], function () {
    // -- группа модули
    Route::group([
        'prefix' => 'module',
    ], function () {
        // -- модуль translations
        Route::group([
            'prefix' => 'translations',
            'middleware' => [
                Auth::class, // логин в целом
                SetLocale::class, // установка локали если передано
            ],
        ], function () {
            // загрузить из файлов (импорт в базу)
            Route::get('import', [TranslationsController::class, 'importEntries'])->name('entries.import');
            // выгрузить в файлы (экспорт из базы)
            Route::get('export', [TranslationsController::class, 'exportEntries'])->name('entries.export');

            // -- языки
            Route::group([
                'prefix' => 'languages',
            ], function () {
                // список языков
                Route::get('/', [TranslationsController::class, 'getLanguages'])->name('languages.pages');
                // создать язык
                Route::post('/', [TranslationsController::class, 'createLanguage'])->name('languages.create');

                Route::group([
                    'prefix' => '{language_id}',
                    'middleware' => [
                        ExistsLanguage::class,
                    ],
                    'where' => ['language_id' => '[0-9]+'],
                ], function () {
                    // изменение одного поля
                    Route::patch('/', [TranslationsController::class, 'patchLanguage'])->name('languages.patch');
                    // удалить язык
                    Route::delete('/', [TranslationsController::class, 'deleteLanguage'])->name('languages.delete');
                });
            });

            // -- группы
            Route::group([
                'prefix' => 'groups',
            ], function () {
                // список групп
                Route::get('/', [TranslationsController::class, 'getGroups'])->name('groups.pages');
                // список групп без paginator
                Route::get('/list', [TranslationsController::class, 'getGroupsList'])->name('groups.list');
                // создать группу
                Route::post('/', [TranslationsController::class, 'createGroup'])->name('groups.create');

                Route::group([
                    'prefix' => '{group_id}',
                    'middleware' => [
                        ExistsGroup::class,
                    ],
                    'where' => ['group_id' => '[0-9]+'],
                ], function () {
                    // изменение одного поля
                    Route::patch('/', [TranslationsController::class, 'patchGroup'])->name('groups.patch');
                    // удалить группу
                    Route::delete('/', [TranslationsController::class, 'deleteGroup'])->name('groups.delete');
                });
            });

            // -- строки
            Route::group([
                'prefix' => 'entries',
            ], function () {
                // список строк
                Route::get('/', [TranslationsController::class, 'getEntries'])->name('entries.pages');
                // создать строку
                Route::post('/', [TranslationsController::class, 'createEntry'])->name('entries.create');

                // по группе
                Route::group([
                    'prefix' => 'group/{group_id}',
                    'middleware' => [
                        ExistsGroup::class,
                    ],
                    'where' => ['group_id' => '[0-9]+'],
                ], function () {
                    // изменения ключа
                    Route::patch('key', [TranslationsController::class, 'patchKey'])->name('entries.patch.key');
                    // удаление ключа
                    Route::delete('key', [TranslationsController::class, 'deleteKey'])->name('entries.delete.key');
                });

                // для строки
                Route::group([
                    'prefix' => '{entry_id}',
                    'middleware' => [
                        ExistsEntry::class,
                    ],
                    'where' => ['entry_id' => '[0-9]+'],
                ], function () {
                    // изменение значения поля
                    Route::patch('/', [TranslationsController::class, 'patchEntry'])->name('entries.patch.value');
                });
            });
        });
    });
});
