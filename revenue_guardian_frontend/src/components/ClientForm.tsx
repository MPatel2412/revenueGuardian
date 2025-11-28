import React, { useState, useEffect } from 'react';
import { createClient, updateClient } from '../services/api';
import toast from 'react-hot-toast';
import { User, Phone, Mail, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    gender: 'M' | 'F' | 'O';
    address: string;
}

interface ClientFormProps {
    initialData?: Client; // Optional for Edit mode
    onSuccess: (clientId: number) => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ initialData, onSuccess }) => {
    const navigate = useNavigate();
    const isEditMode = !!initialData;
    
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        gender: initialData?.gender || 'M' as 'M' | 'F' | 'O',
        address: initialData?.address || '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const clientPayload = {
                ...formData,
                phone: formData.phone.replace(/[^0-9]/g, '') // Clean phone number before sending
            };

            let response;
            if (isEditMode) {
                response = await updateClient(initialData.id, clientPayload);
                toast.success(`Client ${formData.name} updated successfully!`);
            } else {
                response = await createClient(clientPayload);
                toast.success(`Client ${formData.name} created successfully!`);
            }
            
            // Navigate to the detail page or call success handler
            onSuccess(response.id); 

        } catch (error) {
            console.error("Client form submission error:", error);
            toast.error(`Failed to ${isEditMode ? 'update' : 'create'} client.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">
                {isEditMode ? 'Edit Client Details' : 'Add New Client'}
            </h2>
            
            {/* Name Input */}
            <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            
            {/* Contact Row */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number (e.g., 555-123-4567)"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Gender and Address */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                    </select>
                </div>
                <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        name="address"
                        placeholder="Full Address (Optional)"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Client')}
                </button>
            </div>
        </form>
    );
};

export default ClientForm;