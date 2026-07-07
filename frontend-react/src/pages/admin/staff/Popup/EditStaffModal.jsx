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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nrcState || !nrcTownship || !nrcType || !nrcNumber) {
            toast("Please complete the NRC profile field.", {
                icon: '⚠️',
            });
            // alert("Please complete the NRC profile field.");
            return;
        }
        if (nrcNumber.length !== 6) {
            toast.error("NRC Number must be exactly 6 digits.");
            // alert("NRC Number must be exactly 6 digits.");
            return;
        }

        const combinedNrc = `${nrcState}/${nrcTownship}${nrcType}${nrcNumber}`;

        const finalPayload = {
            ...formData,
            nrc: combinedNrc
        };

        try {
            const response = await api.put(`/staff/${staff.user_id}`, finalPayload);
            if (response.data.status === 'success') {
                toast.success('Employee information has been edited.');
                // alert('Employee information has been edited.');
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error(error);
            toast.error('There was an error while editing.');
            // alert('There was an error while editing.');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-800">
                        <UserRoundPen className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                        <h3 className="text-lg font-bold text-gray-800">Edit Staff Profile</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm overflow-y-auto flex-1">
                    {/* Row 1: Name & Email */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Full Name</label>
                            <input type="text" name="username" value={formData.username} required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Email Address</label>
                            <input type="email" name="email" value={formData.email} required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                        </div>
                    </div>

                    {/* Row 2: Phone & Gender */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Phone Number</label>
                            <input type="text" name="phone_number" value={formData.phone_number} required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 bg-white rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Date of Birth & System Role */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Date of Birth</label>
                            <input type="date" name="date_of_birth" value={formData.date_of_birth} required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">System Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 bg-white rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800">
                                <option value="staff">Cashier</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 4: Passport Style NRC Input Block (Full Width) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">NRC Number</label>
                        <div className="flex items-center gap-1.5">
                            {/* NRC State Number Dropdown */}
                            <select
                                value={nrcState}
                                onChange={(e) => {
                                    setNrcState(e.target.value);
                                    setNrcTownship("");
                                }}
                                required
                                className="w-20 border border-gray-300 px-2 py-2 bg-white rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800 text-center"
                            >
                                <option value=""></option>
                                {uniqueNrcCodes.map((code) => (
                                    <option key={code} value={code}>{code}</option>
                                ))}
                            </select>

                            <span className="font-bold text-gray-400 text-base">/</span>

                            {/* NRC Township Dropdown */}
                            <select
                                value={nrcTownship}
                                onChange={(e) => setNrcTownship(e.target.value)}
                                required
                                disabled={!nrcState}
                                className="flex-1 min-w-22.5 border border-gray-300 px-2 py-2 bg-white rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800 disabled:bg-gray-50 disabled:text-gray-400"
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
                                className="w-24 border border-gray-300 px-1 py-2 bg-white rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800 text-center"
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
                                className="w-28 border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800 tracking-wider text-center"
                            />
                        </div>
                    </div>

                    {/* Row 5: Home Address */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Home Address</label>
                        <textarea name="address" value={formData.address} required onChange={handleChange} rows="3" className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800 resize-none"></textarea>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition">Save Staff Profile</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditStaffModal
