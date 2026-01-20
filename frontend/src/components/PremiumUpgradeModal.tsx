import React, { useState, useEffect } from 'react';
import { initMercadoPago } from '@mercadopago/sdk-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Check, Send, Loader2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName?: string;
}

const PremiumUpgradeModal = ({ isOpen, onClose, courseName }: PremiumUpgradeModalProps) => {
  console.log('=== PREMIUM MODAL RENDER ===');
  console.log('isOpen:', isOpen);
  console.log('courseName:', courseName);
  console.log('Componente montado com sucesso');
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('=== MERCADO PAGO INIT ===');
    // Inicializar Mercado Pago assim que o componente montar
    initMercadoPago('APP_USR-e64fd1e7-a174-464f-bf6a-17c3d4f1072f');
    console.log('Mercado Pago inicializado');
  }, []);

  const handleCheckout = async () => {
    console.log('=== HANDLE CHECKOUT INICIADO ===');
    setIsLoading(true);
    try {
      console.log('Enviando requisição para backend...');
      const response = await fetch('https://ai-business-academy-backend.onrender.com/api/mercadopago/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: courseName || 'Assinatura Premium',
          price: 1.00,
          quantity: 1,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Backend response:', data);
      
      // Sempre redirecionar direto para o checkout
      if (data.init_point) {
        console.log('Redirecionando para:', data.init_point);
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
      // Call edge function to send email
      const { data, error } = await supabase.functions.invoke('send-premium-contact', {
        body: {
          ...formData,
          courseName: courseName || 'Não especificado'
        }
      });

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Entraremos em contato em breve para apresentar nossos planos premium.",
      });

      // Reset form
      setFormData({ name: "", email: "", phone: "", message: "" });
      onClose();

    } catch (error) {
      console.error('Error sending contact form:', error);
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro. Tente novamente ou entre em contato conosco diretamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) {
    console.log('=== MODAL FECHADO - NÃO RENDERIZAR ===');
    return null;
  }

  console.log('=== RENDERIZANDO MODAL ABERTO ===');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="w-6 h-6 text-yellow-500" />
            Upgrade para Premium
          </DialogTitle>
          <DialogDescription>
            {courseName ? 
              `Desbloqueie o curso "${courseName}" e todos os outros cursos premium.` :
              "Desbloqueie todos os cursos premium e tenha acesso completo."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Premium Benefits */}
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                Benefícios Premium
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Acesso a todos os cursos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Certificados de conclusão</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Suporte prioritário</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Novos conteúdos mensais</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Downloads offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Acesso vitalício</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Tabs defaultValue="payment" className="w-full">
            {console.log('=== RENDERIZANDO TABS ===')}
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Comece agora
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Fale Conosco
              </TabsTrigger>
            </TabsList>

            <TabsContent value="payment" className="space-y-4">
              {console.log('=== RENDERIZANDO TAB PAGAMENTO ===')}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    <div className="text-3xl font-bold text-blue-600">R$ 1,00/mês</div>
                    <p className="text-muted-foreground">Acesso imediato a todos os cursos premium</p>
                    
                    <Button
                      onClick={handleCheckout}
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
                    
                    <p className="text-xs text-muted-foreground">
                      Pagamento processado com segurança pelo Mercado Pago
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              {console.log('=== RENDERIZANDO TAB CONTATO ===')}
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

                    <div className="flex gap-3 pt-4">
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
                        disabled={isSubmitting}
                      >
                        Fechar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumUpgradeModal;
