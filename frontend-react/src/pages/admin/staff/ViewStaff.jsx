import { useEffect, useState } from "react";
import api from "../../../api/axios";
import StaffDetailModal from "./Popup/StaffDetailModal";
import AddStaffModal from "./Popup/AddStaffModal";
import EditStaffModal from "./Popup/EditStaffModal";
import toast from 'react-hot-toast';
import { AlertTriangle } from "lucide-react";

const ViewStaff = () => {
    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === "-") return "-";
        if (typeof dateStr === 'string' && dateStr.includes("T")) {
            return dateStr.split("T")[0];
        }
        return dateStr;
    }

    const [staffs, setStaffs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [loading, setLoading] = useState(false);

    const [refreshTrigger, setRefreshTrigger] = useState(false);

    // Modals Visibility States
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [toggleStaffId, setToggleStaffId] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm])

    // Auto refresh data every time you change the filter
    useEffect(() => {
        // Retrieve Staff Data from the Backend
        const fetchStaffs = async () => {
            try {
                setLoading(true);
                const response = await api.get('/staff', {
                    params: {
                        search: debouncedSearchTerm,
                        status: statusFilter
                    }
                });

                if (response.data.status === 'success') {
                    setStaffs(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching staff data:", error);
                toast.error("There was an error retrieving staff information.");
                // alert("There was an error retrieving staff information.");
            } finally {
                setLoading(false);
            }
        };

        fetchStaffs();

    }, [statusFilter, debouncedSearchTerm, refreshTrigger])

    const handleTriggerRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    }

    const handleOpenDetail = async (id) => {
        try {
            const response = await api.get(`/staff/${id}`);
            if (response.data.status === 'success') {
                setSelectedStaff(response.data.data);
                setIsDetailOpen(true);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleOpenEdit = (staff) => {
        setSelectedStaff(staff);
        setIsEditOpen(true);
    }

    const handleToggleStatus = async (id) => {
        setToggleStaffId(id);
        setIsConfirmOpen(true);
    }

    const executeToggleStatus = async () => {
        try {
            const response = await api.patch(`/staff/${toggleStaffId}/toggle-status`);
            if (response.data.status === 'success') {
                toast.success(response.data.message || "Status updated successfully!");
                handleTriggerRefresh();

                if (selectedStaff && selectedStaff.user_id === toggleStaffId) {
                    setSelectedStaff({ ...selectedStaff, status: response.data.updated_status });
                }
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("There was an error updating the staff status.");
        } finally {
            setIsConfirmOpen(false);
            setToggleStaffId(null);
        }
    }

    return (
        <div className="p-6 bg-white min-h-screen relative">
            {/* Top Header Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex justify-between items-center mb-4 gap-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-400 px-3 py-1.5 rounded w-72 focus:outline-none focus:border-emerald-600"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-800 px-4 py-1.5 rounded bg-white font-medium focus:outline-none"
                    >
                        <option value="All">All</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>

                    <button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 text-white font-medium px-4 py-1.5 rounded flex items-center gap-1 hover:bg-emerald-700 transition">
                        <span className="text-lg font-bold">+</span> Add new staff
                    </button>
                </div>
            </div>

            {/* Staff Table */}
            <div className="border border-gray-300 rounded overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-300 bg-gray-50 text-gray-700 font-semibold text-sm">
                            <th className="p-3 text-center w-16">No</th>
                            <th className="p-3">Name</th>
                            <th className="p-3">Gender</th>
                            <th className="p-3">Join Date</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-center w-72">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center p-6 text-gray-500">Loading staff data...</td>
                            </tr>
                        ) : staffs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center p-6 text-gray-500">No staff list</td>
                            </tr>
                        ) : (
                            staffs.map((staff, index) => (
                                <tr key={staff.user_id} className="border-b border-gray-200 hover:bg-gray-50 text-gray-800 font-medium text-sm">
                                    <td className="p-3 text-center font-bold">{index + 1}.</td>
                                    <td className="p-3 font-bold">{staff.username}</td>
                                    <td className="p-3">{staff.gender}</td>
                                    <td className="p-3">{formatDate(staff.join_date)}</td>
                                    <td className="p-3">
                                        <span className={staff.status === 'Active' ? 'text-emerald-500 font-semibold' : 'text-red-500 font-semibold'}>
                                            {staff.status}
                                        </span>
                                    </td>
                                    <td className="p-3 flex justify-center gap-2">
                                        <button
                                            onClick={() => handleOpenDetail(staff.user_id)}
                                            className="bg-amber-500 text-white font-semibold px-5 py-1 rounded w-20 shadow-sm hover:bg-amber-600 transition"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleOpenEdit(staff)}
                                            className="bg-emerald-500 text-white font-semibold px-5 py-1 rounded w-20 shadow-sm hover:bg-emerald-600 transition">
                                            Edit
                                        </button>

                                        <button onClick={() => handleToggleStatus(staff.user_id)} className={`text-white font-semibold px-3 py-1 rounded w-24 transition ${staff.status === 'Active' ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-500 hover:bg-cyan-600'}`}>
                                            {staff.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Confirm box */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsConfirmOpen(false)}
                    ></div>

                    {/* Modal Box */}
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative z-10 transform transition-all animate-in fade-in zoom-in-95 duration-200 mx-4">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0 text-amber-500">
                                <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Change Status?</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Are you sure you want to change this employee's status?
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsConfirmOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeToggleStatus}
                                className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-sm transition text-sm"
                            >
                                Yes, Change It
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <StaffDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                staff={selectedStaff}
            />
            <AddStaffModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSuccess={handleTriggerRefresh}
            />

            {isEditOpen && selectedStaff && (
                <EditStaffModal
                    key={selectedStaff?.user_id}
                    onClose={() => setIsEditOpen(false)}
                    staff={selectedStaff}
                    onSuccess={handleTriggerRefresh}
                />
            )}
        </div>
    )
}

export default ViewStaff
