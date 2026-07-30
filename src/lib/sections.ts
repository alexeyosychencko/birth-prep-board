import type { Section, Subsection } from "@/lib/types"

export const SECTIONS = {
  documents: { id: "8f1a2b30-0001-4e11-9a11-0000000000d1", key: "documents", title_uk: "Документи", sort_order: 1 },
  hospitalBag: { id: "8f1a2b30-0002-4e11-9a11-0000000000d2", key: "hospital-bag", title_uk: "Сумка в пологовий", sort_order: 2 },
  babyItems: { id: "8f1a2b30-0003-4e11-9a11-0000000000d3", key: "baby-items", title_uk: "Речі для малюка", sort_order: 3 },
  home: { id: "8f1a2b30-0004-4e11-9a11-0000000000d4", key: "home", title_uk: "Дім", sort_order: 4 },
  medical: { id: "8f1a2b30-0005-4e11-9a11-0000000000d5", key: "medical", title_uk: "Медичне", sort_order: 5 },
  peopleLogistics: { id: "8f1a2b30-0006-4e11-9a11-0000000000d6", key: "people-logistics", title_uk: "Люди й логістика", sort_order: 6 },
  postpartum: { id: "8f1a2b30-0007-4e11-9a11-0000000000d7", key: "postpartum", title_uk: "Післяпологовий період", sort_order: 7 },
} as const satisfies Record<string, Section>

export const SECTIONS_LIST: Section[] = Object.values(SECTIONS).sort(
  (a, b) => a.sort_order - b.sort_order
)

export function getSectionByKey(key: Section["key"]): Section {
  const found = SECTIONS_LIST.find((section) => section.key === key)
  if (!found) throw new Error(`Unknown section key: ${key}`)
  return found
}

export const HOSPITAL_BAG_SUBSECTIONS: { key: Subsection; title: string }[] = [
  { key: "mom", title: "Мама" },
  { key: "baby", title: "Малюк" },
  { key: "dad", title: "Тато" },
]
