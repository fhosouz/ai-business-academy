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
    console.log('=== HANDLE CHECKOUT START ===');
    console.log('=== BOTÃO PAGAR CLICADO ===');
    console.log('=== VERIFICANDO ESTADO DO BOTÃO ===');
    console.log('isLoading:', isLoading);
    console.log('isOpen:', isOpen);
    console.log('courseName:', courseName);
    
    setIsLoading(true);
    try {
      // Obter token via backend (arquitetura correta: frontend -> backend -> supabase)
      console.log('=== OBTENDO TOKEN VIA BACKEND ===');
      
      // O Supabase armazena o token em localStorage com a chave 'sb-<ref>-auth-token'
      const storageKeys = Object.keys(localStorage);
      console.log('LocalStorage keys:', storageKeys);
      console.log('LocalStorage completo:', JSON.stringify(localStorage, null, 2));
      
      let accessToken = null;
      const authKey = storageKeys.find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
      
      console.log('Auth key encontrada:', authKey);
      
      if (authKey) {
        try {
          const tokenData = localStorage.getItem(authKey);
          console.log('Token data bruto:', tokenData);
          console.log('Token data existe:', !!tokenData);
          
          if (tokenData) {
            const parsed = JSON.parse(tokenData);
            console.log('Token parseado:', JSON.stringify(parsed, null, 2));
            accessToken = parsed?.access_token;
            console.log('Access token extraído:', !!accessToken);
            console.log('Access token length:', accessToken?.length || 0);
            console.log('Access token prefix:', accessToken?.substring(0, 20) + '...');
          }
        } catch (e) {
          console.error('Failed to parse stored token:', e);
        }
      } else {
        console.error('Nenhuma chave sb-*-auth-token encontrada');
        // Tentar outras chaves comuns
        const possibleKeys = storageKeys.filter(k => k.includes('supabase') || k.includes('auth') || k.includes('token'));
        console.log('Chaves possíveis:', possibleKeys);
      }
      
      if (!accessToken) {
        console.error('=== NO ACCESS TOKEN IN STORAGE ===');
        console.error('Available keys:', storageKeys);
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para fazer o pagamento. Por favor, faça login novamente.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      console.log('Access token exists:', !!accessToken);
      console.log('Token length:', accessToken?.length || 0);
      
      // Opcional: validar token com backend antes de prosseguir
      let meData = null;
      try {
        const meResponse = await fetch('https://ai-business-academy-backend.onrender.com/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!meResponse.ok) {
          console.error('Token validation failed:', meResponse.status);
          throw new Error('Token inválido');
        }
        
        const meResult = await meResponse.json();
        meData = meResult.data;
        console.log('Token valid for user:', meData.user?.email);
      } catch (meError) {
        console.error('Error validating token:', meError);
        toast({
          title: "Erro de autenticação",
          description: "Sua sessão expirou. Por favor, faça login novamente.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      console.log('=== PLAN SELECTED ===');
      console.log('Plan selected: premium');
      console.log('Course:', courseName);
      
      console.log('=== INICIANDO REQUISIÇÃO MERCADO PAGO ===');
      console.log('Authorization header will be:', `Bearer ${accessToken ? 'EXISTS' : 'MISSING'}`);
      
      const response = await fetch('https://ai-business-academy-backend.onrender.com/api/payments/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          planType: 'premium',
          courseName: courseName || 'Acesso Premium',
          payerInfo: {
            name: meData?.user?.user_metadata?.full_name || meData?.user?.email?.split('@')[0] || 'Usuario',
            email: meData?.user?.email || 'user@example.com',
            userId: meData?.user?.id
          },
          returnUrl: 'https://automatizeai-academy.netlify.app/payment/success',
          failureUrl: 'https://automatizeai-academy.netlify.app/payment/failure'
        }),
      });

      console.log('=== MERCADO PAGO RESPONSE ===');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('=== RESPONSE DATA ANALYSIS ===');
      console.log('Full response:', JSON.stringify(data, null, 2));
      console.log('Response message:', data.message);
      console.log('Response data exists:', !!data.data);
      console.log('Response data keys:', data.data ? Object.keys(data.data) : 'NO DATA');
      
      if (data.data?.initPoint || data.data?.init_point) {
        const redirectUrl = data.data?.initPoint || data.data?.init_point;
        console.log('=== REDIRECT SUCCESS ===');
        console.log('Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
      } else {
        console.error('=== NO REDIRECT URL ERROR ===');
        console.error('Expected data.data.initPoint or data.data.init_point');
        console.error('Actual response structure:', JSON.stringify(data, null, 2));
        toast({
          title: "Erro ao processar pagamento",
          description: "Não foi possível gerar o link de pagamento. Verifique os logs.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('=== CHECKOUT ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      toast({
        title: "Erro ao processar pagamento",
        description: "Ocorreu um erro ao processar seu pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('=== HANDLE CHECKOUT END ===');
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
