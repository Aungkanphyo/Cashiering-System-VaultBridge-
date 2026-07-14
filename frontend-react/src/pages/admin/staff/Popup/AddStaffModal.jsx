import { useMemo, useState } from "react";
import api from "../../../../api/axios";
import { Eye, EyeOff, UserPlus, X, Loader2 } from "lucide-react";
import nrcData from "../../../../data/nrc.json";
import toast from 'react-hot-toast';
import useScrollLock from "../../../../hooks/useScrollLock";


const AddStaffModal = ({ isOpen, onClose, onSuccess }) => {

    useScrollLock(isOpen);

    const [formData, setFormData] = useState({
        username: '', password: '', role: 'staff', status: 'Active',
        phone_number: '', nrc: '', date_of_birth: '', address: '',
        gender: 'Male', email: '', join_date: ''
    });

    // password visibility state
    const [showPassword, setShowPassword] = useState(false);

    // nrc states
    const [nrcState, setNrcState] = useState("");
    const [nrcTownship, setNrcTownship] = useState("");
    const [nrcType, setNrcType] = useState("(N)");
    const [nrcNumber, setNrcNumber] = useState("");

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

    if (!isOpen) return null;

    const clearFieldError = (field) => {
        setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        clearFieldError(e.target.name);
        if (error) setError("");
    }

    const validate = () => {
        const errs = {};
        if (!formData.username.trim()) errs.username = "Full name is required.";
        if (!formData.password.trim()) errs.password = "Password is required.";
        if (!formData.email.trim()) errs.email = "Email address is required.";
        if (!formData.phone_number.trim()) errs.phone_number = "Phone number is required.";
        if (!formData.date_of_birth) errs.date_of_birth = "Date of birth is required.";
        if (!formData.address.trim()) errs.address = "Address is required.";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errs = validate();
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) {
            setError("Please fix the highlighted fields.");
            return;
        }

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

        const today = new Date().toISOString().split('T')[0];

        const combinedNrc = `${nrcState}/${nrcTownship}${nrcType}${nrcNumber}`;

        const finalPayload = {
            ...formData,
            nrc: combinedNrc,
            join_date: today
        };

        setSubmitting(true);
        setError("");
        try {
            const response = await api.post('/staff', finalPayload);
            if (response.data.status === 'success') {
                toast.success('New employee successfully added.');
                setNrcState("");
                setNrcTownship("");
                setNrcNumber("");
                setShowPassword(false);
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "There was an error while entering the data. Please check the data again."
            );
            toast.error('There was an error while entering the data. Please check the data again.');
        } finally {
            setSubmitting(false);
        }
    }

    const handleCancel = () => {
        if (submitting) return;
        onClose?.();
    };

    const inputClass = (field) =>
        `w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:outline-none text-slate-800 ${fieldErrors[field]
            ? "border-rose-400 focus:ring-rose-400"
            : "border-slate-300 focus:ring-emerald-500"
        }`;

    return (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-700 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <UserPlus className="text-white" size={28} />
                        <h3 className="font-bold text-white text-lg">Add New Staff Profile</h3>
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
                <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4 overflow-y-auto flex-1">
                    {error && (
                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Row 1: Name & Password */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Full Name</label>
                            <input type="text" name="username" onChange={handleChange} className={inputClass("username")} />
                            {fieldErrors.username && <p className="text-xs text-rose-600 mt-1">{fieldErrors.username}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Password</label>
                            <div className="relative ">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    onChange={handleChange}
                                    className={inputClass("password")}
                                    autoComplete="new-password" 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                >
                                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>
                            {fieldErrors.password && <p className="text-xs text-rose-600 mt-1">{fieldErrors.password}</p>}
                        </div>
                    </div>

                    {/* Row 2: Email & Phone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Email Address</label>
                            <input type="email" name="email" onChange={handleChange} className={inputClass("email")} />
                            {fieldErrors.email && <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Phone Number</label>
                            <input type="text" name="phone_number" onChange={handleChange} className={inputClass("phone_number")} />
                            {fieldErrors.phone_number && <p className="text-xs text-rose-600 mt-1">{fieldErrors.phone_number}</p>}
                        </div>
                    </div>

                    {/* Row 3: Gender & Date of Birth */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Gender</label>
                            <select name="gender" onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-800">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Date of Birth</label>
                            <input type="date" name="date_of_birth" onChange={handleChange} className={inputClass("date_of_birth")} />
                            {fieldErrors.date_of_birth && <p className="text-xs text-rose-600 mt-1">{fieldErrors.date_of_birth}</p>}
                        </div>
                    </div>

                    {/* Row 4: System Role */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">System Role</label>
                        <select name="role" onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-800">
                            <option value="staff">Cashier</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Row 5: NRC Input Block (Full Width) */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1.5">NRC Number</label>
                        <div className="flex items-center gap-1.5">
                            <select
                                value={nrcState}
                                onChange={(e) => {
                                    setNrcState(e.target.value);
                                    setNrcTownship("");
                                }}
                                className="w-20 border border-slate-300 px-2 py-2.5 bg-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 text-center"
                            >
                                <option value=""></option>
                                {uniqueNrcCodes.map((code) => (
                                    <option key={code} value={code}>{code}</option>
                                ))}
                            </select>

                            <span className="font-bold text-slate-400 text-base">/</span>

                            <select
                                value={nrcTownship}
                                onChange={(e) => setNrcTownship(e.target.value)}
                                disabled={!nrcState}
                                className="flex-1 min-w-22.5 border border-slate-300 px-2 py-2.5 bg-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                            >
                                <option value=""></option>
                                {availableTownships.map((township, idx) => (
                                    <option key={idx} value={township.name_en}>
                                        {township.name_mm}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={nrcType}
                                onChange={(e) => setNrcType(e.target.value)}
                                className="w-24 border border-slate-300 px-1 py-2.5 bg-white rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 text-center"
                            >
                                <option value="N">(N) နိုင်</option>
                                <option value="A">(A) ပြု</option>
                                <option value="P">(P) ဧည့်</option>
                            </select>

                            <input
                                type="text"
                                value={nrcNumber}
                                onChange={(e) => setNrcNumber(e.target.value.replace(/\D/g, ''))}
                                maxLength="6"
                                placeholder="123456"
                                className="w-28 border border-slate-300 px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 tracking-wider text-center"
                            />
                        </div>
                    </div>

                    {/* Row 6: Address */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">Address</label>
                        <textarea name="address" onChange={handleChange} rows="2" className={`${inputClass("address")} resize-none`}></textarea>
                        {fieldErrors.address && <p className="text-xs text-rose-600 mt-1">{fieldErrors.address}</p>}
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
                            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-60"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {submitting ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddStaffModal