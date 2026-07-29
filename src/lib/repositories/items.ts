import type { Item, Subsection } from "@/lib/types"

export interface ItemsRepository {
  getItemsBySection(householdId: string, sectionId: string): Promise<Item[]>
  getAllItems(householdId: string): Promise<Item[]>
  addItem(
    householdId: string,
    sectionId: string,
    id: string,
    title: string,
    price: number | null,
    subsection?: Subsection | null
  ): Promise<Item>
  toggleItem(householdId: string, itemId: string): Promise<void>
  updateItemPrice(householdId: string, itemId: string, price: number | null): Promise<void>
  deleteItem(householdId: string, itemId: string): Promise<void>
}
