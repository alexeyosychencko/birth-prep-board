import { SECTIONS } from "@/lib/sections"
import type { SeedItem } from "@/lib/types"

// These ids are permanent constants — like the section uuids in
// src/lib/sections.ts, they will seed the Phase 2 Supabase migration
// unchanged, so they must be valid uuid literals from the start.
const nextOrder: Record<string, number> = {}
function seed(sectionId: string, title: string, defaultPrice: number | null, subsection: SeedItem["subsection"] = null, idSuffix: string): SeedItem {
  const key = sectionId + (subsection ?? "")
  nextOrder[key] = (nextOrder[key] ?? 0) + 1
  return {
    id: `c2b3d440-0000-4000-9000-${idSuffix.padStart(12, "0")}`,
    section_id: sectionId,
    subsection,
    title,
    default_price: defaultPrice,
    sort_order: nextOrder[key],
  }
}

export const seedItems: SeedItem[] = [
  // Документи
  seed(SECTIONS.documents.id, "Паспорт", null, null, "d001"),
  seed(SECTIONS.documents.id, "Довідка про присвоєння РНОКПП (ІПН)", null, null, "d002"),
  seed(SECTIONS.documents.id, "Обмінна карта вагітної", null, null, "d003"),
  seed(SECTIONS.documents.id, "Свідоцтво про шлюб (за наявності)", null, null, "d004"),
  seed(SECTIONS.documents.id, "Договір з пологовим будинком (контрактні пологи)", null, null, "d005"),
  seed(SECTIONS.documents.id, "Поліс добровільного медичного страхування (за наявності)", null, null, "d006"),
  seed(SECTIONS.documents.id, "Реквізити рахунку для допомоги при народженні дитини", null, null, "d007"),

  // Сумка в пологовий — мама
  seed(SECTIONS.hospitalBag.id, "Халат і тапочки", null, "mom", "h001"),
  seed(SECTIONS.hospitalBag.id, "Засоби гігієни", null, "mom", "h002"),
  seed(SECTIONS.hospitalBag.id, "Боді/сорочка для годування", null, "mom", "h003"),
  seed(SECTIONS.hospitalBag.id, "Компресійні панчохи", null, "mom", "h004"),
  seed(SECTIONS.hospitalBag.id, "Зарядка для телефону", null, "mom", "h005"),
  seed(SECTIONS.hospitalBag.id, "Вода і перекус", null, "mom", "h006"),
  // Сумка в пологовий — малюк
  seed(SECTIONS.hospitalBag.id, "Боді та повзунки (кілька комплектів)", null, "baby", "h007"),
  seed(SECTIONS.hospitalBag.id, "Шапочка і шкарпетки", null, "baby", "h008"),
  seed(SECTIONS.hospitalBag.id, "Підгузки для новонароджених", null, "baby", "h009"),
  seed(SECTIONS.hospitalBag.id, "Вологі серветки", null, "baby", "h010"),
  seed(SECTIONS.hospitalBag.id, "Конверт або плед на виписку", null, "baby", "h011"),
  // Сумка в пологовий — тато
  seed(SECTIONS.hospitalBag.id, "Документи (паспорт)", null, "dad", "h012"),
  seed(SECTIONS.hospitalBag.id, "Зарядний пристрій", null, "dad", "h013"),
  seed(SECTIONS.hospitalBag.id, "Змінний одяг", null, "dad", "h014"),
  seed(SECTIONS.hospitalBag.id, "Готівка або картка", null, "dad", "h015"),

  // Речі для малюка
  seed(SECTIONS.babyItems.id, "Ліжечко", null, null, "b001"),
  seed(SECTIONS.babyItems.id, "Автокрісло", null, null, "b002"),
  seed(SECTIONS.babyItems.id, "Коляска", null, null, "b003"),
  seed(SECTIONS.babyItems.id, "Пелюшки багаторазові", null, null, "b004"),
  seed(SECTIONS.babyItems.id, "Підгузки (запас)", null, null, "b005"),
  seed(SECTIONS.babyItems.id, "Засоби для купання", null, null, "b006"),
  seed(SECTIONS.babyItems.id, "Термометр", null, null, "b007"),
  seed(SECTIONS.babyItems.id, "Аспіратор", null, null, "b008"),
  seed(SECTIONS.babyItems.id, "Одяг на виписку", null, null, "b009"),
  seed(SECTIONS.babyItems.id, "Засіб для прання дитячих речей", null, null, "b010"),

  // Дім
  seed(SECTIONS.home.id, "Підготувати місце для сну малюка", null, null, "o001"),
  seed(SECTIONS.home.id, "Зібрати аптечку", null, null, "o002"),
  seed(SECTIONS.home.id, "Зробити запас продуктів", null, null, "o003"),
  seed(SECTIONS.home.id, "Прибрати вдома перед випискою", null, null, "o004"),
  seed(SECTIONS.home.id, "Зарядити павербанк", null, null, "o005"),
  seed(SECTIONS.home.id, "Домовитись з рідними про допомогу перші дні", null, null, "o006"),
  seed(SECTIONS.home.id, "Підготувати місце для годування", null, null, "o007"),

  // Медичне
  seed(SECTIONS.medical.id, "Обрати педіатра", null, null, "m001"),
  seed(SECTIONS.medical.id, "Здати аналізи перед пологами", null, null, "m002"),
  seed(SECTIONS.medical.id, "Щеплення партнера від кашлюку", null, null, "m003"),
  seed(SECTIONS.medical.id, "Консультація з лактаційним консультантом", null, null, "m004"),
  seed(SECTIONS.medical.id, "Перевірити страховий поліс", null, null, "m005"),

  // Люди й логістика
  seed(SECTIONS.peopleLogistics.id, "Контакти лікаря і пологового", null, null, "p001"),
  seed(SECTIONS.peopleLogistics.id, "Хто відвезе до пологового", null, null, "p002"),
  seed(SECTIONS.peopleLogistics.id, "План хто доглядає старших дітей/тварин", null, null, "p003"),
  seed(SECTIONS.peopleLogistics.id, "Домовленість з рідними про допомогу", null, null, "p004"),
  seed(SECTIONS.peopleLogistics.id, "Перевірити маршрут і транспорт заздалегідь", null, null, "p005"),

  // Післяпологовий період
  seed(SECTIONS.postpartum.id, "Післяпологові прокладки", null, null, "a001"),
  seed(SECTIONS.postpartum.id, "Засоби для догляду за швами", null, null, "a002"),
  seed(SECTIONS.postpartum.id, "Компресійна білизна", null, null, "a003"),
  seed(SECTIONS.postpartum.id, "Записатись до лактаційного консультанта", null, null, "a004"),
  seed(SECTIONS.postpartum.id, "План харчування перших тижнів", null, null, "a005"),
  seed(SECTIONS.postpartum.id, "Контакти на випадок післяпологової депресії", null, null, "a006"),
]
