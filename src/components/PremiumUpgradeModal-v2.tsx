// ========================================
// PREMIUM UPGRADE MODAL - VERSÃO OTIMIZADA
// ========================================

import React, { useState, useEffect } from 'react';
import { initMercadoPago } from '@mercadopago/sdk-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Check, Send, Loader2, CreditCard, Shield, Star, Zap, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabaseHelpers } from "@/integrations/supabase/client-v2";
import { env } from "@/config/env";
import type { PlanType } from "@/hooks/useAuth-v2";

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
    // Inicializar Mercado Pago assim que o componente montar
    initMercadoPago(env.MERCADO_PAGO_PUBLIC_KEY);
    console.log('=== MERCADO PAGO INITIALIZED ===');
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

      const response = await fetch(env.MERCADO_PAGO_CHECKOUT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Plano ${planType.charAt(0).toUpperCase() + planType.slice(1)} - AI Business Academy`,
          price: prices[planType],
          quantity: 1,
          plan_type: planType,
          course_name: courseName || 'Acesso Premium',
          user_id: (await supabaseHelpers.getUserPlan('current'))?.user_id || 'unknown',
        }),
      });

      console.log('Checkout response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Checkout response data:', data);
      
      if (data.init_point) {
        console.log('=== REDIRECTING TO MERCADO PAGO ===');
        console.log('Redirect URL:', data.init_point);
        window.location.href = data.init_point;
      } else {
        console.error('No init_point received:', data);
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
      const { error } = await supabase
        .from('contact_requests')
        .insert({
          ...formData,
          type: 'premium_inquiry',
          plan_interest: selectedPlan,
          course_name: courseName,
        });

      if (error) {
        throw error;
      }

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
      price: 'R$ 99,90/mês',
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
      price: 'R$ 299,90/mês',
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
            Upgrade para Premium
          </DialogTitle>
          <DialogDescription>
            Desbloqueie o curso "{courseName || 'conteúdo exclusivo'}" e tenha acesso a todos os benefícios premium
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="payment">Pagamento</TabsTrigger>
            <TabsTrigger value="contact">Fale Conosco</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(plans).map(([key, plan]) => (
                <Card key={key} className={`relative ${selectedPlan === key ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">{plan.name}</div>
                      <div className="text-3xl font-bold text-blue-600 mb-4">{plan.price}</div>
                      <p className="text-muted-foreground mb-6">{plan.description}</p>
                      
                      <div className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        onClick={() => setSelectedPlan(key as PlanType)}
                        className={`w-full ${plan.color} hover:opacity-90`}
                        variant={selectedPlan === key ? "default" : "outline"}
                      >
                        {selectedPlan === key ? 'Selecionado' : `Selecionar ${plan.name}`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      Plano {plans[selectedPlan].name}
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {plans[selectedPlan].price}
                    </div>
                    <p className="text-muted-foreground">
                      Pagamento processado com segurança pelo Mercado Pago
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Pagamento seguro</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm">Acesso imediato</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-5 h-5 text-blue-600" />
                      <span className="text-sm">Cancelamento a qualquer momento</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleCheckout(selectedPlan)}
                    disabled={isLoading}
                    className={`w-full ${plans[selectedPlan].color} hover:opacity-90 text-white`}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pagar com Mercado Pago
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">
                  Fale conosco para saber mais sobre nossos planos
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome completo *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Conte-nos sobre seu interesse no plano premium..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Solicitação
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      Fechar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumUpgradeModal;
