export type Subsection = "mom" | "baby" | "dad"

export type SectionKey =
  | "documents"
  | "hospital-bag"
  | "baby-items"
  | "home"
  | "medical"
  | "people-logistics"
  | "postpartum"

export interface Household {
  id: string
  created_at: string
}

export interface Pregnancy {
  id: string
  household_id: string
  due_date: string
  city_hospital: string | null
  birth_type: string | null
  first_pregnancy: boolean
}

export interface BudgetGoal {
  id: string
  household_id: string
  goal_amount: number
  other_expenses: number
}

export interface Section {
  id: string
  key: SectionKey
  title_uk: string
  sort_order: number
}

export interface SeedItem {
  id: string
  section_id: string
  subsection: Subsection | null
  title: string
  default_price: number | null
  target_week: number | null
  sort_order: number
}

export interface Item {
  id: string
  household_id: string
  section_id: string
  subsection: Subsection | null
  title: string
  price: number | null
  target_week: number | null
  is_checked: boolean
  is_seed: boolean
  sort_order: number
  created_at: string
}
