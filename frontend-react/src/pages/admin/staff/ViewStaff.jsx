import { useEffect, useState } from "react";
import api from "../../../api/axios";
import StaffDetailModal from "./Popup/StaffDetailModal";
import AddStaffModal from "./Popup/AddStaffModal";
import EditStaffModal from "./Popup/EditStaffModal";

const ViewStaff = () => {
    const [staffs, setStaffs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [loading, setLoading] = useState(false);

    const [refreshTrigger, setRefreshTrigger] = useState(false);

    // Modals Visibility States
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Auto refresh data every time you change the filter
    useEffect(() => {
        // Retrieve Staff Data from the Backend
        const fetchStaffs = async () => {
            try {
                setLoading(true);
                const response = await api.get('/staff', {
                    params: {
                        search: appliedSearch,
                        status: statusFilter
                    }
                });

                if (response.data.status === 'success') {
                    setStaffs(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching staff data:", error);
                alert("There was an error retrieving staff information.");
            } finally {
                setLoading(false);
            }
        };

        fetchStaffs();

    }, [statusFilter, appliedSearch, refreshTrigger])

    const handleTriggerRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setAppliedSearch(searchTerm);
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
        if (confirm("Are you sure you want to change this employee's status?")) {
            try {
                const response = await api.patch(`/staff/${id}/toggle-status`);
                if (response.data.status === 'success') {
                    setStaffs(staffs.map(staff =>
                        staff.user_id === id ? { ...staff, status: response.data.updated_status } : staff
                    ));

                    if (selectedStaff && selectedStaff.user_id === id) {
                        setSelectedStaff({ ...selectedStaff, status: response.data.updated_status });
                    }
                }
            } catch (error) {
                console.error("Error updating status:", error);
            }
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
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search by name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border border-gray-400 px-3 py-1.5 rounded w-64 focus:outline-none focus:border-emerald-600"
                    />
                    <button type="submit" className="bg-gray-200 px-4 py-1.5 rounded hover:bg-gray-300 font-medium">
                        Search
                    </button>
                </form>

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
                                    <td className="p-3">{staff.join_date}</td>
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
