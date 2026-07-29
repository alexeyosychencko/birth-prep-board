# MCP Stack — Tool Usage Guide

Перед використанням звір актуальний список серверів через `/mcp`.
Якщо потрібного інструмента немає — скажи про це, не вигадуй виклик
і не підміняй його пам'яттю.

## shadcn (project — `.mcp.json`)

Єдине джерело правди по компонентах UI.

| Коли | Що робити |
|------|-----------|
| Додаєш будь-який компонент | Спершу подивись у реєстрі, потім `shadcn add` |
| Пишеш розмітку з готовим компонентом | Звір props і структуру з реєстром |
| Не впевнений в API | Реєстр, не пам'ять |

Причина: проєкт на **Base UI**, не Radix, зі стилем `base-maia`.
Ця комбінація рідкісна в training-даних — props і структура файлів
відрізняються від класичного shadcn/ui. Пам'ять тут systematically
помиляється.

Файли в `src/components/ui/` руками не пишемо ніколи — тільки CLI.

## context7 (global plugin)

Документація всього іншого стеку.

| Бібліотека | Коли звірятись |
|------------|----------------|
| Next.js 16 (App Router) | routing, server/client components, metadata |
| React 19 | hooks, `use`, Server Components |
| Tailwind v4 | `@theme`, CSS-first config — **немає** `tailwind.config.js` |
| Base UI | будь-який primitive |
| next-themes | SSR, гідратація, FOUC |
| Supabase JS | клієнт, auth, RLS з боку клієнта |
| Vitest | конфіг, API |

Правило: якщо версія бібліотеки новіша за твої training-дані або
ти не впевнений у поточному API — context7, а не здогад.
Особливо Tailwind v4 і Next 16: тут пам'ять дає застарілі патерни
з v3 і Pages Router.

## hugeicons

Іконки — `@hugeicons/core-free-icons` (free, MIT).
Імена іконок не вигадуємо: беремо з пакета.
`@hugeicons-pro/*` не ставимо — платне.

## Ще не підключено

- **Supabase MCP** — додамо на етапі схеми й міграцій, read-only,
  прив'язаний до конкретного проєкту
- **browser MCP** — свідомо відкладено, UI перевіряється вручну