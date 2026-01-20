import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Webhook do Mercado Pago para receber notificações de pagamento
router.post('/webhook', async (req, res) => {
  try {
    console.log('=== MERCADO PAGO WEBHOOK RECEIVED ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    // Verificar se é uma notificação do Mercado Pago
    const signature = req.headers['x-signature'];
    const notificationId = req.body.id || req.body.data?.id;
    const topic = req.body.type || req.body.action;
    
    console.log('Notification ID:', notificationId);
    console.log('Topic:', topic);
    
    // Processar diferentes tipos de notificação
    switch (topic) {
      case 'payment':
        await handlePaymentNotification(req.body);
        break;
      case 'merchant_order':
        await handleMerchantOrderNotification(req.body);
        break;
      default:
        console.log('Unhandled notification type:', topic);
    }
    
    // Responder ao Mercado Pago
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Função para processar notificações de pagamento
async function handlePaymentNotification(notification) {
  try {
    console.log('=== PROCESSING PAYMENT NOTIFICATION ===');
    
    const paymentId = notification.data?.id;
    if (!paymentId) {
      console.error('Payment ID not found in notification');
      return;
    }
    
    console.log('Payment ID:', paymentId);
    
    // TODO: Buscar informações detalhadas do pagamento no Mercado Pago
    // const paymentInfo = await mercadopago.payment.findById(paymentId);
    
    // Por ora, assumimos que se recebemos a notificação, o pagamento foi aprovado
    const paymentStatus = 'APPROVED'; // Viria do paymentInfo.status
    
    if (paymentStatus === 'APPROVED') {
      // Atualizar status do pagamento
      const { data: paymentRecord, error: updateError } = await supabase
        .from('payments')
        .update({ status: 'APPROVED' })
        .eq('external_payment_id', paymentId)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating payment status:', updateError);
        return;
      }
      
      console.log('Payment updated:', paymentRecord);
      
      // Atualizar plano do usuário
      await updateUserPlan(paymentRecord);
    }
    
    console.log('Payment notification processed successfully');
    
  } catch (error) {
    console.error('Error handling payment notification:', error);
  }
}

// Função para atualizar plano do usuário
async function updateUserPlan(paymentRecord) {
  try {
    console.log('=== UPDATING USER PLAN ===');
    
    // Extrair tipo do plano do external_reference
    const planType = paymentRecord.external_reference?.split('_')[0];
    
    if (!planType || !['premium', 'enterprise'].includes(planType)) {
      console.error('Invalid plan type:', planType);
      return;
    }
    
    console.log('Updating user to plan:', planType);
    
    // Atualizar ou criar plano do usuário
    const { data: userPlan, error: planError } = await supabase
      .from('user_plans')
      .upsert({
        user_id: paymentRecord.user_id,
        plan_type: planType,
        status: 'active',
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // +1 ano
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (planError) {
      console.error('Error updating user plan:', planError);
    } else {
      console.log('User plan updated:', userPlan);
    }
    
  } catch (error) {
    console.error('Error updating user plan:', error);
  }
}

// Função para processar notificações de merchant order
async function handleMerchantOrderNotification(notification) {
  try {
    console.log('=== PROCESSING MERCHANT ORDER NOTIFICATION ===');
    console.log('Order ID:', notification.data?.id);
    
    // TODO: Implementar lógica se necessário
    
  } catch (error) {
    console.error('Error handling merchant order notification:', error);
  }
}

export default router;
