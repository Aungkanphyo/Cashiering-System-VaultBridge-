

const StaffDetailModal = ({ isOpen, onClose, staff }) => {
    if (!isOpen || !staff) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white border border-black w-100 shadow-2xl relative rounded overflow-hidden">
                {/* Header */}
                <div className="bg-black text-white p-4 flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold tracking-wide">{staff.username}</h3>
                        <p className="text-xs text-gray-300 mt-0.5">{staff.working_year_text}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-gray-300 font-bold text-xl leading-none">✖</button>
                </div>

                {/* Body */}
                <div className="p-4 text-sm font-semibold text-gray-900 space-y-2.5">
                    <div className="grid grid-cols-[100px_10px_1fr]">
                        <span>Phone</span><span>:</span><span>{staff.phone_number}</span>
                    </div>
                    <div className="grid grid-cols-[100px_10px_1fr]">
                        <span>NRC No</span><span>:</span><span>{staff.nrc}</span>
                    </div>
                    <div className="grid grid-cols-[100px_10px_1fr]">
                        <span>Date of Birth</span><span>:</span><span>{staff.date_of_birth}</span>
                    </div>
                    <div className="grid grid-cols-[100px_10px_1fr]">
                        <span>Gender</span><span>:</span><span>{staff.gender}</span>
                    </div>
                    <div className="grid grid-cols-[100px_10px_1fr]">
                        <span>Join Date</span><span>:</span><span>{staff.join_date}</span>
                    </div>
                    <div className="grid grid-cols-[100px_10px_1fr] items-start">
                        <span>Address</span><span>:</span><span className="font-medium text-xs leading-relaxed">{staff.address}</span>
                    </div>

                    {/* Total Errors */}
                    <div className="grid grid-cols-[100px_10px_1fr] items-start pt-2 border-t border-gray-100">
                        <span>Total Errors</span><span>:</span>
                        <div>
                            <span>{staff.total_errors?.count || "0 times"}</span>
                            <ul className="text-xs font-medium text-gray-700 mt-1 space-y-1">
                                {staff.total_errors?.details?.map((error, idx) => (
                                    <li key={idx} className="list-none">{error}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default StaffDetailModal
