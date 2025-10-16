import { NextRequest, NextResponse } from 'next/server'
import * as AlipaySdk from 'alipay-sdk'
import { createClient } from '@supabase/supabase-js'

const SUCCESS_RESPONSE = 'success'
const FAILURE_RESPONSE = 'fail'

function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are required')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

function createAlipaySdk() {
  if (!process.env.ALIPAY_APP_ID || !process.env.ALIPAY_PRIVATE_KEY || !process.env.ALIPAY_PUBLIC_KEY) {
    throw new Error('Alipay environment variables are not configured. Please set ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY, and ALIPAY_PUBLIC_KEY.')
  }

  return new AlipaySdk({
    appId: process.env.ALIPAY_APP_ID,
    privateKey: process.env.ALIPAY_PRIVATE_KEY,
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
    gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
    camelcase: true
  })
}

function parsePassbackParams(raw?: string) {
  if (!raw) return null

  try {
    const onceDecoded = decodeURIComponent(raw)
    const decoded = onceDecoded.includes('%7B') || onceDecoded.includes('%22') ? decodeURIComponent(onceDecoded) : onceDecoded
    return JSON.parse(decoded)
  } catch (error) {
    console.warn('Failed to parse passback_params:', raw, error)
    return null
  }
}

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text()
    const formData = new URLSearchParams(bodyText)
    const params: Record<string, string> = {}
    formData.forEach((value, key) => {
      params[key] = value
    })

    const alipaySdk = createAlipaySdk()
    const validSign = alipaySdk.checkNotifySign(params)
    if (!validSign) {
      console.error('Alipay notify signature verification failed:', params)
      return new NextResponse(FAILURE_RESPONSE)
    }

    const tradeStatus = params.trade_status
    if (tradeStatus !== 'TRADE_SUCCESS' && tradeStatus !== 'TRADE_FINISHED') {
      console.log('Alipay notification ignored due to status:', tradeStatus)
      return new NextResponse(SUCCESS_RESPONSE)
    }

    const passback = parsePassbackParams(params.passback_params || params.passbackParams)

    if (!passback || !passback.userEmail || !passback.planType || !passback.billingCycle) {
      console.error('Missing passback parameters in Alipay notify payload:', passback)
      return new NextResponse(FAILURE_RESPONSE)
    }

    const supabase = createSupabaseClient()
    const now = new Date()
    const expireTime = new Date(now)
    if (passback.billingCycle === 'yearly') {
      expireTime.setFullYear(expireTime.getFullYear() + 1)
    } else {
      expireTime.setMonth(expireTime.getMonth() + 1)
    }

    const { data: subscription, error: upsertError } = await supabase
      .from('web_subscriptions')
      .upsert(
        {
          user_email: passback.userEmail,
          platform: 'web',
          payment_method: 'alipay',
          plan_type: passback.planType,
          billing_cycle: passback.billingCycle,
          status: 'active',
          start_time: now.toISOString(),
          expire_time: expireTime.toISOString(),
          auto_renew: false,
          next_billing_date: expireTime.toISOString(),
          alipay_order_id: params.trade_no,
          updated_at: now.toISOString()
        },
        { onConflict: 'user_email' }
      )
      .select()
      .maybeSingle()

    if (upsertError) {
      console.error('Failed to upsert Alipay subscription:', upsertError)
      return new NextResponse(FAILURE_RESPONSE)
    }

    const amountInCents = Math.round(Number.parseFloat(params.total_amount || '0') * 100)
    const { error: txError } = await supabase.from('web_payment_transactions').insert({
      subscription_id: subscription?.id ?? null,
      user_email: passback.userEmail,
      product_name: 'sitehub',
      plan_type: passback.planType,
      billing_cycle: passback.billingCycle,
      payment_method: 'alipay',
      payment_status: 'completed',
      transaction_type: 'purchase',
      currency: params.settle_currency || 'CNY',
      gross_amount: amountInCents,
      payment_fee: 0,
      net_amount: amountInCents,
      service_cost: 0,
      profit: amountInCents,
      alipay_trade_no: params.trade_no,
      payment_time: now.toISOString(),
      metadata: {
        buyer: params.buyer_logon_id || params.buyer_id,
        orderId: passback.orderId,
        notifyId: params.notify_id
      }
    })

    if (txError) {
      console.error('Failed to insert Alipay payment transaction:', txError)
    }

    return new NextResponse(SUCCESS_RESPONSE)
  } catch (error) {
    console.error('Alipay notify handler error:', error)
    return new NextResponse(FAILURE_RESPONSE)
  }
}

export async function GET(req: NextRequest) {
  const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')}/payment/cancel`
  return NextResponse.redirect(returnUrl)
}
