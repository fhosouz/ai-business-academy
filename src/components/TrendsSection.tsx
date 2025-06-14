
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BookOpen, Eye } from "lucide-react";
import ArticleDetail from "./ArticleDetail";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  image: string;
}

const TrendsSection = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const articles: Article[] = [
    {
      id: 1,
      title: "ChatGPT-4o: Revolucionando a Interação com IA",
      excerpt: "O novo modelo GPT-4o da OpenAI traz capacidades multimodais que prometem transformar como interagimos com inteligência artificial.",
      content: `O ChatGPT-4o representa um marco significativo na evolução da inteligência artificial conversacional. Com capacidades multimodais integradas, este modelo consegue processar e gerar não apenas texto, mas também imagens, áudio e vídeo de forma nativa.

As principais inovações incluem tempo de resposta drasticamente reduzido, melhor compreensão contextual e capacidade de manter conversas mais naturais e fluidas. Para empresas, isso significa possibilidades inéditas de automação de atendimento ao cliente, criação de conteúdo e análise de dados.

A integração de modalidades múltiplas permite casos de uso antes impossíveis, como análise simultânea de documentos visuais e textuais, criação de apresentações interativas e desenvolvimento de assistentes virtuais mais intuitivos.`,
      category: "IA Generativa",
      author: "Dr. Ana Silva",
      publishedAt: "10 de Jun, 2024",
      readTime: "5 min",
      image: "photo-1677442136019-21780ecad995"
    },
    {
      id: 2,
      title: "Automação Inteligente: Transformando Processos Empresariais",
      excerpt: "Empresas estão utilizando IA para automatizar processos complexos, resultando em eficiência operacional sem precedentes.",
      content: `A automação inteligente está redefinindo como as empresas operam. Diferente da automação tradicional, que segue regras pré-definidas, a IA permite que sistemas tomem decisões complexas e se adaptem a situações novas.

Setores como manufatura, logística e serviços financeiros estão vendo reduções de custo de até 40% e aumentos de produtividade de 60% com implementações estratégicas de IA.

O futuro aponta para uma integração ainda mais profunda, onde IA e automação trabalharão em conjunto com humanos, criando ambientes de trabalho híbridos mais eficientes e produtivos.`,
      category: "Automação",
      author: "Carlos Mendes",
      publishedAt: "8 de Jun, 2024",
      readTime: "7 min",
      image: "photo-1485827404703-89b55fcc595e"
    },
    {
      id: 3,
      title: "O Futuro do Prompt Engineering: Técnicas Avançadas para 2024",
      excerpt: "Novas metodologias de prompt engineering estão emergindo, oferecendo resultados mais precisos e consistentes.",
      content: `O prompt engineering evoluiu de uma arte para uma ciência. As técnicas emergentes em 2024 incluem prompt chaining, onde múltiplos prompts trabalham em sequência para resolver problemas complexos.

A técnica de few-shot learning está sendo refinada com exemplos mais estratégicos e contextuais. Ferramentas especializadas estão surgindo para otimizar prompts automaticamente.

O futuro aponta para prompts adaptativos que se ajustam automaticamente com base no feedback e contexto, criando experiências mais personalizadas.`,
      category: "Prompt Engineering",
      author: "Maria Santos",
      publishedAt: "5 de Jun, 2024",
      readTime: "6 min",
      image: "photo-1555949963-aa79dcee981c"
    }
  ];

  if (selectedArticle) {
    return (
      <ArticleDetail 
        article={selectedArticle} 
        onBack={() => setSelectedArticle(null)} 
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tendências em IA</h1>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          Artigos em Destaque
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card 
              key={article.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setSelectedArticle(article)}
            >
              <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                <img 
                  src={`https://images.unsplash.com/${article.image}?q=80&w=800&auto=format&fit=crop`}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{article.category}</Badge>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {article.publishedAt}
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Por {article.author}
                  </span>
                  <Button variant="ghost" size="sm" className="group-hover:bg-blue-50">
                    <Eye className="w-4 h-4 mr-2" />
                    Ler mais
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendsSection;
