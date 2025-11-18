<?php
namespace Helgispbru\EvolutionCMS\Translations\Controllers;

use Helgispbru\EvolutionCMS\Translations\Traits\TranslationsLanguageClass;
use Helgispbru\EvolutionCMS\Translations\Traits\TranslationsLanguageEntryClass;
use Helgispbru\EvolutionCMS\Translations\Traits\TranslationsLanguageGroupClass;

class TranslationsController
{
    use TranslationsLanguageClass;
    use TranslationsLanguageGroupClass;
    use TranslationsLanguageEntryClass;

    // загрузить в базу из файлов
    public function importToDB()
    {
        // todo
        //
        // core/custom/langs -> db

        return response([
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }

    // выгрузить в файлы из базы
    public function exportToFiles()
    {
        // todo
        //
        // db -> core/custom/langs

        return response([
            'timestamp' => Carbon::now()->toISOString(),
        ]);
    }
}
