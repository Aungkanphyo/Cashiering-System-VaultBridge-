import { useMemo, useState } from "react";
import api from "../../../../api/axios";
import { UserRoundPen, X } from "lucide-react";
import nrcData from "../../../../data/nrc.json";
import toast from 'react-hot-toast';


const EditStaffModal = ({ onClose, staff, onSuccess }) => {
    const initialNrc = useMemo(() => {
        if (!staff || !staff.nrc) return { state: "", township: "", type: "(N)", number: "" };

        const match = staff.nrc.match(/^(\d+)\/([A-Za-z]+)(\([NAP]\))(\d+)$/);
        if (match) {
            return {
                state: match[1],
                township: match[2],
                type: match[3],
                number: match[4]
            };
        }
        return { state: "", township: "", type: "(N)", number: "" };
    }, [staff]);

    const [formData, setFormData] = useState({
        username: staff.username || '',
        phone_number: staff.phone_number || '',
        nrc: staff.nrc || '',
        date_of_birth: staff.date_of_birth ? staff.date_of_birth.substring(0, 10) : '',
        address: staff.address || '',
        gender: staff.gender || 'Male',
        email: staff.email || '',
        role: staff.role || 'Cashier',
        join_date: staff.join_date || ''
    });

    // nrc states
    const [nrcState, setNrcState] = useState(initialNrc.state);
    const [nrcTownship, setNrcTownship] = useState(initialNrc.township);
    const [nrcType, setNrcType] = useState(initialNrc.type);
    const [nrcNumber, setNrcNumber] = useState(initialNrc.number);
    const [submitting, setSubmitting] = useState(false);

    const uniqueNrcCodes = useMemo(() => {
        if (!nrcData || !nrcData.data) return [];
        const codes = nrcData.data.map(item => item.nrc_code);
        return Array.from(new Set(codes)).sort((a, b) => Number(a) - Number(b));
    }, []);

    const availableTownships = useMemo(() => {
        if (!nrcState || !nrcData || !nrcData.data) return [];
        return nrcData.data.filter(
            item => String(item.nrc_code) === String(nrcState)
        );
    }, [nrcState]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleCancel = () => {
        if (submitting) return;
        onClose?.();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nrcState || !nrcTownship || !nrcType || !nrcNumber) {
            toast("Please complete the NRC profile field.", {
                icon: '⚠️',
            });
            return;
        }
        if (nrcNumber.length !== 6) {
            toast.error("NRC Number must be exactly 6 digits.");
            return;
        }

        const combinedNrc = `${nrcState}/${nrcTownship}${nrcType}${nrcNumber}`;

        const finalPayload = {
            ...formData,
            nrc: combinedNrc
        };

        setSubmitting(true);
        try {
            const response = await api.put(`/staff/${staff.user_id}`, finalPayload);
            if (response.data.status === 'success') {
                toast.success('Employee information has been edited.');
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error(error);
            toast.error('There was an error while editing.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-700 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <UserRoundPen className="text-white" size={28} />
                        <h3 className="font-bold text-white text-lg">Edit Staff Profile</h3>
                    </div>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm overflow-y-auto flex-1">
                    {/* Row 1: Name & Email */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Full Name</label>
                            <input type="text" name="username" value={formData.username} required onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Email Address</label>
                            <input type="email" name="email" value={formData.email} required onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                        </div>
                    </div>

                    {/* Row 2: Phone & Gender */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Phone Number</label>
                            <input type="text" name="phone_number" value={formData.phone_number} required onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Date of Birth & System Role */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Date of Birth</label>
                            <input type="date" name="date_of_birth" value={formData.date_of_birth} required onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">System Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                                <option value="staff">Cashier</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 4: Passport Style NRC Input Block (Full Width) */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1.5">NRC Number</label>
                        <div className="flex items-center gap-1.5">
                            {/* NRC State Number Dropdown */}
                            <select
                                value={nrcState}
                                onChange={(e) => {
                                    setNrcState(e.target.value);
                                    setNrcTownship("");
                                }}
                                required
                                className="w-20 p-2.5 border border-slate-300 bg-white rounded-lg text-sm text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            >
                                <option value=""></option>
                                {uniqueNrcCodes.map((code) => (
                                    <option key={code} value={code}>{code}</option>
                                ))}
                            </select>

                            <span className="font-bold text-slate-400 text-base">/</span>

                            {/* NRC Township Dropdown */}
                            <select
                                value={nrcTownship}
                                onChange={(e) => setNrcTownship(e.target.value)}
                                required
                                disabled={!nrcState}
                                className="flex-1 min-w-22.5 p-2.5 border border-slate-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                            >
                                <option value=""></option>
                                {availableTownships.map((township, idx) => (
                                    <option key={idx} value={township.name_en}>
                                        {township.name_mm}
                                    </option>
                                ))}
                            </select>

                            {/* NRC Type Dropdown */}
                            <select
                                value={nrcType}
                                onChange={(e) => setNrcType(e.target.value)}
                                required
                                className="w-24 p-2.5 border border-slate-300 bg-white rounded-lg text-sm text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            >
                                <option value="(N)">(N) နိုင်</option>
                                <option value="(A)">(A) ပြု</option>
                                <option value="(P)">(P) ဧည့်</option>
                            </select>

                            {/* NRC 6-Digit Serial Number Input */}
                            <input
                                type="text"
                                value={nrcNumber}
                                onChange={(e) => setNrcNumber(e.target.value.replace(/\D/g, ''))}
                                maxLength="6"
                                placeholder="123456"
                                required
                                className="w-28 p-2.5 border border-slate-300 rounded-lg text-sm text-center tracking-wider focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Row 5: Home Address */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Home Address</label>
                        <textarea name="address" value={formData.address} required onChange={handleChange} rows="3" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end space-x-3 pt-1">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={submitting}
                            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-sm disabled:opacity-60"
                        >
                            {submitting ? "Saving..." : "Save Staff Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditStaffModal