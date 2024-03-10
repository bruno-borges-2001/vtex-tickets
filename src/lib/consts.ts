export const SUBJECTS = ['Orders', 'Payments', 'Catalog', 'Others'] as const
export const TRANSACTION_STATUS = ['Pending', 'In Progress', 'Completed'] as const

export const FIELD_MAPPING = {
  'account_name': 23668110907291,
  'requester_email': 23668126579995,
  'subject': 23668565503003,
  'order_number': 23668201672475,
  'is_affecting_all_users': 23674397259035,
  'transaction_number': 23668204395419,
  'transaction_status': 23668226104347,
  'payment_acquirer': 23668226930587,
  'sku_id': 23668227480603
} as const