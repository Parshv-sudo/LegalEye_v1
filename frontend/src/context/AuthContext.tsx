import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Role, Matter } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  globalRole: Role;
  setCurrentUser: (user: User | null) => void;
  setGlobalRole: (role: Role) => void;
  hasRole: (requiredRole: Role, matter?: Matter | null) => boolean;
  hasAnyRole: (roles: Role[], matter?: Matter | null) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define our role hierarchy (lower index = higher privilege)
const ROLE_HIERARCHY: Role[] = ['ADMIN', 'PARTNER', 'ASSOCIATE', 'GUEST'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Default to partner for now
  const [globalRole, setGlobalRole] = useState<Role>('PARTNER');

  // Check token on mount
  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authApi.verify(token)
        .then(() => {
          setCurrentUser({
            id: 'u-admin',
            name: 'Admin User',
            email: 'admin@acme.com'
          });
          setGlobalRole('ADMIN');
        })
        .catch(() => {
          // Token is invalid or expired
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setCurrentUser(null);
        });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setCurrentUser(null);
    window.location.reload();
  };

  const getEffectiveRole = (matter?: Matter | null): Role => {
    // If we have a specific matter, check if the user has a specific role for it
    if (matter && currentUser) {
      const member = matter.members?.find(m => m.user.id === currentUser.id);
      if (member) return member.role;
    }
    // Fallback to global role if not explicitly defined in matter, or if no matter is provided
    return globalRole;
  };

  const hasRole = (requiredRole: Role, matter?: Matter | null): boolean => {
    const effectiveRole = getEffectiveRole(matter);
    const requiredIdx = ROLE_HIERARCHY.indexOf(requiredRole);
    const effectiveIdx = ROLE_HIERARCHY.indexOf(effectiveRole);
    
    // User has permission if their effective role index is <= the required role index
    return effectiveIdx !== -1 && effectiveIdx <= requiredIdx;
  };

  const hasAnyRole = (roles: Role[], matter?: Matter | null): boolean => {
    return roles.some(role => hasRole(role, matter));
  };

  return (
    <AuthContext.Provider value={{ currentUser, globalRole, setCurrentUser, setGlobalRole, hasRole, hasAnyRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
