import { CalendarDays, Banknote, Wallet, QrCode, ChartColumn, TriangleAlert, ShieldCheck, RotateCcw, } from "lucide-react";

const stats = [
  {
    title: "TODAY TOTAL SALES",
    amount: 66780,
    icon: Banknote,
    bg: "bg-emerald-100",
    color: "text-emerald-600",
  },
  {
    title: "TOTAL CASH RECEIVED",
    amount: 46780,
    icon: Wallet,
    bg: "bg-blue-100",
    color: "text-blue-600",
  },
  {
    title: "TOTAL KPAY RECEIVED",
    amount: 20000,
    icon: QrCode,
    bg: "bg-purple-100",
    color: "text-purple-600",
  },
  {
    title: "TOTAL WAVEPAY RECEIVED",
    amount: 0,
    icon: QrCode,
    bg: "bg-purple-100",
    color: "text-purple-600",
  },
];

const products = [
  {
    name: "Premier Coffee Mix 30s",
    qty: 20,
    stock : 8,
    color: "bg-orange-500",
  },
  {
    name: "Nestlé Milo Powder",
    qty: 15,
    stock : 12,
    color: "bg-emerald-500",
  },
  {
    name: "Pringles Original",
    qty: 10,
    stock : 8,
    color: "bg-cyan-500",
  },
  {
    name: "Tissue Soft Roll (Pack of 10)",
    qty: 5,
    stock : 5,
    color: "bg-teal-500",
  },

  {
    name: "Oreo Chocolate Biscuit",
    qty: 8,
    stock : 3,
    color: "bg-amber-500",
  },
];

const sortedProducts = [...products].sort((a, b) => b.qty - a.qty);
const totalQty = sortedProducts.reduce((sum, item) => sum + item.qty, 0);
const lowStockProducts = products.filter((item) => item.stock <= 5);

export default function Dashboard() {
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
            <input type="date" className="border rounded-lg px-3 py-2" />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold">TO:</label>
            <input type="date" className="border rounded-lg px-3 py-2" />
          </div>

          <button className="flex items-center gap-2 rounded-lg bg-red-600 text-gray-50 hover:bg-red-300 px-4 py-2">
            <RotateCcw size={18} /> Reset Filter
          </button>
        </div>
      </div>

      {/* Cards Section*/}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
        {stats
          .filter((item) => item.amount > 0)
          .map((item) => {
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

          {sortedProducts.map((product, index) => {
            const percent = totalQty > 0 ? (product.qty / totalQty) * 100 : 0;

            return (
              <div key={product.name} className="mb-7">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-xs font-semibold">{index + 1}</div>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <span className="font-semibold text-green-500">{product.qty} Units ({percent.toFixed(1)}%)</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                  <div className={`${product.color} h-4 rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Low Stock Warning Section */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <TriangleAlert className="text-red-500" size={28} />
            <h2 className="font-bold text-xl">Low Stock Warning</h2>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="space-y-4">
              {lowStockProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4"
                >
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {product.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      Remaining Stock
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-600">
                      {product.stock} Left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[350px]">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <TriangleAlert className="text-green-600" size={36} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-700">
                Great!
              </h3>

              <p className="text-slate-500">
                All products are fully stocked.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}