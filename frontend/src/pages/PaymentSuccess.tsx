import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        console.log('=== PAYMENT SUCCESS PAGE LOADED ===');
        
        // 1. Verificar se usuário está autenticado
        const { data: sessionData, error: authError } = await supabase.auth.getSession();
        
        if (authError || !sessionData?.session?.user) {
          console.error('❌ User not authenticated:', authError);
          setError('Usuário não autenticado. Redirecionando para login...');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        const user = sessionData.session.user;
        console.log('✅ User authenticated:', user.email);
        
        // 2. Buscar perfil atual do usuário
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('❌ Error fetching user profile:', profileError);
          setError('Erro ao verificar seu plano. Contate o suporte.');
          setLoading(false);
          return;
        }

        console.log('📋 User profile:', profile);
        setUserPlan(profile?.plan || 'free');

        // 3. Verificar se tem pagamentos recentes
        const { data: payments, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(5);

        if (paymentsError) {
          console.error('❌ Error fetching payments:', paymentsError);
          setError('Erro ao verificar pagamento. Contate o suporte.');
          setLoading(false);
          return;
        }

        console.log('💳 User payments:', payments);

        // 4. Verificar se tem pagamento aprovado recente
        const recentPayment = payments?.find((p: any) => {
          const paymentTime = new Date(p.created_at);
          const now = new Date();
          const hoursDiff = (now.getTime() - paymentTime.getTime()) / (1000 * 60 * 60);
          return hoursDiff <= 24; // Pagamento nas últimas 24 horas
        });

        if (recentPayment) {
          console.log('✅ Recent approved payment found:', recentPayment);
          
          // 5. Se o plano ainda não for premium, atualizar
          if (profile?.plan !== 'premium') {
            console.log('🔄 Updating user plan to premium...');
            
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({ 
                plan: 'premium',
                plan_updated_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);

            if (updateError) {
              console.error('❌ Error updating plan:', updateError);
              setError('Erro ao atualizar plano. Contate o suporte.');
            } else {
              console.log('✅ Plan updated to premium successfully');
              setUserPlan('premium');
              setPaymentVerified(true);
            }
          } else {
            console.log('✅ User already has premium plan');
            setPaymentVerified(true);
          }
        } else {
          console.log('⚠️ No recent approved payment found');
          setError('Pagamento não encontrado ou ainda não foi aprovado. Tente novamente em alguns minutos.');
        }

      } catch (err) {
        console.error('❌ Payment success error:', err);
        setError('Erro ao processar pagamento. Contate o suporte.');
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificando pagamento...</h2>
          <p className="text-gray-600">Estamos validando sua transação e atualizando seu acesso.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro na Verificação</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Voltar para Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-green-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Pagamento Aprovado!</h2>
        <p className="text-gray-600 mb-4">
          Parabéns! Sua assinatura premium foi ativada com sucesso.
        </p>
        
        {paymentVerified && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="text-sm">
              ✅ Plano Premium verificado e ativado
            </p>
            <p className="text-xs mt-1">
              Plano atual: <span className="font-bold">{userPlan}</span>
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Acessar Cursos Premium
          </button>
          <p className="text-sm text-gray-500">
            Você será redirecionado automaticamente em 5 segundos...
          </p>
        </div>
      </div>
    </div>
  );
}
