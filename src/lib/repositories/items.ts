import type { Item, Subsection } from "@/lib/types"

export interface ItemsRepository {
  getItemsBySection(householdId: string, sectionId: string): Promise<Item[]>
  getAllItems(householdId: string): Promise<Item[]>
  /** Unchecked items with a target_week set and target_week <= week, e.g. the dashboard "Пора зробити" block. */
  getItemsDueByWeek(householdId: string, week: number): Promise<Item[]>
  /** Unchecked items with target_week === week, e.g. the dashboard "Наступного тижня" block. */
  getItemsForTargetWeek(householdId: string, week: number): Promise<Item[]>
  addItem(
    householdId: string,
    sectionId: string,
    id: string,
    title: string,
    price: number | null,
    subsection?: Subsection | null,
    targetWeek?: number | null
  ): Promise<Item>
  toggleItem(householdId: string, itemId: string): Promise<void>
  updateItemPrice(householdId: string, itemId: string, price: number | null): Promise<void>
  deleteItem(householdId: string, itemId: string): Promise<void>
}
