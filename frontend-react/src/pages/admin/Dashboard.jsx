import { CalendarDays, Banknote, Wallet, QrCode, ChartColumn, TriangleAlert, RotateCcw, } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Dashboard() {
    const [dashboard, setDashboard] = useState({
        totalSales: 0,
        payments: [],
        bestSeller: [],
        lowStock: []
    });

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const stats = [
        {
            title: "TODAY TOTAL SALES",
            amount: Number(dashboard.totalSales || 0),
            icon: Banknote,
            bg: "bg-emerald-100",
            color: "text-emerald-600",
        },
        ...(dashboard.payments || []).map((pay) => {
            const isCash = pay.name.toLowerCase().includes("cash");

            return {
                title: `TOTAL ${pay.name.toUpperCase()} RECEIVED`,
                amount: Number(pay.amount || 0),
                icon: isCash ? Wallet : QrCode,
                bg: isCash ? "bg-yellow-100" : "bg-blue-100",
                color: isCash ? "text-yellow-600" : "text-blue-600",
            };
        })
    ];

    const fetchDashboard = async () => {
        try {
            const res = await api.get("/admin/dashboard", { params: { from, to } });
            setDashboard(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, [from, to]);

    const totalQty = (dashboard.bestSeller || []).reduce((sum, item) => sum + Number(item.qty), 0);

    return (
        <div className="min-h-screen">
            {/* Header Section*/}
            <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <CalendarDays className="w-6 h-6 text-slate-600" />
                    </div>

                    <div>
                        <h1 className="font-bold text-xl">Sales Analytics (Date Filter)</h1>
                        <p className="text-sm text-slate-500">Filter sales reports based on the selected date range.</p>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold">FROM:</label>
                        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded-lg px-3 py-2 cursor-text focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15" />
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold">TO:</label>
                        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded-lg px-3 py-2 cursor-text focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15" />
                    </div>

                    <button
                        onClick={() => { setFrom(""); setTo(""); }}
                        className="flex items-center gap-2 rounded-lg bg-red-600 text-white px-4 py-2"
                    >
                        <RotateCcw size={18} />
                        Reset Filter
                    </button>
                </div>
            </div>


            {/* Dynamic Cards Section*/}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
                {stats.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div key={item.title} className="bg-white rounded-2xl border shadow-sm p-6 flex justify-between items-center">
                            <div>
                                <p className="text-lg uppercase tracking-wider font-bold">{item.title}</p>
                                <h2 className="text-sm text-slate-500 font-semibold mt-2">{item.amount.toLocaleString()} MMK</h2>
                            </div>

                            <div className={`w-14 h-14 rounded-xl ${item.bg} flex items-center justify-center`}>
                                <Icon className={item.color} size={24} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Section*/}
            <div className="grid xl:grid-cols-3 gap-6 mt-8">
                {/* Best Sellers Items Section */}
                <div className="xl:col-span-2 bg-white rounded-2xl border shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <ChartColumn className="text-emerald-500" size={28} />
                        <h2 className="font-bold text-xl">Best Seller Items</h2>
                    </div>

                    <div className="space-y-5">
                        {(() => {
                            // Calculate total quantity once outside the loop
                            const totalQty = (dashboard.bestSeller || []).reduce((sum, item) => sum + Number(item.qty), 0);

                            const barColors = [
                                "bg-cyan-500",
                                "bg-orange-500",
                                "bg-rose-500",
                                "bg-emerald-500",
                                "bg-purple-500"
                            ];

                            const badgeColors = [
                                "bg-cyan-100 text-cyan-600",
                                "bg-orange-100 text-orange-600",
                                "bg-rose-100 text-rose-600",
                                "bg-emerald-100 text-emerald-600",
                                "bg-purple-100 text-purple-600"
                            ];

                            if (totalQty === 0) {
                                return (
                                    <div className="text-center py-10 text-slate-400">
                                        No sales data available for this period.
                                    </div>
                                );
                            }

                            return (dashboard.bestSeller || []).map((product, index) => {
                                const percent = totalQty > 0 ? (Number(product.qty) / totalQty) * 100 : 0;
                                const currentBarColor = barColors[index] || "bg-slate-500";
                                const currentBadgeColor = badgeColors[index] || "bg-slate-100 text-slate-600";

                                return (
                                    <div key={product.product_name || index} className="space-y-2">
                                        {/* Product Name & Info Row */}
                                        <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${currentBadgeColor}`}>
                                                    {index + 1}
                                                </span>
                                                <span>{product.product_name}</span>
                                            </div>
                                            <div className="text-slate-500 text-sm">
                                                <span className="text-slate-800 font-bold">{product.qty} Units</span> ({percent.toFixed(1)}%)
                                            </div>
                                        </div>

                                        {/* Progress Bar Wrapper */}
                                        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                                            {/* Dynamic Progress Indicator with Unique Color */}
                                            <div className={`h-full rounded-full transition-all duration-500 ease-out ${currentBarColor}`} style={{ width: `${percent}%` }} />
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                {/* Low Stock Warning Section */}
                <div className="bg-white rounded-2xl border shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <TriangleAlert className="text-red-500" size={28} />
                        <h2 className="font-bold text-xl">Low Stock Warning</h2>
                    </div>

                    {(dashboard.lowStock || []).length > 0 ?
                        (<div className="space-y-4">
                            {(dashboard.lowStock || []).map((product, index) => (
                                <div key={index} className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4">
                                    <div>
                                        <h3 className="font-semibold text-slate-800">{product.product_name}</h3>
                                        <p className="text-sm text-slate-500">Remaining Stock</p>
                                    </div>

                                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-600">
                                        {product.stock_quantity} Left
                                    </span>
                                </div>
                            ))}
                        </div>) :
                        (
                            <div className="flex flex-col items-center justify-center h-87.5">
                                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                                    <TriangleAlert className="text-green-600" size={36} />
                                </div>

                                <h3 className="mt-5 text-lg font-semibold text-slate-700">Great!</h3>
                                <p className="text-slate-500">All products are fully stocked.</p>
                            </div>
                        )}
                </div>
            </div>
        </div>
    )
};