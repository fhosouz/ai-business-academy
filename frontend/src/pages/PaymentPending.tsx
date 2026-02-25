import { useNavigate } from 'react-router-dom';

export default function PaymentPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-yellow-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Pagamento em Processamento</h2>
        <p className="text-gray-600 mb-6">
          Seu pagamento está sendo processado. Você receberá uma confirmação por email em breve.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Dashboard
          </button>
          <p className="text-sm text-gray-500">
            Verifique seu email para confirmação do pagamento.
          </p>
        </div>
      </div>
    </div>
  );
}
