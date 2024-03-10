import { NextRequest, NextResponse } from "next/server";

const { ZENDESK_SUBDOMAIN, ZENDESK_EMAIL, ZENDESK_PASSWORD } = process.env

function getContentTypeFromBase64String(string: string) {
  const REGEX = /^data:([^;]+);/

  return string.match(REGEX)?.[1] ?? ""
}

const FIELD_MAPPING = {
  'account_name': 23668110907291,
  'requester_email': 23668126579995,
  'subject': 23668565503003,
  'order_number': 23668201672475,
  'is_affecting_all_users': 23668220752667,
  'transaction_number': 23668204395419,
  'transaction_status': 23668226104347,
  'payment_acquirer': 23668226930587,
  'sku_id': 23668227480603
} as const

export async function POST(req: NextRequest) {
  try {
    const authorization_token = btoa(`${ZENDESK_EMAIL}:${ZENDESK_PASSWORD}`)

    const data = await req.formData()
    const subject = data.get('subject')

    let token;

    if (subject === 'Catalog' && data.has('screenshot')) {
      const screenshot = data.get('screenshot') as Blob
      const uploadResponse = await fetch(
        `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/uploads.json?filename=order_issue.png`,
        {
          method: 'POST',
          body: screenshot,
          headers: {
            'Content-Type': screenshot.type,
            'Authorization': `Basic ${authorization_token}`,
          }
        }
      )

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) return NextResponse.json(uploadData, { status: uploadResponse.status })

      if (!uploadData?.upload.token) throw new Error('Error during upload')

      token = uploadData.upload.token as string
    }

    const ticket = {
      subject: data.get('title'),
      priority: 'normal',
      comment: {
        body: data.get('detailing'),
        uploads: token ? [token] : undefined
      },
      custom_fields: [] as { id: number, value: string }[]
    }

    const fields: { id: number, value: any }[] = []

    fields.push({ id: FIELD_MAPPING['account_name'], value: data.get('account_name') })
    fields.push({ id: FIELD_MAPPING['requester_email'], value: data.get('requester_email') })
    fields.push({ id: FIELD_MAPPING['subject'], value: data.get('subject')?.toString().toLowerCase() })


    switch (subject) {
      case 'Orders':
        fields.push({ id: FIELD_MAPPING['order_number'], value: data.get('order_number') })
        // if (data.get('is_affecting_all_users') === 'true')
        fields.push({ id: FIELD_MAPPING['is_affecting_all_users'], value: data.get('is_affecting_all_users') })
        break
      case 'Payments':
        fields.push({ id: FIELD_MAPPING['transaction_number'], value: data.get('transaction_number') })
        fields.push({ id: FIELD_MAPPING['transaction_status'], value: data.get('transaction_status')?.toString().toLowerCase().replaceAll(' ', '_') })
        fields.push({ id: FIELD_MAPPING['payment_acquirer'], value: data.get('payment_acquirer') })
        break
      case 'Catalog':
        fields.push({ id: FIELD_MAPPING['sku_id'], value: data.get('sku_id') })
        break
    }

    ticket.custom_fields = fields

    const response = await fetch(`https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/tickets`,
      {
        method: 'POST',
        body: JSON.stringify({ ticket }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authorization_token}`,
        }
      }
    )

    const ticketResponse = await response.json()

    if (!response.ok) return NextResponse.json(ticketResponse, { status: response.status })

    return NextResponse.json(ticketResponse, { status: 200 })
  } catch (err: any) {
    console.log(err)
    return NextResponse.json({ ...err, message: 'Something went wrong' }, { status: 400 })
  }
}