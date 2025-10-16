import { NextRequest, NextResponse } from 'next/server'
import * as AlipaySdk from 'alipay-sdk'
import { randomUUID } from 'crypto'

interface PricingPlan {
  name: string
  monthlyPrice: number
  yearlyPrice: number
}

const pricingPlans: Record<string, PricingPlan> = {
  pro: {
    name: 'Pro',
    monthlyPrice: 0.5,
    yearlyPrice: 168
  },
  team: {
    name: 'Team',
    monthlyPrice: 1,
    yearlyPrice: 2520
  }
}

const REQUIRED_ENV_VARS = [
  'ALIPAY_APP_ID',
  'ALIPAY_PRIVATE_KEY',
  'ALIPAY_PUBLIC_KEY',
  'NEXT_PUBLIC_SITE_URL'
] as const

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required Alipay environment variables: ${missing.join(', ')}`)
  }
}

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    validateEnv()

    const { planType, billingCycle, userEmail } = await req.json()

    if (!planType || !billingCycle || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: planType, billingCycle, and userEmail' },
        { status: 400 }
      )
    }

    const plan = pricingPlans[planType as keyof typeof pricingPlans]
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan type. Must be "pro" or "team"' },
        { status: 400 }
      )
    }

    const amount =
      billingCycle === 'yearly'
        ? plan.yearlyPrice
        : plan.monthlyPrice

    if (!amount || Number.isNaN(amount)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle. Must be "monthly" or "yearly"' },
        { status: 400 }
      )
    }

    const orderId = `ALI_${randomUUID()}`
    const alipaySdk = new AlipaySdk.default({
      appId: process.env.ALIPAY_APP_ID!,
      privateKey: process.env.ALIPAY_PRIVATE_KEY!,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
      gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
      camelcase: true
    })

    const subject =
      planType === 'team'
        ? 'SiteHub Team Membership'
        : 'SiteHub Pro Membership'

    const passback = encodeURIComponent(JSON.stringify({
      planType,
      billingCycle,
      userEmail,
      orderId
    }))

    const notifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')}/api/payment/alipay/notify`
    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')}/payment/success?provider=alipay&order=${orderId}`

    const paymentUrl = await alipaySdk.exec('alipay.trade.page.pay', {
      bizContent: {
        outTradeNo: orderId,
        productCode: 'FAST_INSTANT_TRADE_PAY',
        totalAmount: amount.toFixed(2),
        subject,
        body: `SiteHub ${plan.name} - ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} Plan`
      },
      passbackParams: passback
    }, {
      method: 'GET',
      returnUrl,
      notifyUrl
    })

    return NextResponse.json({
      paymentUrl,
      orderId
    })
  } catch (error) {
    console.error('Alipay order creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Alipay order' },
      { status: 500 }
    )
  }
}
