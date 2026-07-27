# Birth Prep Board — MVP Spec

Персональний вебзастосунок для підготовки до пологів на двох
користувачів (household). Стек і конвенції — див. `CLAUDE.md` у корені
репозиторію. Цей документ фіксує обсяг MVP, модель даних Supabase та
структуру екранів, узгоджені під час брейнштормінгу.

## 1. Обсяг MVP

**Входить:**

- Auth через Supabase (email/пароль).
- Household на двох людей, приєднання партнера через invite-код.
- Dashboard: timeline тижнів вагітності 20–40 (обмежено діапазоном, без
  edge-case обробки виходу за межі), прогрес = поточний тиждень з
  20–40 **і окремо** "виконано X з Y пунктів" по всіх чеклістах, блок
  "фокус тижня" з `week_content`.
- 7 чекліст-розділів, кожен окремий route: `/documents`,
  `/hospital-bag` (з підрозділами мама/малюк/тато), `/baby-items`,
  `/home`, `/medical`, `/people-logistics`, `/postpartum`.
- Кожен пункт чекліста: назва, опціональна ціна, checkbox, ознака
  seed/custom; можна додавати власні пункти.
- `/budget`: одна "банка" — ціль (редагована), план (сума всіх цін),
  факт (сума цін позначених пунктів). Модель — розділ 3.
- `/settings`: редагування ПДР (перераховує timeline на льоту) +
  постійний показ invite-коду household.
- Спільний layout з навігацією між усіма розділами.

**Явно поза MVP:** завантаження файлів/фото, нагадування/пуш,
календар подій/зустрічей, кастомізація/перейменування розділів,
персоналізація seed-контенту за тегами онбордингу, декілька бюджетних
"банок" по категоріях.

## 2. Модель даних (Supabase / Postgres)

```
households
  id, invite_code (unique, короткий alphanumeric), created_at

household_members
  id, household_id → households, user_id → auth.users
  role (owner | partner)  -- інформаційне поле, на права доступу не впливає
  unique (household_id, user_id)

pregnancies
  id, household_id → households (unique, 1:1)
  due_date, city_hospital, birth_type, first_pregnancy (bool)

budget_goals
  id, household_id → households (unique, 1:1)
  goal_amount

sections        -- public read-only довідник
  id, key, title_uk, sort_order

seed_items      -- public read-only шаблон, окремо від items
  id, section_id → sections, subsection (nullable, check in ('mom','baby','dad'))
  title, default_price (nullable), sort_order

week_content    -- public read-only, 21 рядок (тижні 20..40)
  week_number (PK), title, tip

items           -- household_id NOT NULL (без "шаблонних" NULL-рядків)
  id, household_id → households, section_id → sections
  subsection (nullable, check in ('mom','baby','dad')), title, price (nullable)
  is_checked (bool), is_seed (bool), sort_order, created_at
```

### Індекси

```
household_members(user_id)         -- без нього кожна RLS-перевірка seq scan
items(household_id, section_id)
```

## 3. Модель бюджету

- `ціль` (goal) — редагована сума, задається при онбордингу, змінна
  пізніше з `/budget`.
- `заплановано` (plan) = `SUM(price)` по всіх `items` household з
  вказаною ціною, незалежно від `is_checked`.
- `витрачено` (fact) = `SUM(price)` по `items`, де `is_checked = true`.
- UI показує прогрес банки як `факт` відносно `цілі`, `заплановано` —
  довідково поруч.

## 4. Онбординг

1. Signup/login (Supabase Auth). Після логіну — перевірка наявності
   рядка в `household_members`. Немає → екран "Створити" / "Приєднатись
   за кодом".
2. **Створити:** форма (ПДР, місто/пологовий, тип пологів, ціль
   бюджету, перша вагітність) → RPC `onboarding_create_household(...)`,
   `SECURITY INVOKER`, одна атомарна транзакція. `id` household
   генерується заздалегідь у змінну, а не через `INSERT ... RETURNING
   id` — на момент вставки рядка в `household_members` ще немає, і
   `RETURNING` під RLS теж проходить перевірку SELECT policy, яка на
   цьому кроці нічого не пропустить. Генерація `invite_code` обгорнута
   в retry-цикл на `unique_violation` (до 5 спроб).

```sql
create or replace function onboarding_create_household(
  p_due_date date,
  p_city_hospital text,
  p_birth_type text,
  p_first_pregnancy boolean,
  p_goal_amount numeric
)
returns uuid
security invoker
set search_path = public
as $$
declare
  v_household_id uuid := gen_random_uuid();
  v_code text;
  v_attempt int := 0;
begin
  loop
    v_attempt := v_attempt + 1;
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    begin
      insert into households (id, invite_code) values (v_household_id, v_code);
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then
        raise exception 'invite_code_collision';
      end if;
    end;
  end loop;

  insert into household_members (household_id, user_id, role)
  values (v_household_id, auth.uid(), 'owner');

  insert into pregnancies (household_id, due_date, city_hospital, birth_type, first_pregnancy)
  values (v_household_id, p_due_date, p_city_hospital, p_birth_type, p_first_pregnancy);

  insert into budget_goals (household_id, goal_amount)
  values (v_household_id, p_goal_amount);

  insert into items (household_id, section_id, subsection, title, price, is_checked, is_seed, sort_order)
  select v_household_id, section_id, subsection, title, default_price, false, true, sort_order
  from seed_items;

  return v_household_id;
end;
$$ language plpgsql;
```

   RLS діє від імені юзера на кожному кроці; попередні insert-и в межах
   тієї ж транзакції вже видимі наступним (MVCC), тож ланцюжок
   not-null-membership → items спрацьовує без часткового стану при
   збої. `invite_code_collision` — практично недосяжна помилка (5
   невдалих 8-символьних колізій поспіль), але явний exception кращий
   за мовчазний збій.
3. **Приєднатись за кодом:** RPC `join_household_by_code(code)`,
   **єдина `SECURITY DEFINER` функція в системі**, `SET search_path =
   public`. Знаходить household за кодом з `FOR UPDATE` — без локу
   перевірка `< 2` учасників не атомарна: два одночасні join-и в READ
   COMMITTED обидва побачать `count = 1` і вставлять третього
   учасника. Insert обгорнутий в обробку `unique_violation` (потребує
   `unique (household_id, user_id)`, розділ 2): без цього owner, що
   випадково вводить власний invite-код, пройде перевірку `count = 1`
   і вставить другий рядок для того ж `user_id`, назавжди зробивши
   household "full" для реального партнера. Помилки
   `invite_code_not_found` / `household_full` / `already_member` →
   інлайн-текст.

```sql
create or replace function join_household_by_code(code text)
returns uuid
security definer
set search_path = public
as $$
declare
  target_household_id uuid;
  member_count int;
begin
  select id into target_household_id
  from households
  where invite_code = code
  for update;

  if target_household_id is null then
    raise exception 'invite_code_not_found';
  end if;

  select count(*) into member_count from household_members where household_id = target_household_id;
  if member_count >= 2 then
    raise exception 'household_full';
  end if;

  begin
    insert into household_members (household_id, user_id, role)
    values (target_household_id, auth.uid(), 'partner');
  exception when unique_violation then
    raise exception 'already_member';
  end;

  return target_household_id;
end;
$$ language plpgsql;
```

## 5. RLS policies

RLS вмикається окремо на кожній таблиці через `alter table ...
enable row level security` — включно з `sections`, `seed_items`,
`week_content`. Без цього рядка `policy true` не має сенсу: таблиця
залишається повністю відкритою.

| Таблиця | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `households` | член: `id IN (SELECT household_id FROM household_members WHERE user_id = (select auth.uid()))` | будь-який автентифікований юзер; у застосунку викликається лише з onboarding RPC | — | — |
| `household_members` | `user_id = (select auth.uid())` (без рекурсії; бачить лише свій рядок) | `WITH CHECK (user_id = (select auth.uid()))` — owner-шлях у onboarding RPC; partner-шлях виключно через `join_household_by_code` (DEFINER) | — | — |
| `pregnancies` | член household* | член household (onboarding RPC) | член household — редагування ПДР у `/settings` | — |
| `budget_goals` | член household* | член household (onboarding RPC) | член household — редагування цілі у `/budget` | — |
| `items` | член household* | член household — додавання свого пункту + копіювання seed при онбордингу | член household — checkbox/ціна | член household — видалення власного пункту |
| `sections`, `seed_items`, `week_content` | `true` (усі автентифіковані) | — | — | — |

\* «член household» = `household_id IN (SELECT household_id FROM household_members WHERE user_id = (select auth.uid()))`. Форма `(select auth.uid())` замість голого виклику — Postgres кешує її як initPlan один раз на запит, а не на кожен рядок; на `items` із сотнею рядків різниця відчутна.

Свідомий залишковий ризик: `household_members` INSERT (`user_id =
auth.uid()`) технічно дозволив би прямий self-insert, якби хтось
дізнався конкретний `household_id` в обхід `join_household_by_code`.
Оскільки `households` видимі лише членам, а UUID не вгадується — це
прийнятний trade-off для приватного застосунку на двох користувачів, а
не недогляд.

## 6. Error handling

- Форми (auth, онбординг, join-by-code) — інлайн-помилки українською
  під полем.
- Чекбокси/ціни/додавання пунктів — optimistic UI update, при помилці
  запису відкат + toast.
- `error.tsx` на рівні кожного route-сегмента (Next.js error boundary).
- Без retry/backoff, rate-limiting чи складної обробки — недоцільно для
  приватного інструменту на двох користувачів.

## 7. Тестування

- Vitest unit-тести лише для чистої логіки з найвищим ризиком помилки:
  `getCurrentWeek(dueDate)` (клемп 20–40), розрахунок `plan`/`fact`
  бюджету.
- Без e2e/інтеграційних тестів у MVP.
- Ручний чек-лист перед здачею: онбординг create + join у двох сесіях
  браузера, CRUD чеклістів, перерахунок бюджету, зміна ПДР у
  `/settings` зсуває timeline, `pnpm build` проходить чисто.
