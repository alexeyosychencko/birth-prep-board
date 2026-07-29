import { SECTIONS } from "@/lib/sections"
import type { SeedItem } from "@/lib/types"

// These ids are permanent constants — like the section uuids in
// src/lib/sections.ts, they will seed the Phase 2 Supabase migration
// unchanged, so they must be valid uuid literals from the start.
let counter = 0
const nextOrder: Record<string, number> = {}
function seed(sectionId: string, title: string, defaultPrice: number | null, subsection: SeedItem["subsection"] = null): SeedItem {
  counter += 1
  const key = sectionId + (subsection ?? "")
  nextOrder[key] = (nextOrder[key] ?? 0) + 1
  return {
    id: `c2b3d440-0000-4000-9000-${counter.toString(16).padStart(12, "0")}`,
    section_id: sectionId,
    subsection,
    title,
    default_price: defaultPrice,
    sort_order: nextOrder[key],
  }
}

export const seedItems: SeedItem[] = [
  // Документи
  seed(SECTIONS.documents.id, "Паспорт", null, null),
  seed(SECTIONS.documents.id, "Довідка про присвоєння РНОКПП (ІПН)", null, null),
  seed(SECTIONS.documents.id, "Обмінна карта вагітної", null, null),
  seed(SECTIONS.documents.id, "Свідоцтво про шлюб (за наявності)", null, null),
  seed(SECTIONS.documents.id, "Договір з пологовим будинком (контрактні пологи)", null, null),
  seed(SECTIONS.documents.id, "Поліс добровільного медичного страхування (за наявності)", null, null),
  seed(SECTIONS.documents.id, "Реквізити рахунку для допомоги при народженні дитини", null, null),

  // Сумка в пологовий — мама
  seed(SECTIONS.hospitalBag.id, "Халат і тапочки", null, "mom"),
  seed(SECTIONS.hospitalBag.id, "Засоби гігієни", null, "mom"),
  seed(SECTIONS.hospitalBag.id, "Боді/сорочка для годування", null, "mom"),
  seed(SECTIONS.hospitalBag.id, "Компресійні панчохи", null, "mom"),
  seed(SECTIONS.hospitalBag.id, "Зарядка для телефону", null, "mom"),
  seed(SECTIONS.hospitalBag.id, "Вода і перекус", null, "mom"),
  // Сумка в пологовий — малюк
  seed(SECTIONS.hospitalBag.id, "Боді та повзунки (кілька комплектів)", null, "baby"),
  seed(SECTIONS.hospitalBag.id, "Шапочка і шкарпетки", null, "baby"),
  seed(SECTIONS.hospitalBag.id, "Підгузки для новонароджених", null, "baby"),
  seed(SECTIONS.hospitalBag.id, "Вологі серветки", null, "baby"),
  seed(SECTIONS.hospitalBag.id, "Конверт або плед на виписку", null, "baby"),
  // Сумка в пологовий — тато
  seed(SECTIONS.hospitalBag.id, "Документи (паспорт)", null, "dad"),
  seed(SECTIONS.hospitalBag.id, "Зарядний пристрій", null, "dad"),
  seed(SECTIONS.hospitalBag.id, "Змінний одяг", null, "dad"),
  seed(SECTIONS.hospitalBag.id, "Готівка або картка", null, "dad"),

  // Речі для малюка
  seed(SECTIONS.babyItems.id, "Ліжечко", null, null),
  seed(SECTIONS.babyItems.id, "Автокрісло", null, null),
  seed(SECTIONS.babyItems.id, "Коляска", null, null),
  seed(SECTIONS.babyItems.id, "Пелюшки багаторазові", null, null),
  seed(SECTIONS.babyItems.id, "Підгузки (запас)", null, null),
  seed(SECTIONS.babyItems.id, "Засоби для купання", null, null),
  seed(SECTIONS.babyItems.id, "Термометр", null, null),
  seed(SECTIONS.babyItems.id, "Аспіратор", null, null),
  seed(SECTIONS.babyItems.id, "Одяг на виписку", null, null),
  seed(SECTIONS.babyItems.id, "Засіб для прання дитячих речей", null, null),

  // Дім
  seed(SECTIONS.home.id, "Підготувати місце для сну малюка", null, null),
  seed(SECTIONS.home.id, "Зібрати аптечку", null, null),
  seed(SECTIONS.home.id, "Зробити запас продуктів", null, null),
  seed(SECTIONS.home.id, "Прибрати вдома перед випискою", null, null),
  seed(SECTIONS.home.id, "Зарядити павербанк", null, null),
  seed(SECTIONS.home.id, "Домовитись з рідними про допомогу перші дні", null, null),
  seed(SECTIONS.home.id, "Підготувати місце для годування", null, null),

  // Медичне
  seed(SECTIONS.medical.id, "Обрати педіатра", null, null),
  seed(SECTIONS.medical.id, "Здати аналізи перед пологами", null, null),
  seed(SECTIONS.medical.id, "Щеплення партнера від кашлюку", null, null),
  seed(SECTIONS.medical.id, "Консультація з лактаційним консультантом", null, null),
  seed(SECTIONS.medical.id, "Перевірити страховий поліс", null, null),

  // Люди й логістика
  seed(SECTIONS.peopleLogistics.id, "Контакти лікаря і пологового", null, null),
  seed(SECTIONS.peopleLogistics.id, "Хто відвезе до пологового", null, null),
  seed(SECTIONS.peopleLogistics.id, "План хто доглядає старших дітей/тварин", null, null),
  seed(SECTIONS.peopleLogistics.id, "Домовленість з рідними про допомогу", null, null),
  seed(SECTIONS.peopleLogistics.id, "Перевірити маршрут і транспорт заздалегідь", null, null),

  // Післяпологовий період
  seed(SECTIONS.postpartum.id, "Післяпологові прокладки", null, null),
  seed(SECTIONS.postpartum.id, "Засоби для догляду за швами", null, null),
  seed(SECTIONS.postpartum.id, "Компресійна білизна", null, null),
  seed(SECTIONS.postpartum.id, "Записатись до лактаційного консультанта", null, null),
  seed(SECTIONS.postpartum.id, "План харчування перших тижнів", null, null),
  seed(SECTIONS.postpartum.id, "Контакти на випадок післяпологової депресії", null, null),
]
