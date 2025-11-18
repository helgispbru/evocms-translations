# Модуль Translations

Модуль Translations для EvolutionCMS v3

## Установка автоматически

_дописать!_

## Установка вручную

1. добавить в `composer.json` в список репозиториев

```json
"repositories": [
    {
        "type": "path",
        "url": "packages/helgispbru/evocms-translations"
    }
]
```

2. скопировать файлы в `core/custom/packages/helgispbru`

3. открыть терминал и перейти в `core`, а там запустить

```shell
php -d="memory_limit=-1" artisan package:installrequire helgispbru/evocms-translations "^1"

; установка только фронта в assets
php artisan vendor:publish --tag="assets" --force

; или
; php artisan vendor:publish --provider="Helgispbru\EvolutionCMS\Translations\TranslationsServiceProvider" --force
```
