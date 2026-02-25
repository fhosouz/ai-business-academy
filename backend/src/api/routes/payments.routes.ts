import { Router } from 'express';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configurar Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-ACCESS-TOKEN' 
});

// Criar preferência de pagamento (PRODUÇÃO)
router.post('/create-preference', async (req, res) => {
  try {
    const { planType, courseName, payerInfo, returnUrl, failureUrl } = req.body;
    
    console.log('=== CREATING PAYMENT PREFERENCE ===');
    console.log('Plan:', planType);
    console.log('Course:', courseName);
    console.log('Payer:', payerInfo);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('All ENV vars:', {
      MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN ? 'CONFIGURED' : 'NOT CONFIGURED',
      NODE_ENV: process.env.NODE_ENV,
      BACKEND_URL: process.env.BACKEND_URL,
      FRONTEND_URL: process.env.FRONTEND_URL
    });
    console.log('MP Token Configured:', !!process.env.MERCADOPAGO_ACCESS_TOKEN);
    console.log('MP Token Length:', process.env.MERCADOPAGO_ACCESS_TOKEN?.length || 0);

    console.log('=== MERCADO PAGO ACCOUNT DEBUG ===');
    console.log('Access Token first 20 chars:', process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 20) + '...');
    
    // Extrair informações do token
    if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
      try {
        const tokenParts = process.env.MERCADOPAGO_ACCESS_TOKEN.split('-');
        if (tokenParts.length >= 2) {
          const appId = tokenParts[0];
          const userId = tokenParts[1];
          console.log('App ID:', appId);
          console.log('User ID (Collector):', userId);
          console.log('Account URL:', `https://www.mercadopago.com.br/users/${userId}`);
        }
      } catch (e) {
        console.log('Error parsing token:', e.message);
      }
    }
    
    const prices = {
      premium: 1.00,
      enterprise: 1.00
    };

    // URLs configuradas corretamente
    const backendUrl = process.env.BACKEND_URL || 'https://ai-business-academy-backend.onrender.com';
    const frontendUrl = process.env.FRONTEND_URL || 'https://automatizeai-academy.netlify.app';
    
    console.log('=== CONFIGURED URLS ===');
    console.log('Backend URL:', backendUrl);
    console.log('Frontend URL:', frontendUrl);

    // Criar preferência REAL do Mercado Pago
    const preferenceData = {
      items: [
        {
          id: `item_${planType}_${Date.now()}`,
          title: `Plano ${planType.toUpperCase()} - AI Business Academy`,
          description: `Acesso ao plano ${planType} ${courseName ? `para o curso ${courseName}` : ''}`,
          unit_price: prices[planType] || prices.premium,
          quantity: 1,
          currency_id: 'BRL',
          picture_url: 'https://automatizeai-academy.netlify.app/logo.svg'
        }
      ],
      payer: {
        // Removidos dados padrão - usuário deve preencher manualmente
        name: null,
        email: null,
        identification: {
          type: 'CPF',
          number: null
        },
        address: {
          zip_code: null,
          street_name: null,
          street_number: null,
          neighborhood: null,
          city: null,
          federal_unit: null
        },
        phone: {
          area_code: null,
          number: null
        }
      },
      back_urls: {
        success: returnUrl || `${frontendUrl}/payment/success`,
        failure: failureUrl || `${frontendUrl}/payment/failure`,
        pending: `${frontendUrl}/payment/pending`
      },
      auto_return: 'approved',
      external_reference: `${planType}_${Date.now()}`,
      notification_url: `${backendUrl}/api/payments/webhook`,
      payment_methods: {
        // Removido exclusões e padrões para máxima flexibilidade
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: 12
      }
    };

    console.log('=== PREFERENCE DATA ===');
    console.log('Full preference data:', JSON.stringify(preferenceData, null, 2));
    console.log('Item price:', preferenceData.items[0].unit_price);
    console.log('Total amount:', preferenceData.items[0].unit_price * preferenceData.items[0].quantity);

    let response;
    
    console.log('=== ENVIRONMENT CHECK ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MERCADOPAGO_ACCESS_TOKEN exists:', !!process.env.MERCADOPAGO_ACCESS_TOKEN);
    console.log('MERCADOPAGO_ACCESS_TOKEN length:', process.env.MERCADOPAGO_ACCESS_TOKEN?.length || 0);
    console.log('All env vars starting with MERCADO:', Object.keys(process.env).filter(k => k.startsWith('MERCADO')));
    
    // Forçar produção para teste
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
    const hasToken = process.env.MERCADOPAGO_ACCESS_TOKEN && process.env.MERCADOPAGO_ACCESS_TOKEN.length > 50;
    const forceSandbox = process.env.FORCE_SANDBOX === 'true'; // Nova variável para forçar sandbox
    
    console.log('=== PAYMENT MODE ===');
    console.log('Is Production:', isProduction);
    console.log('Has Token:', hasToken);
    console.log('Force Sandbox:', forceSandbox);
    
    if (hasToken && isProduction && !forceSandbox) {
      // PRODUÇÃO - Usar API real do Mercado Pago
      console.log('=== CREATING REAL MERCADO PAGO PREFERENCE ===');
      try {
        const preference = new Preference(client);
        const mpResponse = await preference.create({ body: preferenceData });
        console.log('Mercado Pago Response:', JSON.stringify(mpResponse, null, 2));
        
        response = {
          body: mpResponse
        };
      } catch (mpError) {
        console.error('Mercado Pago API Error:', mpError);
        throw new Error(`Mercado Pago API Error: ${mpError.message}`);
      }
    } else {
      // DESENVOLVIMENTO/FALHA TOKEN/FORÇADO SANDBOX - Simular
      const reason = forceSandbox ? 'Forced sandbox mode' : (hasToken ? 'Not production' : 'No valid token');
      console.log('=== CREATING SIMULATED PREFERENCE ===');
      console.log('Reason:', reason);
      const preferenceId = `preference_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      response = {
        body: {
          id: preferenceId,
          init_point: `https://sandbox.mercadopago.com.br/checkout/v1/redirect?preference_id=${preferenceId}`,
          sandbox_init_point: `https://sandbox.mercadopago.com.br/checkout/v1/redirect?preference_id=${preferenceId}`
        }
      };
    }
    
    console.log('=== PREFERENCE CREATED ===');
    console.log('Response object:', JSON.stringify(response, null, 2));
    console.log('Response.body:', JSON.stringify(response?.body, null, 2));
    console.log('Response type:', typeof response);
    console.log('Response.body type:', typeof response?.body);
    
    if (!response || !response.body) {
      console.error('ERROR: Response or response.body is undefined!');
      throw new Error('Invalid response from Mercado Pago API');
    }
    
    console.log('Preference ID:', response.body.id);
    console.log('Init Point:', response.body.init_point);

    res.json({
      success: true,
      data: {
        id: response.body.id,
        init_point: response.body.init_point,
        sandbox_init_point: response.body.sandbox_init_point
      }
    });

  } catch (error) {
    console.error('Error creating payment preference:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar preferência de pagamento',
      error: error.message
    });
  }
});

// Verificar status do pagamento
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simular status do pagamento
    res.json({
      success: true,
      data: {
        id: id,
        status: 'approved',
        status_detail: 'accredited',
        payment_method_id: 'test_payment_method',
        payment_type: 'credit_card',
        merchant_account_id: 'test_merchant',
        payer: {
          id: 'test_payer_id',
          email: 'test@example.com'
        },
        transaction_amount: 99.90,
        date_created: new Date().toISOString(),
        date_approved: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status do pagamento',
      error: error.message
    });
  }
});

// Endpoint para testar webhook manualmente
router.post('/test-webhook', async (req, res) => {
  try {
    console.log('=== MANUAL WEBHOOK TEST ===');
    
    // Simular dados do pagamento aprovado
    const testPaymentData = {
      topic: 'payment',
      action: 'payment.created',
      data: {
        id: '147773647340' // Usar o ID real do pagamento
      }
    };
    
    // Processar como se fosse o webhook real
    req.body = testPaymentData;
    
    // Chamar a lógica do webhook
    const { topic, action, data } = testPaymentData;
    
    if (topic === 'payment' || action === 'payment.created') {
      const paymentId = data?.id;
      console.log('Processing payment:', paymentId);
      
      if (paymentId) {
        try {
          const client = new MercadoPagoConfig({ 
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
          });
          const payment = new Payment(client);
          const paymentData = await payment.get({ id: paymentId });
          
          console.log('Payment data:', JSON.stringify(paymentData, null, 2));
          
          if (paymentData.status === 'approved') {
            console.log('✅ Payment approved - Processing user upgrade');
            
            const payerEmail = paymentData.payer?.email;
            const externalReference = paymentData.external_reference;
            const amount = paymentData.transaction_amount;
            
            console.log('Payer email:', payerEmail);
            console.log('External reference:', externalReference);
            console.log('Amount:', amount);
            
            if (payerEmail) {
              const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
              
              if (!userError && userData.users) {
                const user = userData.users.find(u => u.email === payerEmail);
                
                if (user) {
                  console.log('✅ User found:', user.id);
                  
                  const { error: paymentError } = await supabase
                    .from('payments')
                    .insert({
                      user_id: user.id,
                      payment_id: paymentId,
                      amount: amount,
                      status: 'approved',
                      payment_method: paymentData.payment_method_id,
                      external_reference: externalReference,
                      payment_data: paymentData,
                      created_at: new Date().toISOString()
                    });
                  
                  if (paymentError) {
                    console.error('❌ Error saving payment:', paymentError);
                  } else {
                    console.log('✅ Payment saved successfully');
                    
                    const { error: updateError } = await supabase
                      .from('user_profiles')
                      .upsert({
                        user_id: user.id,
                        plan: 'premium',
                        updated_at: new Date().toISOString()
                      }, {
                        onConflict: 'user_id'
                      });
                    
                    if (updateError) {
                      console.error('❌ Error updating user plan:', updateError);
                    } else {
                      console.log('✅ User plan updated to premium');
                    }
                  }
                } else {
                  console.log('❌ User not found for email:', payerEmail);
                }
              } else {
                console.error('❌ Error fetching users:', userError);
              }
            }
          } else {
            console.log('Payment not approved, status:', paymentData.status);
          }
        } catch (mpError) {
          console.error('❌ Error fetching payment from Mercado Pago:', mpError);
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Webhook test completed',
      checkLogs: 'See backend logs for details'
    });
  } catch (error) {
    console.error('Error in test webhook:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Webhook para notificações do Mercado Pago
router.post('/webhook', async (req, res) => {
  try {
    console.log('=== MERCADO PAGO WEBHOOK ===');
    console.log('Body:', req.body);
    
    const { topic, resource, action, data } = req.body;
    
    // Processar diferentes tipos de notificações
    if (topic === 'payment' || action === 'payment.created') {
      const paymentId = data?.id || resource;
      console.log('Processing payment:', paymentId);
      
      if (paymentId) {
        // Buscar informações detalhadas do pagamento
        try {
          const client = new MercadoPagoConfig({ 
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
          });
          const payment = new Payment(client);
          const paymentData = await payment.get({ id: paymentId });
          
          console.log('Payment data:', JSON.stringify(paymentData, null, 2));
          
          if (paymentData.status === 'approved') {
            console.log('✅ Payment approved - Processing user upgrade');
            
            // Extrair informações do pagamento
            const payerEmail = paymentData.payer?.email;
            const externalReference = paymentData.external_reference;
            const amount = paymentData.transaction_amount;
            
            console.log('Payer email:', payerEmail);
            console.log('External reference:', externalReference);
            console.log('Amount:', amount);
            
            if (payerEmail) {
              // Buscar usuário pelo email
              const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
              
              if (!userError && userData.users) {
                const user = userData.users.find(u => u.email === payerEmail);
                
                if (user) {
                  console.log('✅ User found:', user.id);
                  
                  // Salvar registro do pagamento
                  const { error: paymentError } = await supabase
                    .from('payments')
                    .insert({
                      user_id: user.id,
                      payment_id: paymentId,
                      amount: amount,
                      status: 'approved',
                      payment_method: paymentData.payment_method_id,
                      external_reference: externalReference,
                      payment_data: paymentData,
                      created_at: new Date().toISOString()
                    });
                  
                  if (paymentError) {
                    console.error('❌ Error saving payment:', paymentError);
                  } else {
                    console.log('✅ Payment saved successfully');
                    
                    // Atualizar plano do usuário
                    const { error: updateError } = await supabase
                      .from('user_profiles')
                      .upsert({
                        user_id: user.id,
                        plan: 'premium',
                        updated_at: new Date().toISOString()
                      }, {
                        onConflict: 'user_id'
                      });
                    
                    if (updateError) {
                      console.error('❌ Error updating user plan:', updateError);
                    } else {
                      console.log('✅ User plan updated to premium');
                    }
                  }
                } else {
                  console.log('❌ User not found for email:', payerEmail);
                }
              } else {
                console.error('❌ Error fetching users:', userError);
              }
            }
          } else {
            console.log('Payment not approved, status:', paymentData.status);
          }
        } catch (mpError) {
          console.error('❌ Error fetching payment from Mercado Pago:', mpError);
        }
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('ERROR');
  }
});

export { router as paymentsRoutes };
