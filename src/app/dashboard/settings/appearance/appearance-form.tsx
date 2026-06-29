"use client"

import { useState } from "react"
import { useActionState } from "react"
import { useTheme } from "next-themes"
import { updateAppearance } from "@/lib/actions/appearance"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Sun, Moon, Monitor, GripVertical, Paintbrush } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SectionItem } from "./page"

const presetColors = [
  { name: "Blu", value: "#3b82f6" },
  { name: "Viola", value: "#8b5cf6" },
  { name: "Verde", value: "#22c55e" },
  { name: "Arancione", value: "#f97316" },
  { name: "Rosso", value: "#ef4444" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Ciano", value: "#06b6d4" },
  { name: "Giallo", value: "#eab308" },
]

type Props = {
  themeMode: string
  accentColor: string
  brandName: string
  sections: SectionItem[]
}

export function AppearanceForm({
  themeMode: initialTheme,
  accentColor: initialColor,
  brandName: initialBrand,
  sections: initialSections,
}: Props) {
  const { setTheme } = useTheme()
  const [state, formAction, pending] = useActionState(updateAppearance, undefined)

  const [sections, setSections] = useState<SectionItem[]>(initialSections)
  const [accentColor, setAccentColor] = useState(initialColor)
  const [customColor, setCustomColor] = useState(initialColor && !presetColors.find((c) => c.value === initialColor) ? initialColor : "")

  const themeOptions = [
    { value: "light", label: "Chiaro", icon: Sun },
    { value: "dark", label: "Scuro", icon: Moon },
    { value: "system", label: "Auto", icon: Monitor },
  ]

  function moveSection(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= sections.length) return
    const updated = [...sections]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    setSections(updated.map((s, i) => ({ ...s, order: i })))
  }

  function toggleSection(id: string) {
    setSections(sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)))
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="sectionsConfig" value={JSON.stringify(sections)} />

      {/* Theme mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tema</CardTitle>
          <CardDescription>Scegli il tema del portfolio pubblico.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {themeOptions.map((opt) => {
              const Icon = opt.icon
              const selected = initialTheme === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setTheme(opt.value)
                    // Update the hidden input via form submission
                    document.getElementById("themeMode")?.setAttribute("value", opt.value)
                  }}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors",
                    selected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-muted",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {opt.label}
                </button>
              )
            })}
          </div>
          <input type="hidden" name="themeMode" id="themeMode" value={initialTheme} />
        </CardContent>
      </Card>

      {/* Accent color */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Colore Accent</CardTitle>
          <CardDescription>Colore principale per link e accenti.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {presetColors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => { setAccentColor(color.value); setCustomColor("") }}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-all",
                  accentColor === color.value ? "border-foreground scale-110" : "border-transparent",
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            <div className="relative">
              <input
                type="color"
                value={customColor || "#3b82f6"}
                onChange={(e) => { setCustomColor(e.target.value); setAccentColor(e.target.value) }}
                className="h-8 w-8 cursor-pointer rounded-full border-2 border-border"
                title="Colore personalizzato"
              />
              <Paintbrush className="pointer-events-none absolute inset-0 m-auto h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
          <input type="hidden" name="accentColor" value={accentColor} />
        </CardContent>
      </Card>

      {/* Brand name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nome Portfolio</CardTitle>
          <CardDescription>Nome mostrato nell&apos;header e nel titolo del sito.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            name="brandName"
            defaultValue={initialBrand}
            placeholder="Il tuo nome o brand"
          />
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sezioni Homepage</CardTitle>
          <CardDescription>
            Attiva/disattiva e riordina le sezioni della homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3",
                  !section.visible && "opacity-50",
                )}
              >
                <button
                  type="button"
                  className="cursor-grab text-muted-foreground hover:text-foreground"
                  onPointerDown={(e) => {
                    // Simple manual reorder buttons instead of dnd-kit
                  }}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveSection(index, index - 1)}
                      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === sections.length - 1}
                      onClick={() => moveSection(index, index + 1)}
                      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                </div>
                <span className="flex-1 text-sm font-medium">{section.label}</span>
                <Switch
                  checked={section.visible}
                  onCheckedChange={() => toggleSection(section.id)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {state?.message && (
        <div
          className={cn(
            "rounded-lg border p-3 text-sm",
            state.success ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700",
          )}
        >
          {state.message}
        </div>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvataggio..." : "Salva impostazioni"}
      </Button>
    </form>
  )
}
