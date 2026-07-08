import { useState } from "react";
import api from "../../api/axios";
import { Eye, EyeOff, Key, X } from "lucide-react";

const ChangePassword = ({ isOpen, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("");
    const [processing, setProcessing] = useState(false);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    if (!isOpen) return null;

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setStatus("");

        try {
            await api.put("/password", {
                current_password: currentPassword,
                password: password,
                password_confirmation: passwordConfirmation
            });

            setStatus("Password updated successfully!");
            setCurrentPassword("");
            setPassword("");
            setPasswordConfirmation("");

            setShowCurrent(false);
            setShowNew(false);
            setShowConfirm(false);

            setTimeout(() => {
                setStatus("");
                onClose();
            }, 2000);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ current_password: ["Failed to update password. Please try again."] });
            }
        } finally {
            setProcessing(false);
        }
    }
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all overflow-hidden flex flex-col">

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-gray-900 font-bold text-base">
                        <Key className="w-5 h-5 text-emerald-600" />
                        <span>Change Password</span>
                    </div>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body / Form */}
                <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
                    {status && <div className="mb-2 text-sm text-green-600 bg-green-50 p-4 rounded-xl font-medium">{status}</div>}

                    <div>
                        <label className="block mb-2 text-gray-700 font-medium text-sm">Current Password</label>
                        <div className="relative">
                            <input
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full h-12 px-4 border border-gray-300 rounded-xl outline-none focus:border-emerald-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showCurrent ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password[0]}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 text-gray-700 font-medium text-sm">New Password</label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 px-4 border border-gray-300 rounded-xl outline-none focus:border-emerald-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showNew ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                    </div>

                    <div>
                        <label className="block mb-2 text-gray-700 font-medium text-sm">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                className="w-full h-12 px-4 border border-gray-300 rounded-xl outline-none focus:border-emerald-500"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showConfirm ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Modal Footer Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition shadow-sm"
                        >
                            {processing ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ChangePassword