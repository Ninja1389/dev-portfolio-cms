"use client"

import { useState } from "react"
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
import { GripVertical, ExternalLink, Pencil, Star, Trash2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
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
import { cn } from "@/lib/utils"
import {
  toggleProjectFeatured,
  toggleProjectPublished,
  deleteProject,
  reorderProjects,
} from "@/lib/actions/projects"

type ProjectItem = {
  id: string
  title: string
  slug: string
  featured: boolean
  published: boolean
  order: number
  createdAt: string
}

function SortableRow({
  project,
  onToggleFeatured,
  onTogglePublished,
  onDelete,
}: {
  project: ProjectItem
  onToggleFeatured: (id: string) => void
  onTogglePublished: (id: string) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

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
      <TableCell className="font-medium">{project.title}</TableCell>
      <TableCell>
        {project.published ? (
          <Badge variant="success">Pubblicato</Badge>
        ) : (
          <Badge variant="warning">Bozza</Badge>
        )}
      </TableCell>
      <TableCell>
        {project.featured ? (
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground text-xs">
        {new Date(project.createdAt).toLocaleDateString("it-IT")}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title={project.published ? "Nascondi" : "Pubblica"}
            onClick={() => onTogglePublished(project.id)}
          >
            {project.published ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title={project.featured ? "Rimuovi in evidenza" : "Metti in evidenza"}
            onClick={() => onToggleFeatured(project.id)}
          >
            <Star
              className={cn(
                "h-4 w-4",
                project.featured && "fill-amber-400 text-amber-400",
              )}
            />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Modifica" asChild>
            <a href={`/dashboard/projects/${project.id}/edit`}>
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
                <AlertDialogTitle>Elimina progetto</AlertDialogTitle>
                <AlertDialogDescription>
                  Sei sicuro di voler eliminare "{project.title}"? Questa azione
                  non può essere annullata.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-end gap-2">
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => onDelete(project.id)}
                >
                  Elimina
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Vedi" asChild>
            <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function ProjectsList({ items }: { items: ProjectItem[] }) {
  const router = useRouter()
  const [projects, setProjects] = useState(items)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = projects.findIndex((p) => p.id === active.id)
    const newIndex = projects.findIndex((p) => p.id === over.id)

    const reordered = arrayMove(projects, oldIndex, newIndex).map(
      (p, i) => ({ ...p, order: i }),
    )
    setProjects(reordered)

    reorderProjects(
      reordered.map((p) => ({ id: p.id, order: p.order })),
    ).then((res) => {
      if (res?.success) {
        toast.success(res.message ?? "Ordine aggiornato")
      } else {
        toast.error(res?.message ?? "Errore durante il riordino")
        setProjects(items)
      }
    })
  }

  async function handleToggleFeatured(id: string) {
    const res = await toggleProjectFeatured(id)
    if (res?.success) {
      setProjects(
        projects.map((p) =>
          p.id === id ? { ...p, featured: !p.featured } : p,
        ),
      )
      toast.success(res.message ?? "Progetto aggiornato")
    } else {
      toast.error(res?.message ?? "Errore")
    }
  }

  async function handleTogglePublished(id: string) {
    const res = await toggleProjectPublished(id)
    if (res?.success) {
      setProjects(
        projects.map((p) =>
          p.id === id ? { ...p, published: !p.published } : p,
        ),
      )
      toast.success(res.message ?? "Progetto aggiornato")
    } else {
      toast.error(res?.message ?? "Errore")
    }
  }

  async function handleDelete(id: string) {
    const res = await deleteProject(id)
    if (res?.success) {
      setProjects(projects.filter((p) => p.id !== id))
      toast.success(res.message ?? "Progetto eliminato")
    } else {
      toast.error(res?.message ?? "Errore")
    }
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <h3 className="text-lg font-semibold">Nessun progetto</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea il tuo primo progetto per iniziare.
        </p>
      </div>
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
            <TableHead>Titolo</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>In evidenza</TableHead>
            <TableHead>Creato il</TableHead>
            <TableHead className="w-[200px]">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <SortableContext
            items={projects.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {projects.map((project) => (
              <SortableRow
                key={project.id}
                project={project}
                onToggleFeatured={handleToggleFeatured}
                onTogglePublished={handleTogglePublished}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  )
}
