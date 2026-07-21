import { useEffect, useMemo, useState } from "react";
import api from "../../../../api/axios";
import { Eye, EyeOff, UserPlus, X } from "lucide-react";
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
    const [errors, setErrors] = useState({});

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

            setErrors({});
            setShowPassword(false);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updatedValue = value;

        if (name === "phone_number") {
            updatedValue = value.replace(/\D/g, '');
        }

        if (name === "date_of_birth") {
            if (value > maxDate) {
                toast.error("Staff must be at least 18 years old.");
                return;
            }
        }

        setFormData({ ...formData, [name]: updatedValue });

        // As you type, the error message for that field will be immediately cleared
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }

    const handleNrcChange = (setter, value) => {
        setter(value);
        if (errors.nrc) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.nrc;
                return newErrors;
            });
        }
    }

    const validateForm = () => {
        let tempErrors = {};

        if (!formData.username.trim()) {
            tempErrors.username = "Full name is required.";
        }
        if (!formData.password.trim()) {
            tempErrors.password = "Password is required.";
        } else if (formData.password.length < 8) {
            tempErrors.password = "Password must be at least 8 characters long.";
        }
        if (!formData.email.trim()) {
            tempErrors.email = "Email address is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            tempErrors.email = "Please enter a valid email address.";
        }
        if (!formData.phone_number.trim()) {
            tempErrors.phone_number = "Phone number is required.";
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
            tempErrors.nrc = "NRC profile field must be completed.";
        } else if (nrcNumber.length !== 6) {
            tempErrors.nrc = "NRC Number must be exactly 6 digits.";
        }

        return tempErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);

            const formBody = document.getElementById("staff-form-body");
            if (formBody) formBody.scrollTop = 0;
            return;
        }

        const combinedNrc = `${nrcState}/${nrcTownship}${nrcType}${nrcNumber}`;

        const finalPayload = {
            ...formData,
            nrc: combinedNrc,
        };

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
                setErrors({});
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
                        newErrors[key] = backendErrors[key][0];
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
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-800">
                        <UserPlus className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                        <h3 className="text-lg font-bold text-gray-800">Add New Staff Profile</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} autoComplete="off" noValidate className="p-6 space-y-4 text-sm overflow-y-auto flex-1">
                    {/* Row 1: Name & Password */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                                <span className="text-[11px] text-gray-400 font-semibold">
                                    {formData.username.length} / 20
                                </span>
                            </div>
                            <input
                                type="text"
                                name="username"
                                maxLength="20"
                                value={formData.username}
                                onChange={handleChange}
                                className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-1 transition text-gray-800 ${errors.username
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                                    : "border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
                                    }`}
                            />
                            {errors.username && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.username}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    minLength="8"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-1 transition text-gray-800 ${errors.password
                                        ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                                        : "border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                >
                                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.password}</p>}
                        </div>
                    </div>

                    {/* Row 2: Email & Phone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-1 transition text-gray-800 ${errors.email
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                                    : "border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
                                    }`}
                            />
                            {errors.email && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Phone Number</label>
                            <input
                                type="text"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-1 transition text-gray-800 ${errors.phone_number
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                                    : "border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
                                    }`}
                            />
                            {errors.phone_number && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.phone_number}</p>}
                        </div>
                    </div>

                    {/* Row 3: Gender & Date of Birth */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Gender</label>
                            <select name="gender" onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 bg-white rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Date of Birth</label>
                            <input
                                type="date"
                                name="date_of_birth"
                                max={maxDate}
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-1 transition text-gray-800 ${errors.date_of_birth
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                                    : "border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
                                    }`}
                            />
                            {errors.date_of_birth && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.date_of_birth}</p>}
                        </div>
                    </div>

                    {/* Row 4: Join Date */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Join Date</label>
                        <input
                            type="date"
                            name="join_date"
                            value={formData.join_date}
                            onChange={handleChange}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-1 transition text-gray-800 ${errors.join_date
                                ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                                : "border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
                                }`}
                        />
                        {errors.join_date && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.join_date}</p>}
                    </div>

                    {/* Row 5: Passport Style NRC Input Block (Full Width) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">NRC Number</label>
                        <div className="flex items-center gap-1.5">
                            {/* NRC State Number Dropdown */}
                            <select
                                value={nrcState}
                                onChange={(e) => {
                                    handleNrcChange(setNrcState, e.target.value);
                                    setNrcTownship("");
                                }}
                                className={`w-20 border px-2 py-2 bg-white rounded-lg focus:outline-none focus:ring-1 transition text-gray-800 text-center ${errors.nrc
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                                    : "border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
                                    }`}
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
                                onChange={(e) => handleNrcChange(setNrcTownship, e.target.value)}
                                disabled={!nrcState}
                                className={`flex-1 min-w-22.5 border px-2 py-2 bg-white rounded-lg focus:outline-none focus:ring-1 transition text-gray-800 disabled:bg-gray-50 disabled:text-gray-400 ${errors.nrc
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                                    : "border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
                                    }`}
                            >
                                <option value=""></option>
                                {availableTownships.map((township, idx) => (
                                    <option key={idx} value={township.name_en}>
                                        {township.name_en}
                                    </option>
                                ))}
                            </select>

                            {/* NRC Type Dropdown */}
                            <select
                                value={nrcType}
                                onChange={(e) => handleNrcChange(setNrcType, e.target.value)}
                                className={`w-24 border px-1 py-2 bg-white rounded-lg focus:outline-none focus:ring-1 transition text-gray-800 text-center ${errors.nrc
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                                    : "border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
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
                                onChange={(e) => handleNrcChange(setNrcNumber, e.target.value.replace(/\D/g, ''))}
                                maxLength="6"
                                placeholder="123456"
                                className={`w-28 border px-3 py-2 rounded-lg focus:outline-none focus:ring-1 transition text-gray-800 tracking-wider text-center ${errors.nrc
                                    ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                                    : "border-gray-300 focus:border-emerald-600 focus:ring-emerald-600"
                                    }`}
                            />
                        </div>
                        {errors.nrc && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.nrc}</p>}
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
                        {errors.address && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.address}</p>}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition">Save</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddStaffModal