import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPolicy, getClientsList, getCarriers } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Users, Shield, DollarSign } from 'lucide-react';

const PolicyAdd = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Check for pre-selected client from URL (e.g., from ClientDetails page)
    const clientIdParam = searchParams.get('client_id');
    const preSelectedClientId = clientIdParam ? parseInt(clientIdParam) : undefined;

    // Dropdown Options State
    const [clients, setClients] = useState<any[]>([]);
    const [carriers, setCarriers] = useState<any[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form State initialization
    const [formData, setFormData] = useState({
        client: preSelectedClientId || '',
        carrier: '',
        policy_number: '',
        policy_type: 'AUTO',
        status: 'ACTIVE',
        premium_amount: '',
        sum_insured: '',
        start_date: '',
        end_date: '',
        renewal_date: '',
    });

    // --- 1. Load Dropdown Options ---
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [clientsData, carriersData] = await Promise.all([
                    getClientsList(),
                    getCarriers()
                ]);
                setClients(clientsData);
                setCarriers(carriersData);
                
                // If there are carriers, select the first one by default
                if (carriersData.length > 0 && !formData.carrier) {
                    setFormData(prev => ({ ...prev, carrier: carriersData[0].id }));
                }
            } catch (error) {
                toast.error("Failed to load form options");
            } finally {
                setLoadingOptions(false);
            }
        };
        fetchOptions();
    }, []);

    // --- 2. Form Handling ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                client: Number(formData.client),
                carrier: Number(formData.carrier),
            };

            const response = await createPolicy(payload);
            toast.success("Policy created successfully!");
            
            // Navigate to the Client's page so they see the list with the new policy
            // { replace: true } prevents the "Back" button from returning to this form
            navigate(`/clients/${formData.client}`, { replace: true }); 
        } catch (error) {
            console.error("Policy form submission error:", error);
            toast.error("Failed to create policy. Check your inputs.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingOptions) return <div className="p-10 text-center">Loading form options...</div>;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Cancel
            </button>
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Policy</h2>

                    {/* Row 1: Client & Carrier */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <select 
                                    name="client" 
                                    value={formData.client} 
                                    onChange={handleChange} 
                                    required 
                                    disabled={!!preSelectedClientId} // Lock if pre-selected
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500"
                                >
                                    <option value="">Select a Client</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <select 
                                    name="carrier" 
                                    value={formData.carrier} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500"
                                >
                                    <option value="">Select Carrier</option>
                                    {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Policy Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                            <input type="text" name="policy_number" value={formData.policy_number} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. POL-12345" />
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
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Premium Amount ($)</label>
                            <DollarSign className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
                            <input type="number" step="0.01" name="premium_amount" value={formData.premium_amount} onChange={handleChange} required className="w-full pl-9 pr-4 py-2 border rounded-lg" />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sum Insured ($)</label>
                            <DollarSign className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
                            <input type="number" step="0.01" name="sum_insured" value={formData.sum_insured} onChange={handleChange} required className="w-full pl-9 pr-4 py-2 border rounded-lg" />
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

                    <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50">
                        {isSubmitting ? 'Creating...' : 'Create Policy'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PolicyAdd;