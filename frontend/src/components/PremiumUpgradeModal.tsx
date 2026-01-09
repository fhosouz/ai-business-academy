import React, { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

const PremiumUpgradeModal = ({ isOpen, onClose, courseName }) => {
  const [preferenceId, setPreferenceId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (preferenceId) {
      initMercadoPago('APP_USR-e64fd1e7-a174-464f-bf6a-17c3d4f1072f');
    }
  }, [preferenceId]);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://ai-business-academy-backend.onrender.com/api/mercadopago/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: courseName || 'Assinatura Premium',
          price: 99.90,
          quantity: 1,
        }),
      });

      const data = await response.json();
      console.log('Backend response:', data);
      
      if (data.init_point) {
        // Redirecionar diretamente para o checkout do Mercado Pago
        window.location.href = data.init_point;
      } else if (data.preference_id) {
        setPreferenceId(data.preference_id);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return React.createElement('div', {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }
  }, [
    React.createElement('div', {
      style: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%'
      }
    }, [
      React.createElement('h2', null, 'Upgrade para Premium'),
      React.createElement('p', null, `Desbloqueie o curso "${courseName}" e todos os outros cursos premium.`),
      React.createElement('p', null, 'Por apenas R$ 99,90/mês'),
      
      preferenceId ? React.createElement(Wallet, {
        initialization: { preferenceId: preferenceId }
      }) : React.createElement('button', {
        onClick: handleCheckout,
        disabled: isLoading,
        style: {
          backgroundColor: '#009EE3',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '16px'
        }
      }, isLoading ? 'Processando...' : 'Comprar com Mercado Pago'),
      
      React.createElement('button', {
        onClick: onClose,
        style: {
          backgroundColor: '#6c757d',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '1rem',
          marginLeft: '0.5rem'
        }
      }, 'Cancelar')
    ])
  ]);
};

export default PremiumUpgradeModal;
