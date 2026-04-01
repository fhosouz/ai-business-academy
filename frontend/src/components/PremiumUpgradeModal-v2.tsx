// ========================================
// PREMIUM UPGRADE MODAL - VERSÃO OTIMIZADA
// ========================================

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Check, Send, Loader2, CreditCard, Shield, Star, Zap, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { env } from "@/config/env";
import type { PlanType } from "@/hooks/useUserPlan";

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName?: string;
  currentPlan?: PlanType;
}

const PremiumUpgradeModal = ({ isOpen, onClose, courseName, currentPlan = 'free' }: PremiumUpgradeModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('premium');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      console.log('=== PREMIUM MODAL OPENED ===');
      console.log('courseName:', courseName);
      console.log('currentPlan:', currentPlan);
    }
  }, [isOpen, courseName, currentPlan]);

  useEffect(() => {
    // Removido SDK do Mercado Pago do frontend
    // Agora toda integração é via backend
    console.log('=== PAGAMENTO VIA BACKEND ===');
    console.log('API URL:', env.VITE_API_URL);
  }, []);

  const handleCheckout = async (planType: PlanType) => {
    console.log('=== HANDLE CHECKOUT START ===');
    console.log('Plan selected:', planType);
    console.log('Course:', courseName);
    
    setIsLoading(true);
    
    try {
      const prices = {
        premium: 99.90,
        enterprise: 299.90
      };

      // Obter usuário atual para enviar userId
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      console.log('User ID:', userId);

      // Chamar backend para criar preferência de pagamento
      const response = await fetch(`${env.VITE_API_URL}/payments/create-preference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
          courseName,
          payerInfo: {
            name: formData.name || 'Usuario',
            email: formData.email || 'user@example.com',
          },
          userId, // Enviar userId para external_reference
          returnUrl: `${window.location.origin}/payment/success`,
          failureUrl: `${window.location.origin}/payment/failure`,
        }),
      });

      console.log('Backend response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        toast({
          title: "Erro ao processar pagamento",
          description: errorData.message || "Não foi possível processar seu pagamento. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();
      console.log('Backend response data:', data);
      
      // Redirecionar para URL do Mercado Pago retornada pelo backend (PRODUÇÃO)
      if (data.data?.init_point) {
        console.log('=== REDIRECTING TO MERCADO PAGO (PRODUCTION) ===');
        const redirectUrl = data.data.init_point;
        console.log('Redirect URL:', redirectUrl);
        window.location.href = redirectUrl;
      } else {
        console.error('No redirect URL received:', data);
        toast({
          title: "Erro ao processar pagamento",
          description: "Não foi possível gerar o link de pagamento. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Ocorreu um erro ao processar seu pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simular envio de formulário (removido contact_requests que não existe)
      console.log('=== CONTACT FORM SUBMITTED ===');
      console.log('Form data:', formData);
      console.log('Plan interest:', selectedPlan);
      console.log('Course name:', courseName);

      toast({
        title: "Solicitação enviada!",
        description: "Entraremos em contato em até 24h úteis.",
      });

      setFormData({ name: "", email: "", phone: "", message: "" });
      onClose();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente ou contate-nos diretamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const plans = {
    premium: {
      name: 'Premium',
      price: 'R$ 1,00/mês',
      description: 'Acesso completo a todos os cursos',
      features: [
        'Acesso a todos os cursos',
        'Certificados de conclusão',
        'Suporte prioritário',
        'Downloads offline',
        'Acesso vitalício aos cursos concluídos'
      ],
      color: 'bg-blue-600'
    },
    enterprise: {
      name: 'Enterprise',
      price: 'R$ 1,00/mês',
      description: 'Para equipes e empresas',
      features: [
        'Tudo do plano Premium',
        'Acesso para até 10 usuários',
        'Suporte dedicado 24/7',
        'API access',
        'Custom branding'
      ],
      color: 'bg-purple-600'
    }
  };

  if (!isOpen) {
    console.log('=== MODAL FECHADO - NÃO RENDERIZAR ===');
    return null;
  }

  console.log('=== RENDERIZANDO MODAL ABERTO ===');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="w-6 h-6 text-yellow-500" />
            Domine IA como um Profissional
          </DialogTitle>
          <DialogDescription>
            Junte-se a <span className="font-bold text-blue-600">2.847 iniciantes</span> que estão acelerando sua carreira com IA
          </DialogDescription>
        </DialogHeader>

        {/* Social Proof Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-gray-700"><strong>234</strong> iniciantes upgrade hoje</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-600">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-semibold">4.9/5</span>
              <span className="text-gray-600">(1.2k avaliações)</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="plans">Escolha seu Plano</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            {/* Value Proposition */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">De iniciante a profissional em IA</h3>
              <p className="text-gray-600">Aprenda na prática com projetos reais e mentoria especializada</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(plans).map(([key, plan]) => (
                <Card key={key} className={`relative ${selectedPlan === key ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg transition-shadow'}`}>
                  {key === 'premium' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1">
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">{plan.name}</div>
                      <div className="text-3xl font-bold text-blue-600 mb-4">{plan.price}</div>
                      <p className="text-muted-foreground mb-6">{plan.description}</p>
                      
                      {/* Highlight key benefits for beginners */}
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-800 font-medium">
                          {key === 'premium' ? 'Perfeito para começar' : 'Para equipes e empresas'}
                        </p>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Urgency element */}
                      {key === 'premium' && (
                        <div className="bg-orange-50 rounded-lg p-3 mb-4">
                          <p className="text-xs text-orange-800 font-medium">
                            ⏰ Oferta por tempo limitado - 30% OFF
                          </p>
                        </div>
                      )}
                      
                      <Button
                        onClick={() => handleCheckout(key as PlanType)}
                        disabled={isLoading}
                        className={`w-full ${key === 'premium' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
                        variant={selectedPlan === key ? "default" : "outline"}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Crown className="w-4 h-4 mr-2" />
                            {key === 'premium' ? 'Começar Agora' : 'Contatar Vendas'}
                          </>
                        )}
                      </Button>
                      
                      {/* Trust indicators */}
                      <div className="mt-4 text-xs text-gray-500 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Shield className="w-3 h-3" />
                          <span>Cancelamento a qualquer momento</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <CreditCard className="w-3 h-3" />
                          <span>Pagamento seguro via Mercado Pago</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Success Stories */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold mb-4 text-center">Histórias de Sucesso</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">Maria S.</div>
                  <div className="text-gray-600">"Consegui meu primeiro emprego em IA em 2 meses"</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">João P.</div>
                  <div className="text-gray-600">"Os projetos práticos fizeram toda diferença"</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">Ana K.</div>
                  <div className="text-gray-600">"De zero conhecimento a freelancer em IA"</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumUpgradeModal;
