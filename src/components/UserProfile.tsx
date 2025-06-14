import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserProgress } from "@/hooks/useUserProgress";

const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { userProgress } = useUserProgress();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    display_name: "",
    avatar_url: "",
    bio: "",
    location: "",
    website: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile({
          display_name: data.display_name || getUserDisplayName(),
          avatar_url: data.avatar_url || "",
          bio: "",
          location: "",
          website: "",
        });
      } else {
        // Create profile if doesn't exist
        const displayName = getUserDisplayName();
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            display_name: displayName,
          });

        if (insertError) throw insertError;

        setProfile({
          display_name: displayName,
          avatar_url: "",
          bio: "",
          location: "",
          website: "",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar perfil.",
        variant: "destructive",
      });
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

  const getUserInitials = () => {
    const displayName = profile.display_name || getUserDisplayName();
    if (displayName === "Usuário") return "U";
    
    const names = displayName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso.",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile(); // Reset to original data
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Meu Perfil</CardTitle>
              <CardDescription>Gerencie suas informações pessoais</CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                  variant="secondary"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor="display_name">Nome de Exibição</Label>
                {isEditing ? (
                  <Input
                    id="display_name"
                    value={profile.display_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Seu nome completo"
                  />
                ) : (
                  <p className="text-lg font-semibold">{profile.display_name}</p>
                )}
              </div>
              
              <div>
                <Label>Email</Label>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              
              <div className="flex gap-2">
                <Badge className="bg-blue-600">Plano Premium</Badge>
                <Badge variant="outline">Nível {userProgress.level}</Badge>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userProgress.completedCourses}</div>
              <div className="text-sm text-gray-600">Cursos Concluídos</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{userProgress.badges}</div>
              <div className="text-sm text-gray-600">Badges</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{userProgress.totalXP}</div>
              <div className="text-sm text-gray-600">XP Total</div>
            </div>
          </div>

          {/* Additional Info */}
          {isEditing && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Fale um pouco sobre você..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Cidade, País"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profile.website}
                    onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://seusite.com"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Details */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso de Aprendizado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Aulas Concluídas</span>
              <span className="font-semibold">{userProgress.completedCourses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Aulas em Progresso</span>
              <span className="font-semibold">{userProgress.inProgress}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total de XP</span>
              <span className="font-semibold">{userProgress.totalXP}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Nível Atual</span>
              <Badge variant="outline">Nível {userProgress.level}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;