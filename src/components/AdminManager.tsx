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

      // Combine the data
      const formattedUsers = adminRoles.map(role => {
        const profile = profiles?.find(p => p.user_id === role.user_id);
        return {
          id: role.user_id,
          email: 'admin@example.com', // We can't access auth.users directly
          display_name: profile?.display_name || null,
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

  const createAdmin = async () => {
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
      // Create user with admin role
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdminEmail,
        password: newAdminPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: newAdminName
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update user role to admin
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: 'admin' })
          .eq('user_id', authData.user.id);

        if (roleError) throw roleError;

        // Update profile with display name
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ display_name: newAdminName })
          .eq('user_id', authData.user.id);

        if (profileError) throw profileError;
      }

      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminName("");
      fetchAdminUsers();

      toast({
        title: "Sucesso!",
        description: "Administrador criado com sucesso.",
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
            Cadastrar Novo Administrador
          </CardTitle>
          <CardDescription>
            Crie uma nova conta de administrador com acesso total ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="admin-name">Nome Completo</Label>
              <Input
                id="admin-name"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                placeholder="Ex: João Silva"
              />
            </div>
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="admin-password">Senha</Label>
              <Input
                id="admin-password"
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                placeholder="Senha segura"
              />
            </div>
          </div>
          <Button onClick={createAdmin} disabled={loading} className="w-full">
            {loading ? "Criando..." : "Criar Administrador"}
          </Button>
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