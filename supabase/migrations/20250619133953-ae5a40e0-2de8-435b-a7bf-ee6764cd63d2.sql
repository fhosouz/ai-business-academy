-- Criar tabela para artigos de tendências
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - artigos são públicos para leitura
CREATE POLICY "Articles are viewable by everyone" 
ON public.articles 
FOR SELECT 
USING (is_active = true);

-- Apenas admins podem criar/editar artigos
CREATE POLICY "Only admins can insert articles" 
ON public.articles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update articles" 
ON public.articles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns artigos de exemplo
INSERT INTO public.articles (title, excerpt, content, category, author, image_url, is_featured) VALUES
(
  'ChatGPT-4o: Revolucionando a Interação com IA',
  'O novo modelo GPT-4o da OpenAI traz capacidades multimodais que prometem transformar como interagimos com inteligência artificial.',
  'O ChatGPT-4o representa um marco significativo na evolução da inteligência artificial conversacional. Com capacidades multimodais integradas, este modelo consegue processar e gerar não apenas texto, mas também imagens, áudio e vídeo de forma nativa.

As principais inovações incluem tempo de resposta drasticamente reduzido, melhor compreensão contextual e capacidade de manter conversas mais naturais e fluidas. Para empresas, isso significa possibilidades inéditas de automação de atendimento ao cliente, criação de conteúdo e análise de dados.

A integração de modalidades múltiplas permite casos de uso antes impossíveis, como análise simultânea de documentos visuais e textuais, criação de apresentações interativas e desenvolvimento de assistentes virtuais mais intuitivos.',
  'IA Generativa',
  'Dr. Ana Silva',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
  true
),
(
  'Automação Inteligente: Transformando Processos Empresariais',
  'Empresas estão utilizando IA para automatizar processos complexos, resultando em eficiência operacional sem precedentes.',
  'A automação inteligente está redefinindo como as empresas operam. Diferente da automação tradicional, que segue regras pré-definidas, a IA permite que sistemas tomem decisões complexas e se adaptem a situações novas.

Setores como manufatura, logística e serviços financeiros estão vendo reduções de custo de até 40% e aumentos de produtividade de 60% com implementações estratégicas de IA.

O futuro aponta para uma integração ainda mais profunda, onde IA e automação trabalharão em conjunto com humanos, criando ambientes de trabalho híbridos mais eficientes e produtivos.',
  'Automação',
  'Carlos Mendes',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80',
  true
),
(
  'O Futuro do Prompt Engineering: Técnicas Avançadas para 2024',
  'Novas metodologias de prompt engineering estão emergindo, oferecendo resultados mais precisos e consistentes.',
  'O prompt engineering evoluiu de uma arte para uma ciência. As técnicas emergentes em 2024 incluem prompt chaining, onde múltiplos prompts trabalham em sequência para resolver problemas complexos.

A técnica de few-shot learning está sendo refinada com exemplos mais estratégicos e contextuais. Ferramentas especializadas estão surgindo para otimizar prompts automaticamente.

O futuro aponta para prompts adaptativos que se ajustam automaticamente com base no feedback e contexto, criando experiências mais personalizadas.',
  'Prompt Engineering',
  'Maria Santos',
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
  true
);