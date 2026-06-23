"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Trash2, ChevronDown, ChevronRight, Star } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteSkill, reorderSkills } from "@/lib/actions/skills"
import { CATEGORY_LABELS } from "@/lib/skills"

type SkillItem = {
  id: string
  name: string
  category: string
  level: number
  order: number
}

function StarRating({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < level
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  )
}

function SortableSkillRow({
  skill,
  onDelete,
}: {
  skill: SkillItem
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skill.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5",
        isDragging && "opacity-50 shadow-lg",
      )}
    >
      <button
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 text-sm font-medium">{skill.name}</span>
      <StarRating level={skill.level} />
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        title="Modifica"
        asChild
      >
        <a href={`/dashboard/skills/${skill.id}/edit`}>
          <Pencil className="h-3.5 w-3.5" />
        </a>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            title="Elimina"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina skill</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare "{skill.name}"? Questa azione non
              può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete(skill.id)}
            >
              Elimina
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function SkillsList({
  items,
  categories,
}: {
  items: SkillItem[]
  categories: string[]
}) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [grouped, setGrouped] = useState(() => {
    const map: Record<string, SkillItem[]> = {}
    for (const cat of categories) {
      map[cat] = items.filter((s) => s.category === cat)
    }
    return map
  })
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    for (const cat of categories) {
      map[cat] = true
    }
    return map
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(category: string, event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const skills = grouped[category]
    const oldIndex = skills.findIndex((s) => s.id === active.id)
    const newIndex = skills.findIndex((s) => s.id === over.id)

    const reordered = arrayMove(skills, oldIndex, newIndex).map((s, i) => ({
      ...s,
      order: i,
    }))

    setGrouped((prev) => ({ ...prev, [category]: reordered }))

    reorderSkills(
      reordered.map((s) => ({ id: s.id, order: s.order })),
    ).then((res) => {
      if (res?.success) {
        toast.success(res.message ?? "Ordine aggiornato")
      } else {
        toast.error(res?.message ?? "Errore durante il riordino")
        setGrouped((prev) => ({
          ...prev,
          [category]: items.filter((s) => s.category === category),
        }))
      }
    })
  }

  const handleDelete = useCallback(
    async (id: string) => {
      const res = await deleteSkill(id)
      if (res?.success) {
        setGrouped((prev) => {
          const next = { ...prev }
          for (const cat of Object.keys(next)) {
            next[cat] = next[cat].filter((s) => s.id !== id)
          }
          return next
        })
        toast.success(res.message ?? "Skill eliminata")
      } else {
        toast.error(res?.message ?? "Errore")
      }
    },
    [],
  )

  function toggleCategory(cat: string) {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  const hasAny = items.length > 0

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <h3 className="text-lg font-semibold">Nessuna skill</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Aggiungi la tua prima skill.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const skills = grouped[cat] ?? []
        if (skills.length === 0) return null

        return (
          <div
            key={cat}
            className="rounded-lg border bg-card"
          >
            <button
              type="button"
              onClick={() => toggleCategory(cat)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left font-semibold text-sm hover:bg-muted/50"
            >
              {expanded[cat] ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              {CATEGORY_LABELS[cat] ?? cat}
              <Badge variant="secondary" className="ml-auto">
                {skills.length}
              </Badge>
            </button>

            {expanded[cat] && (
              mounted ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(cat, event)}
                >
                  <SortableContext
                    items={skills.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1 px-3 pb-3">
                      {skills.map((skill) => (
                        <SortableSkillRow
                          key={skill.id}
                          skill={skill}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="space-y-1 px-3 pb-3">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5"
                    >
                      <span className="ml-8 flex-1 text-sm font-medium">{skill.name}</span>
                      <StarRating level={skill.level} />
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )
      })}
    </div>
  )
}
