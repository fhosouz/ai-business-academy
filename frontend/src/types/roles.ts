export type UserRole = 'user' | 'admin';

export interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
  user_metadata?: Record<string, any>;
}

export interface RolePermissions {
  canViewCourses: boolean;
  canManageCourses: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canViewAdminPanel: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  user: {
    canViewCourses: true,
    canManageCourses: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canManageSettings: false,
    canViewAdminPanel: false,
  },
  admin: {
    canViewCourses: true,
    canManageCourses: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canManageSettings: true,
    canViewAdminPanel: true,
  },
};

export const hasPermission = (
  role: UserRole,
  permission: keyof RolePermissions
): boolean => {
  return ROLE_PERMISSIONS[role][permission];
};

export const isAdmin = (role: UserRole): boolean => {
  return role === 'admin';
};

export const isUser = (role: UserRole): boolean => {
  return role === 'user';
};
