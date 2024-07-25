// app/components/ThemeSwitcher.tsx
"use client";

import { Button } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SunMoon, Moon } from 'lucide-react'
export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div>
      <Button onClick={() => {
        theme === 'light' ? setTheme('dark') : setTheme('light')
      }} isIconOnly color="danger" aria-label="Like">
        {theme === 'light' ? <Moon /> : <SunMoon />}</Button >
    </div>
  )
};