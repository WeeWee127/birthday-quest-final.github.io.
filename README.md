# Birthday Quest

Статичний мобільний веб-квест (HTML + CSS + vanilla JS). Без бекенду, API і build-кроку.

## Запуск
- Локально: відкрити `index.html` у браузері.
- GitHub Pages: створити repository → завантажити всі файли (разом із папкою `assets/`) → **Settings → Pages → Deploy from branch → main → / (root) → Save** → відкрити згенероване посилання.

## Структура
```
index.html   — усі екрани
style.css    — стилі (в кінці файлу блок MISSION 02)
script.js    — логіка; конфіг на самому початку
assets/
  icons/favicon.svg
  audio/     — сюди music.mp3 (необов'язково)
  images/    — зображення (необов'язково)
```

## Що де міняти (початок `script.js`)
| Що | Де |
|---|---|
| Ім'я | `birthdayConfig.name` |
| Колір | `birthdayConfig.accentColor` |
| Привітання і побажання | `birthdayConfig.greeting`, `birthdayConfig.wishes` |
| Музика | `birthdayConfig.music` (файл `assets/audio/music.mp3`) |
| Питання MEMORY CODE | `memoryCodeConfig.questions` |

Питання: `hint` — текст, `answers` — 3 варіанти, `correctIndex` — номер правильного (0, 1, 2), `digit` — цифра коду **від 0 до 9**. Питань має бути рівно 4 (чотири комірки в `index.html`).

## Прогрес
Зберігається в localStorage. Скинути: кнопка **RESET QUEST** або очистити дані сайту.
Музика вмикається лише після START QUEST (обмеження телефонів); без файлу сайт працює без помилок.
