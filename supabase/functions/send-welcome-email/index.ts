import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, confirmationUrl }: WelcomeEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "AutomatizeAI Academy <onboarding@resend.dev>",
      to: [email],
      subject: "Bem-vindo à AutomatizeAI Academy - Confirme seu email",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo à AutomatizeAI Academy</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
              <div style="width: 64px; height: 64px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <div style="width: 32px; height: 32px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 20px; font-weight: bold; color: #2563eb;">📚</span>
                </div>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">AutomatizeAI Academy</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">Sua jornada em Inteligência Artificial começa aqui</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 20px;">
              <h2 style="color: #1e293b; margin: 0 0 20px; font-size: 24px; font-weight: bold;">Olá, ${name}! 👋</h2>
              
              <p style="color: #475569; line-height: 1.6; margin: 0 0 20px; font-size: 16px;">
                Seja muito bem-vindo à <strong>AutomatizeAI Academy</strong>! Estamos muito felizes em tê-lo conosco nesta jornada de descoberta e aprendizado em Inteligência Artificial.
              </p>
              
              <p style="color: #475569; line-height: 1.6; margin: 0 0 30px; font-size: 16px;">
                Para ativar sua conta e começar a explorar nossos cursos exclusivos, clique no botão abaixo para confirmar seu email:
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.3);">
                  Confirmar Email e Ativar Conta
                </a>
              </div>
              
              <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #1e293b; margin: 0 0 15px; font-size: 18px; font-weight: bold;">O que você encontrará na plataforma:</h3>
                <ul style="color: #475569; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">🎯 Cursos práticos e atualizados sobre IA</li>
                  <li style="margin-bottom: 8px;">📊 Acompanhamento do seu progresso</li>
                  <li style="margin-bottom: 8px;">🏆 Certificados de conclusão</li>
                  <li style="margin-bottom: 8px;">💬 Suporte especializado</li>
                  <li>🚀 Conteúdo exclusivo para acelerar sua carreira</li>
                </ul>
              </div>
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 20px 0 0; text-align: center;">
                Se você não criou esta conta, pode ignorar este email com segurança.<br>
                Este link de confirmação expira em 24 horas.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 30px 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0; font-size: 14px;">
                <strong>AutomatizeAI Academy</strong><br>
                Transformando conhecimento em resultados através da Inteligência Artificial
              </p>
              <p style="color: #94a3b8; margin: 15px 0 0; font-size: 12px;">
                © 2024 AutomatizeAI Academy. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);