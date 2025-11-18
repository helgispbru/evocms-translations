<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableLanguageEntriesCreateTable extends Migration
{
    private $tbl = 'language_entries';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable($this->tbl)) {
            Schema::create($this->tbl, function (Blueprint $table) {
                $table->id();
                $table->foreignId('language_id')
                    ->constrained('languages')
                    ->cascadeOnDelete();
                $table->foreignId('language_group_id')
                    ->constrained('language_groups')
                    ->cascadeOnDelete();
                $table->string('key', 255)->comment('entry key');
                $table->string('value', 255)->nullable()->comment('entry value');
                $table->timestamps();

                // Составной уникальный ключ
                $table->unique(['language_id', 'language_group_id', 'key']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists($this->tbl);
    }
}
