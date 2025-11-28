import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getClient, getPolicyList } from '../services/api'; 
import toast from 'react-hot-toast';
import { Edit, Mail, Phone, MapPin, User, DollarSign, Calendar, AlertTriangle, Plus} from 'lucide-react';
import ClientForm from '../components/ClientForm'; // <-- NEW IMPORT

// Simplified Policy Type (matching the Dashboard interface)
interface Policy {
    id: number;
    policy_number: string;
    client: number;
    client_details: { name: string; id: number }; 
    policy_type: string;
    premium_amount: number;
    sum_insured: number;
    start_date: string;
    end_date: string;
    renewal_date: string;
    status: string;
    carrier_details: { name: string };
}

// Client Details Type (matching the API response)
interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    gender: 'M' | 'F' | 'O';
    address: string;
    total_policies: number; // Placeholder for future data
}

const ClientDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const clientId = id ? parseInt(id) : null;
    
    const [client, setClient] = useState<Client | null>(null);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false); // <-- NEW STATE

    const fetchClientData = async () => {
        if (!clientId) return;
        setLoading(true);
        try {
            // Fetch Client Details
            const clientData = await getClient(clientId.toString());
            setClient(clientData);

            // Fetch Policies filtered by this Client
            // NOTE: We need to update getPolicyList in api.ts to accept a client_id filter later, 
            // but for now, we'll assume the full list and filter locally OR update the API view
            // For now, let's just fetch all and filter client-side:
            const allPolicies = await getPolicyList(); 
            const clientPolicies = allPolicies.filter((p: Policy) => p.client === clientId);
            setPolicies(clientPolicies);

        } catch (error) {
            console.error("Failed to fetch client data:", error);
            toast.error("Client data not found or access denied.");
            // navigate('/clients'); // Redirect if client not found
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientData();
    }, [clientId]);

    if (loading) return <div className="p-10 text-center">Loading Client Profile...</div>;
    if (!client) return <div className="p-10 text-center text-red-600">Client not found.</div>;

    const handleEditSuccess = (updatedId: number) => {
        setIsEditing(false);
        // Refetch data to show updates
        fetchClientData();
    };

    return (
        <div>
            {isEditing ? (
                // --- EDIT MODE ---
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <ClientForm 
                        initialData={client} 
                        onSuccess={handleEditSuccess} 
                    />
                    <button 
                        onClick={() => setIsEditing(false)} 
                        className="mt-4 text-sm text-gray-500 hover:underline"
                    >
                        Cancel Editing
                    </button>
                </div>
            ) : (
                // --- VIEW MODE ---
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                            <User className="h-7 w-7 mr-3 text-blue-600" />
                            {client.name}
                        </h1>
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition shadow-md"
                        >
                            <Edit className="h-5 w-5 mr-2" />
                            Edit Profile
                        </button>
                    </div>

                    {/* Contact & Info Card */}
                    <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Client Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 text-gray-700">
                            <div className="flex items-center">
                                <Mail className="h-5 w-5 text-blue-500 mr-3" />
                                <span className="font-semibold">Email: {client.email}</span>
                            </div>
                            <div className="flex items-center">
                                <Phone className="h-5 w-5 text-blue-500 mr-3" />
                                <span className="font-semibold">Phone: {client.phone}</span>
                            </div>
                            <div className="flex items-center">
                                <User className="h-5 w-5 text-blue-500 mr-3" />
                                <span className="font-semibold">Gender: {client.gender === 'M' ? 'Male' : client.gender === 'F' ? 'Female' : 'Other'}</span>
                            </div>
                            <div className="flex items-start">
                                <MapPin className="h-5 w-5 text-blue-500 mr-3 mt-1" />
                                <div className="flex-1">
                                    <span className="font-semibold">Address:</span> 
                                    <p className="text-sm">{client.address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Policies Section */}
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex justify-between items-center">
                        Client Policies ({policies.length})
                        
                        {/* ADD THIS BUTTON */}
                        <Link 
                            to={`/policies/add?client_id=${clientId}`} 
                            className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition"
                        >
                            <Plus className="h-4 w-4 mr-1" /> Add Policy
                        </Link>
                    </h2>
                        
                        {policies.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                This client currently has no active policies.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy #</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Renewal Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {policies.map((policy) => (
                                            <tr key={policy.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-medium">
                                                    <Link to={`/policies/${policy.id}`}>{policy.policy_number}</Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">{policy.policy_type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">${policy.premium_amount.toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{policy.renewal_date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {/* Using simplified status tag logic here, you can refine it */}
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${policy.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {policy.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ClientDetails;