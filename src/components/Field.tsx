'use client'

import { Slot } from '@radix-ui/react-slot'
import * as React from "react"
import { Input, InputProps } from './ui/input'

interface FieldProps extends InputProps {
  asChild?: boolean

  label?: string
  error?: string
}

const Field = React.forwardRef<HTMLInputElement, FieldProps>(({ asChild, label, error, ...rest }, ref) => {
  const Comp = asChild ? Slot : Input

  return (
    <div className='flex flex-col gap-1 w-full'>
      <label className='text-xs'>&#8203;{label}</label>
      <Comp ref={ref} {...rest} />
      <p className='text-xs text-red-500'>&#8203;{error}</p>
    </div>
  )
})

Field.displayName = 'Field'

export default Field
