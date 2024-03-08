import { ChevronsUpDown } from "lucide-react"
import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

interface ComboboxProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>

  label: string
}

export function Combobox({ open, setOpen, label, children }: React.PropsWithChildren<ComboboxProps>) {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        {children}
      </PopoverContent>
    </Popover>
  )
}