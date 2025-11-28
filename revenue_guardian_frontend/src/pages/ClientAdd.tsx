import React from 'react';
import { useNavigate } from 'react-router-dom';
import ClientForm from '../components/ClientForm';
import { ArrowLeft } from 'lucide-react';

const ClientAdd = () => {
    const navigate = useNavigate();

    const handleSuccess = (clientId: number) => {
        // Redirect to the newly created client's detail page
        navigate(`/clients/${clientId}`);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <button 
                onClick={() => navigate('/clients')}
                className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Clients List
            </button>
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
                <ClientForm onSuccess={handleSuccess} />
            </div>
        </div>
    );
};

export default ClientAdd;