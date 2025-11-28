import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Import Components
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientDetails from './pages/ClientDetails';
import PolicyDetails from './pages/PolicyDetails';
import ClientsList from './pages/ClientsList';
import ClientAdd from './pages/ClientAdd';
import PolicyAdd from './pages/PolicyAdd';
import type { JSX } from 'react';


// --- PRIVATE ROUTE COMPONENT ---
// This handles both Security (Redirect to Login) and Layout (Adding Sidebar/Header)
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>; 
    }

    // If logged in, wrap the content in the main Layout
    return user ? (
        <Layout>
            {children}
        </Layout>
    ) : (
        <Navigate to="/login" />
    );
};

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes (Wrapped in Layout automatically by PrivateRoute) */}
            <Route 
                path="/" 
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } 
            />
            
            <Route 
                path="/clients/add" 
                element={
                    <PrivateRoute>
                        <ClientAdd />
                    </PrivateRoute>
                } 
            />

            <Route 
                path="/clients/:id" 
                element={
                    <PrivateRoute>
                        <ClientDetails />
                    </PrivateRoute>
                } 
            />
            
            <Route 
                path="/policies/:id" 
                element={
                    <PrivateRoute>
                        <PolicyDetails />
                    </PrivateRoute>
                } 
            />
            
            <Route 
                path="/policies/add" 
                element={<PrivateRoute><PolicyAdd /></PrivateRoute>} 
            />

            <Route 
                path="/renewals" 
                element={
                    <PrivateRoute>
                        <div className="p-10 text-xl text-gray-500">Renewals Management (Coming Soon)</div>
                    </PrivateRoute>
                } 
            />

            <Route 
                path="/settings" 
                element={
                    <PrivateRoute>
                        <div className="p-10 text-xl text-gray-500">Settings Page (Coming Soon)</div>
                    </PrivateRoute>
                } 
            />
            <Route 
                path="/clients" 
                element={
                    <PrivateRoute>
                        <ClientsList />
                    </PrivateRoute>
                } 
            />
        </Routes>
    </AuthProvider>
  );
}

export default App;