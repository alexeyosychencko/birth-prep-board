# Birth Prep Board — MVP Spec

Персональний вебзастосунок для підготовки до пологів на двох
користувачів (household). Стек і конвенції — див. `CLAUDE.md` у корені
репозиторію. Цей документ фіксує обсяг MVP, модель даних Supabase та
структуру екранів, узгоджені під час брейнштормінгу.

## 1. Обсяг MVP

**Входить:**

- Auth через Supabase (email/пароль).
- Household на двох людей, приєднання партнера через invite-код.
- Dashboard:
  - timeline: реальний тиждень вагітності 0–42 (без клемпу до 20),
    прогрес = `week / 40`. Діапазон 20–40 стосується лише наявності
    `week_content`, не самого тижня чи прогресу.
  - блок "фокус тижня": при `week < 20` — заглушка "контент
    починається з 20-го тижня" (контент 20-го тижня не показується);
    при `week > 40` — мітка "40+", контент 40-го тижня і окрема
    помітка, що термін минув.
  - блок **"Пора зробити"** (головний блок сторінки): невідмічені
    items з `target_week <= поточний тиждень`, від найстаріших.
  - блок "Наступного тижня": невідмічені items з
    `target_week = поточний тиждень + 1`.
  - прогрес по чеклістах: "виконано X з Y пунктів" по всіх items.
  - стан бюджету: похідне `витрачено` відносно `goal_amount`.
- 7 чекліст-розділів, кожен окремий route: `/documents`,
  `/hospital-bag` (з підрозділами мама/малюк/тато), `/baby-items`,
  `/home`, `/medical`, `/people-logistics`, `/postpartum`.
- Кожен пункт чекліста: назва, опціональна ціна, checkbox, ознака
  seed/custom; можна додавати власні пункти.
- `/budget`: одна "банка" — ціль (редагована), витрачено (похідне:
  за чеклістом + інші витрати), план (сума всіх цін) — довідково.
  Модель — розділ 3.
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
  id             uuid PK default gen_random_uuid()
  invite_code    text UNIQUE
                 рівно 8 символів з алфавіту без візуально схожих
                 (без 0/O, без 1/I): 23456789ABCDEFGHJKLMNPQRSTUVWXYZ
                 CHECK (invite_code IS NULL OR invite_code ~ '^[2-9A-HJ-NP-Z]{8}$')
                 -- коротший/ширший алфавіт брутфорситься через
                 -- join_household_by_code, яку RLS не спиняє.
                 -- NULLABLE (не NOT NULL): після приєднання партнера
                 -- (household заповнений) код інвалідується в NULL —
                 -- див. розділ 4, one-time use. unique дозволяє
                 -- декілька NULL-рядків одночасно, це очікувано.
  created_at     timestamptz NOT NULL DEFAULT now()

household_members
  id             uuid PK default gen_random_uuid()
  household_id   uuid NOT NULL → households
  user_id        uuid NOT NULL → auth.users
  role           text NOT NULL CHECK (role IN ('owner', 'partner'))
                 -- інформаційне поле, на права доступу не впливає
  unique (user_id)
  -- НЕ unique (household_id, user_id): застосунок побудований на
  -- припущенні "один household на юзера" (.single()-виклики,
  -- розрахунок бюджету по household); unique(household_id, user_id)
  -- дозволив би юзеру бути в двох household одночасно

pregnancies
  id                uuid PK default gen_random_uuid()
  household_id      uuid NOT NULL UNIQUE → households
  due_date          date NOT NULL
  city_hospital     text
  birth_type        text
  first_pregnancy   boolean NOT NULL DEFAULT false

budget_goals
  id             uuid PK default gen_random_uuid()
  household_id   uuid NOT NULL UNIQUE → households
  goal_amount    numeric(10,2) NOT NULL DEFAULT 0 CHECK (goal_amount >= 0)
                 -- numeric, не float: точне округлення в бюджеті
  other_expenses numeric(10,2) NOT NULL DEFAULT 0 CHECK (other_expenses >= 0)
                 -- витрати поза чеклістом, вводяться вручну. Витрати
                 -- за чеклістом — похідні від items.price, не тут
                 -- (розділ 3)

sections        -- public read-only довідник
  id           uuid PK default gen_random_uuid()
  key          text NOT NULL UNIQUE
  title_uk     text NOT NULL
  sort_order   int NOT NULL

seed_items      -- public read-only шаблон, окремо від items
  id              uuid PK default gen_random_uuid()
  section_id      uuid NOT NULL → sections
  subsection      text CHECK (subsection IN ('mom', 'baby', 'dad'))
  title           text NOT NULL
  default_price   numeric(10,2)
  target_week     int CHECK (target_week BETWEEN 1 AND 42)
                  -- тиждень, до якого пункт варто зробити; копіюється
                  -- в items при онбордингу (розділ 4)
  sort_order      int NOT NULL

week_content    -- public read-only, 21 рядок (тижні 20..40)
                -- діапазон 20..40 — це наявність контенту, не діапазон
                -- самого тижня вагітності (getCurrentWeek — 0..42,
                -- розділ 1)
  week_number   int PK CHECK (week_number BETWEEN 20 AND 40)
  title         text NOT NULL
  tip           text NOT NULL

items           -- household_id NOT NULL (без "шаблонних" NULL-рядків)
  id             uuid PK default gen_random_uuid()
  household_id   uuid NOT NULL → households
  section_id     uuid NOT NULL → sections
  subsection     text CHECK (subsection IN ('mom', 'baby', 'dad'))
                 -- НЕ NULL лише для секції hospital-bag, для решти
                 -- NULL. Це не звичайний table-level CHECK: перевірка
                 -- ключа секції вимагає join з sections, а CHECK не
                 -- бачить іншу таблицю. Реалізується BEFORE
                 -- INSERT/UPDATE тригером, що підтягує sections.key
                 -- за section_id і кидає виняток, якщо
                 -- (subsection IS NOT NULL AND key <> 'hospital-bag')
                 -- OR (subsection IS NULL AND key = 'hospital-bag').
  title          text NOT NULL
  price          numeric(10,2)
  target_week    int CHECK (target_week BETWEEN 1 AND 42)
                 -- тиждень, до якого пункт варто зробити. NULL — без
                 -- строку, пункт ніколи не потрапляє в блок "Пора
                 -- зробити" (розділ 1). Кастомні пункти: NULL за
                 -- замовчуванням, користувач може задати
  is_checked     boolean NOT NULL DEFAULT false
  is_seed        boolean NOT NULL DEFAULT false
  sort_order     int NOT NULL
                 -- для custom-пунктів: max(sort_order) + 1 у межах
                 -- (household_id, section_id) на момент створення
  created_at     timestamptz NOT NULL DEFAULT now()
```

### ON DELETE

```
household_members.household_id → households     ON DELETE CASCADE
household_members.user_id → auth.users           ON DELETE CASCADE
pregnancies.household_id → households             ON DELETE CASCADE
budget_goals.household_id → households             ON DELETE CASCADE
items.household_id → households                    ON DELETE CASCADE
items.section_id → sections                          ON DELETE RESTRICT
seed_items.section_id → sections                     ON DELETE RESTRICT
```

CASCADE тут навмисний і обмежений виключно household-даними:
видалення household або юзера прибирає лише те, що належить цьому
household. Додавати CASCADE до нових FK деінде без окремого
обговорення не можна.

### Індекси

```
household_members(user_id)         -- без нього кожна RLS-перевірка seq scan
items(household_id, section_id)
```

## 3. Модель бюджету

- `ціль` (`goal_amount`) — редагована сума, задається при онбордингу,
  змінна пізніше з `/budget`.
- `витрати з чекліста` (derived) = `SUM(price)` по `items` household,
  де `is_checked = true` і `price IS NOT NULL`.
- `other_expenses` — редагована сума, витрати поза пунктами
  чеклиста (наприклад, консультації, непередбачені покупки).
- `витрачено` (derived) = `витрати з чекліста` + `other_expenses`.
- `заплановано` (plan) = `SUM(price)` по всіх `items` household з
  вказаною ціною, незалежно від `is_checked` — довідково.
- UI показує прогрес банки як `витрачено` відносно `goal_amount`, з
  розбивкою на `витрати з чекліста` і `other_expenses` поруч; `plan`
  — довідково.

Причина: `spent_amount`, яке водночас вводилось вручну і "перевірялось"
сумою позначених пунктів, давало подвійний облік — позначив пункт на
800 і вписав 800 руками, разом 1600, і виявити це неможливо. Кожна
витрата має рівно одне джерело: за чекбоксом — ціна пункту, поза ним
— `other_expenses`.

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
   в retry-цикл на `unique_violation` (до 5 спроб); символи беруться з
   обмеженого алфавіту (розділ 2), а не з `md5`-hex — інакше код міг
   би містити `0`/`1`, заборонені CHECK-обмеженням.

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
  v_alphabet text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; -- без 0/O/1/I
  v_household_id uuid := gen_random_uuid();
  v_code text;
  v_attempt int := 0;
  i int;
begin
  loop
    v_attempt := v_attempt + 1;
    v_code := '';
    for i in 1..8 loop
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    end loop;
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

  insert into items (household_id, section_id, subsection, title, price, target_week, is_checked, is_seed, sort_order)
  select v_household_id, section_id, subsection, title, default_price, target_week, false, true, sort_order
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
   одна з двох `SECURITY DEFINER` функцій у системі (друга —
   `household_member_count`, розділ 7), `SET search_path = public`.
   `SECURITY DEFINER` обходить RLS, тому функція сама
   перевіряє `auth.uid() is not null` на вході — без цього guard
   анонімний виклик (якщо `execute` не відкликано) міг би вставити
   `NULL` як `user_id`. Явно: `revoke execute on function
   join_household_by_code from anon;` — RPC доступна лише
   `authenticated`. Знаходить household за кодом з `FOR UPDATE` — без
   локу перевірка `< 2` учасників не атомарна: два одночасні join-и в
   READ COMMITTED обидва побачать `count = 1` і вставлять третього
   учасника. Insert обгорнутий в обробку `unique_violation` (потребує
   `unique (household_id, user_id)`, розділ 2): без цього owner, що
   випадково вводить власний invite-код, пройде перевірку `count = 1`
   і вставить другий рядок для того ж `user_id`, назавжди зробивши
   household "full" для реального партнера. Після успішного
   приєднання партнера (тобто коли учасників стає 2) `invite_code`
   інвалідується — household розрахований на двох, а живий код після
   заповнення лишається постійною поверхнею для перебору. Помилки
   `invite_code_not_found` / `household_full` / `already_member` →
   інлайн-текст.

```sql
revoke execute on function join_household_by_code from anon;

create or replace function join_household_by_code(code text)
returns uuid
security definer
set search_path = public
as $$
declare
  target_household_id uuid;
  member_count int;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

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

  -- household тепер заповнений (2 учасники) — код більше не потрібен
  if member_count + 1 >= 2 then
    update households set invite_code = null where id = target_household_id;
  end if;

  return target_household_id;
end;
$$ language plpgsql;
```

## 5. RLS policies

RLS вмикається окремо на кожній таблиці через `alter table ...
enable row level security` — включно з `sections`, `seed_items`,
`week_content`. Без цього рядка `policy true` не має сенсу: таблиця
залишається повністю відкритою.

Для кожної UPDATE-політики нижче `WITH CHECK` навмисно **не ширший**
за `USING` — інакше клієнт PATCH-запитом переносить рядок у чужий
household (або, для `items`, в іншу секцію). Postgres RLS не дає
прямого доступу до "старого" значення колонки одночасно з "новим" в
одній політиці, тому там, де потрібно заборонити зміну конкретної
колонки (не просто перевірити членство), додатково потрібен `BEFORE
UPDATE` тригер — позначено окремо.

| Таблиця | SELECT (`USING`) | INSERT (`WITH CHECK`) | UPDATE `USING` | UPDATE `WITH CHECK` | DELETE (`USING`) |
|---|---|---|---|---|---|
| `households` | член* | будь-який автентифікований юзер; у застосунку викликається лише з onboarding RPC | член* — потрібно для ротації `invite_code` | член* (`id` — PK, не змінюється) | — |
| `household_members` | `user_id = (select auth.uid())` (без рекурсії; бачить лише свій рядок) | `user_id = (select auth.uid())` — owner-шлях у onboarding RPC; partner-шлях виключно через `join_household_by_code` (DEFINER) | — | — | `user_id = (select auth.uid())` — self-leave, лише власний рядок |
| `pregnancies` | член* | член* (onboarding RPC) | член* | член* | — |
| `budget_goals` | член* | член* (onboarding RPC) | член* | член* | — |
| `items` | член* | член* — додавання свого пункту + копіювання seed при онбордингу | член* | член* (post-update `household_id`); незмінність `household_id`/`section_id`/`subsection` на UPDATE — окремий `BEFORE UPDATE` тригер, той самий, що й у розділі 2 для `subsection` (RLS сама по собі не порівнює старе й нове значення) | член* — включно з seed-пунктами (`created_by` немає, розрізняти "чий" пункт нема як; див. «Ухвалені рішення») |
| `sections`, `seed_items`, `week_content` | `to authenticated using (true)` | — | — | — | — |

\* «член household» = `household_id IN (SELECT household_id FROM household_members WHERE user_id = (select auth.uid()))` (для `households` — `id IN (...)`). Форма `(select auth.uid())` замість голого виклику — Postgres кешує її як initPlan один раз на запит, а не на кожен рядок; на `items` із сотнею рядків різниця відчутна.

Свідомий залишковий ризик: `household_members` INSERT (`user_id =
auth.uid()`) технічно дозволив би прямий self-insert, якби хтось
дізнався конкретний `household_id` в обхід `join_household_by_code`.
Оскільки `households` видимі лише членам, а UUID не вгадується — це
прийнятний trade-off для приватного застосунку на двох користувачів, а
не недогляд.

## 6. Видалення та відновлення

Зараз вийти з household, прибрати помилково приєднаного учасника чи
отримати новий invite-код неможливо. Для застосунку на двох людей
"партнер приєднався не тим акаунтом" — найімовірніший реальний
інцидент, і без цього розділу він незворотний.

- **Self-leave.** `DELETE` на `household_members`, `USING (user_id =
  (select auth.uid()))` (розділ 5) — юзер прибирає лише власний
  рядок. Ролі це не потребує окремої гілки: і owner, і partner
  виходять однаково.
- **Ротація `invite_code`.** `UPDATE` на `households` дозволена лише
  членам (розділ 5, `households` UPDATE). Генерація нового коду
  повторює алгоритм онбордингу (розділ 4: 8 символів з алфавіту без
  `0/O/1/I`, retry на `unique_violation`) — щоб не дублювати логіку,
  винести в спільну `SECURITY INVOKER` функцію `rotate_invite_code()`,
  яку викликає і онбординг, і ротація з `/settings`.
- **Сценарій відновлення після "не той акаунт".** Помилково
  приєднаний учасник робить self-leave → `member_count` падає до 1,
  але `invite_code` лишається `NULL` (інвалідований при приєднанні,
  розділ 4) — сам факт виходу код не відновлює. Власник викликає
  ротацію, отримує новий код, передає реальному партнеру. Це і є
  єдиний спосіб відновлення: без ротації household лишився б без
  робочого invite-коду назавжди.
- **Останній учасник виходить.** `households` не має DELETE-політики
  (розділ 5) — рядок `households` і пов'язані `pregnancies` /
  `budget_goals` / `items` не видаляються автоматично, коли
  `household_members` для цього household спорожніє. Дані лишаються в
  БД, але недосяжні через RLS нікому (умова членства не виконується
  ні для кого). Повне видалення household (а не лише виходу з нього)
  — поза MVP; якщо знадобиться, це окрема, свідомо ухвалена дія, а не
  побічний ефект self-leave.

## 7. Видимість партнера

SELECT-політика на `household_members` навмисно нерекурсивна
(`user_id = (select auth.uid())`, розділ 5) — це рішення не
переглядається: рекурсивна умова ("бачити рядки інших членів свого
household") означала б `household_members`-політика, що читає
`household_members`, а це `infinite recursion` при першому ж запиті
(див. `.claude/rules/supabase.md`, розділ «RLS — критично», пункт 4).

Наслідок навмисний, а не недогляд: звичайний запит під RLS ніколи не
поверне більше одного рядка `household_members` (свого власного), тож
UI не може напряму дізнатись, чи партнер уже приєднався — обхід через
загальний SELECT неможливий у принципі, не лише небажаний.

Вирішується окремою функцією `household_member_count()`:

```sql
revoke execute on function household_member_count from anon;

create or replace function household_member_count()
returns int
security definer
set search_path = public
as $$
declare
  caller_household_id uuid;
  result int;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select household_id into caller_household_id
  from household_members
  where user_id = (select auth.uid());

  if caller_household_id is null then
    return 0;
  end if;

  select count(*) into result
  from household_members
  where household_id = caller_household_id;

  return result;
end;
$$ language plpgsql;
```

Без аргументів навмисно: `household_id` як параметр створив би
поверхню для зондування чужих household (перебір UUID + читання
чужого count), а guard на членство викликача лише прикрив би цю
поверхню, а не прибрав. Замість цього household визначається
всередині функції з `auth.uid()` — той самий підхід, що й у
`join_household_by_code`.

## 8. Ухвалені рішення

Явно зафіксовані рішення — щоб рев'ю не піднімало їх щоразу як баги:

1. **`DELETE` на `items` дозволяє видаляти й seed-пункти.** Свідомо:
   колонки `created_by` немає, розрізняти "чий" пункт технічно нема
   як. Наслідок відображено в розділі 5 (`items` DELETE — "член
   household", без застереження "лише власний").
2. **`INSERT` на `households` доступний будь-якому автентифікованому
   юзеру.** Обмеження "створювати household можна лише через
   онбординг" — на рівні застосунку (форма викликає лише RPC
   `onboarding_create_household`), не на рівні БД/RLS.
3. **`seed_items` не поширює зміни на вже створені household.**
   Пункти копіюються в `items` один раз при онбордингу (розділ 4);
   подальші правки `seed_items` не зачіпають наявні household.
   Персоналізація seed-контенту за household — поза MVP.
4. **Фаза 1 (локальна) — тестова.** Дані одноразові, міграція
   локальних даних у фазу 2 не передбачена. Реальне використання
   починається після підключення Supabase.
5. **Фаза 1 не відтворює sync між двома користувачами.** Сценарії
   "партнер ще не приєднався", ротація invite-коду і конфлікт
   одночасних правок проєктуються на фазі 2.
6. **Тиждень показується реальний.** Клемп до 20 прибрано як такий,
   що дає невірну інформацію; діапазон 20–40 лишився лише умовою
   наявності `week_content` (розділ 1).
7. **Витрачено — похідне число.** Редагується тільки "інші витрати"
   (`other_expenses`, поза чеклістом). Ціни відмічених пунктів
   входять автоматично (розділ 3).

## 9. Error handling

- Форми (auth, онбординг, join-by-code) — інлайн-помилки українською
  під полем.
- Чекбокси/ціни/додавання пунктів — optimistic UI update, при помилці
  запису відкат + toast.
- `error.tsx` на рівні кожного route-сегмента (Next.js error boundary).
- Без retry/backoff, rate-limiting чи складної обробки — недоцільно для
  приватного інструменту на двох користувачів.

## 10. Тестування

- Vitest unit-тести лише для чистої логіки з найвищим ризиком помилки:
  `getCurrentWeek(dueDate)` (діапазон 0–42, без клемпу), розрахунок
  `plan`, "витрат з чекліста" і похідного "витрачено" бюджету.
  `other_expenses` — ручне поле, не обчислюється, тестової логіки не
  потребує.
- Без e2e/інтеграційних тестів у MVP.
- Ручний чек-лист перед здачею: онбординг create + join у двох сесіях
  браузера, CRUD чеклістів, перерахунок бюджету, зміна ПДР у
  `/settings` зсуває timeline, `pnpm build` проходить чисто.
