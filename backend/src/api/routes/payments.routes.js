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

// Verificar configuração do Supabase
console.log('=== SUPABASE CONFIG ===');
console.log('URL:', process.env.SUPABASE_URL);
console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'NOT CONFIGURED');

const router = express.Router();

// Create payment preference
router.post('/create-preference', async (req, res) => {
  try {
    const { planType, courseName, payerInfo, returnUrl, failureUrl } = req.body;
    
    // Input validation
    if (!planType || !['premium', 'enterprise'].includes(planType)) {
      return res.status(400).json({
        message: 'Invalid or missing planType',
        error: 'planType must be premium or enterprise'
      });
    }

    if (!payerInfo?.email) {
      return res.status(400).json({
        message: 'Missing required payer information',
        error: 'payerInfo.email is required'
      });
    }

    console.log('Creating payment preference for plan:', planType);
    
    // Preços dos planos - EM REAIS (DECIMAL)
    const prices = {
      premium: 1.00,      // R$ 1,00 em reais
      enterprise: 1.00    // R$ 1,00 em reais
    };

    // Dados do usuário logado (priorizar dados reais)
    const userData = {
      name: payerInfo?.name || req.user?.user_metadata?.full_name || req.user?.email?.split('@')[0] || 'Usuario',
      surname: payerInfo?.surname || req.user?.user_metadata?.surname || '',
      email: payerInfo?.email || req.user?.email || 'user@example.com',
      identification: {
        type: 'CPF',
        number: req.user?.user_metadata?.cpf || payerInfo?.cpf || ''
      }
    };

    
    const preferenceData = {
      items: [{
        id: `plan_${planType}`,
        title: `Plano ${planType.charAt(0).toUpperCase() + planType.slice(1)} - AutomatizeAI Academy`,
        description: courseName ? `Acesso ao curso: ${courseName}` : 'Acesso Premium a todos os cursos',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: prices[planType], // Valor em reais (decimal)
        category_id: 'services', // Categoria de serviço (recomendado)
      }],
      payer: userData,
      back_urls: {
        success: returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
        failure: failureUrl || `${process.env.FRONTEND_URL}/payment/failure`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`,
      },
      auto_return: 'approved',
      external_reference: `plan_${planType}_${Math.floor(Date.now() / 1000)}`,
      payment_methods: {
        excluded_payment_types: [
          {
            id: 'ticket' // Excluir boleto (apenas cartão)
          }
        ],
        installments: 12 // Máximo de parcelas
      },
      statement_descriptor: 'AutomatizeAI Academy', // Nome na fatura
      binary_mode: true, // Modo estrito para validação
      purpose: 'wallet_purchase' // Modo wallet para melhor UX
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

    
    const preference = new Preference(client);
    const result = await preference.create({
      body: preferenceData
    });
    
    console.log('Payment preference created:', result.id);
    
    // Registrar pagamento inicial no banco de dados
    try {
      const userId = req.user?.id || payerInfo?.userId;
      
      console.log('=== USER ID FOR PAYMENT ===');
      console.log('req.user:', req.user);
      console.log('payerInfo.userId:', payerInfo?.userId);
      console.log('Final userId:', userId);
      
      const { data: paymentRecord, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userId || null,
          provider: 'MERCADO_PAGO',
          external_payment_id: result.id,
          external_reference: preferenceData.external_reference,
          amount: prices[planType],
          status: 'PENDING',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (paymentError) {
        console.error('Error recording payment:', paymentError);
        console.error('Error details:', JSON.stringify(paymentError, null, 2));
        // Não falhar a requisição se o registro no BD falhar
      } else {
        console.log('Payment recorded successfully:', paymentRecord);
      }
    } catch (dbError) {
      console.error('Database error recording payment:', dbError);
      console.error('DB Error details:', JSON.stringify(dbError, null, 2));
    }
    
    res.json({
      message: 'Payment preference created successfully',
      data: {
        preferenceId: result.id,
        initPoint: result.init_point,
        init_point: result.init_point,
        sandboxInitPoint: result.sandbox_init_point
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
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        message: 'Payment ID is required',
        error: 'Missing payment ID'
      });
    }

    // Buscar pagamento no banco de dados
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('external_payment_id', id)
      .single();

    if (error || !payment) {
      return res.status(404).json({
        message: 'Payment not found',
        error: 'Payment ID not found in database'
      });
    }

    res.json({
      message: 'Payment status retrieved successfully',
      data: {
        paymentId: id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        planType: payment.plan_type,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at
      }
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

export default router;
