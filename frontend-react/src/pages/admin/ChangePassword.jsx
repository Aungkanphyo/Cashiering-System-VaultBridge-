import { useState } from "react";
import api from "../../api/axios";

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("");
    const [processing, setProcessing] = useState(false);

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
        <div className="max-w-xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            {status && <div className="mb-4 text-sm text-green-600 bg-green-50 p-4 rounded-xl font-medium">{status}</div>}

            <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div>
                    <label className="block mb-2 text-gray-700 font-medium text-sm">Current Password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full h-12 px-4 border border-gray-300 rounded-xl outline-none focus:border-emerald-500"
                        required
                    />
                    {errors.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password[0]}</p>}
                </div>

                <div>
                    <label className="block mb-2 text-gray-700 font-medium text-sm">New Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 px-4 border border-gray-300 rounded-xl outline-none focus:border-emerald-500"
                        required
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                </div>

                <div>
                    <label className="block mb-2 text-gray-700 font-medium text-sm">Confirm New Password</label>
                    <input
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        className="w-full h-12 px-4 border border-gray-300 rounded-xl outline-none focus:border-emerald-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="px-6 h-12 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-emerald-700 transition shadow-sm"
                >
                    {processing ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    )
}

export default ChangePassword