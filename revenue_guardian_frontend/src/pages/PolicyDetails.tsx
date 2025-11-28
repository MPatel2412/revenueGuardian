import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPolicy, updatePolicy, getClientsList, getCarriers } from '../services/api';
import toast from 'react-hot-toast';
import { Edit, FileText, Calendar, DollarSign, ArrowLeft, Users, Shield } from 'lucide-react';

// Define the shape of data we need for display and form state
interface Policy {
    id: number;
    policy_number: string;
    client: number;
    carrier: number;
    client_details: { name: string; id: number }; 
    carrier_details: { name: string };
    policy_type: string;
    status: string;
    premium_amount: number;
    sum_insured: number;
    start_date: string;
    end_date: string;
    renewal_date: string;
}

const PolicyDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const policyId = id ? parseInt(id) : null;
    
    const [policy, setPolicy] = useState<Policy | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false); // Toggle Edit Mode
    
    // Form State (for editing)
    const [formData, setFormData] = useState<any>({});
    
    // Dropdown Options State
    const [clients, setClients] = useState<any[]>([]);
    const [carriers, setCarriers] = useState<any[]>([]);

    // --- 1. Data Fetching ---
    const fetchPolicyData = async () => {
        if (!policyId) return;
        setLoading(true);
        try {
            const policyData = await getPolicy(policyId.toString());
            setPolicy(policyData);
            
            // Initialize form data with fetched policy data
            setFormData({
                client: policyData.client,
                carrier: policyData.carrier,
                policy_number: policyData.policy_number,
                policy_type: policyData.policy_type,
                status: policyData.status,
                // Ensure numbers are strings for form inputs
                premium_amount: String(policyData.premium_amount), 
                sum_insured: String(policyData.sum_insured),
                start_date: policyData.start_date,
                end_date: policyData.end_date,
                renewal_date: policyData.renewal_date,
            });
            
            // Load dropdown options once
            const [clientsData, carriersData] = await Promise.all([
                getClientsList(),
                getCarriers()
            ]);
            setClients(clientsData);
            setCarriers(carriersData);

        } catch (error) {
            console.error("Failed to fetch policy data:", error);
            toast.error("Policy data not found or access denied.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicyData();
    }, [policyId]);

    // --- 2. Form Handling ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const payload = {
                ...formData,
                // Ensure IDs are numbers before sending
                client: Number(formData.client),
                carrier: Number(formData.carrier),
            };

            await updatePolicy(policyId!, payload);
            toast.success("Policy updated successfully!");
            
            // Exit edit mode and refetch the updated data
            setIsEditing(false);
            fetchPolicyData(); 

        } catch (error) {
            console.error("Policy form submission error:", error);
            toast.error("Failed to update policy. Check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Policy Details...</div>;
    if (!policy) return <div className="p-10 text-center text-red-600">Policy not found.</div>;

    // Helper for badges
    const getStatusTag = (status: string) => {
        const styles: {[key: string]: string} = {
            'ACTIVE': 'bg-green-100 text-green-800',
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'LAPSED': 'bg-red-100 text-red-800'
        };
        return `px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`;
    };

    return (
        <div className="max-w-4xl mx-auto">
             <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </button>
            
            {isEditing ? (
                // --- EDIT MODE: INLINED FORM ---
                <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Policy: {policy.policy_number}</h2>

                        {/* Row 1: Client & Carrier */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                                <select name="client" value={formData.client} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg">
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
                                <select name="carrier" value={formData.carrier} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg">
                                    {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Policy Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                                <input type="text" name="policy_number" value={formData.policy_number} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select name="policy_type" value={formData.policy_type} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                                    <option value="AUTO">Auto</option>
                                    <option value="HOME">Home</option>
                                    <option value="LIFE">Life</option>
                                    <option value="HEALTH">Health</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                                    <option value="ACTIVE">Active</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="LAPSED">Lapsed</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 3: Financials */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Premium Amount ($)</label>
                                <input type="number" step="0.01" name="premium_amount" value={formData.premium_amount} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sum Insured ($)</label>
                                <input type="number" step="0.01" name="sum_insured" value={formData.sum_insured} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                        </div>

                        {/* Row 4: Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-red-600">Renewal Date</label>
                                <input type="date" name="renewal_date" value={formData.renewal_date} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg border-red-200 bg-red-50" />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                // --- VIEW MODE ---
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                            <FileText className="h-7 w-7 mr-3 text-blue-600" />
                            {policy.policy_number}
                        </h1>
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition shadow-md"
                        >
                            <Edit className="h-5 w-5 mr-2" />
                            Edit Policy
                        </button>
                    </div>

                    {/* Policy Details Card */}
                    <div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-4 text-gray-700">
                            
                            {/* Policy & Status */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                <div className="mt-1">
                                    <span className={getStatusTag(policy.status)}>{policy.status}</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Type</h3>
                                <p className="mt-1 font-semibold">{policy.policy_type}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Carrier</h3>
                                <p className="mt-1 font-semibold">{policy.carrier_details.name}</p>
                            </div>

                            <div className="md:col-span-2 lg:col-span-1">
                                <h3 className="text-sm font-medium text-gray-500">Client</h3>
                                <Link to={`/clients/${policy.client}`} className="mt-1 font-semibold text-blue-600 hover:underline">
                                    {policy.client_details.name}
                                </Link>
                            </div>

                            {/* Financials */}
                            <div className="border-t pt-4 mt-4 md:col-span-2 lg:col-span-3 grid grid-cols-3 gap-x-10">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                                        <DollarSign className="h-4 w-4 mr-1 text-green-500"/> Annual Premium
                                    </h3>
                                    <p className="mt-1 text-lg font-bold text-green-700">${policy.premium_amount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Sum Insured</h3>
                                    <p className="mt-1 text-lg font-semibold">${policy.sum_insured.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="border-t pt-4 mt-4 md:col-span-2 lg:col-span-3 grid grid-cols-3 gap-x-10">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                                        <Calendar className="h-4 w-4 mr-1 text-purple-500"/> Start Date
                                    </h3>
                                    <p className="mt-1">{policy.start_date}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                                    <p className="mt-1">{policy.end_date}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 text-red-600">Renewal Date</h3>
                                    <p className="mt-1 font-bold text-red-600">{policy.renewal_date}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PolicyDetails;