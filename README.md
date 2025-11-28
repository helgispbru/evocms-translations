# Модуль Translations

Модуль Translations для EvolutionCMS v3 это редактор для удобной правки языковых файлов в `/core/custom/lang` с промежуточным хранением в базе.

## Установка автоматически

**ВАЖНО:** сейчас недоступно

Зайти в консоль сервера, перейти в папку `core` и там выполнить:

```shell
php -d="memory_limit=-1" artisan package:installrequire helgispbru/evocms-translations "^1"

php artisan vendor:publish --tag="assets" --force
```

## Установка вручную

1. Добавить в `/core/custom/composer.json` в список репозиториев:

```json
"repositories": [
    {
        "type": "git",
        "url": "https://github.com/helgispbru/evocms-translations"
    }
]
```

2. Зайти в консоль сервера, перейти в папку `core` и там запустить

```shell
php -d="memory_limit=-1" artisan package:installrequire helgispbru/evocms-translations "^1"

; установка только фронта в assets
php artisan vendor:publish --tag="assets" --force

; или
; php artisan vendor:publish --provider="Helgispbru\EvolutionCMS\Translations\TranslationsServiceProvider" --force
```

## Описание

Код фронта модуля находится в `publishable/module`, написан с помощью vuejs3.

Для импорта и экспорта заимствован код у [WeDesignIt/laravel-translations-import](https://github.com/WeDesignIt/laravel-translations-import), спасибо ему!
