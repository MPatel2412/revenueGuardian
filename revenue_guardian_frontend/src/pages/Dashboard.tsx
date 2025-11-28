import { useState, useEffect } from 'react';
import { AlertTriangle, Search, Calendar, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPolicyList } from '../services/api'; 
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// Define the shape of data we expect from Backend
interface Policy {
    id: number;
    policy_number: string;
    client: number;
    client_details: { name: string; id: number }; // We need this from the Serializer
    policy_type: string;
    premium_amount: number;
    sum_insured: number;
    start_date: string;
    end_date: string;
    renewal_date: string;
    status: string;
    carrier_details: { name: string };
}

const Dashboard = () => {
    const { user } = useAuth();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const data = await getPolicyList();
                console.log("Dashboard Data Loaded:", data); // Debug Log
                setPolicies(data);
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
                toast.error("Could not load policies.");
            } finally {
                setLoading(false);
            }
        };
        fetchPolicies();
    }, []);

    // Filter Logic
    const upcomingRenewals = policies.filter(p => {
        const today = new Date();
        const renewal = new Date(p.renewal_date);
        const diffDays = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return p.status !== 'LAPSED' && diffDays >= 0 && diffDays <= 30; 
    });

    const displayedPolicies = activeTab === 'all' ? policies : upcomingRenewals;

    if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

    // Helper for badges
    const getStatusTag = (status: string) => {
        const styles: {[key: string]: string} = {
            'ACTIVE': 'bg-green-100 text-green-800',
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'LAPSED': 'bg-red-100 text-red-800'
        };
        return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`;
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
            <p className="text-gray-600 mb-6">Welcome back, {user?.username}. Here is your overview.</p>

            {/* Alert Card */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-center mb-6">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
                <h3 className="font-semibold text-yellow-800 mr-4">Renewal Alerts</h3>
                <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                    {upcomingRenewals.length}
                </span>
            </div>

            {/* Main Table Card */}
            <div className="bg-white p-6 rounded-lg shadow">
                
                {/* Tabs */}
                <div className="flex border-b mb-4">
                    <button onClick={() => setActiveTab('all')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                        All Policies ({policies.length})
                    </button>
                    <button onClick={() => setActiveTab('upcoming')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'upcoming' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                         Upcoming Renewals
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Policy #</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Renewal</th>
                                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedPolicies.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        No policies found.
                                    </td>
                                </tr>
                            ) : (
                                displayedPolicies.map((policy) => (
                                    <tr key={policy.id} className="hover:bg-gray-50">
                                        <td className="p-4 text-blue-600 font-medium">
                                            <Link to={`/policies/${policy.id}`}>{policy.policy_number}</Link>
                                        </td>
                                        <td className="p-4">
                                            <Link to={`/clients/${policy.client}`} className="hover:underline">
                                                {policy.client_details?.name || 'Unknown Client'}
                                            </Link>
                                        </td>
                                        <td className="p-4">{policy.carrier_details?.name || '-'}</td>
                                        <td className="p-4"><span className={getStatusTag(policy.status)}>{policy.status}</span></td>
                                        <td className="p-4">${policy.premium_amount}</td>
                                        <td className={`p-4 ${upcomingRenewals.includes(policy) ? 'text-red-600 font-bold' : ''}`}>
                                            {policy.renewal_date}
                                        </td>
                                        <td className="p-4">
                                            <Link to={`/policies/${policy.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;