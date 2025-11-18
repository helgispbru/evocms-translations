<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableLanguageGroupsCreateTable extends Migration
{
    private $tbl = 'language_groups';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable($this->tbl)) {
            Schema::create($this->tbl, function (Blueprint $table) {
                $table->id();
                $table->string('code', 255)->unique()->comment('group code');
                $table->string('title', 255)->comment('group title');
                $table->timestamps();
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
