'use client'
import { Combobox } from "@/components/Combobox";
import Field from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as yup from 'yup';

const SUBJECTS = ['Orders', 'Payments', 'Catalog', 'Others'] as const
const TRANSACTION_STATUS = ['Pending', 'In Progress', 'Completed'] as const

const baseSchema = yup.object().shape({
  account_name: yup.string().required('This field is required'),
  requester_email: yup.string().email('Invalid email').required('This field is required'),
  subject: yup.string().oneOf(SUBJECTS, 'Invalid subject').required('This field is required'),
  detailing: yup.string().required('This field is required')
}).required()

const ordersSchema = baseSchema.shape({
  order_number: yup.string().required('This field is required'),
  is_afecting_all_users: yup.boolean().default(false),
})

const paymentsSchema = baseSchema.shape({
  transaction_number: yup.string().required('This field is required'),
  transaction_status: yup.string().oneOf(TRANSACTION_STATUS).required('This field is required'),
  payment_acquirer: yup.string().required('This field is required'),
})

const catalogSchema = baseSchema.shape({
  sku_id: yup.string().required('This field is required'),
  screenshot: yup.string(),
})

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
        return baseSchema
    }
  }, [selectedSubject])

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  const baseFields = (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Account Name" error={errors.account_name?.message} {...register('account_name')} />
        <Field label="Requester Email" error={errors.requester_email?.message} {...register('requester_email')} />
      </div>
      <Field label="Subject" error={errors.subject?.message} {...register('subject')} asChild>
        <Combobox open={subjectOpen} setOpen={setSubjectOpen} label={selectedSubject || "Select..."}>
          <section className="flex flex-col">
            {SUBJECTS.map(el => (
              <button
                key={el}
                className="text-left px-3 py-2 bg-white hover:brightness-90"
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
      {/* @ts-expect-error */}
      <Field label="Order Number" error={errors.order_number?.message} {...register('order_number')} className="w-full" />
      {/* @ts-expect-error */}
      <Field error={errors.is_afecting_all_users?.message} {...register('is_afecting_all_users')} asChild>
        <div className="flex gap-2 items-center">
          {/* @ts-expect-error */}
          <Checkbox id="is_afecting_all_users" onChange={() => setValue('is_afecting_all_users', !getValues().is_afecting_all_users)} />
          <label htmlFor="is_afecting_all_users">
            Is afecting all users?
          </label>
        </div>
      </Field>
    </div>
  )

  const paymentsFields = (
    <div className="grid md:grid-cols-3 gap-4">
      {/* @ts-expect-error */}
      <Field label="Transaction number" error={errors.transaction_number?.message} {...register('transaction_number')} />
      {/* @ts-expect-error */}
      <Field label="Transaction status" error={errors.transaction_status?.message} {...register('transaction_status')} asChild>
        <Combobox open={transactionStatusOpen} setOpen={setTransactionStatusOpen} label={selectedTransactionStatus || "Select..."}>
          <section className="flex flex-col">
            {TRANSACTION_STATUS.map(el => (
              <button
                key={el}
                className="text-left px-3 py-2 bg-white hover:brightness-90"
                onClick={() => {
                  {/* @ts-expect-error */ }
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
      {/* @ts-expect-error */}
      <Field label="Payment Acquirer" error={errors.payment_acquirer?.message} {...register('payment_acquirer')} />
    </div>
  )

  const catalogFields = (
    <>
      {/* @ts-expect-error */}
      <Field label="Sku Id" error={errors.sku_id?.message} {...register('sku_id')} />
      <Field
        label="Capture of the screen"
        type="file" accept="image/*"
        onChange={(e) => {
          const blob = e.target.files?.[0]

          if (!blob) {
            // @ts-expect-error
            setValue('screenshot', undefined)
            return
          }

          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = function () {
            const base64data = reader.result;
            // @ts-expect-error
            setValue('screenshot', base64data)
          }
        }}
      />
    </>
  )

  const onSubmit = handleSubmit(async (formData) => {
    const form = new FormData()
    Object.entries(formData).map(([key, value]) => value && form.append(key, value as string))

    const response = await fetch('/api/ticket', {
      method: 'POST',
      body: form
    })

    const data = await response.json()

    if (!response.ok) {
      toast(data.message)
    } else {
      toast(`Ticket created successfully. id: ${data.id}`)
    }

    reset()
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 w-full max-w-xl p-6">
      <h1 className="w-full text-center text-3xl font-bold mb-4">Submit Ticket</h1>
      {baseFields}
      {selectedSubject === 'Orders' && ordersFields}
      {selectedSubject === 'Payments' && paymentsFields}
      {selectedSubject === 'Catalog' && catalogFields}
      <Field label="Detailing" error={errors.detailing?.message} {...register('detailing')} asChild>
        <Textarea className="resize-none" />
      </Field>
      <Button type="submit" className="w-full">
        Send Ticket
      </Button>
    </form>
  );
}
