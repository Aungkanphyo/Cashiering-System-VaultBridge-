import axios from "axios";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";


const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("");
    const [processing, setProcessing] = useState(false);

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await axios.get("http://localhost:8000/sanctum/csrf-cookie", { withCredentials: true });
            
            const response = await api.post("/reset-password", {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            setStatus(response.data.status);
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ password: ["Password reset failed. Link may be expired."] });
            }
        } finally {
            setProcessing(false);
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Reset Your Password</h2>

                {status && <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-xl">{status} Redirecting to login...</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
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

                    <div className="mb-6">
                        <label className="block mb-2 text-gray-700 font-medium text-sm">Confirm Password</label>
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
                        className="w-full h-12 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-emerald-700 transition"
                    >
                        {processing ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword
