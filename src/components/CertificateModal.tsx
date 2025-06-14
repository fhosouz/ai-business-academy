import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Calendar } from "lucide-react";

interface Certificate {
  id: string;
  category_name: string;
  issued_at: string;
  user_name: string;
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate | null;
}

const CertificateModal = ({ isOpen, onClose, certificate }: CertificateModalProps) => {
  if (!certificate) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDownload = () => {
    // Create a simple certificate as an image/PDF
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Title
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICADO DE CONCLUSÃO', canvas.width / 2, 120);

    // Subtitle
    ctx.fillStyle = '#374151';
    ctx.font = '18px Arial';
    ctx.fillText('Este certificado atesta que', canvas.width / 2, 180);

    // User name
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(certificate.user_name, canvas.width / 2, 240);

    // Course completion text
    ctx.fillStyle = '#374151';
    ctx.font = '18px Arial';
    ctx.fillText('concluiu com sucesso o curso', canvas.width / 2, 290);

    // Course name
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(certificate.category_name, canvas.width / 2, 340);

    // Date
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Arial';
    ctx.fillText(`Emitido em ${formatDate(certificate.issued_at)}`, canvas.width / 2, 450);

    // Download
    const link = document.createElement('a');
    link.download = `certificado-${certificate.category_name}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Certificado de Conclusão
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-blue-900">
              Certificado de Conclusão
            </h2>
            
            <p className="text-gray-600">
              Este certificado atesta que
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900">
              {certificate.user_name}
            </h3>
            
            <p className="text-gray-600">
              concluiu com sucesso o curso
            </p>
            
            <Badge className="text-lg px-4 py-2 bg-blue-600">
              {certificate.category_name}
            </Badge>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-6">
              <Calendar className="w-4 h-4" />
              Emitido em {formatDate(certificate.issued_at)}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Baixar Certificado
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateModal;