import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link} from 'react-router-dom';
import { getClient, getClientPolicies } from '../services/api';
import toast from 'react-hot-toast';

const ClientDetails = () => {
    const { id } = useParams(); // Get ID from URL
    const navigate = useNavigate();
    
    const [client, setClient] = useState<any>(null);
    const [policies, setPolicies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!id) return;
                // Run both requests in parallel
                const [clientData, policyData] = await Promise.all([
                    getClient(id),
                    getClientPolicies(id)
                ]);
                setClient(clientData);
                setPolicies(policyData);
            } catch (error) {
                toast.error("Error fetching client details");
                navigate('/'); // Go back if error
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-10">Loading...</div>;
    if (!client) return <div className="p-10">Client not found</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">
                &larr; Back to Dashboard
            </button>

            {/* Section 1: Client Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{client.name}</h1>
                        <p className="text-gray-500">{client.email}</p>
                    </div>
                    <div className="text-right">
                        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded">
                            Total Policies: {client.total_policies}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div><p className="text-gray-400 text-sm">Phone</p><p className="font-medium">{client.phone}</p></div>
                    <div><p className="text-gray-400 text-sm">Gender</p><p className="font-medium">{client.gender}</p></div>
                    <div><p className="text-gray-400 text-sm">Age</p><p className="font-medium">{client.age}</p></div>
                    <div><p className="text-gray-400 text-sm">Created</p><p className="font-medium">{new Date(client.created_at).toLocaleDateString()}</p></div>
                </div>
                <div className="mt-4"><p className="text-gray-400 text-sm">Address</p><p className="font-medium">{client.address || 'N/A'}</p></div>
            </div>

            {/* Section 2: Policies List */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">Policy History</h2>
            
            {policies.length === 0 ? (
                <p className="text-gray-500">No policies found for this client.</p>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renewal Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {policies.map((policy) => (
                                <tr key={policy.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                                        <Link to={`/policies/${policy.id}`} className="hover:underline">
                                            {policy.policy_number}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{policy.carrier_details?.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{policy.policy_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${policy.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                                              policy.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                              'bg-red-100 text-red-800'}`}>
                                            {policy.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">${policy.premium_amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{policy.renewal_date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ClientDetails;   