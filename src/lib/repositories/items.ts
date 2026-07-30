import type { Item, ItemStatus, Subsection } from "@/lib/types"

export interface ItemsRepository {
  getItemsBySection(householdId: string, sectionId: string): Promise<Item[]>
  getAllItems(householdId: string): Promise<Item[]>
  /** Items with status todo/in_progress, a target_week set, and target_week <= week, e.g. the dashboard "Пора зробити" block. */
  getItemsDueByWeek(householdId: string, week: number): Promise<Item[]>
  /** Items with status todo/in_progress and target_week === week, e.g. the dashboard "Наступного тижня" block. */
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
  setItemStatus(householdId: string, itemId: string, status: ItemStatus): Promise<void>
  updateItemNote(householdId: string, itemId: string, note: string | null): Promise<void>
  updateItemPrice(householdId: string, itemId: string, price: number | null): Promise<void>
  updateItemTargetWeek(householdId: string, itemId: string, targetWeek: number | null): Promise<void>
  deleteItem(householdId: string, itemId: string): Promise<void>
}
