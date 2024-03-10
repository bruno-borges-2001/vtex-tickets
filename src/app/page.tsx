'use client'
import { Combobox } from "@/components/Combobox";
import Field from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { SUBJECTS, TRANSACTION_STATUS } from "@/lib/consts";
import { BaseSchema, FullSchema, baseSchema, catalogSchema, ordersSchema, paymentsSchema } from "@/lib/schemas";
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ObjectSchema } from 'yup';

export default function Home() {
  const [subjectOpen, setSubjectOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<typeof SUBJECTS[number] | null>(null)

  const [transactionStatusOpen, setTransactionStatusOpen] = useState(false)
  const [selectedTransactionStatus, setSelectedTransactionStatus] = useState<typeof TRANSACTION_STATUS[number] | null>(null)

  const schema = useMemo(() => {
    switch (selectedSubject) {
      case 'Orders':
        return ordersSchema
      case 'Catalog':
        return catalogSchema
      case 'Payments':
        return paymentsSchema
      case 'Others':
      default:
        return baseSchema as ObjectSchema<BaseSchema>
    }
  }, [selectedSubject])

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FullSchema>({
    resolver: yupResolver(schema as ObjectSchema<FullSchema>)
  })

  const baseFields = (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Account Name" key="account_name" error={errors.account_name?.message} {...register('account_name')} />
        <Field label="Requester Email" key="requester_email" error={errors.requester_email?.message} {...register('requester_email')} />
      </div>
      <Field label="Title" error={errors.title?.message} key="title" {...register('title')} />
      <Field label="Subject" error={errors.subject?.message} key="subject" asChild>
        <Combobox open={subjectOpen} setOpen={setSubjectOpen} label={selectedSubject || "Select..."}>
          <section className="flex flex-col">
            {SUBJECTS.map(el => (
              <button
                key={el}
                className="text-left px-3 py-2 bg-popover hover:brightness-90"
                onClick={() => {
                  setValue('subject', el)
                  setSelectedSubject(el)
                  setSubjectOpen(false)
                }}
              >
                {el}
              </button>
            ))}
          </section>
        </Combobox>
      </Field>
    </>
  )

  const ordersFields = (
    <div className="grid grid-cols-[1fr_auto] gap-4 place-items-center">
      <Field
        label="Order Number"
        error={errors.order_number?.message}
        {...register('order_number')}
        className="w-full"
      />
      <Field error={errors.is_affecting_all_users?.message} {...register('is_affecting_all_users')} asChild>
        <div className="flex gap-2 items-center">
          <Checkbox id="is_affecting_all_users" onCheckedChange={(checked) => setValue('is_affecting_all_users', Boolean(checked))} />
          <label htmlFor="is_affecting_all_users">
            Is affecting all users?
          </label>
        </div>
      </Field>
    </div>
  )

  const paymentsFields = (
    <div className="grid md:grid-cols-3 gap-4">
      <Field label="Transaction number" error={errors.transaction_number?.message} {...register('transaction_number')} />
      <Field label="Transaction status" error={errors.transaction_status?.message} asChild>
        <Combobox open={transactionStatusOpen} setOpen={setTransactionStatusOpen} label={selectedTransactionStatus || "Select..."}>
          <section className="flex flex-col">
            {TRANSACTION_STATUS.map(el => (
              <button
                key={el}
                className="text-left px-3 py-2 bg-popover hover:brightness-90"
                onClick={() => {
                  setValue('transaction_status', el)
                  setSelectedTransactionStatus(el)
                  setTransactionStatusOpen(false)
                }}
              >
                {el}
              </button>
            ))}
          </section>
        </Combobox>
      </Field>
      <Field label="Payment Acquirer" error={errors.payment_acquirer?.message} {...register('payment_acquirer')} />
    </div>
  )

  const catalogFields = (
    <>
      <Field label="Sku Id" error={errors.sku_id?.message} {...register('sku_id')} />
      <Field
        label="Capture of the screen"
        type="file" accept="image/*"
        onChange={(e) => setValue('screenshot', e.target.files?.[0])}
      />
    </>
  )

  const onSubmit = handleSubmit(async (formData) => {
    const body = new FormData()

    // add form data to body
    Object.entries(formData).map(([key, value]) => value !== undefined && body.append(key, typeof value === 'boolean' ? String(value) : value as string | Blob))

    const response = await fetch('/api/ticket', { method: 'POST', body })

    const data = await response.json()

    if (!response.ok) {
      toast(data.error ?? 'Something went wrong')
    } else {
      toast(`Ticket created successfully. id: ${data.audit.ticket_id}`)
    }

    reset()
    setSelectedSubject(null)
    setSelectedTransactionStatus(null)
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 w-full max-w-xl p-6 bg-card rounded-2xl shadow max-h-[calc(100vh-162px)] overflow-auto">
      <h1 className="w-full text-center text-lg leading-none mb-4">Submit <span className="text-primary">Ticket</span></h1>
      {baseFields}
      {selectedSubject === 'Catalog' && catalogFields}
      {selectedSubject === 'Orders' && ordersFields}
      {selectedSubject === 'Payments' && paymentsFields}
      <Field label="Detailing" error={errors.detailing?.message} {...register('detailing')} asChild>
        <Textarea className="resize-none" />
      </Field>
      <Button type="submit" className="w-full">
        Send Ticket
      </Button>
    </form>
  );
}
