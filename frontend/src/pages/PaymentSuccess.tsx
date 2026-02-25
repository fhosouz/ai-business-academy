import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Verificar se usuário está autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('Usuário não autenticado. Redirecionando para login...');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Atualizar plano do usuário para premium
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            plan: 'premium',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating user plan:', updateError);
          setError('Erro ao atualizar plano. Contate o suporte.');
        } else {
          console.log('✅ User plan updated to premium');
          // Redirecionar para dashboard após 3 segundos
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (err) {
        console.error('Payment success error:', err);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processando pagamento...</h2>
          <p className="text-gray-600">Aguarde enquanto confirmamos sua assinatura.</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro no Processamento</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Dashboard
          </button>
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
        <p className="text-sm text-gray-500 mb-6">
          Você será redirecionado para o dashboard em 3 segundos...
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Ir para Dashboard Agora
        </button>
      </div>
    </div>
  );
}
