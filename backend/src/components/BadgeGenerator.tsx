import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Share2, Linkedin, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BadgeGeneratorProps {
  courseName: string;
  completionDate: string;
  userName: string;
  skills?: string[];
}

const BadgeGenerator = ({ courseName, completionDate, userName, skills = [] }: BadgeGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const badgeId = `badge-${Date.now()}`;
  
  const downloadBadge = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = 600;
    canvas.height = 400;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, '#6366f1');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // White content area
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.roundRect(40, 40, canvas.width - 80, canvas.height - 80, 20);
    ctx.fill();
    
    // Award icon area
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 120, 40, 0, 2 * Math.PI);
    ctx.fill();
    
    // Text content
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    
    // Title
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Certificado de Conclusão', canvas.width / 2, 200);
    
    // Course name
    ctx.font = 'bold 20px Arial';
    ctx.fillText(courseName, canvas.width / 2, 235);
    
    // Institution
    ctx.font = '16px Arial';
    ctx.fillText('AutomatizeAI', canvas.width / 2, 260);
    
    // Student name
    ctx.font = 'italic 18px Arial';
    ctx.fillText(`Concedido a: ${userName}`, canvas.width / 2, 290);
    
    // Date
    ctx.font = '14px Arial';
    ctx.fillText(`Data: ${completionDate}`, canvas.width / 2, 320);
    
    // Skills
    if (skills.length > 0) {
      ctx.font = '12px Arial';
      ctx.fillText(`Habilidades: ${skills.join(', ')}`, canvas.width / 2, 345);
    }
    
    // Download
    const link = document.createElement('a');
    link.download = `badge-${courseName.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    toast({
      title: "Badge baixado!",
      description: "Seu badge foi salvo com sucesso.",
    });
  };

  const shareLinkedIn = () => {
    const text = `Acabei de concluir o curso "${courseName}" na AutomatizeAI! 🎉 #AprendizadoContinuo #IA #AutomatizeAI`;
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareFacebook = () => {
    const text = `Acabei de concluir o curso "${courseName}" na AutomatizeAI! 🎉`;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    const text = `Acabei de concluir o curso "${courseName}" na AutomatizeAI! 🎉`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
          size="lg"
        >
          <Award className="w-5 h-5 mr-2" />
          Gerar Badge de Conclusão
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">🎉 Parabéns! Curso Concluído 🎉</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Badge Preview */}
          <Card className="mx-auto max-w-md">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 p-8 text-white text-center rounded-t-lg">
                <div className="bg-yellow-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Certificado de Conclusão</h3>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <h4 className="text-lg font-semibold">{courseName}</h4>
                  <p className="text-blue-100 text-sm mt-1">AutomatizeAI</p>
                </div>
              </div>
              
              <div className="bg-white p-6 text-center rounded-b-lg">
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Concedido a:</span> {userName}
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  <span className="font-medium">Data:</span> {completionDate}
                </p>
                
                {skills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Habilidades Desenvolvidas:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="space-y-4">
            <div className="text-center">
              <Button onClick={downloadBadge} className="mr-2">
                <Download className="w-4 h-4 mr-2" />
                Baixar Badge
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">Compartilhe sua conquista:</p>
              <div className="flex justify-center gap-2">
                <Button onClick={shareLinkedIn} variant="outline" size="sm">
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </Button>
                <Button onClick={shareFacebook} variant="outline" size="sm">
                  <Facebook className="w-4 h-4 mr-1" />
                  Facebook
                </Button>
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-1" />
                  Copiar Texto
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeGenerator;