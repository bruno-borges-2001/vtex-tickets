import { FIELD_MAPPING } from "@/lib/consts";
import { NextRequest, NextResponse } from "next/server";

const { ZENDESK_SUBDOMAIN, ZENDESK_EMAIL, ZENDESK_PASSWORD } = process.env

export async function POST(req: NextRequest) {
  try {
    // get authorization token
    const authorization_token = btoa(`${ZENDESK_EMAIL}:${ZENDESK_PASSWORD}`)

    const data = await req.formData()
    const subject = data.get('subject')

    let token;

    // handle attachment upload
    if (subject === 'Catalog' && data.has('screenshot')) {
      const screenshot = data.get('screenshot') as File

      const uploadResponse = await fetch(
        `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/uploads.json?filename=${screenshot.name}`,
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

    const custom_fields: { id: number, value: unknown }[] = []

    // add default fields
    custom_fields.push({ id: FIELD_MAPPING['account_name'], value: data.get('account_name') })
    custom_fields.push({ id: FIELD_MAPPING['requester_email'], value: data.get('requester_email') })
    custom_fields.push({ id: FIELD_MAPPING['subject'], value: data.get('subject')?.toString().toLowerCase() })

    // add subject specific fields
    switch (subject) {
      case 'Orders':
        custom_fields.push({ id: FIELD_MAPPING['order_number'], value: data.get('order_number') })
        custom_fields.push({ id: FIELD_MAPPING['is_affecting_all_users'], value: data.get('is_affecting_all_users') === 'true' ? 'affecting_all_users' : 'not_affecting_all_users' })
        break
      case 'Payments':
        custom_fields.push({ id: FIELD_MAPPING['transaction_number'], value: data.get('transaction_number') })
        custom_fields.push({ id: FIELD_MAPPING['transaction_status'], value: data.get('transaction_status')?.toString().toLowerCase().replaceAll(' ', '_') })
        custom_fields.push({ id: FIELD_MAPPING['payment_acquirer'], value: data.get('payment_acquirer') })
        break
      case 'Catalog':
        custom_fields.push({ id: FIELD_MAPPING['sku_id'], value: data.get('sku_id') })
        break
    }

    console.log(custom_fields)

    // create ticket object
    const ticket = {
      subject: data.get('title'),
      priority: 'normal',
      comment: {
        body: data.get('detailing'),
        uploads: token ? [token] : undefined
      },
      custom_fields
    }

    console.log(JSON.stringify({ ticket }))

    // create ticket request
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

    // return ticket object as response with status code 200
    return NextResponse.json(ticketResponse, { status: 200 })
  } catch (err: unknown) {
    // return error with status code 400
    return NextResponse.json(err, { status: 400 })
  }
}