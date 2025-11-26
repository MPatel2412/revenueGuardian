import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { jwtDecode } from "jwt-decode";
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: any;
    login: (e: React.FormEvent) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [tokens, setTokens] = useState(() => localStorage.getItem('access') ? localStorage.getItem('access') : null);
    const navigate = useNavigate();

    // 1. Decode User info from Token on load
    useEffect(() => {
        if (tokens) {
            try {
                const decoded = jwtDecode(tokens);
                setUser(decoded);
            } catch (error) {
                logout(); // Token invalid/expired
            }
        }
    }, [tokens]);

    // 2. Login Function
    const login = async (e: any) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            const response = await api.post('auth/login/', { username, password });
            
            // Save Tokens
            localStorage.setItem('access', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
            
            setTokens(response.data.access);
            setUser(jwtDecode(response.data.access));
            
            toast.success('Login Successful!');
            navigate('/'); // Redirect to Dashboard
        } catch (error) {
            toast.error('Invalid Credentials');
            console.error("Login Failed", error);
        }
    };

    // 3. Logout Function
    const logout = () => {
        setTokens(null);
        setUser(null);
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext)!;