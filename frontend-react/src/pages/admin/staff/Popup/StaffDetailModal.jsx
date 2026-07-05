import { User, X } from "lucide-react";


const StaffDetailModal = ({ isOpen, onClose, staff }) => {
    if (!isOpen || !staff) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-800">
                        {/* User Icon */}
                        <User className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 leading-tight">{staff.username}</h3>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">{staff.working_year_text || 'Staff Profile'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        {/* X Icon */}
                        <X className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-4 text-sm text-gray-800 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Phone Number</span>
                            <span className="font-semibold">{staff.phone_number || "-"}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">NRC Number</span>
                            <span className="font-semibold">{staff.nrc || "-"}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date of Birth</span>
                            <span className="font-semibold">{staff.date_of_birth || "-"}</span>
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Gender</span>
                            <span className="font-semibold">{staff.gender || "-"}</span>
                        </div>
                    </div>

                    <div>
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Joining Date</span>
                        <span className="font-semibold">{staff.join_date || "-"}</span>
                    </div>

                    <div>
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Home Address</span>
                        <p className="font-medium text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1 leading-relaxed">{staff.address || "-"}</p>
                    </div>

                    {/* Total Errors Section */}
                    <div className="pt-4 border-t border-gray-100">
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Errors</span>
                        <div className="flex flex-col gap-1.5">
                            <span className="font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded w-max text-xs">
                                {staff.total_errors?.count || "0 times"}
                            </span>
                            {staff.total_errors?.details && staff.total_errors.details.length > 0 && (
                                <ul className="text-xs font-medium text-gray-600 list-disc list-inside bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                                    {staff.total_errors.details.map((error, idx) => (
                                        <li key={idx}>{error}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-3 flex justify-end border-t border-gray-100">
                    <button onClick={onClose} className="px-5 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition text-xs shadow-sm">
                        Close Detail
                    </button>
                </div>
            </div>
        </div>
    );

}

export default StaffDetailModal
