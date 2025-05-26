// lib/types.ts
export interface SkillEntry {
    name: string
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert"
    years: number
    lastUsed: string
    category?: string
    certified?: boolean
  }
  