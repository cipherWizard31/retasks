"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

const ACCENT_COLORS = [
  { name: "emerald", hex: "#10b981" },
  { name: "sky", hex: "#0ea5e9" },
  { name: "violet", hex: "#8b5cf6" },
  { name: "rose", hex: "#ef4444" },
  { name: "amber", hex: "#f59e0b" },
  { name: "pink", hex: "#ec4899" },
] as const

export function applyAccentColor(hexColor: string) {
  const colorObj = ACCENT_COLORS.find((c) => c.hex === hexColor) ?? ACCENT_COLORS[0]
  document.documentElement.style.setProperty("--accent-color", colorObj.hex)
  document.documentElement.setAttribute("data-accent", colorObj.name)
}

function AccentBootstrap({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    const savedAccent = localStorage.getItem("app-accent-color") || "#10b981"
    applyAccentColor(savedAccent)
  }, [resolvedTheme])

  return <>{children}</>
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      scriptProps={{
        type: typeof window === 'undefined' ? 'text/javascript' : 'text/plain'
      }}
      {...props}
    >
      <AccentBootstrap>{children}</AccentBootstrap>
    </NextThemesProvider>
  )
}

export { ACCENT_COLORS }
