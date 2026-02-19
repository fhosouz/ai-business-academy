import { Router } from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const router = Router();

// Configurar Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-ACCESS-TOKEN' 
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
      MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN ? 'CONFIGURED' : 'NOT CONFIGURED',
      NODE_ENV: process.env.NODE_ENV,
      BACKEND_URL: process.env.BACKEND_URL,
      FRONTEND_URL: process.env.FRONTEND_URL
    });
    console.log('MP Token Configured:', !!process.env.MERCADO_PAGO_ACCESS_TOKEN);
    console.log('MP Token Length:', process.env.MERCADO_PAGO_ACCESS_TOKEN?.length || 0);

    const prices = {
      premium: 99.90,
      enterprise: 299.90
    };

    // Criar preferência REAL do Mercado Pago
    const preferenceData = {
      items: [
        {
          id: `item_${planType}_${Date.now()}`,
          title: `Plano ${planType.toUpperCase()} - AI Business Academy`,
          description: `Acesso ao plano ${planType} ${courseName ? `para o curso ${courseName}` : ''}`,
          unit_price: prices[planType] || prices.premium,
          quantity: 1,
          currency_id: 'BRL'
        }
      ],
      payer: {
        name: payerInfo?.name || 'Usuario',
        email: payerInfo?.email || 'user@example.com'
      },
      back_urls: {
        success: returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
        failure: failureUrl || `${process.env.FRONTEND_URL}/payment/failure`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`
      },
      auto_return: 'approved',
      external_reference: `${planType}_${Date.now()}`,
      notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`
    };

    let response;
    
    console.log('=== ENVIRONMENT CHECK ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MERCADO_PAGO_ACCESS_TOKEN exists:', !!process.env.MERCADO_PAGO_ACCESS_TOKEN);
    console.log('MERCADO_PAGO_ACCESS_TOKEN length:', process.env.MERCADO_PAGO_ACCESS_TOKEN?.length || 0);
    console.log('All env vars starting with MERCADO:', Object.keys(process.env).filter(k => k.startsWith('MERCADO')));
    
    // Forçar produção para teste
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
    const hasToken = process.env.MERCADO_PAGO_ACCESS_TOKEN && process.env.MERCADO_PAGO_ACCESS_TOKEN.length > 50;
    
    if (hasToken && isProduction) {
      // PRODUÇÃO - Usar API real do Mercado Pago
      console.log('=== CREATING REAL MERCADO PAGO PREFERENCE ===');
      const preference = new Preference(client);
      response = await preference.create({ body: preferenceData });
    } else {
      // DESENVOLVIMENTO/FALHA TOKEN - Simular
      console.log('=== CREATING SIMULATED PREFERENCE ===');
      console.log('Reason:', hasToken ? 'Not production' : 'No valid token');
      const preferenceId = `preference_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      response = {
        body: {
          id: preferenceId,
          init_point: `https://www.mercadopago.com.br/checkout/v1/redirect?preference_id=${preferenceId}`,
          sandbox_init_point: `https://sandbox.mercadopago.com.br/checkout/v1/redirect?preference_id=${preferenceId}`
        }
      };
    }
    
    console.log('=== PREFERENCE CREATED ===');
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

// Webhook para notificações do Mercado Pago
router.post('/webhook', (req, res) => {
  try {
    console.log('=== MERCADO PAGO WEBHOOK ===');
    console.log('Body:', req.body);
    
    // Simular processamento do webhook
    // Em produção, aqui você processaria o pagamento e atualizaria o plano do usuário
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('ERROR');
  }
});

export { router as paymentsRoutes };
