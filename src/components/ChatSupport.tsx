
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, Clock, Check } from "lucide-react";

const ChatSupport = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      message: "Olá! Sou o assistente virtual da AI Academy. Como posso ajudá-lo hoje?",
      timestamp: "14:30",
      isRead: true
    },
    {
      id: 2,
      sender: "user",
      message: "Tenho dúvidas sobre como acessar o certificado do curso de IA Generativa",
      timestamp: "14:32",
      isRead: true
    },
    {
      id: 3,
      sender: "bot",
      message: "Perfeito! Para acessar seu certificado, você precisa completar 100% do curso. Atualmente você está com 65% de progresso. Após a conclusão, o certificado estará disponível na seção 'Meus Certificados' do seu perfil.",
      timestamp: "14:33",
      isRead: true
    }
  ]);
  
  const [newMessage, setNewMessage] = useState("");

  const quickActions = [
    "Como acessar certificados?",
    "Problemas com login",
    "Dúvidas sobre planos",
    "Suporte técnico",
    "Feedback sobre cursos"
  ];

  const faqItems = [
    {
      question: "Como posso alterar meu plano?",
      answer: "Você pode alterar seu plano a qualquer momento na seção 'Configurações' do seu perfil."
    },
    {
      question: "Os certificados são reconhecidos?",
      answer: "Sim, nossos certificados são reconhecidos por empresas parceiras e podem ser validados online."
    },
    {
      question: "Posso fazer download das aulas?",
      answer: "Com o plano Premium, você pode fazer download das aulas para assistir offline."
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        sender: "user" as const,
        message: newMessage,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isRead: false
      };
      
      setMessages([...messages, userMessage]);
      setNewMessage("");
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          sender: "bot" as const,
          message: "Obrigado pela sua mensagem! Nossa equipe irá analisar sua solicitação e responder em breve. Tempo médio de resposta: 15 minutos.",
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isRead: false
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const handleQuickAction = (action: string) => {
    setNewMessage(action);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Central de Suporte</h1>
        <p className="text-gray-600">Estamos aqui para ajudar você em sua jornada de aprendizado</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Chat de Suporte
              </CardTitle>
              <CardDescription>
                Converse conosco em tempo real
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{message.timestamp}</span>
                        {message.sender === 'user' && (
                          <Check className={`w-3 h-3 ${message.isRead ? 'text-blue-500' : 'text-gray-400'}`} />
                        )}
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      message.sender === 'user' ? 'bg-blue-600 order-1 ml-2' : 'bg-gray-500 order-2 mr-2'
                    }`}>
                      {message.sender === 'user' ? 'Você' : 'AI'}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700">
                  Enviar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => handleQuickAction(action)}
                >
                  {action}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status do Suporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tempo médio:</span>
                <span className="text-sm font-medium">15 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Horário:</span>
                <span className="text-sm font-medium">8h às 22h</span>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Perguntas Frequentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-3">
                  <h4 className="font-medium text-sm">{item.question}</h4>
                  <p className="text-xs text-gray-600 mt-1">{item.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChatSupport;
