import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Agent Portal Login</h2>
                
                <form onSubmit={login} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                        <input 
                            type="text" 
                            name="username"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" 
                            placeholder="Enter your username"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input 
                            type="password" 
                            name="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" 
                            placeholder="********"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
                    >
                        Sign In
                    </button>
                </form>
                
                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? <span className="text-blue-500 cursor-pointer">Contact Admin</span>
                </p>
            </div>
        </div>
    );
};

export default Login;