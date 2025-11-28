import React, { useState, useEffect } from 'react';
import { createPolicy, updatePolicy, getClientsList, getCarriers } from '../services/api';
import toast from 'react-hot-toast';
import { FileText, Calendar, DollarSign, Users, Shield } from 'lucide-react';

interface PolicyFormProps {
    initialData?: any; // For Edit Mode
    preSelectedClientId?: number; // If adding from a specific client page
    onSuccess: (policyId: number) => void;
}

const PolicyForm: React.FC<PolicyFormProps> = ({ initialData, preSelectedClientId, onSuccess }) => {
    const isEditMode = !!initialData;
    
    // Dropdown Data
    const [clients, setClients] = useState<any[]>([]);
    const [carriers, setCarriers] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        client: preSelectedClientId || initialData?.client || '',
        carrier: initialData?.carrier || '',
        policy_number: initialData?.policy_number || '',
        policy_type: initialData?.policy_type || 'AUTO',
        status: initialData?.status || 'ACTIVE',
        premium_amount: initialData?.premium_amount || '',
        sum_insured: initialData?.sum_insured || '',
        start_date: initialData?.start_date || '',
        end_date: initialData?.end_date || '',
        renewal_date: initialData?.renewal_date || '',
    });
    
    const [loading, setLoading] = useState(false);

    // 1. Load Dropdown Options (Clients & Carriers)
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [clientsData, carriersData] = await Promise.all([
                    getClientsList(),
                    getCarriers()
                ]);
                setClients(clientsData);
                setCarriers(carriersData);
                
                // If Creating: Select first carrier by default if none selected
                if (!isEditMode && carriersData.length > 0 && !formData.carrier) {
                    setFormData(prev => ({ ...prev, carrier: carriersData[0].id }));
                }
            } catch (error) {
                toast.error("Failed to load form options");
            }
        };
        fetchOptions();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Ensure numbers are numbers for IDs
            const payload = {
                ...formData,
                client: Number(formData.client),
                carrier: Number(formData.carrier),
            };

            let response;
            if (isEditMode) {
                response = await updatePolicy(initialData.id, payload);
                toast.success("Policy updated!");
            } else {
                response = await createPolicy(payload);
                toast.success("Policy created!");
            }
            onSuccess(response.id);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save policy. Check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {isEditMode ? 'Edit Policy' : 'Create New Policy'}
            </h2>

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
                            disabled={!!preSelectedClientId} // Lock if coming from Client Page
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

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                {loading ? 'Processing...' : (isEditMode ? 'Update Policy' : 'Create Policy')}
            </button>
        </form>
    );
};

export default PolicyForm;