import "server-only"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import type { Household, Pregnancy, BudgetGoal, Item, Contact } from "@/lib/types"
import { seedItems } from "@/lib/content/seed-items"

export interface StoreShape {
  households: Record<string, Household>
  pregnancies: Record<string, Pregnancy>
  budgetGoals: Record<string, BudgetGoal>
  items: Record<string, Item>
  contacts: Record<string, Contact>
}

function getStoreDir(): string {
  return path.join(process.cwd(), ".data")
}
function getStorePath(): string {
  return path.join(getStoreDir(), "store.json")
}

const DEFAULT_PREGNANCY_TERM_DAYS = 280

function createDefaultHouseholdState(): StoreShape {
  const householdId = crypto.randomUUID()
  const now = new Date()
  const dueDate = new Date(now.getTime() + DEFAULT_PREGNANCY_TERM_DAYS * 24 * 60 * 60 * 1000)

  const household: Household = { id: householdId, created_at: now.toISOString() }

  const pregnancy: Pregnancy = {
    id: crypto.randomUUID(),
    household_id: householdId,
    due_date: dueDate.toISOString().slice(0, 10),
    city_hospital: null,
    birth_type: null,
    first_pregnancy: false,
  }

  const budgetGoal: BudgetGoal = {
    id: crypto.randomUUID(),
    household_id: householdId,
    goal_amount: 0,
    other_expenses: 0,
  }

  const items: Record<string, Item> = {}
  for (const seed of seedItems) {
    const item: Item = {
      id: crypto.randomUUID(),
      household_id: householdId,
      section_id: seed.section_id,
      subsection: seed.subsection,
      title: seed.title,
      price: seed.default_price,
      target_week: seed.target_week,
      status: "todo",
      note: null,
      is_seed: true,
      sort_order: seed.sort_order,
      created_at: now.toISOString(),
    }
    items[item.id] = item
  }

  return {
    households: { [householdId]: household },
    pregnancies: { [pregnancy.id]: pregnancy },
    budgetGoals: { [budgetGoal.id]: budgetGoal },
    items,
    contacts: {},
  }
}

async function readStoreFile(): Promise<StoreShape> {
  try {
    const raw = await readFile(getStorePath(), "utf-8")
    const store = JSON.parse(raw) as StoreShape
    store.contacts ??= {}
    return store
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const initial = createDefaultHouseholdState()
      await writeStoreFile(initial)
      return initial
    }
    throw error
  }
}

async function writeStoreFile(store: StoreShape): Promise<void> {
  await mkdir(getStoreDir(), { recursive: true })
  await writeFile(getStorePath(), JSON.stringify(store, null, 2), "utf-8")
}

let queue: Promise<unknown> = Promise.resolve()

function withQueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task)
  queue = run.then(
    () => undefined,
    () => undefined
  )
  return run
}

export function readStore<T>(select: (store: StoreShape) => T): Promise<T> {
  return withQueue(async () => {
    const store = await readStoreFile()
    return select(store)
  })
}

export function writeStore<T>(mutate: (store: StoreShape) => T): Promise<T> {
  return withQueue(async () => {
    const store = await readStoreFile()
    const result = mutate(store)
    await writeStoreFile(store)
    return result
  })
}
