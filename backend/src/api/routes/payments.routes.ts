import { Router } from 'express';

const router = Router();

// Criar preferência de pagamento (versão temporária para testes)
router.post('/create-preference', async (req, res) => {
  try {
    const { planType, courseName, payerInfo, returnUrl, failureUrl } = req.body;
    
    console.log('=== CREATING PAYMENT PREFERENCE ===');
    console.log('Plan:', planType);
    console.log('Course:', courseName);
    console.log('Payer:', payerInfo);

    const prices = {
      premium: 99.90,
      enterprise: 299.90
    };

    // Simular criação de preferência do Mercado Pago
    // Em produção, aqui você integraria com a API real do Mercado Pago
    const preferenceId = `preference_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // URL de teste do Mercado Pago Sandbox (corrigida)
    const testUrl = `https://sandbox.mercadopago.com.br/checkout/v1/redirect?preference_id=${preferenceId}`;
    
    console.log('=== PREFERENCE CREATED (TEST MODE) ===');
    console.log('Preference ID:', preferenceId);
    console.log('Test URL:', testUrl);

    res.json({
      success: true,
      data: {
        id: preferenceId,
        init_point: testUrl,
        sandbox_init_point: testUrl
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
