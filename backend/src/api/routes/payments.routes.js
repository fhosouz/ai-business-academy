import express from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Configurar SDK do Mercado Pago para ES modules
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
});

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const router = express.Router();

// Create payment preference
router.post('/create-preference', async (req, res) => {
  try {
    const { planType, courseName, payerInfo, returnUrl, failureUrl } = req.body;
    
    console.log('=== CREATING MERCADO PAGO PREFERENCE ===');
    console.log('Plan:', planType);
    console.log('Course:', courseName);
    console.log('Payer:', payerInfo);
    
    // Preços dos planos
    const prices = {
      premium: 1.00,
      enterprise: 1.00
    };

    // Criar preferência de pagamento do Mercado Pago
    const preferenceData = {
      items: [{
        id: `plan_${planType}`,
        title: `Plano ${planType.charAt(0).toUpperCase() + planType.slice(1)} - AutomatizeAI Academy`,
        description: courseName ? `Acesso ao curso: ${courseName}` : 'Acesso Premium a todos os cursos',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: Math.round(prices[planType] * 100), // Mercado Pago usa centavos
        category_id: 'services', // Categoria de serviço (recomendado)
      }],
      payer: {
        name: payerInfo?.name || 'Usuario',
        email: payerInfo?.email || 'user@example.com',
        // identification removido - opcional e pode ser adicionado depois
      },
      back_urls: {
        success: returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
        failure: failureUrl || `${process.env.FRONTEND_URL}/payment/failure`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`,
      },
      auto_return: 'approved',
      external_reference: `plan_${planType}_${Date.now()}`,
      payment_methods: {
        excluded_payment_types: [
          {
            id: 'ticket' // Excluir boleto (apenas cartão)
          }
        ],
        installments: 12 // Máximo de parcelas
      },
      statement_descriptor: 'AutomatizeAI Academy', // Nome na fatura
      binary_mode: false // Permite pagamento parcelado
    };

    // Verificar se temos as credenciais do Mercado Pago
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('Mercado Pago access token not configured');
      return res.status(500).json({
        message: 'Mercado Pago not configured',
        error: 'Payment provider not available',
        debug: {
          hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
          environment: process.env.NODE_ENV
        }
      });
    }

    // Criar preferência de pagamento usando SDK oficial (ES modules)
    const preference = new Preference(client);
    const result = await preference.create({
      body: preferenceData
    });
    console.log('Mercado Pago SDK response:', result);
    
    // Registrar pagamento inicial no banco de dados
    try {
      const { data: paymentRecord, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: payerInfo?.userId || null, // TODO: Obter user_id do auth
          provider: 'MERCADO_PAGO',
          external_payment_id: result.id,
          external_reference: `plan_${planType}_${Date.now()}`,
          amount: prices[planType],
          status: 'PENDING',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (paymentError) {
        console.error('Error recording payment:', paymentError);
      } else {
        console.log('Payment recorded:', paymentRecord);
      }
    } catch (dbError) {
      console.error('Database error recording payment:', dbError);
    }
    
    res.json({
      message: 'Payment preference created successfully',
      data: {
        preferenceId: result.id,
        init_point: result.init_point
      }
    });
  } catch (error) {
    console.error('Error in create-preference:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get payment status
router.get('/status/:id', (req, res) => {
  const { id } = req.params;
  
  // Placeholder - implementar lógica real depois
  res.json({
    message: 'Get payment status endpoint - placeholder',
    data: {
      paymentId: id,
      status: 'pending',
      amount: 99.99
    },
    status: 'implemented',
    timestamp: new Date().toISOString()
  });
});

export default router;
