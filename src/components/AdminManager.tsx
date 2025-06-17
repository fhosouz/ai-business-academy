import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, UserPlus, Trash2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";

interface AdminUser {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string;
}

const AdminManager = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    if (isAdmin) {
      fetchAdminUsers();
    }
  }, [isAdmin]);

  const fetchAdminUsers = async () => {
    try {
      setFetchingUsers(true);
      
      // First get all admin user roles
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      if (!adminRoles || adminRoles.length === 0) {
        setAdminUsers([]);
        return;
      }

      // Then get profiles for those users
      const userIds = adminRoles.map(role => role.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Get user emails from auth.users through profiles table
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      // Combine the data
      const formattedUsers = adminRoles.map(role => {
        const profile = profiles?.find(p => p.user_id === role.user_id);
        const authUser = authUsers?.users?.find(u => u.id === role.user_id);
        return {
          id: role.user_id,
          email: authUser?.email || 'email@naodiponivel.com',
          display_name: profile?.display_name || authUser?.user_metadata?.display_name || null,
          role: role.role,
          created_at: new Date().toISOString()
        };
      });

      setAdminUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar administradores.",
        variant: "destructive",
      });
    } finally {
      setFetchingUsers(false);
    }
  };

  const createNewAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword || !newAdminName) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create new user with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: newAdminEmail,
        password: newAdminPassword,
        options: {
          data: {
            display_name: newAdminName
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (signUpError) throw signUpError;
      
      if (!data.user) {
        throw new Error('Falha ao criar usuário');
      }

      // The profile and user role will be created automatically by the trigger
      // But we need to update the role to admin
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('user_id', data.user.id);

      if (roleError) throw roleError;

      // Clear form
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminName("");
      setShowCreateForm(false);
      
      fetchAdminUsers();

      toast({
        title: "Sucesso!",
        description: "Novo administrador criado com sucesso.",
      });
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar administrador.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addExistingAdmin = async () => {
    if (!newAdminEmail) {
      toast({
        title: "Erro",
        description: "Email é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Search for user by email in profiles table using display_name for now
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .ilike('display_name', `%${newAdminEmail}%`)
        .single();
      
      if (profileError || !profile) {
        toast({
          title: "Erro",
          description: "Usuário com este email não encontrado. O usuário deve estar registrado primeiro.",
          variant: "destructive",
        });
        return;
      }
      
      const targetUserId = profile.user_id;
      
      // Check if user already has admin role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('role', 'admin')
        .single();

      if (existingRole) {
        toast({
          title: "Aviso",
          description: "Este usuário já é um administrador.",
          variant: "destructive",
        });
        return;
      }

      // Add admin role
      const { error: insertError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: targetUserId,
          role: 'admin'
        });

      if (insertError) throw insertError;

      setNewAdminEmail("");
      fetchAdminUsers();

      toast({
        title: "Sucesso!",
        description: "Usuário promovido a administrador com sucesso.",
      });
    } catch (error: any) {
      console.error('Error adding admin:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar administrador.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'user' })
        .eq('user_id', userId);

      if (error) throw error;

      fetchAdminUsers();
      toast({
        title: "Sucesso!",
        description: "Permissões de administrador removidas.",
      });
    } catch (error) {
      console.error('Error removing admin:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover administrador.",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta área.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Criar Novo Administrador
          </CardTitle>
          <CardDescription>
            Criar um novo usuário com permissões de administrador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showCreateForm ? (
            <Button 
              onClick={() => setShowCreateForm(true)} 
              variant="outline" 
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Criar Novo Administrador
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-admin-name">Nome Completo</Label>
                <Input
                  id="new-admin-name"
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Nome do administrador"
                />
              </div>
              <div>
                <Label htmlFor="new-admin-email">Email</Label>
                <Input
                  id="new-admin-email"
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="new-admin-password">Senha</Label>
                <Input
                  id="new-admin-password"
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Senha segura"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Mínimo 6 caracteres
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={createNewAdmin} 
                  disabled={loading} 
                  className="flex-1"
                >
                  {loading ? "Criando..." : "Criar Administrador"}
                </Button>
                <Button 
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewAdminEmail("");
                    setNewAdminPassword("");
                    setNewAdminName("");
                  }} 
                  variant="outline"
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Administradores Cadastrados
          </CardTitle>
          <CardDescription>
            Gerencie os administradores do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetchingUsers ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando administradores...</p>
            </div>
          ) : adminUsers.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum administrador cadastrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      {admin.display_name || 'Sem nome'}
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {admin.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover Admin
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover Administrador</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover as permissões de administrador de {admin.display_name}? 
                              O usuário continuará existindo, mas não terá mais acesso de admin.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeAdmin(admin.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManager;