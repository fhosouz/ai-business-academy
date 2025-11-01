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
import { validateEmail, validateName, sanitizeInput } from "@/utils/inputValidation";

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
  const [existingUserEmail, setExistingUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    name: '',
    existingEmail: ''
  });
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    if (isAdmin) {
      fetchAdminUsers();
    }
  }, [isAdmin]);

  const validateCreateForm = () => {
    const errors = { email: '', password: '', name: '', existingEmail: '' };
    let isValid = true;

    if (!newAdminEmail) {
      errors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!validateEmail(newAdminEmail)) {
      errors.email = 'Email inválido';
      isValid = false;
    }

    if (!newAdminPassword) {
      errors.password = 'Senha é obrigatória';
      isValid = false;
    } else if (newAdminPassword.length < 8) {
      errors.password = 'Senha deve ter pelo menos 8 caracteres';
      isValid = false;
    }

    if (!newAdminName) {
      errors.name = 'Nome é obrigatório';
      isValid = false;
    } else if (!validateName(newAdminName)) {
      errors.name = 'Nome inválido';
      isValid = false;
    }

    setFormErrors(prev => ({ ...prev, ...errors }));
    return isValid;
  };

  const validateExistingUserForm = () => {
    const errors = { email: '', password: '', name: '', existingEmail: '' };
    let isValid = true;

    if (!existingUserEmail) {
      errors.existingEmail = 'Email é obrigatório';
      isValid = false;
    } else if (!validateEmail(existingUserEmail)) {
      errors.existingEmail = 'Email inválido';
      isValid = false;
    }

    setFormErrors(prev => ({ ...prev, ...errors }));
    return isValid;
  };

  const logAdminAction = async (action: string, targetUserId?: string, details?: any) => {
    try {
      await supabase
        .from('admin_action_logs')
        .insert({
          action: action,
          target_user_id: targetUserId || null,
          details: details || null
        });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  };

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
        .select('id, name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Get user emails from auth.users through profiles table
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.warn('Could not fetch auth users:', authError);
      }

      // Combine the data
      const formattedUsers = adminRoles.map(role => {
        const profile = profiles?.find(p => p.id === role.user_id);
        const authUser = authUsers && authUsers.users ? authUsers.users.find((u: any) => u.id === role.user_id) : null;
        return {
          id: role.user_id,
          email: authUser?.email || 'email@naodiponivel.com',
          display_name: profile?.name || authUser?.user_metadata?.display_name || null,
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
    if (!validateCreateForm()) {
      return;
    }

    setLoading(true);
    try {
      const sanitizedName = sanitizeInput(newAdminName, 50);
      const sanitizedEmail = sanitizeInput(newAdminEmail, 255);

      // Create new user with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: newAdminPassword,
        options: {
          data: {
            display_name: sanitizedName
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

      // Log admin action
      await logAdminAction('create_admin', data.user.id, {
        email: sanitizedEmail,
        name: sanitizedName
      });

      // Clear form
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminName("");
      setShowCreateForm(false);
      setFormErrors({ email: '', password: '', name: '', existingEmail: '' });
      
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
    if (!validateExistingUserForm()) {
      return;
    }

    setLoading(true);
    try {
      const sanitizedEmail = sanitizeInput(existingUserEmail, 255);

      // Get user by email using a more reliable method
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw new Error('Erro ao buscar usuários');

      const targetUser = authUsers.users?.find((user: any) => 
        user.email?.toLowerCase() === sanitizedEmail.toLowerCase()
      );

      if (!targetUser) {
        toast({
          title: "Erro",
          description: "Usuário com este email não encontrado. O usuário deve estar registrado primeiro.",
          variant: "destructive",
        });
        return;
      }
      
      const targetUserId = targetUser.id;
      
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

      // Log admin action
      await logAdminAction('promote_to_admin', targetUserId, {
        email: sanitizedEmail
      });

      setExistingUserEmail("");
      setFormErrors({ email: '', password: '', name: '', existingEmail: '' });
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

      // Log admin action
      await logAdminAction('remove_admin', userId);

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
            Gerenciar Administradores
          </CardTitle>
          <CardDescription>
            Criar novos administradores ou promover usuários existentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create New Admin Section */}
          <div className="space-y-4">
            <h4 className="font-medium">Criar Novo Administrador</h4>
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
              <div className="space-y-4 border rounded-lg p-4">
                <div>
                  <Label htmlFor="new-admin-name">Nome Completo</Label>
                  <Input
                    id="new-admin-name"
                    type="text"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(sanitizeInput(e.target.value, 50))}
                    placeholder="Nome do administrador"
                    className={formErrors.name ? 'border-red-500' : ''}
                  />
                  {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="new-admin-email">Email</Label>
                  <Input
                    id="new-admin-email"
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(sanitizeInput(e.target.value, 255))}
                    placeholder="email@exemplo.com"
                    className={formErrors.email ? 'border-red-500' : ''}
                  />
                  {formErrors.email && <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="new-admin-password">Senha</Label>
                  <Input
                    id="new-admin-password"
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Senha segura"
                    className={formErrors.password ? 'border-red-500' : ''}
                  />
                  {formErrors.password && <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>}
                  <p className="text-sm text-muted-foreground mt-1">
                    Mínimo 8 caracteres
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
                      setFormErrors({ email: '', password: '', name: '', existingEmail: '' });
                    }} 
                    variant="outline"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Promote Existing User Section */}
          <div className="space-y-4">
            <h4 className="font-medium">Promover Usuário Existente</h4>
            <div className="space-y-4 border rounded-lg p-4">
              <div>
                <Label htmlFor="existing-user-email">Email do Usuário</Label>
                <Input
                  id="existing-user-email"
                  type="email"
                  value={existingUserEmail}
                  onChange={(e) => setExistingUserEmail(sanitizeInput(e.target.value, 255))}
                  placeholder="email@exemplo.com"
                  className={formErrors.existingEmail ? 'border-red-500' : ''}
                />
                {formErrors.existingEmail && <p className="text-sm text-red-500 mt-1">{formErrors.existingEmail}</p>}
                <p className="text-sm text-muted-foreground mt-1">
                  O usuário deve estar registrado no sistema
                </p>
              </div>
              <Button 
                onClick={addExistingAdmin} 
                disabled={loading} 
                variant="outline"
                className="w-full"
              >
                {loading ? "Promovendo..." : "Promover a Administrador"}
              </Button>
            </div>
          </div>
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
