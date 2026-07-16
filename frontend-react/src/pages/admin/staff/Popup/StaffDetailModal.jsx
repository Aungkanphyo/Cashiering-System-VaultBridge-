import { User, X } from "lucide-react";


const StaffDetailModal = ({ isOpen, onClose, staff }) => {
    if (!isOpen || !staff) return null;

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === "-") return "-";
        if (typeof dateStr === 'string' && dateStr.includes("T")) {
            return dateStr.split("T")[0];
        }
        return dateStr;
    }

    return (
        <div className="fixed inset-0 bg-slate-900/30 bg-white/2 backdrop-blur-[7px] flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-700 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <User className="text-white" size={28} />
                        <div>
                            <h3 className="font-bold text-white text-lg leading-tight">{staff.username}</h3>
                            <p className="text-xs text-white/70 font-medium mt-0.5">
                                Work Experience: {staff.working_duration || 'Staff Profile'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5 cursor-pointer" />
                    </button>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4 text-sm text-slate-800 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Phone Number</span>
                            <span className="font-semibold">{staff.phone_number || "-"}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">NRC Number</span>
                            <span className="font-semibold">{staff.nrc || "-"}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Date of Birth</span>
                            <span className="font-semibold">{formatDate(staff.date_of_birth) || "-"}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Gender</span>
                            <span className="font-semibold">{staff.gender || "-"}</span>
                        </div>
                    </div>

                    <div>
                        <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Joining Date</span>
                        <div className="flex flex-col gap-1">
                            <span className="font-semibold text-slate-800">{formatDate(staff.join_date) || "-"}</span>

                            {staff.working_duration && (
                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded w-max mt-0.5">
                                    ({staff.working_duration} of experience)
                                </span>
                            )}
                        </div>
                    </div>

                    <div>
                        <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Home Address</span>
                        <p className="font-medium text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1 leading-relaxed">{staff.address || "-"}</p>
                    </div>

                    {/* Total Errors Section */}
                    <div className="pt-4 border-t border-slate-100">
                        <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Errors</span>
                        <div className="flex flex-col gap-1.5">
                            <span className="font-semibold text-rose-600 bg-rose-100 px-2 py-0.5 rounded w-max text-xs">
                                {staff.total_errors?.count || "0 times"}
                            </span>
                            {staff.total_errors?.details && staff.total_errors.details.length > 0 && (
                                <ul className="text-xs font-medium list-inside bg-rose-50 p-3 rounded-lg border border-slate-200 space-y-1">
                                    {staff.total_errors.details.map((error, idx) => (
                                        <li key={idx}>{error}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-5 pt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-gray-500 bg-slate-100 rounded-lg cursor-pointer"
                    >
                        Close Detail
                    </button>
                </div>
            </div>
        </div>
    );

}

export default StaffDetailModal