import { useMemo, useState } from "react";
import api from "../../../../api/axios";
import { UserRoundPen, X, Loader2 } from "lucide-react";
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

    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
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

    const clearFieldError = (field) => {
        setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedValue = value;

        if (name === "phone_number") {
            updatedValue = value.replace(/\D/g, '');
        }

        if (name === "username") {
            updatedValue = value.slice(0, 20);
        }

        if (name === "date_of_birth") {
            const today = new Date().toISOString().split('T')[0];
            if (value > today) {
                toast.error("Future dates are not allowed for Date of Birth.");
                return;
            }
        }

        setFormData({ ...formData, [name]: updatedValue });
        clearFieldError(name);
        if (error) setError("");
    }

    const handleNrcChange = (setter, value) => {
        setter(value);
        clearFieldError("nrc");
        if (error) setError("");
    }

    // Full per-field validation (ported from the AddStaffModal treatment)
    const validate = () => {
        const errs = {};

        if (!formData.username.trim()) {
            errs.username = "Full name is required.";
        }

        if (!formData.email.trim()) {
            errs.email = "Email address is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errs.email = "Please enter a valid email address.";
        }

        if (!formData.phone_number.trim()) {
            errs.phone_number = "Phone number is required.";
        }

        if (!formData.date_of_birth) {
            errs.date_of_birth = "Date of birth is required.";
        }

        if (!formData.address.trim()) {
            errs.address = "Address is required.";
        }

        // NRC Block Validation
        if (!nrcState || !nrcTownship || !nrcType || !nrcNumber) {
            errs.nrc = "NRC profile field must be completed.";
        } else if (nrcNumber.length !== 6) {
            errs.nrc = "NRC Number must be exactly 6 digits.";
        }

        return errs;
    };

    const handleCancel = () => {
        if (submitting) return;
        onClose?.();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errs = validate();
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) {
            setError("Please fix the highlighted fields.");
            return;
        }

        const combinedNrc = `${nrcState}/${nrcTownship}${nrcType}${nrcNumber}`;

        const finalPayload = {
            ...formData,
            nrc: combinedNrc
        };

        setSubmitting(true);
        setError("");
        try {
            const response = await api.put(`/staff/${staff.user_id}`, finalPayload);
            if (response.data.status === 'success') {
                toast.success('Employee information has been edited.');
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "There was an error while editing."
            );
            toast.error('There was an error while editing.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = (field) =>
        `w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none text-slate-800 ${fieldErrors[field]
            ? "border-rose-400 focus:ring-rose-400"
            : "border-slate-300 focus:ring-emerald-500"
        }`;

    return (
        <div className="fixed inset-0 bg-slate-900/30 bg-white/2 backdrop-blur-[7px] flex justify-center items-center z-50 p-4">
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
                        <X className="w-5 h-5 cursor-pointer" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4 text-sm overflow-y-auto flex-1">
                    {error && (
                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Row 1: Name & Email */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-slate-600">Full Name</label>
                                <span className="text-xs text-slate-400">{formData.username.length}/20</span>
                            </div>
                            <input
                                type="text"
                                name="username"
                                maxLength={20}
                                value={formData.username}
                                onChange={handleChange}
                                className={inputClass("username")}
                            />
                            {fieldErrors.username && <p className="text-xs text-rose-600 mt-1">{fieldErrors.username}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={inputClass("email")}
                            />
                            {fieldErrors.email && <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>}
                        </div>
                    </div>

                    {/* Row 2: Phone & Gender */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Phone Number</label>
                            <input
                                type="text"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className={inputClass("phone_number")}
                            />
                            {fieldErrors.phone_number && <p className="text-xs text-rose-600 mt-1">{fieldErrors.phone_number}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 3: Date of Birth & System Role */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Date of Birth</label>
                            <input
                                type="date"
                                name="date_of_birth"
                                max={new Date().toISOString().split('T')[0]}
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                className={inputClass("date_of_birth")}
                            />
                            {fieldErrors.date_of_birth && <p className="text-xs text-rose-600 mt-1">{fieldErrors.date_of_birth}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">System Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                            >
                                <option value="staff">Cashier</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 4: Passport Style NRC Input Block (Full Width) */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-semibold text-slate-600">NRC Number</label>
                            <span className="text-xs text-slate-400">{nrcNumber.length}/6</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {/* NRC State Number Dropdown */}
                            <select
                                value={nrcState}
                                onChange={(e) => {
                                    handleNrcChange(setNrcState, e.target.value);
                                    setNrcTownship("");
                                }}
                                className={`w-20 p-2.5 border bg-white rounded-lg text-sm text-center focus:ring-2 focus:outline-none text-slate-800 ${fieldErrors.nrc
                                    ? "border-rose-400 focus:ring-rose-400"
                                    : "border-slate-300 focus:ring-emerald-500"
                                    }`}
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
                                onChange={(e) => handleNrcChange(setNrcTownship, e.target.value)}
                                disabled={!nrcState}
                                className={`flex-1 min-w-22.5 p-2.5 border bg-white rounded-lg text-sm focus:ring-2 focus:outline-none text-slate-800 disabled:bg-slate-50 disabled:text-slate-400 ${fieldErrors.nrc
                                    ? "border-rose-400 focus:ring-rose-400"
                                    : "border-slate-300 focus:ring-emerald-500"
                                    }`}
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
                                onChange={(e) => handleNrcChange(setNrcType, e.target.value)}
                                className={`w-24 p-2.5 border bg-white rounded-lg text-sm text-center focus:ring-2 focus:outline-none text-slate-800 ${fieldErrors.nrc
                                    ? "border-rose-400 focus:ring-rose-400"
                                    : "border-slate-300 focus:ring-emerald-500"
                                    }`}
                            >
                                <option value="(N)">(N) နိုင်</option>
                                <option value="(A)">(A) ပြု</option>
                                <option value="(P)">(P) ဧည့်</option>
                            </select>

                            {/* NRC 6-Digit Serial Number Input */}
                            <input
                                type="text"
                                value={nrcNumber}
                                onChange={(e) => handleNrcChange(setNrcNumber, e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                placeholder="123456"
                                className={`w-28 p-2.5 border rounded-lg text-sm text-center tracking-wider focus:ring-2 focus:outline-none text-slate-800 ${fieldErrors.nrc
                                    ? "border-rose-400 focus:ring-rose-400"
                                    : "border-slate-300 focus:ring-emerald-500"
                                    }`}
                            />
                        </div>
                        {fieldErrors.nrc && <p className="text-xs text-rose-600 mt-1">{fieldErrors.nrc}</p>}
                    </div>

                    {/* Row 5: Home Address */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Home Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                            className={`${inputClass("address")} resize-none`}
                        ></textarea>
                        {fieldErrors.address && <p className="text-xs text-rose-600 mt-1">{fieldErrors.address}</p>}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end space-x-3 pt-1">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={submitting}
                            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg disabled:opacity-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {submitting ? "Saving..." : "Save Staff Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditStaffModal