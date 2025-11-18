<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTableLanguagesCreateTable extends Migration
{
    private $tbl = 'languages';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable($this->tbl)) {
            Schema::create($this->tbl, function (Blueprint $table) {
                $table->id();
                $table->char('code', 2)->unique()->comment('language code');
                $table->string('title', 20)->comment('language title');
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
