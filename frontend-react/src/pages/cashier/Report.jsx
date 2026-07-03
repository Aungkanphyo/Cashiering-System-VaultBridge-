import { Clock, Info, BarChart3 } from "lucide-react";
import { useState } from "react";

export default function Report() {
    const expectedCash = 96780;
    const [actualCash, setActualCash] = useState("");

    const discrepancy = actualCash === "" ? null : Number(actualCash) - expectedCash;

    const isInvalid = actualCash.trim() === "" || Number.isNaN(Number(actualCash));

    return (
        <div className="min-h-screen">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Left Panel */}
                <div className="rounded-3xl border bg-white p-7 shadow-sm">
                    <div className="flex items-center justify-center gap-4">
                        <BarChart3 className="text-green-500" />
                        <h2 className="text-2xl font-bold text-slate-800">Close Session Report</h2>
                    </div>

                    <hr className="my-8" />

                    {/* Row 1 */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block font-semibold uppercase tracking-wide text-slate-600">Session ID</label>
                            <input value="#103" readOnly
                                className="h-14 w-full rounded-xl border bg-green-50 px-4 text-md outline-none" />
                        </div>

                        <div>
                            <label className="mb-2 block font-semibold uppercase tracking-wide text-slate-600"> Opening Time</label>
                            <input value="2026-06-07 08:00:00" readOnly
                                className="h-14 w-full rounded-xl border bg-green-50 px-4 text-md outline-none" />
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block font-semibold uppercase tracking-wide text-slate-600">Expected Closing Cash</label>
                            <div className="relative">
                                <input value={expectedCash.toLocaleString()} readOnly
                                    className="h-14 w-full rounded-xl border bg-green-50 px-4 text-md font-bold text-green-600 outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block font-semibold uppercase tracking-wide text-slate-600">Actual Closing Cash </label>
                            <div className="relative">
                                <input type="number" placeholder="e.g. 96780" value={actualCash}
                                    onChange={(e) => setActualCash(e.target.value)}
                                    className="h-14 w-full rounded-xl border px-4 text-md outline-none focus:border-green-600" />
                            </div>
                        </div>
                    </div>

                    {/* Discrepancy */}
                    {discrepancy !== null && (
                        <div className={`mt-8 rounded-2xl border p-3 ${discrepancy >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                            <div className="flex gap-4">
                                <Info className={`mt-1 ${discrepancy >= 0 ? "text-green-500" : "text-red-500"}`} />

                                <div>
                                    <h3 className="text-xl font-bold text-slate-700">Discrepancy </h3>

                                    <p className={`mt-2 text-xl font-bold ${discrepancy >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {discrepancy > 0 ? "+" : ""} {discrepancy.toLocaleString()} MMK
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Report Status */}
                    {discrepancy !== null && (
                        <div className={`mt-6 rounded-2xl border p-5 ${discrepancy >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                            <h3 className={`text-lg font-bold ${discrepancy >= 0 ? "text-green-700" : "text-red-700"}`} >
                                {discrepancy === 0 ? "Cash Balanced" : discrepancy > 0 ? "Extra Cash" : "Cash Shortage"}
                            </h3>

                            <p className="mt-2 text-sm text-slate-600">
                                {discrepancy === 0 ? "Cash is balanced." : discrepancy > 0 ? "There is extra cash in the drawer." : "The cash drawer is short."}
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button disabled={isInvalid}
                        className={`mt-10 h-16 w-full rounded-2xl text-xl font-bold text-white transition 
                            ${isInvalid ? "cursor-not-allowed bg-gray-300" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                        Submit Session Report
                    </button>
                </div>

                {/* Right Panel */}
                <div className="rounded-3xl border bg-white p-8 shadow-sm">
                    <div className="flex items-center justify-center gap-4">
                        <Clock className="text-green-500" />
                        <h2 className="text-2xl font-bold text-slate-800">Session Summary</h2>
                    </div>

                    <hr className="my-6" />

                    <div className="space-y-5">
                        <SummaryCard title="Completed Total" value={`${expectedCash.toLocaleString()} MMK`} />
                        <SummaryCard title="Cash Total" value="46,780 MMK" bg="bg-yellow-100" color="text-yellow-800" />
                        <SummaryCard title="KPay Total" value="20,000 MMK" bg="bg-blue-100" color="text-blue-800" />
                        <SummaryCard title="Voided" value="0 vouchers" bg="bg-red-100" color="text-red-800" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, bg = "bg-green-100", color = "text-green-800" }) {
    return (
        <div className={`flex items-center justify-between rounded-2xl ${bg} px-5 py-5`}>
            <span className={`font-semibold ${color}`}>{title}</span>
            <span className={`font-semibold ${color}`}>{value}</span>
        </div>
    );
}