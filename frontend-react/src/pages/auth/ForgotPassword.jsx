import axios from "axios";
import { useState } from "react";
import api from "../../api/axios";


const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setMessage("");

        try {
            await axios.get("http://localhost:8000/sanctum/csrf-cookie", { withCredentials: true });

            const response = await api.post("/forgot-password", { email });
            setMessage(response.data.status);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ email: ["Something went wrong. Please try again."] });
            }
        } finally {
            setProcessing(false);
        }
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
                <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send you a link to reset your password.</p>

                {message && <div className="mb-4 text-sm text-green-600 font-medium bg-green-50 p-3 rounded-xl">{message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 text-gray-700 font-medium text-sm">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 px-4 border border-gray-300 rounded-xl outline-none focus:border-emerald-500"
                            required
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full h-12 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-emerald-700 transition"
                    >
                        {processing ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ForgotPassword
