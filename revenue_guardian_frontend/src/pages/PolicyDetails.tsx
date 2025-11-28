import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPolicy } from '../services/api';
import toast from 'react-hot-toast';

const PolicyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [policy, setPolicy] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                if (!id) return;
                const data = await getPolicy(id);
                setPolicy(data);
            } catch (error) {
                toast.error("Error fetching policy details");
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchPolicy();
    }, [id]);

    if (loading) return <div className="p-10">Loading...</div>;
    if (!policy) return <div className="p-10">Policy not found</div>;

    // Helper for Status Colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'LAPSED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="mb-6 text-blue-600 hover:underline flex items-center">
                &larr; Back
            </button>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Policy #{policy.policy_number}</h1>
                    <p className="text-gray-500 mt-1">
                        Carrier: <span className="font-semibold text-gray-700">{policy.carrier_details?.name}</span>
                    </p>
                </div>
                <div className="mt-4 md:mt-0">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold tracking-wide ${getStatusColor(policy.status)}`}>
                        {policy.status}
                    </span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Card 1: Key Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Contract Details</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Policy Type</span>
                            <span className="font-medium">{policy.policy_type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Premium (Annual)</span>
                            <span className="font-bold text-green-600">${policy.premium_amount}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Sum Insured</span>
                            <span className="font-medium">${policy.sum_insured}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Client Name</span>
                            <Link to={`/clients/${policy.client}`} className="text-blue-600 hover:underline font-medium">
                                {policy.client_details?.name} &rarr;
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Card 2: Important Dates */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Timeline</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Start Date</span>
                            <span className="font-medium">{policy.start_date}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">End Date</span>
                            <span className="font-medium">{policy.end_date}</span>
                        </div>
                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                            <p className="text-xs text-yellow-600 uppercase font-bold tracking-wider mb-1">Renewal Deadline</p>
                            <p className="text-xl font-bold text-yellow-800">{policy.renewal_date}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyDetails;