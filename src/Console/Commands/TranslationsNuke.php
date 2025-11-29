<?php
namespace Helgispbru\EvolutionCMS\Translations\Console\Commands;

use Helgispbru\EvolutionCMS\Translations\Controllers\ImportExportController;
use Illuminate\Console\Command;

class TranslationsNuke extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'translations:nuke

        { --only-groups=                : Only delete given groups (split,by,commas), ex: admin/employer,frontend/* }
    ';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete translations from the database';

    /** @var \Helgispbru\EvolutionCMS\Translations\Controllers\ImportExportController */
    protected $manager;

    public function __construct(ImportExportController $manager)
    {
        $this->manager = $manager;
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Set options from the command context
        $options = [
            'only-groups' => $this->option('only-groups'),
        ];

        $warning = 'Are you entirely sure you want to delete ' . (isset($options['only-groups']) ? 'translations for given groups?' : 'all translations?');

        if ($this->confirm("\e[31m{$warning}\e[0m")) {
            $this->manager->deleteTranslations($options);
            $this->info('Translations have been deleted.');
        } else {
            $this->warn('Deleting cancelled.');
        }
    }
}
