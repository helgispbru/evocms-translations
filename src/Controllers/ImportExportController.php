<?php
namespace Helgispbru\EvolutionCMS\Translations\Controllers;

use Helgispbru\EvolutionCMS\Translations\Models\Language;
use Helgispbru\EvolutionCMS\Translations\Models\LanguageEntry;
use Helgispbru\EvolutionCMS\Translations\Models\LanguageGroup;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class ImportExportController
{
    const LOGGING = [
        'info' => "\033[32m%s\033[0m",
        'error' => "\033[41m%s\033[0m",
        'warn' => "\033[33m%s\033[0m",
        'danger' => "\033[31m%s\033[0m",
    ];

    const LANG = '/custom/lang';

    /** @var \Illuminate\Contracts\Foundation\Application */
    protected $app;
    /** @var \Illuminate\Filesystem\Filesystem */
    protected $files;
    /** @var \Illuminate\Contracts\Events\Dispatcher */
    protected $events;

    /** @var \Illuminate\Console\Command; */
    public $command;

    /** @var array $options */
    protected $options;

    /** @var array $languages */
    protected $languages = [];
    /** @var array $groups */
    protected $groups = [];

    /**
     * Constructor.
     * @param Application $app
     * @param Filesystem $files
     * @param Dispatcher $events
     */
    public function __construct(Application $app, Filesystem $files, Dispatcher $events)
    {
        $this->app = $app;
        $this->files = $files;
        $this->events = $events;
    }

    ###########################################
    #
    #   Импорт
    #
    ###########################################

    /**
     * Загрузка строк переводов.
     * @param array $options
     * @return int|mixed
     */
    public function importTranslations($options = [])
    {
        $this->options = $options;

        // Где расположены файлы с языками
        $base = $this->app['path'] . self::LANG;

        $counter = 0;

        $localeIds = Language::all()
            ->pluck('id');

        // Собрать папки с языками
        foreach ($this->files->directories($base) as $langPath) {
            // Получить язык из пути
            $locale = basename($langPath);

            $localeId = Language::where('code', $locale)
                ->value('id');

            if (!$localeId) {
                $created = Language::create([
                    'code' => Str::slug($locale, '_'),
                    'title' => $locale,
                ]);

                $localeId = $created->id;

                // если нет языка
                //throw new Exception("Locale '{$locale}' not found");
            }

            // Если язык может быть импортирован и не в списке ignore-locales
            if ($this->localeCanBeImported($locale)) {
                error_log(sprintf(self::LOGGING['info'], "Processing locale '{$locale}'"));

                // Цикл по всем файлам в языке
                foreach ($this->files->allfiles($langPath) as $file) {
                    $info = pathinfo($file);
                    $group = $info['filename'];

                    $groupId = LanguageGroup::where('code', $group)
                        ->value('id');

                    if (!$groupId) {
                        $created = LanguageGroup::create([
                            'code' => Str::slug($group, '_'),
                            'title' => $group,
                        ]);

                        $groupId = $created->id;

                        // если нет группы
                        //throw new Exception("Group '{$group}' not found");
                    }

                    // Разобраться с разделителями
                    $subLangPath = str_replace($langPath . DIRECTORY_SEPARATOR, '', $info['dirname']);
                    $subLangPath = str_replace(DIRECTORY_SEPARATOR, '/', $subLangPath);
                    $langPath = str_replace(DIRECTORY_SEPARATOR, '/', $langPath);

                    if ($subLangPath != $langPath) {
                        $group = $subLangPath . '/' . $group;
                    }

                    if ($this->groupCanBeProcessed($group)) {
                        $entries = include $file;

                        // Цикл по всем строкам переводов
                        if ($entries && is_array($entries)) {
                            // Вложенные архивы преобразовать в точки 'auth' => [ 'login' => 'Login', ] будет auth.login
                            foreach (Arr::dot($entries) as $key => $value) {
                                // импорт строк
                                if ($this->importTranslation($key, $value, $localeId, $groupId) === true) {
                                    $counter++;
                                }

                                // Другие языки для этого ключа, создать если нет
                                foreach ($localeIds as $id) {
                                    $created = LanguageEntry::firstOrCreate(
                                        [
                                            'language_id' => $id,
                                            'language_group_id' => $groupId,
                                            'key' => $key,
                                        ],
                                        [
                                            'value' => null,
                                        ]
                                    );

                                    if ($created) {
                                        $counter++;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                error_log(sprintf(self::LOGGING['warn'], "Skipping locale '{$locale}'"));
            }
        }

        return $counter;
    }

    /**
     * Создание/обновление строки перевода
     * @param $key
     * @param $value
     * @param $localeId
     * @param $groupId
     * @return bool
     */
    public function importTranslation($key, $value, $localeId, $groupId)
    {
        if (is_array($value)) {
            return false;
        }

        $entry = LanguageEntry::where('language_id', $localeId)
            ->where('language_group_id', $groupId)
            ->where('key', $key)
            ->first();

        // Если строка перевода есть
        if ($entry) {
            // Разрешено замещать строки
            if ($this->options['overwrite']) {
                // Обновить
                $entry = LanguageEntry::where('language_id', $localeId)
                    ->where('language_group_id', $groupId)
                    ->where('key', $key)
                    ->update([
                        'value' => $value,
                    ]);

                return true;
            }
        } else {
            // Создать
            $entry = LanguageEntry::create([
                'language_id' => $localeId,
                'language_group_id' => $groupId,
                'key' => $key,
                'value' => $value,
            ]);

            return true;
        }

        return false;
    }

    ###########################################
    #
    #   Эспорт
    #
    ###########################################

    /**
     * Выгрузка всех строк переводов.
     * @param $options
     */
    public function exportTranslations($options)
    {
        $this->options = $options;

        // Получить все языки
        $this->languages = Language::all()
            ->pluck('code', 'id');

        // Получить все группы
        $this->groups = LanguageGroup::all()
            ->pluck('code', 'id');

        foreach ($this->groups as $groupId => $groupCode) {
            $this->processExportForGroup($groupId);
        }
    }

    /**
     * Обработка экспорта для группы.
     * @param $groupId
     */
    public function processExportForGroup($groupId)
    {
        if ($this->groupCanBeProcessed($this->groups[$groupId])) {
            error_log(sprintf(self::LOGGING['info'], "Exporting group '{$this->groups[$groupId]}'"));

            // Получить переводы для группы
            $entries = LanguageEntry::where('language_group_id', $groupId)
                ->get();

            // Сделать дерево для группы
            $tree = $this->makeTree($entries);

            $this->exportTranslationGroup($tree, $groupId);
        }
    }

    /**
     * Сохранить дерево в файлы.
     * @param $tree
     * @param $groupId
     */
    public function exportTranslationGroup(&$tree, $groupId)
    {
        $base = $this->app['path'] . self::LANG;

        // По всем группам
        foreach ($tree as $languageId => $groups) {
            if (isset($groups[$groupId])) {
                // Записи для текущей группы
                $entries = $groups[$groupId];

                // Убрать внутренние массивы, где значение null
                $filteredEntries = array_map([self::class, 'deepFilterNull'], $entries);
                // Убрать строки, где значение null
                $filteredEntries = array_filter($filteredEntries, fn($value) => $value !== null);

                // Путь к языку из языка и группы
                $localePath = $this->languages[$languageId] . DIRECTORY_SEPARATOR . $this->groups[$groupId];

                // Массив из соседей
                $subfolders = explode(DIRECTORY_SEPARATOR, $localePath);
                // Убрать последний элемент (это файл php)
                array_pop($subfolders);

                $subfolder_level = '';
                // Цикл по подпапкам, чтобы проверить полный путь
                foreach ($subfolders as $subfolder) {
                    // Определить путь к текущей папке
                    $subfolder_level = $subfolder_level . $subfolder . DIRECTORY_SEPARATOR;
                    // Построить путь
                    $temp_path = rtrim($base . DIRECTORY_SEPARATOR . $subfolder_level, DIRECTORY_SEPARATOR);

                    // Если нет - создать
                    if (!is_dir($temp_path)) {
                        mkdir($temp_path, 0775, true);
                    }
                }
                // Теперь путь проверен

                $filePath = $base . DIRECTORY_SEPARATOR . $localePath . '.php';

                // Подготовить и записать в файл
                $output = "<?php\n\nreturn " . $this->fancyVarExport($filteredEntries) . ';' . \PHP_EOL;
                $this->files->put($filePath, $output);

                // error_log(sprintf(self::LOGGING['info'], "Group '{$this->groups[$groupId]}' for '{$this->languages[$languageId]}' written"));
            }
        }
    }

    /**
     * Построить массив с деревом переводов.
     * @param object $entries
     * @return array
     */
    protected function makeTree($entries)
    {
        $array = [];

        foreach ($entries as $entry) {
            $languageId = $entry->language_id;
            $groupId = $entry->language_group_id;

            // Построить массив вида locale => groups => keys => value
            Arr::set(
                $array[$languageId][$groupId],
                $entry->key,
                $entry->value
            );
        }

        return $array;
    }

    ###########################################
    #
    #   Удалить
    #
    ###########################################

    public function deleteTranslations($options = [])
    {
        if (empty($options['only-groups'])) {
            $deleted = LanguageEntry::query()->delete();

            error_log(sprintf(self::LOGGING['info'], "Deleted {$deleted} entries."));
            return true;
        }

        $counter = 0;
        $groups = explode(',', $options['only-groups']);

        foreach ($groups as $group) {
            if (Str::endsWith($group, '/*')) {
                $group = str_replace('*', '%', $group);
                $deletedCount = LanguageEntry::whereHas('languageGroup', function ($query) use ($group) {
                    $query->where('code', 'like', $group);
                })->delete();
            } else {
                $deletedCount = LanguageEntry::whereHas('languageGroup', function ($query) use ($group) {
                    $query->where('code', $group);
                })->delete();
            }

            $counter += $deletedCount;
        }

        error_log(sprintf(self::LOGGING['info'], "Deleted {$counter} entries."));
        return true;
    }

    ###########################################
    #
    #   Functions
    #
    ###########################################

    /**
     * Checks if a locale can be imported
     * @param $locale
     * @return bool
     */
    public function localeCanBeImported($locale): bool
    {
        if (is_null($this->options['ignore-locales'])) {
            return true;
        }
        return !in_array($locale, explode(',', $this->options['ignore-locales']));
    }

    /**
     * Checks if a group can be processed
     * @param $group
     * @return bool
     */
    public function groupCanBeProcessed($group): bool
    {
        $canProcess = false;
        $ignore = false;

        if (!is_null($this->options['only-groups'])) {
            $groupsToProcess = explode(',', $this->options['only-groups']);

            // Loop through all groups that were set in the options
            foreach ($groupsToProcess as $groupToProcess) {
                // If the option ends in a wildcard
                if (Str::endsWith($groupToProcess, '/*')) {
                    // Check if the group being checked starts with the group in the option
                    $groupToProcess = substr($groupToProcess, 0, -2);
                    if (Str::startsWith($group, $groupToProcess)) {
                        $canProcess = true;
                    }
                } elseif ($groupToProcess == $group) {
                    $canProcess = true;
                }
            }
        } else {
            $canProcess = true;
        }

        if (!is_null($this->options['ignore-groups'])) {
            $groupsToIgnore = explode(',', $this->options['ignore-groups']);

            // Loop through all groups that were set in the options
            foreach ($groupsToIgnore as $groupToIgnore) {
                // If the option ends in a wildcard
                if (Str::endsWith($groupToIgnore, '/*')) {
                    // Check if the group being checked starts with the group in the option
                    $groupToIgnore = substr($groupToIgnore, 0, -2);
                    if (Str::startsWith($group, $groupToIgnore)) {
                        $ignore = true;
                    }
                } elseif ($groupToIgnore == $group) {
                    $ignore = true;
                }
            }
        }

        return ($canProcess && !$ignore);
    }

    /**
     * Makes the default var_export fancy
     * @param $expression
     * @return string|string[]|null
     */
    private function fancyVarExport($expression)
    {
        $export = var_export($expression, true);
        // Patterns to replace parts
        $transformPatterns = [
            "/array \(/" => '[', // Matches all array opening functions and brackets
            "/(?<![\S])\)/" => ']', // Matches all closing brackets (can only be preceded by a space)
            "/(?<==> )" . PHP_EOL . "/" => '', // Matches the newlines before array opening brackets
            "/(?<==>)[ ]*(?=\[)/" => ' ', // Matches all white space between an arrow and an opening bracket
        ];
        $export = preg_replace(array_keys($transformPatterns), array_values($transformPatterns), $export);
        // Patterns to double up on whitespace
        $indentPatterns = [
            "/(?<!=>)[ ]+(?='[\w])/", // Matches all spaces before a translation
            "/[ ]+(?=[\]])/", // Matches all spaces before a closing bracket
        ];

        $export = preg_replace_callback(
            array_values($indentPatterns),
            function ($matches) {
                return str_repeat($matches[0], 2);
            },
            $export
        );

        return $export;
    }

    /**
     * Убрать внутренние строки где значение null.
     * @param string|array $value
     * @return
     */
    private static function deepFilterNull($value)
    {
        if (is_array($value)) {
            $result = [];

            foreach ($value as $key => $item) {
                $filtered = self::deepFilterNull($item);

                if ($filtered !== null) {
                    $result[$key] = $filtered;
                }
            }
            return empty($result) ? null : $result;
        }

        return $value !== null ? $value : null;
    }
}
