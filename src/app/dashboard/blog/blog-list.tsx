"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Plus, Eye } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
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
import { deletePost } from "@/lib/actions/posts"

type PostItem = {
  id: string
  title: string
  slug: string
  published: boolean
  scheduled: boolean
  dateLabel: string
}

export function BlogList({ items }: { items: PostItem[] }) {
  const router = useRouter()

  const handleDelete = useCallback(async (id: string) => {
    const res = await deletePost(id)
    if (res?.success) {
      toast.success(res.message ?? "Articolo eliminato")
      router.refresh()
    } else {
      toast.error(res?.message ?? "Errore")
    }
  }, [router])

  function getStatusBadge(post: PostItem) {
    if (post.published) return <Badge variant="success">Pubblicato</Badge>
    if (post.scheduled) return <Badge variant="warning">Programmato</Badge>
    return <Badge variant="secondary">Bozza</Badge>
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <h3 className="text-lg font-semibold">Nessun articolo</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Scrivi il tuo primo articolo per il blog.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/blog/new">
            <Plus className="mr-1 h-4 w-4" />
            Nuovo articolo
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titolo</TableHead>
          <TableHead>Stato</TableHead>
          <TableHead>Data</TableHead>
          <TableHead className="w-[140px]">Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((post) => (
          <TableRow key={post.id}>
            <TableCell className="font-medium">{post.title}</TableCell>
            <TableCell>{getStatusBadge(post)}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {post.dateLabel}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Anteprima"
                  asChild
                >
                  <a href={`/blog/${post.slug}?preview=true`} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Modifica"
                  asChild
                >
                  <a href={`/dashboard/blog/${post.id}/edit`}>
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
                      <AlertDialogTitle>Elimina articolo</AlertDialogTitle>
                      <AlertDialogDescription>
                        Sei sicuro di voler eliminare &quot;{post.title}&quot;?
                        Questa azione non può essere annullata.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDelete(post.id)}
                      >
                        Elimina
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
