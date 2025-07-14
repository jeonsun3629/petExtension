// supabase/functions/issue-license/index.ts
// 결제 검증 및 라이선스 발급 Edge Function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  paymentProvider: 'paypal' | 'toss'
  paymentId: string
  userEmail: string
  amount?: number
}

serve(async (req) => {
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Supabase 클라이언트 초기화
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 요청 데이터 파싱
    const { paymentProvider, paymentId, userEmail, amount }: PaymentRequest = await req.json()

    if (!paymentProvider || !paymentId || !userEmail) {
      return new Response(
        JSON.stringify({ success: false, error: '필수 파라미터가 누락되었습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 이미 처리된 결제인지 확인
    const { data: existingLicense } = await supabase
      .from('licenses')
      .select('license_key')
      .eq('payment_id', paymentId)
      .single()

    if (existingLicense) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          licenseKey: existingLicense.license_key,
          message: '이미 발급된 라이선스입니다.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 결제 검증
    let verificationResult = false
    let paymentAmount = amount || 9.99

    if (paymentProvider === 'paypal') {
      verificationResult = await verifyPayPalPayment(paymentId)
    } else if (paymentProvider === 'toss') {
      verificationResult = await verifyTossPayment(paymentId)
    }

    if (!verificationResult) {
      return new Response(
        JSON.stringify({ success: false, error: '결제 검증에 실패했습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 라이선스 키 생성
    const licenseKey = generateLicenseKey(paymentProvider, paymentId)

    // 라이선스 저장
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .insert({
        license_key: licenseKey,
        user_email: userEmail,
        payment_provider: paymentProvider,
        payment_id: paymentId,
        status: 'active'
      })
      .select()
      .single()

    if (licenseError) {
      console.error('라이선스 저장 실패:', licenseError)
      return new Response(
        JSON.stringify({ success: false, error: '라이선스 저장에 실패했습니다.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 결제 내역 저장
    await supabase
      .from('payments')
      .insert({
        license_id: license.id,
        payment_provider: paymentProvider,
        payment_id: paymentId,
        amount: paymentAmount,
        currency: 'USD',
        status: 'completed',
        verified_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        licenseKey: licenseKey,
        message: '라이선스가 성공적으로 발급되었습니다.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('서버 오류:', error)
    return new Response(
      JSON.stringify({ success: false, error: '서버 내부 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// PayPal 결제 검증
async function verifyPayPalPayment(orderId: string): Promise<boolean> {
  try {
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID')
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')
    const baseUrl = Deno.env.get('PAYPAL_BASE_URL') || 'https://api-m.sandbox.paypal.com' // sandbox or live

    // PayPal 액세스 토큰 획득
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    })

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // 주문 상세 정보 조회
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const orderData = await orderResponse.json()
    
    // 결제 완료 상태 확인
    return orderData.status === 'COMPLETED'

  } catch (error) {
    console.error('PayPal 검증 오류:', error)
    return false
  }
}

// Toss 결제 검증
async function verifyTossPayment(paymentKey: string): Promise<boolean> {
  try {
    const secretKey = Deno.env.get('TOSS_SECRET_KEY')
    const baseUrl = 'https://api.tosspayments.com'

    const response = await fetch(`${baseUrl}/v1/payments/${paymentKey}`, {
      headers: {
        'Authorization': `Basic ${btoa(secretKey + ':')}`
      }
    })

    const paymentData = await response.json()
    
    // 결제 완료 상태 확인
    return paymentData.status === 'DONE'

  } catch (error) {
    console.error('Toss 검증 오류:', error)
    return false
  }
}

// 라이선스 키 생성
function generateLicenseKey(provider: string, paymentId: string): string {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomPart = Math.random().toString(36).substr(2, 8).toUpperCase()
  const providerCode = provider.toUpperCase().slice(0, 2)
  
  return `${providerCode}${timestamp}${randomPart}`
} 