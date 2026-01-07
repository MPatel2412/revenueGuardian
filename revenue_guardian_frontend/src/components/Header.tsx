import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, User, FileText, Users } from 'lucide-react';
import { searchGlobal } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // Search State
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ clients: any[], policies: any[] }>({ clients: [], policies: [] });
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Debounce Search Logic (Wait 300ms after typing stops)
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length >= 2) {
                try {
                    const data = await searchGlobal(query);
                    setResults(data);
                    setIsOpen(true);
                } catch (error) {
                    console.error("Search failed", error);
                }
            } else {
                setIsOpen(false);
                setResults({ clients: [], policies: [] });
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleResultClick = (path: string) => {
        setIsOpen(false);
        setQuery(''); // Clear search after selection
        navigate(path);
    };

    return (
        <header className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10 h-16">
            
            {/* Left Section: Search */}
            <div className="relative" ref={searchRef}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search clients, policies, vehicles..." 
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-80 text-sm transition-all focus:w-96"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.length >= 2 && setIsOpen(true)}
                    />
                </div>

                {/* --- SEARCH DROPDOWN RESULTS --- */}
                {isOpen && (
                    <div className="absolute top-full left-0 w-96 bg-white shadow-xl rounded-lg border border-gray-100 mt-2 max-h-96 overflow-y-auto z-50">
                        
                        {/* No Results */}
                        {results.clients.length === 0 && results.policies.length === 0 && (
                            <div className="p-4 text-sm text-gray-500 text-center">No results found for "{query}"</div>
                        )}

                        {/* Client Results */}
                        {results.clients.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase px-4 py-2 bg-gray-50">Clients</h3>
                                {results.clients.map((client: any) => (
                                    <div 
                                        key={client.id}
                                        onClick={() => handleResultClick(`/clients/${client.id}`)}
                                        className="flex items-center px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                                    >
                                        <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-600">
                                            <Users className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{client.name}</p>
                                            <p className="text-xs text-gray-500">{client.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Policy Results */}
                        {results.policies.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase px-4 py-2 bg-gray-50">Policies</h3>
                                {results.policies.map((policy: any) => (
                                    <div 
                                        key={policy.id}
                                        onClick={() => handleResultClick(`/policies/${policy.id}`)}
                                        className="flex items-center px-4 py-3 hover:bg-green-50 cursor-pointer border-b last:border-0"
                                    >
                                        <div className="bg-green-100 p-2 rounded-full mr-3 text-green-600">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{policy.policy_number}</p>
                                            <p className="text-xs text-gray-500">
                                                {policy.vehicle_number ? `Vehicle: ${policy.vehicle_number}` : policy.policy_type}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Right Section: Notifications & User (Unchanged) */}
            <div className="flex items-center space-x-6">
                <Bell className="h-6 w-6 text-gray-500 cursor-pointer hover:text-blue-600" />
                <div className="flex items-center space-x-2 cursor-pointer group relative">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {user?.username ? user.username.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.username || 'User'}</span>
                    
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