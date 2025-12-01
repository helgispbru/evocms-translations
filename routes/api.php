<?php
use Helgispbru\EvolutionCMS\Translations\Controllers\TranslationsController;
use Helgispbru\EvolutionCMS\Translations\Middleware\Auth;
use Helgispbru\EvolutionCMS\Translations\Middleware\ExistsGroup;
use Helgispbru\EvolutionCMS\Translations\Middleware\ExistsKey;
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
                Route::get('/', [TranslationsController::class, 'getLanguages'])->name('languages.index');
                // создать язык
                Route::post('/', [TranslationsController::class, 'createLanguage'])->name('languages.create');

                Route::group([
                    'prefix' => '{language_id}',
                    'middleware' => [
                        ExistsLanguage::class,
                    ],
                    'where' => ['language_id' => '[0-9]+'],
                ], function () {
                    // получить язык
                    Route::get('/', [TranslationsController::class, 'getLanguage'])->name('languages.get');
                    // обновить язык
                    Route::put('/', [TranslationsController::class, 'updateLanguage'])->name('languages.update');
                    // удалить язык
                    Route::delete('/', [TranslationsController::class, 'deleteLanguage'])->name('languages.delete');
                });
            });

            // -- группы
            Route::group([
                'prefix' => 'groups',
            ], function () {
                // список групп
                Route::get('/', [TranslationsController::class, 'getGroups'])->name('groups.index');
                // создать группу
                Route::post('/', [TranslationsController::class, 'createGroup'])->name('groups.create');

                Route::group([
                    'prefix' => '{group_id}',
                    'middleware' => [
                        ExistsGroup::class,
                    ],
                    'where' => ['group_id' => '[0-9]+'],
                ], function () {
                    // получить группу
                    Route::get('/', [TranslationsController::class, 'getGroup'])->name('groups.get');
                    // обновить группу
                    Route::put('/', [TranslationsController::class, 'updateGroup'])->name('groups.update');
                    // удалить группу
                    Route::delete('/', [TranslationsController::class, 'deleteGroup'])->name('groups.delete');
                });
            });

            // -- строки
            Route::group([
                'prefix' => 'entries',
            ], function () {
                // список строк
                Route::get('/', [TranslationsController::class, 'getEntries'])->name('entries.index');
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
                    // по ключу
                    Route::group([
                        'prefix' => 'key/{key_id}',
                        'middleware' => [
                            ExistsKey::class,
                        ],
                    ], function () {
                        // - обновить ключ
                        Route::put('/', [TranslationsController::class, 'updateEntryKey'])->name('entries.key.update');

                        // - удалить ключ
                        Route::delete('/', [TranslationsController::class, 'deleteEntryKey'])->name('entries.key.delete');

                        // - по языку
                        Route::group([
                            'prefix' => 'language/{language_id}',
                            'middleware' => [
                                ExistsLanguage::class,
                            ],
                            'where' => ['language_id' => '[0-9]+'],
                        ], function () {
                            // -- обновить значение ключа
                            Route::put('/', [TranslationsController::class, 'updateEntryValue'])->name('entries.value.update');

                            // -- очистить значение ключа
                            Route::delete('/', [TranslationsController::class, 'deleteEntryValue'])->name('entries.value.delete');
                        });
                    });
                });
            });
        });
    });
});
