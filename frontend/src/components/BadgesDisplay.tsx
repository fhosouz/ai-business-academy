import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Calendar, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CertificateModal from "./CertificateModal";

interface UserBadge {
  id: string;
  badge_type: string;
  badge_title: string;
  badge_description: string | null;
  earned_at: string;
}

interface Certificate {
  id: string;
  certificate_title: string;
  course_id: string | null;
  issued_at: string;
  user_name: string;
}

const BadgesDisplay = () => {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBadgesAndCertificates();
    }
  }, [user]);

  const fetchBadgesAndCertificates = async () => {
    if (!user) return;

    try {
      // Fetch badges
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('id, badge_type, badge_title, badge_description, earned_at')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      // Fetch certificates
      const { data: certificatesData } = await supabase
        .from('user_certificates')
        .select('id, certificate_title, course_id, issued_at')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });

      const certificatesWithUserName = certificatesData?.map(cert => ({
        ...cert,
        user_name: getUserDisplayName()
      })) || [];

      setBadges(badgesData || []);
      setCertificates(certificatesWithUserName);
    } catch (error) {
      console.error('Error fetching badges and certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "Usuário";
    
    const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name;
    if (displayName) return displayName;
    
    if (user.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    return "Usuário";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setShowCertificateModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Badges Conquistadas ({badges.length})
          </CardTitle>
          <CardDescription>
            Conquiste badges completando categorias de cursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhuma badge conquistada ainda. Complete uma categoria para ganhar sua primeira badge!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{badge.badge_title}</h4>
                    {badge.badge_description && (
                      <p className="text-xs text-muted-foreground">{badge.badge_description}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(badge.earned_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Certificados ({certificates.length})
          </CardTitle>
          <CardDescription>
            Seus certificados de conclusão de cursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <div className="text-center py-8">
              <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhum certificado emitido ainda. Complete uma categoria para ganhar seu primeiro certificado!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((certificate) => (
                <Card key={certificate.id} className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{certificate.certificate_title}</h4>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(certificate.issued_at)}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewCertificate(certificate)}
                      >
                        Ver Certificado
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        certificate={selectedCertificate}
      />
    </div>
  );
};

export default BadgesDisplay;