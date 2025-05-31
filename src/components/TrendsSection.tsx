
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BookOpen, Users } from "lucide-react";

const TrendsSection = () => {
  const trendingArticles = [
    {
      id: 1,
      title: "GPT-4 Turbo: As Novas Funcionalidades que Vão Revolucionar os Negócios",
      description: "Descubra as últimas atualizações do GPT-4 Turbo e como aplicá-las em processos empresariais para aumentar a produtividade.",
      category: "IA Generativa",
      readTime: "8 min",
      publishedDate: "2024-01-15",
      image: "photo-1498050108023-c5249f4df085",
      isNew: true
    },
    {
      id: 2,
      title: "Microsoft Copilot: Guia Completo para Implementação Empresarial",
      description: "Como integrar o Microsoft Copilot em sua empresa e maximizar o ROI com automação inteligente.",
      category: "Automação",
      readTime: "12 min",
      publishedDate: "2024-01-12",
      image: "photo-1518770660439-4636190af475",
      isNew: true
    },
    {
      id: 3,
      title: "Ética em IA: Frameworks para Tomada de Decisão Responsável",
      description: "Principais considerações éticas ao implementar soluções de IA em organizações e como criar políticas eficazes.",
      category: "Ética em IA",
      readTime: "10 min",
      publishedDate: "2024-01-10",
      image: "photo-1486312338219-ce68d2c6f44d",
      isNew: false
    }
  ];

  const upcomingEvents = [
    {
      title: "Webinar: IA para Pequenas Empresas",
      date: "2024-01-20",
      time: "14:00",
      attendees: 245
    },
    {
      title: "Workshop: Prompt Engineering na Prática",
      date: "2024-01-25",
      time: "10:00",
      attendees: 89
    },
    {
      title: "Mesa Redonda: Futuro da IA nos Negócios",
      date: "2024-01-30",
      time: "16:00",
      attendees: 156
    }
  ];

  const marketUpdates = [
    {
      title: "OpenAI lança GPT Store",
      description: "Marketplace oficial para aplicações customizadas de IA",
      time: "2h atrás"
    },
    {
      title: "Google anuncia Gemini Ultra",
      description: "Novo modelo de IA multimodal com capacidades avançadas",
      time: "5h atrás"
    },
    {
      title: "Microsoft investe $10B em IA",
      description: "Expansão massiva em infraestrutura e pesquisa",
      time: "1 dia atrás"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tendências e Conteúdos</h1>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Ver Agenda
        </Button>
      </div>

      {/* Latest Articles */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          Artigos em Destaque
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={`https://images.unsplash.com/${article.image}?w=400&h=200&fit=crop`}
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {article.isNew && (
                  <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-600">
                    Novo
                  </Badge>
                )}
                <Badge className="absolute top-3 right-3 bg-black/70 text-white">
                  {article.category}
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg leading-tight hover:text-blue-600 transition-colors">
                  {article.title}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {article.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {article.readTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.publishedDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Próximos Eventos
            </CardTitle>
            <CardDescription>
              Participe de webinars e workshops exclusivos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <h4 className="font-medium">{event.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                    <span>{event.time}</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.attendees}
                    </div>
                  </div>
                </div>
                <Button size="sm">Participar</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Market Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Atualizações do Mercado
            </CardTitle>
            <CardDescription>
              Últimas notícias sobre IA e tecnologia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {marketUpdates.map((update, index) => (
              <div key={index} className="p-4 border-l-4 border-blue-500 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                <h4 className="font-medium text-gray-900">{update.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{update.description}</p>
                <p className="text-xs text-gray-500 mt-2">{update.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrendsSection;
