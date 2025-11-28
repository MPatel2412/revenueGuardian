// src/components/Header.tsx
import { useAuth } from '../context/AuthContext';
import { Bell, Search, User } from 'lucide-react';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10 h-16">
            
            {/* Left Section: Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search clients, policies..." 
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-80 text-sm"
                />
            </div>
            
            {/* Right Section: Notifications & User */}
            <div className="flex items-center space-x-6">
                <Bell className="h-6 w-6 text-gray-500 cursor-pointer hover:text-blue-600" />
                
                <div className="flex items-center space-x-2 cursor-pointer group relative">
                    <User className="h-8 w-8 p-1 rounded-full bg-blue-500 text-white" />
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.username || 'John Doe'}</span>
                    
                    {/* Simple Logout Dropdown */}
                    <div className="absolute right-0 top-10 w-32 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;