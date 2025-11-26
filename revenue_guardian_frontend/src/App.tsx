import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';

// A simple Private Route wrapper
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

const Dashboard = () => {
    const { logout, user } = useAuth();
    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold">Welcome, Agent {user?.username || 'User'}!</h1>
            <p className="mb-4">This is the secure dashboard.</p>
            <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </div>
    );
};

function App() {
  return (
    // 'BrowserRouter' is usually wrapped in main.tsx, assuming it is there. 
    // If you get a Router error, wrap this whole return in <BrowserRouter>
    <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Route */}
            <Route 
                path="/" 
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } 
            />
        </Routes>
    </AuthProvider>
  );
}

export default App;