import { NextRequest, NextResponse } from "next/server";

const { ZENDESK_SUBDOMAIN, ZENDESK_EMAIL, ZENDESK_PASSWORD } = process.env

function getContentTypeFromBase64String(string: string) {
  const REGEX = /^data:([^;]+);/

  return string.match(REGEX)?.[1] ?? ""
}

export async function POST(req: NextRequest) {
  try {
    // const authorization_token = atob(`${ZENDESK_EMAIL}:${ZENDESK_PASSWORD}`)

    const data = await req.formData()
    const subject = data.get('subject')

    let token;

    // if (subject === 'Catalog' && data.has('screenshot')) {
    //   const screenshot = data.get('screenshot') as string
    //   const uploadResponse = await fetch(
    //     `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/uploads.json?filename=order_issue.png`,
    //     {
    //       method: 'POST',
    //       body: screenshot,
    //       headers: {
    //         'Content-Type': getContentTypeFromBase64String(screenshot),
    //         'Authorization': `Basic ${authorization_token}`,
    //       }
    //     }
    //   )

    //   const uploadData = await uploadResponse.json()

    //   if (!uploadResponse.ok) throw new Error(uploadData)

    //   if (!uploadData?.token) throw new Error('Error during upload')

    //   token = uploadData.token as string
    // }

    const ticket = {
      subject,
      comment: {
        body: data.get('detailing'),
        uploads: token ? [token] : undefined
      },
      custom_fields: [] as { [key: string]: unknown }[]
    }

    const fields: { [key: string]: unknown } = {
      account_name: data.get('account_name'),
      requester_email: data.get('requester_email')
    }

    switch (subject) {
      case 'Orders':
        fields.order_number = data.get('order_number')
        fields.is_affecting_all_users = data.get('is_affecting_all_users')?.toString()
        break
      case 'Payments':
        fields.transaction_number = data.get('transaction_number')
        fields.transaction_status = data.get('transaction_status')
        fields.payment_acquirer = data.get('payment_acquirer')
        break
      case 'Catalog':
        fields.sku_id = data.get('sku_id')
        break
    }

    ticket.custom_fields[0] = fields

    // const response = await fetch(`https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/tickets`,
    //   {
    //     method: 'POST',
    //     body: JSON.stringify({ ticket }),
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Basic ${authorization_token}`,
    //     }
    //   }
    // )

    // const ticketResponse = await response.json()

    // return NextResponse.json(ticketResponse, { status: 200 })

    return NextResponse.json({ ...ticket, id: 12345 }, { status: 200 })
  } catch (err) {
    return NextResponse.json(err, { status: 400 })
  }
}