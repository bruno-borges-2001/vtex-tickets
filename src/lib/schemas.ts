import * as yup from 'yup';
import { SUBJECTS, TRANSACTION_STATUS } from './consts';

export const baseSchema = yup.object().shape({
  account_name: yup.string().required('This field is required'),
  requester_email: yup.string().email('Invalid email').required('This field is required'),
  title: yup.string().required('This field is required'),
  subject: yup.string().oneOf(SUBJECTS, 'Invalid subject').required('This field is required'),
  detailing: yup.string().required('This field is required')
}).required()

export const ordersSchema = baseSchema.shape({
  order_number: yup.string().required('This field is required'),
  is_affecting_all_users: yup.boolean().default(false),
})

export const paymentsSchema = baseSchema.shape({
  transaction_number: yup.string().required('This field is required'),
  transaction_status: yup.string().oneOf(TRANSACTION_STATUS).required('This field is required'),
  payment_acquirer: yup.string().required('This field is required'),
})

export const catalogSchema = baseSchema.shape({
  sku_id: yup.string().required('This field is required'),
})

export type BaseSchema = yup.InferType<typeof baseSchema>
export type OrderSchema = yup.InferType<typeof ordersSchema>
export type PaymentsSchema = yup.InferType<typeof paymentsSchema>
export type CatalogSchema = yup.InferType<typeof catalogSchema> & { screenshot?: Blob }
export type OtherSchema = BaseSchema

export type FullSchema = Partial<BaseSchema & OrderSchema & PaymentsSchema & CatalogSchema & OtherSchema>