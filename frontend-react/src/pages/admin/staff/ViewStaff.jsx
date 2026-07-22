import { useEffect, useState, useMemo } from "react";
import {
    Plus,
    Loader2,
    Search,
    Users,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import api from "../../../api/axios";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Pagination from "../../../components/common/Pagination";
import StaffDetailModal from "./Popup/StaffDetailModal";
import AddStaffModal from "./Popup/AddStaffModal";
import EditStaffModal from "./Popup/EditStaffModal";
import toast from 'react-hot-toast';

const ViewStaff = () => {
    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === "-") return "-";
        if (typeof dateStr === 'string' && dateStr.includes("T")) {
            return dateStr.split("T")[0];
        }
        return dateStr;
    }

    const [staffs, setStaffs] = useState([]);
    const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); // All | Active | Inactive
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pageSize, setPageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    const [refreshTrigger, setRefreshTrigger] = useState(false);

    // Modals Visibility States
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [confirmState, setConfirmState] = useState(null); // { id, name, nextStatus }

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm])

    // Auto refresh data every time the search term changes
    useEffect(() => {
        const fetchStaffs = async () => {
            try {
                setLoading(true);
                const response = await api.get('/staff', {
                    params: {
                        search: debouncedSearchTerm,
                    }
                });

                if (response.data.status === 'success') {
                    setStaffs(response.data.data);
                    setSummary(response.data.summary);
                }
            } catch (error) {
                console.error("Error fetching staff data:", error);
                toast.error("There was an error retrieving staff information.");
            } finally {
                setLoading(false);
            }
        };

        fetchStaffs();

    }, [debouncedSearchTerm, refreshTrigger])

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

    const askConfirm = (staff) => {
        setConfirmState({
            id: staff.user_id,
            name: staff.username,
            nextStatus: staff.status?.toLowerCase() === 'active' ? 'Inactive' : 'Active',
        });
    }

    const handleConfirmToggle = async () => {
        if (!confirmState) return;
        const { id } = confirmState;
        try {
            const response = await api.patch(`/staff/${id}/toggle-status`);
            if (response.data.status === 'success') {
                handleTriggerRefresh();
                // setStaffs(staffs.map(staff =>
                //     staff.user_id === id ? { ...staff, status: response.data.updated_status } : staff
                // ));

                if (selectedStaff && selectedStaff.user_id === id) {
                    setSelectedStaff({ ...selectedStaff, status: response.data.updated_status });
                }
                toast.success(
                    response.data.updated_status === 'Active'
                        ? 'Staff member activated'
                        : 'Staff member deactivated'
                );
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("There was an error updating this employee's status.");
        } finally {
            setConfirmState(null);
        }
    }

    // Filtering happens client-side so the stat cards always reflect
    // accurate totals regardless of which filter card is selected.
    const filteredStaffs = useMemo(() => {
        if (statusFilter === 'All') return staffs;
        return staffs.filter((s) => s.status === statusFilter);
    }, [staffs, statusFilter]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(1);
    }, [statusFilter, debouncedSearchTerm, pageSize]);

    const totalItems = filteredStaffs.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    const paginatedStaffs = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredStaffs.slice(start, start + pageSize);
    }, [filteredStaffs, currentPage, pageSize]);

    const summaryStats = useMemo(() => {

        return [
            {
                title: "TOTAL STAFF",
                value: summary.total,
                filterKey: "All",
                icon: Users,
                colorClass: "text-slate-500 bg-slate-50 border-slate-200",
                activeClass: "ring-2 ring-emerald-500 border-emerald-400 bg-slate-50/50",
            },
            {
                title: "ACTIVE STAFF",
                value: summary.active,
                filterKey: "Active",
                icon: CheckCircle2,
                colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
                activeClass: "ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/50",
            },
            {
                title: "INACTIVE STAFF",
                value: summary.inactive,
                filterKey: "Inactive",
                icon: XCircle,
                colorClass: "text-rose-600 bg-rose-50 border-rose-100",
                activeClass: "ring-2 ring-emerald-500 border-emerald-400 bg-rose-50/50",
            },
        ];
    }, [summary]);

    return (
        <div className="min-h-screen">
            {/* Interactive Stat Cards Section */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {summaryStats.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = statusFilter === item.filterKey;

                    return (
                        <button
                            key={item.title}
                            onClick={() => setStatusFilter(item.filterKey)}
                            className={`w-full text-left bg-white rounded-2xl border p-5 flex items-center justify-between gap-3 transition-all duration-200 shadow-sm group hover:shadow-md cursor-pointer ${isActive ? item.activeClass : "hover:border-slate-300"
                                }`}
                        >
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wider font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
                                    {item.title}
                                </p>
                                <h2 className="text-2xl text-slate-800 font-bold">
                                    {item.value}
                                </h2>
                            </div>
                            <div className={`p-3 rounded-xl border ${item.colorClass} transition-transform group-hover:scale-105`}>
                                <IconComponent className="w-5 h-5" />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mt-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 pb-4 w-full">

                    {/* Left Side: Search Bar */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-84">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by staff name ..."
                                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-transparent cursor-text focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 transition"
                            />
                        </div>
                    </div>

                    {/* Right Side: Entries Dropdown and Add New Staff Button */}
                    <div className="flex items-center gap-4 w-full sm:w-auto sm:ml-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
                            <span>Show</span>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="border rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15 cursor-pointer"
                            >
                                {[5, 10, 15, 20, 25].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                            <span>entries</span>
                        </div>

                        <button
                            onClick={() => setIsAddOpen(true)}
                            className="flex items-center gap-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 text-sm font-semibold shadow-sm whitespace-nowrap cursor-pointer"
                        >
                            <Plus size={18} /> Add New Staff
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-emerald-700 border-b border-emerald-800 text-white text-xs font-semibold uppercase">
                                <th className="p-4 w-50">Name</th>
                                <th className="p-4 w-50">Gender</th>
                                <th className="p-4 w-50">Join Date</th>
                                <th className="p-4 w-50">Status</th>
                                <th className="p-4 w-50 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400">
                                        <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                                        Loading staff data...
                                    </td>
                                </tr>
                            )}
                            {!loading && filteredStaffs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400">
                                        No staff found under this view.
                                    </td>
                                </tr>
                            )}
                            {!loading &&
                                paginatedStaffs.map((staff) => {
                                    const isInactive = staff.status === 'Inactive';
                                    return (
                                        <tr
                                            key={staff.user_id}
                                            className={`hover:bg-slate-50 transition`}
                                        >
                                            <td className="p-4 font-semibold text-slate-800">
                                                {staff.username}
                                            </td>
                                            <td className="p-4 font-semibold text-slate-800">{staff.gender}</td>
                                            <td className="p-4 font-semibold text-slate-800">{formatDate(staff.join_date)}</td>
                                            <td className="p-4">
                                                <span
                                                    className={`inline-block w-17.5 text-center py-1 rounded-lg text-xs font-semibold ${isInactive
                                                        ? "bg-red-50 text-red-500 border border-red-200"
                                                        : "bg-green-50 text-green-600 border border-green-200"
                                                        }`}
                                                >
                                                    {isInactive ? "Inactive" : "Active"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <button
                                                        onClick={() => handleOpenDetail(staff.user_id)}
                                                        className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-yellow-400 hover:bg-yellow-500 transition cursor-pointer"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEdit(staff)}
                                                        className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 transition cursor-pointer"
                                                    >
                                                        Edit
                                                    </button>
                                                    {isInactive ? (
                                                        <button
                                                            onClick={() => askConfirm(staff)}
                                                            className="px-4.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-500 border border-emerald-200 hover:bg-emerald-600 transition cursor-pointer"
                                                        >
                                                            Activate
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => askConfirm(staff)}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition cursor-pointer"
                                                        >
                                                            Deactivate
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Modals & Dialogs */}
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

            <ConfirmDialog
                isOpen={!!confirmState}
                tone={confirmState?.nextStatus === 'Active' ? "success" : "danger"}
                title={
                    confirmState?.nextStatus === 'Active'
                        ? `Activate "${confirmState?.name}"?`
                        : `Deactivate "${confirmState?.name}"?`
                }
                message={
                    confirmState?.nextStatus === 'Active'
                        ? "This employee will regain access and be marked active again."
                        : "This employee will be marked inactive. You can activate them again anytime."
                }
                confirmLabel={confirmState?.nextStatus === 'Active' ? "Activate" : "Deactivate"}
                onConfirm={handleConfirmToggle}
                onCancel={() => setConfirmState(null)}
            />
        </div>
    )
}

export default ViewStaff