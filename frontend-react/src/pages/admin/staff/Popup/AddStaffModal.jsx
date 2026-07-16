import { useEffect, useMemo, useState } from "react";
import api from "../../../../api/axios";
import { Eye, EyeOff, UserPlus, X, Loader2 } from "lucide-react";
import nrcData from "../../../../data/nrc.json";
import toast from 'react-hot-toast';
import useScrollLock from "../../../../hooks/useScrollLock";


const AddStaffModal = ({ isOpen, onClose, onSuccess }) => {

    useScrollLock(isOpen);

    const maxDate = useMemo(() => {
        const today = new Date();
        const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        return eighteenYearsAgo.toISOString().split('T')[0];
    }, []);

    const [formData, setFormData] = useState({
        username: '', password: '', status: 'Active',
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

    useEffect(() => {
        if (!isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                username: '', password: '', status: 'Active',
                phone_number: '', nrc: '', date_of_birth: '', address: '',
                gender: 'Male', email: '', join_date: ''
            });
            setNrcState("");
            setNrcTownship("");
            setNrcNumber("");
            setError("");
            setFieldErrors({});
            setShowPassword(false);
            setSubmitting(false);
        }
    }, [isOpen]);

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
        const { name, value } = e.target;
        let updatedValue = value;

        if (name === "phone_number") {
            updatedValue = value.replace(/\D/g, '');
        }

        if (name === "username") {
            updatedValue = value.slice(0, 20);
        }

        if (name === "date_of_birth") {
            if (value > maxDate) {
                toast.error("Staff must be at least 18 years old.");
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

    // Full validation logic (ported from original implementation)
    const validate = () => {
        const errs = {};

        if (!formData.username.trim()) {
            errs.username = "Full name is required.";
        }

        if (!formData.password.trim()) {
            errs.password = "Password is required.";
        } else if (formData.password.length < 8) {
            errs.password = "Password must be at least 8 characters long.";
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
            tempErrors.date_of_birth = "Date of birth is required.";
        } else if (formData.date_of_birth > maxDate) {
            tempErrors.date_of_birth = "Staff must be at least 18 years old.";
        }

        if (!formData.address.trim()) {
            tempErrors.address = "Address is required.";
        }
        if (!formData.join_date) {
            tempErrors.join_date = "Join date is required.";
        }

        // NRC Block Validation
        if (!nrcState || !nrcTownship || !nrcType || !nrcNumber) {
            errs.nrc = "NRC profile field must be completed.";
        } else if (nrcNumber.length !== 6) {
            errs.nrc = "NRC Number must be exactly 6 digits.";
        }

        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errs = validate();
        setFieldErrors(errs);
        if (Object.keys(errs).length > 0) {
            setError("Please fix the highlighted fields.");
            const formBody = document.getElementById("staff-form-body");
            if (formBody) formBody.scrollTop = 0;
            return;
        }

        const combinedNrc = `${nrcState}/${nrcTownship}${nrcType}${nrcNumber}`;

        const finalPayload = {
            ...formData,
            nrc: combinedNrc,
        };

        setSubmitting(true);
        setError("");
        try {
            const response = await api.post('/staff', finalPayload);
            if (response.data.status === 'success') {
                toast.success('New employee successfully added.');

                setFormData({
                    username: '', password: '', status: 'Active',
                    phone_number: '', nrc: '', date_of_birth: '', address: '',
                    gender: 'Male', email: '', join_date: ''
                });

               
                setNrcState("");
                setNrcTownship("");
                setNrcNumber("");
                setShowPassword(false);
                setFieldErrors({});
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 422) {
                const backendErrors = error.response.data.errors;
                const newErrors = {};
                if (backendErrors) {
                    Object.keys(backendErrors).forEach((key) => {
                        newErrors[key] = backendErrors[key][0]; // ပထမဆုံး error message ကို ယူသုံးပါမယ်
                    });
                    setErrors(newErrors);
                    toast.error("The information provided is incorrect.");
                }
            } else {
                toast.error('There was an error while entering the data. Please check the data again.');
            }
        }
    }

    return (
        <div className="fixed inset-0  bg-white/2 backdrop-blur-[7px] flex justify-center items-center z-50 p-4">
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
                        <X className="w-5 h-5 cursor-pointer" />
                    </button>
                </div>

                {/* Form Body */}
                <form id="staff-form-body" onSubmit={handleSubmit} noValidate className="p-5 space-y-4 overflow-y-auto flex-1">
                    {error && (
                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Row 1: Name & Password */}
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
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-slate-600">Password</label>
                                <span className="text-xs text-slate-400">{formData.password.length} (min 8)</span>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    minLength={8}
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    className={inputClass("password")}
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
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={inputClass("email")}
                            />
                            {fieldErrors.email && <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>}
                        </div>
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
                    </div>

                    {/* Row 3: Gender & Date of Birth */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-800"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Date of Birth</label>
                            <input
                                type="date"
                                name="date_of_birth"
                                max={maxDate}
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                className={inputClass("date_of_birth")}
                            />
                            {fieldErrors.date_of_birth && <p className="text-xs text-rose-600 mt-1">{fieldErrors.date_of_birth}</p>}
                        </div>
                    </div>

                    {/* Row 4: Join Date */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Join Date</label>
                        <input
                            type="date"
                            name="join_date"
                            max={new Date().toISOString().split('T')[0]}
                            value={formData.join_date}
                            onChange={handleChange}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-1 transition text-gray-800 ${errors.join_date
                                ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                                : "border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
                                }`}
                        />
                        {errors.join_date && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.join_date}</p>}
                    </div>

                    {/* Row 5: NRC Input Block (Full Width) */}
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
                                className={`w-20 border px-2 py-2.5 bg-white rounded-lg text-sm focus:ring-2 focus:outline-none text-slate-800 text-center ${fieldErrors.nrc
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
                                className={`flex-1 min-w-22.5 border px-2 py-2.5 bg-white rounded-lg text-sm focus:ring-2 focus:outline-none text-slate-800 disabled:bg-slate-50 disabled:text-slate-400 ${fieldErrors.nrc
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
                                className={`w-24 border px-1 py-2.5 bg-white rounded-lg text-sm focus:ring-2 focus:outline-none text-slate-800 text-center ${fieldErrors.nrc
                                    ? "border-rose-400 focus:ring-rose-400"
                                    : "border-slate-300 focus:ring-emerald-500"
                                    }`}
                            >
                                <option value="N">(N) နိုင်</option>
                                <option value="A">(A) ပြု</option>
                                <option value="P">(P) ဧည့်</option>
                            </select>

                            {/* NRC 6-Digit Serial Number Input */}
                            <input
                                type="text"
                                value={nrcNumber}
                                onChange={(e) => handleNrcChange(setNrcNumber, e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                placeholder="123456"
                                className={`w-28 border px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:outline-none text-slate-800 tracking-wider text-center ${fieldErrors.nrc
                                    ? "border-rose-400 focus:ring-rose-400"
                                    : "border-slate-300 focus:ring-emerald-500"
                                    }`}
                            />
                        </div>
                        {fieldErrors.nrc && <p className="text-xs text-rose-600 mt-1">{fieldErrors.nrc}</p>}
                    </div>

                    {/* Row 6: Address */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Address</label>
                            <span className="text-[11px] text-gray-400 font-semibold">
                                {formData.address.length} / 100
                            </span>
                        </div>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="2"
                            maxLength="100"
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-1 transition text-gray-800 resize-none ${errors.address
                                ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                                : "border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
                                }`}
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
                            {submitting ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddStaffModal