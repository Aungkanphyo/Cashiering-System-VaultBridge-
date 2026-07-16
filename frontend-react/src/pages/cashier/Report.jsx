import { Clock, Info, BarChart3, NotepadText } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";

export default function Report() {
    const navigate = useNavigate();
    const logout = useAuthStore(
        (state) => state.logout
    );

    const [session, setSession] = useState(null);
    const [actualCash, setActualCash] = useState("");
    const [loading, setLoading] = useState(true);
    const [reportText, setReportText] = useState("");

    // Load current session
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await api.get("/cash-register/session");
                setSession(response.data);
            } catch (error) {
                console.error("Session Error:", error.response?.data);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    const formatDateTime = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleString("sv-SE", { timeZone: "Asia/Yangon", });
    };
    const expectedCash = Number(session?.expected_closing_cash ?? 0);
    const discrepancy = actualCash === "" ? null : Number(actualCash) - expectedCash;
    const isInvalid = actualCash.trim() === "" || Number.isNaN(Number(actualCash));
    const getReportText = () => {
        if (discrepancy === null) {
            return "";
        }

        if (discrepancy === 0) {
            return "Cash balanced";
        }

        if (discrepancy > 0) {
            return "Extra cash";
        }

        return "Cash shortage";
    };

    // Submit report
    const submitReport = async () => {
        try {
            await api.post("/cash-register/close", { actual_closing_cash: Number(actualCash), report_text: getReportText() });
            await api.post("/logout");
            logout();
            toast.success("Session closed successfully");
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout error:", error.response?.data);
            toast.error("Logout failed");
        }
    };

    return (
        <div className="min-h-screen">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2">
                {/* LEFT PANEL */}
                <div className="rounded-3xl border bg-white p-7 shadow-sm">
                    <div className="flex items-center justify-center gap-4">
                        <BarChart3 className="text-green-500" />
                        <h2 className="text-2xl font-bold text-slate-800">Close Session Report</h2>
                    </div>

                    <hr className="my-8" />

                    {/* Session Info */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block font-semibold uppercase text-slate-600">Session ID</label>
                            <input value={session ? `${session.session_id}` : ""} readOnly className="h-14 w-full rounded-xl border bg-green-50 px-4" />
                        </div>

                        <div>
                            <label className="mb-2 block font-semibold uppercase text-slate-600">Opening Time</label>
                            <input value={formatDateTime(session?.opening_time)} readOnly className="h-14 w-full rounded-xl border bg-green-50 px-4" />
                        </div>
                    </div>

                    {/* Cash */}
                    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block font-semibold uppercase text-slate-600">Expected Closing Amount</label>
                            <input value={expectedCash.toLocaleString()} readOnly className="h-14 w-full rounded-xl border bg-green-50 px-4 font-bold text-green-600" />
                        </div>

                        <div>
                            <label className="mb-2 block font-semibold uppercase text-slate-600">Actual Closing Amount</label>
                            <input type="number" placeholder="Enter cash amount" value={actualCash}
                                onChange={e => setActualCash(e.target.value)} className="h-14 w-full rounded-xl border px-4 focus:border-green-500" />
                        </div>
                    </div>


                    {/* Discrepancy */}
                    {discrepancy !== null && (
                        <div className={`mt-8 rounded-2xl border p-4 ${discrepancy >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                            <div className="flex gap-4">
                                <Info className={discrepancy >= 0 ? "text-green-500" : "text-red-500"} />
                                <div>
                                    <h3 className="text-xl font-bold">Discrepancy</h3>
                                    <p className={discrepancy >= 0 ? "mt-2 text-green-600 text-md font-bold" : "mt-2 text-red-600 text-md font-bold"}>
                                        {discrepancy > 0 ? "+" : ""}
                                        {discrepancy.toLocaleString()}{" "}MMK
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                    }

                    {/* Report Text */}
                    {discrepancy !== null && (
                        <div className={`mt-8 rounded-2xl border p-4 ${discrepancy >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                            <div className="flex gap-4">
                                <NotepadText className={discrepancy >= 0 ? "text-green-500" : "text-red-500"} />
                                <div>
                                    <h3 className="text-xl font-bold text-slate-700">Report Text</h3>
                                    <p className={`mt-2 text-md font-bold ${discrepancy >= 0 ? "text-green-600" : "text-red-600"}`}>{getReportText()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button disabled={isInvalid} onClick={submitReport}
                        className={`mt-10 h-16 w-full rounded-2xl text-xl font-bold text-white ${isInvalid ? "bg-gray-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                        Submit Session Report
                    </button>
                </div>


                {/* RIGHT PANEL */}
                <div className="rounded-3xl border bg-white p-8 shadow-sm">
                    <div className="flex items-center justify-center gap-4">
                        <Clock className="text-green-500" />
                        <h2 className="text-2xl font-bold text-slate-800">Session Summary</h2>
                    </div>

                    <hr className="my-6" />

                    <SummaryCard title="TOTAL SALES" value={`${Number(session?.summary?.total ?? 0).toLocaleString()} MMK`} />


                    {Object.entries(session?.summary?.payments || {}).filter(([, amount]) => Number(amount) > 0).map(([name, amount]) => {
                        const isCash = name.toLowerCase() === "cash";

                        return (
                            <SummaryCard key={name} title={name.toUpperCase()} value={`${Number(amount).toLocaleString()} MMK`}
                                         bg={isCash ? "bg-yellow-100" : "bg-blue-100"} text={isCash ? "text-yellow-700" : "text-blue-700"} />
                        );
                    })}

                    <SummaryCard title="VOIDED VOUCHERS" value={`${Number(session?.summary?.voided ?? 0).toLocaleString()}`} bg="bg-red-100" text="text-red-700" />
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, bg = "bg-green-100", text = "text-green-700", }) {
    return (
        <div className={`flex justify-between rounded-2xl ${bg} px-5 py-5 mb-5`}>
            <span className={`font-semibold ${text}`}>{title}</span>
            <span className={`font-bold ${text}`}>{value}</span>
        </div>
    );
}