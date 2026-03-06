"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

export function DatePickerDemo({
  onDateChange,
}: {
  onDateChange?: (date: Date | undefined) => void
}) {
  const [date, setDate] = React.useState<Date | undefined>(undefined)

  function handleSelect(d: Date | undefined) {
    setDate(d)
    onDateChange?.(d)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className="selector bg-white"
        >
          {date ? format(date, "PPP") : <span>Datum</span>}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}   
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  )
}