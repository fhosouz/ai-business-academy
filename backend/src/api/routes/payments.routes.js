import express from 'express';
import mercadopago from 'mercadopago';

// Configurar SDK do Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

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
      premium: 99.90,
      enterprise: 299.90
    };

    // Criar preferência de pagamento do Mercado Pago
    const preferenceData = {
      items: [{
        id: `plan_${planType}`,
        title: `Plano ${planType.charAt(0).toUpperCase() + planType.slice(1)} - AI Business Academy`,
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
      statement_descriptor: 'AI Business Academy', // Nome na fatura
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

    // Criar preferência de pagamento usando SDK oficial
    const preference = await mercadopago.preferences.create(preferenceData);
    console.log('Mercado Pago SDK response:', preference);
    
    res.json({
      message: 'Payment preference created successfully',
      data: {
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point
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
