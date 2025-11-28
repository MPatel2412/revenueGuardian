// src/components/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { Home, Users, AlertTriangle, Settings } from 'lucide-react';

const navItems = [
    { name: 'Overview', icon: Home, path: '/' },
    { name: 'Clients', icon: Users, path: '/clients' },
    { name: 'Renewals', icon: AlertTriangle, path: '/renewals' },
];

const Sidebar = () => {
    
    // Function to handle active styling
    const getLinkClass = ({ isActive, path }: { isActive: boolean, path: string }) => {
        // Use location check for '/' being active only when path is '/'
        const shouldBeActive = isActive || (path === '/' && location.pathname === '/');
        
        return `flex items-center p-3 rounded-lg transition-colors ${
            shouldBeActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
        }`;
    };

    return (
        <div className="w-64 bg-white border-r h-full p-4 fixed top-0 left-0 z-20">
            <h1 className="text-2xl font-extrabold text-blue-600 mb-8 mt-2">InsuranceAgent Pro</h1>
            
            <nav className="space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink key={item.name} to={item.path} className={({ isActive }) => getLinkClass({ isActive, path: item.path })}>
                            <Icon className="h-5 w-5 mr-3" />
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>
            
            <div className="absolute bottom-4 left-4 right-4">
                <NavLink to="/settings" className={({ isActive }) => getLinkClass({ isActive, path: '/settings' })}>
                    <Settings className="h-5 w-5 mr-3" />
                    <span className="font-medium">Settings</span>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;