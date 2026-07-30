"use client"

import type { CSSProperties, ReactNode } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { HugeiconsIcon } from "@hugeicons/react"
import { GripVerticalIcon } from "@hugeicons/core-free-icons"

export function DragHandle({
  attributes,
  listeners,
}: {
  attributes: DraggableAttributes
  listeners: DraggableSyntheticListeners
}) {
  return (
    <button
      type="button"
      className="shrink-0 touch-none cursor-grab text-muted-foreground active:cursor-grabbing"
      aria-label="Перетягнути для зміни порядку"
      {...attributes}
      {...listeners}
    >
      <HugeiconsIcon icon={GripVerticalIcon} strokeWidth={2} />
    </button>
  )
}

/**
 * Wraps useSortable for a single row. Must be called directly inside the
 * component that renders the row's root element — the returned setNodeRef
 * (a ref callback) is only safe to attach in the component that owns it,
 * not to thread through props to a different component.
 */
export function useSortableRow(id: string) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return { setNodeRef, style, isDragging, attributes, listeners }
}

/**
 * DndContext + SortableContext wrapper shared by any drag-and-drop
 * reorderable list (checklist items, contacts). Callers keep rendering their
 * own <ul>/row markup and call useSortableRow directly inside each row —
 * this component only owns sensors, collision detection and the reorder
 * calculation on drop.
 */
export function SortableListProvider<T extends { id: string }>({
  items,
  onReorder,
  children,
}: {
  items: T[]
  onReorder: (orderedIds: string[]) => void
  children: ReactNode
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = items.map((item) => item.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(arrayMove(ids, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}
