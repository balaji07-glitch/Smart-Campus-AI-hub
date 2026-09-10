import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, EducationDetail } from '../types';
import { initialUsers } from '../data/initialData';

// Safe JSON parser: prevents "not valid JSON" crash when server returns an HTML error page
async function safeJson(res: Response) {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Server returned non-JSON response (HTTP ${res.status}). Make sure the backend is running on port 3000. Preview: ${text.slice(0, 120)}`);
  }
  return res.json();
}

interface AuthContextType {
  currentUser: User;
  isLoggedIn: boolean;
  selectedRole: UserRole | null;
  selectRole: (role: UserRole) => void;
  clearRoleSelection: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  enterAsVisitor: () => Promise<void>;
  loginWithRole: (role: UserRole, credentials: { email?: string; password?: string; userId?: string }) => Promise<User>;
  signupWithRole: (data: {
    role: UserRole;
    name: string;
    email: string;
    password?: string;
    skills?: string[];
    education?: EducationDetail[];
    department?: string;
    studentYear?: string;
  }) => Promise<User>;
  switchRole: (role?: UserRole) => void;
  logout: () => void;
  setUser: (user: User) => void;
  availableUsers: User[];
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  loginAs: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>(initialUsers);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Restore saved session if any, otherwise default to not logged in
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('smart_campus_logged_in') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = sessionStorage.getItem('smart_campus_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    // Fallback template user (only used once logged in)
    return initialUsers[0];
  });

  // Load available users from backend
  useEffect(() => {
    fetch('/api/auth/users')
      .then(res => safeJson(res))
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableUsers(data);
        }
      })
      .catch(() => {
        // keep fallback initialUsers
      });
  }, []);

  // Sync to session storage
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      sessionStorage.setItem('smart_campus_logged_in', 'true');
      sessionStorage.setItem('smart_campus_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('smart_campus_logged_in');
      sessionStorage.removeItem('smart_campus_user');
    }
  }, [isLoggedIn, currentUser]);

  // Pick a role from the landing role selector
  const selectRole = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'visitor') {
      enterAsVisitor();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  // Clear role selection to return to the landing screen
  const clearRoleSelection = () => {
    setSelectedRole(null);
    setIsAuthModalOpen(false);
    setIsLoginModalOpen(false);
    setIsLoggedIn(false);
  };

  // Visitor enters directly with NO signup/login screen
  const enterAsVisitor = async () => {
    try {
      const res = await fetch('/api/auth/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await safeJson(res);
      if (data && data.user) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        setSelectedRole('visitor');
        setIsAuthModalOpen(false);
        return;
      }
    } catch (e) {
      // Fallback local visitor
    }

    const fallbackVisitor: User = {
      id: `usr_visitor_${Date.now()}`,
      name: 'Guest Visitor',
      email: 'visitor@guest.org',
      role: 'visitor',
      department: 'Campus Visitor / Guest',
      languagePreference: 'en',
      skills: [],
    };
    setCurrentUser(fallbackVisitor);
    setIsLoggedIn(true);
    setSelectedRole('visitor');
    setIsAuthModalOpen(false);
  };

  // Login with role
  const loginWithRole = async (
    role: UserRole,
    credentials: { email?: string; password?: string; userId?: string }
  ): Promise<User> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, ...credentials }),
      });
      const data = await safeJson(res);
      if (data.user) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        setSelectedRole(data.user.role);
        setIsAuthModalOpen(false);
        setIsLoginModalOpen(false);
        return data.user;
      }
    } catch (err: any) {
      console.warn('Backend auth unreachable, using local login fallback:', err);
      const match = availableUsers.find(
        u => u.role === role && (credentials.email ? u.email.toLowerCase() === credentials.email.toLowerCase() : true)
      );
      if (match) {
        setCurrentUser(match);
        setIsLoggedIn(true);
        setSelectedRole(match.role);
        setIsAuthModalOpen(false);
        setIsLoginModalOpen(false);
        return match;
      }
    }
    throw new Error('Invalid login credentials');
  };

  // Signup with role-specific fields
  const signupWithRole = async (data: {
    role: UserRole;
    name: string;
    email: string;
    password?: string;
    skills?: string[];
    education?: EducationDetail[];
    department?: string;
    studentYear?: string;
  }): Promise<User> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await safeJson(res);
      if (res.ok && resData.user) {
        setCurrentUser(resData.user);
        setIsLoggedIn(true);
        setSelectedRole(resData.user.role);
        setIsAuthModalOpen(false);
        setIsLoginModalOpen(false);
        return resData.user;
      }
    } catch (err: any) {
      console.warn('Backend signup unreachable, creating user locally:', err);
    }

    // Fallback: create user locally if backend is unavailable or fails
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department || 'Computer Science & Engineering',
      studentYear: data.studentYear || '1st Year (Freshman)',
      skills: data.skills || ['AI & ML'],
      education: data.education || [],
      languagePreference: 'en',
    };
    setAvailableUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setSelectedRole(newUser.role);
    setIsAuthModalOpen(false);
    setIsLoginModalOpen(false);
    return newUser;
  };

  // Switch role: After login, trying to switch role clears the active session and returns to the starting page
  const switchRole = (_role?: UserRole) => {
    clearRoleSelection();
  };

  // Direct login
  const loginAs = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setSelectedRole(user.role);
    setIsAuthModalOpen(false);
    setIsLoginModalOpen(false);
  };

  // Logout returns strictly to the Role Selector screen
  const logout = () => {
    clearRoleSelection();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        selectedRole,
        selectRole,
        clearRoleSelection,
        isAuthModalOpen,
        setIsAuthModalOpen,
        enterAsVisitor,
        loginWithRole,
        signupWithRole,
        switchRole,
        logout,
        setUser: setCurrentUser,
        availableUsers,
        isLoginModalOpen,
        setIsLoginModalOpen,
        loginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
