<?php
namespace Helgispbru\EvolutionCMS\Translations\Controllers;

use Carbon\Carbon;
use Helgispbru\EvolutionCMS\Translations\Controllers\ImportExportController;
use Helgispbru\EvolutionCMS\Translations\Traits\TranslationsLanguageClass;
use Helgispbru\EvolutionCMS\Translations\Traits\TranslationsLanguageEntryClass;
use Helgispbru\EvolutionCMS\Translations\Traits\TranslationsLanguageGroupClass;

class TranslationsController
{
    use TranslationsLanguageClass;
    use TranslationsLanguageGroupClass;
    use TranslationsLanguageEntryClass;

    // Класс для импорта и экспорта
    protected $importExport;

    public function __construct(ImportExportController $importExport)
    {
        $this->importExport = $importExport;
    }

    // Загрузить в базу из файлов
    public function importEntries()
    {
        // core/custom/langs -> db

        $options = [
            'overwrite' => true,
        ];

        $imported = $this->importExport->importTranslations($options);

        return response([
            'imported' => $imported,
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // Выгрузить в файлы из базы
    public function exportEntries()
    {
        // db -> core/custom/langs

        $options = [];

        $exported = $this->importExport->exportTranslations($options);

        return response([
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }
}
