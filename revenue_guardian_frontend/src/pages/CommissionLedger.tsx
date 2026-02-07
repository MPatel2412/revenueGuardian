import { useState, useEffect } from 'react';
import { getCommissionSummary } from '../services/api';
import { DollarSign, TrendingUp, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface MonthlyData {
    month: string;
    total_commission: number;
    total_premium: number;
    policy_count: number;
}

const CommissionLedger = () => {
    const [data, setData] = useState<MonthlyData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getCommissionSummary();
                setData(result);
            } catch (error) {
                toast.error("Failed to load commission data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Calculate Grand Totals
    const totalCommission = data.reduce((acc, curr) => acc + (curr.total_commission || 0), 0);
    const totalPremium = data.reduce((acc, curr) => acc + (curr.total_premium || 0), 0);

    if (loading) return <div className="p-10 text-center">Loading Financials...</div>;

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <DollarSign className="h-8 w-8 text-green-600 mr-2" />
                Commission Ledger
            </h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Commission (All Time)</p>
                            <h2 className="text-3xl font-bold text-gray-800 mt-1">
                                ${totalCommission.toLocaleString()}
                            </h2>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full text-green-600">
                            <DollarSign className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Premium Volume</p>
                            <h2 className="text-3xl font-bold text-gray-800 mt-1">
                                ${totalPremium.toLocaleString()}
                            </h2>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Policies Sold</p>
                            <h2 className="text-3xl font-bold text-gray-800 mt-1">
                                {data.reduce((acc, curr) => acc + curr.policy_count, 0)}
                            </h2>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                            <FileText className="h-6 w-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Breakdown Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">Monthly Breakdown</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policies</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium Collected</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase text-green-700">Commission Earned</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No commission data found. Add some policies with start dates!
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => {
                                const date = new Date(row.month);
                                const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                                
                                return (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            {monthName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {row.policy_count}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                            ${(row.total_premium || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                                            ${(row.total_commission || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CommissionLedger;