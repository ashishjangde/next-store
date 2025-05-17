"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, XCircle, Users } from "lucide-react"

interface StatusFilterProps {
  value: string
  onChange: (value: string) => void
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={value === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("all")}
        className="h-9"
      >
        <Users className="mr-2 h-4 w-4" />
        All
      </Button>
      <Button
        variant={value === "APPROVED" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("APPROVED")}
        className="h-9"
      >
        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
        Active
      </Button>
      <Button
        variant={value === "PENDING" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("PENDING")}
        className="h-9"
      >
        <Clock className="mr-2 h-4 w-4 text-yellow-500" />
        Pending
      </Button>
      <Button
        variant={value === "REJECTED" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("REJECTED")}
        className="h-9"
      >
        <XCircle className="mr-2 h-4 w-4 text-red-500" />
        Rejected
      </Button>
      <Button
        variant={value === "SUSPENDED" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("SUSPENDED")}
        className="h-9"
      >
        <XCircle className="mr-2 h-4 w-4 text-orange-500" />
        Suspended
      </Button>
    </div>
  )
}
