import { CalendarDays, Banknote, Wallet, QrCode, ChartColumn, TriangleAlert, ShieldCheck, RotateCcw, } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState({
    cards: {
      sales: 0,
      cash: 0,
      kpay: 0,
    },
    bestSeller: [],
    lowStock: []
  });

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const stats = [
    {
      title: "TODAY TOTAL SALES",
      amount: Number(dashboard.cards?.sales || 0),
      icon: Banknote,
      bg: "bg-emerald-100",
      color: "text-emerald-600",
    },
    {
      title: "TOTAL CASH RECEIVED",
      amount: Number(dashboard.cards?.cash || 0),
      icon: Wallet,
      bg: "bg-yellow-100",
      color: "text-yellow-600",
    },
    {
      title: "TOTAL KPAY RECEIVED",
      amount: Number(dashboard.cards?.kpay || 0),
      icon: QrCode,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
  ];

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/admin/dashboard", { params: { from, to } });
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


      {/* Cards Section*/}
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

          {(dashboard.bestSeller || []).map((product, index) => {
            const totalQty = dashboard.bestSeller.reduce((sum, item) => sum + Number(item.qty), 0);
            const percent = (product.qty / totalQty) * 100;

            return (
              <div key={product.product_name}>
                {product.product_name}
                {product.qty} Units
              </div>
            )
          })}
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
              <div className="flex flex-col items-center justify-center h-[350px]">
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