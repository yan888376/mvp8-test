import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function createStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required')
  }
  
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-09-30.clover',
  })
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    const stripe = createStripeClient()
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
  }

  // 处理支付成功事件
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const { planType, billingCycle, userEmail } = session.metadata || {}

    if (!planType || !billingCycle || !userEmail) {
      console.error('Missing metadata in session:', { planType, billingCycle, userEmail })
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    // 计算订阅到期时间（使用 billingCycle）
    const now = new Date()
    const expireTime = new Date(now)
    if (billingCycle === 'yearly') {
      expireTime.setFullYear(expireTime.getFullYear() + 1)
    } else {
      expireTime.setMonth(expireTime.getMonth() + 1)
    }

    console.log('📅 Stripe subscription period:', {
      planType,
      billingCycle,
      startTime: now.toISOString(),
      expireTime: expireTime.toISOString()
    })

    // 获取支付金额
    const amountTotal = session.amount_total || 0 // Stripe 金额已经是分为单位
    const amountInCents = amountTotal

    // 更新Supabase订阅状态（使用 web_subscriptions）
    const { data: subscriptionRows, error: subError } = await supabase.from('web_subscriptions').upsert({
      user_email: userEmail,
      platform: 'web',
      payment_method: 'stripe',
      plan_type: planType,
      billing_cycle: billingCycle,
      status: 'active',
      start_time: now.toISOString(),
      expire_time: expireTime.toISOString(),
      stripe_session_id: session.id,
      auto_renew: false,
      next_billing_date: expireTime.toISOString(),
      updated_at: now.toISOString(),
    }, {
      onConflict: 'user_email'
    }).select().maybeSingle()

    if (subError) {
      console.error('Failed to update subscription:', subError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // 记录支付交易（用于利润统计）
    const paymentFee = Math.round(amountInCents * 0.029 + 30) // Stripe 2.9% + $0.30
    const netAmount = amountInCents - paymentFee
    const { error: txError } = await supabase.from('web_payment_transactions').insert({
      subscription_id: subscriptionRows?.id ?? null,
      user_email: userEmail,
      product_name: 'sitehub',
      plan_type: planType,
      billing_cycle: billingCycle,
      payment_method: 'stripe',
      payment_status: 'completed',
      transaction_type: 'purchase',
      currency: 'USD',
      gross_amount: amountInCents,
      payment_fee: paymentFee,
      net_amount: netAmount,
      service_cost: 0,
      profit: netAmount,
      stripe_session_id: session.id,
      stripe_payment_intent_id: (session.payment_intent as string) || null,
      payment_time: now.toISOString(),
      metadata: {
        planType,
        billingCycle,
        paymentIntent: session.payment_intent,
        checkoutMode: session.mode
      }
    })

    if (txError) {
      console.error('Failed to record payment transaction:', txError)
      // 不返回错误，因为订阅已经创建成功
    }

    console.log('✅ Subscription activated:', userEmail, planType)
  }

  return NextResponse.json({ received: true })
}
