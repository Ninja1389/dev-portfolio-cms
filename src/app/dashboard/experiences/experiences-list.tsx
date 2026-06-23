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
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { GripVertical, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { deleteExperience, reorderExperiences } from "@/lib/actions/experiences"

type ExperienceItem = {
  id: string
  role: string
  company: string
  startDate: string
  endDate: string | null
  current: boolean
  order: number
}

function SortableRow({
  item,
  onDelete,
}: {
  item: ExperienceItem
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const start = format(new Date(item.startDate), "MMM yyyy", { locale: it })
  const end = item.current
    ? "Presente"
    : item.endDate
      ? format(new Date(item.endDate), "MMM yyyy", { locale: it })
      : null

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50")}
    >
      <TableCell className="w-10">
        <button
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{item.role}</TableCell>
      <TableCell>{item.company}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {start} — {end}
      </TableCell>
      <TableCell>
        {item.current && <Badge variant="success">Attuale</Badge>}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Modifica"
            asChild
          >
            <a href={`/dashboard/experiences/${item.id}/edit`}>
              <Pencil className="h-4 w-4" />
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                title="Elimina"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Elimina esperienza</AlertDialogTitle>
                <AlertDialogDescription>
                  Sei sicuro di voler eliminare "{item.role}" presso{" "}
                  "{item.company}"? Questa azione non può essere annullata.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-end gap-2">
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(item.id)}
                >
                  Elimina
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function ExperiencesList({ items }: { items: ExperienceItem[] }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [experiences, setExperiences] = useState(items)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = experiences.findIndex((e) => e.id === active.id)
    const newIndex = experiences.findIndex((e) => e.id === over.id)

    const reordered = arrayMove(experiences, oldIndex, newIndex).map(
      (e, i) => ({ ...e, order: i }),
    )
    setExperiences(reordered)

    reorderExperiences(
      reordered.map((e) => ({ id: e.id, order: e.order })),
    ).then((res) => {
      if (res?.success) {
        toast.success(res.message ?? "Ordine aggiornato")
      } else {
        toast.error(res?.message ?? "Errore durante il riordino")
        setExperiences(items)
      }
    })
  }

  const handleDelete = useCallback(async (id: string) => {
    const res = await deleteExperience(id)
    if (res?.success) {
      setExperiences((prev) => prev.filter((e) => e.id !== id))
      toast.success(res.message ?? "Esperienza eliminata")
    } else {
      toast.error(res?.message ?? "Errore")
    }
  }, [])

  if (experiences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <h3 className="text-lg font-semibold">Nessuna esperienza</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Aggiungi la tua prima esperienza lavorativa.
        </p>
      </div>
    )
  }

  if (!mounted) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>Ruolo</TableHead>
            <TableHead>Azienda</TableHead>
            <TableHead>Periodo</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead className="w-[120px]">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {experiences.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="w-10" />
              <TableCell className="font-medium">{item.role}</TableCell>
              <TableCell>{item.company}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(item.startDate), "MMM yyyy", { locale: it })} — {item.current ? "Presente" : item.endDate ? format(new Date(item.endDate), "MMM yyyy", { locale: it }) : null}
              </TableCell>
              <TableCell>
                {item.current && <Badge variant="success">Attuale</Badge>}
              </TableCell>
              <TableCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>Ruolo</TableHead>
            <TableHead>Azienda</TableHead>
            <TableHead>Periodo</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead className="w-[120px]">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <SortableContext
            items={experiences.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            {experiences.map((item) => (
              <SortableRow key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  )
}
