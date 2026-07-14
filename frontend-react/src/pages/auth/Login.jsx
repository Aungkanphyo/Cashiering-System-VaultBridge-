import { ShoppingBasket, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import LoginBanner from '../../assets/cashier.png';
import axios from "axios";
import { useAuthStore } from "../../stores/authStore";

const Login = () => {
    const navigate = useNavigate();
    const loginUser = useAuthStore((state) => state.login);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
                withCredentials: true
            });

            const response = await api.post('/login', {
                email: email,
                password: password,
            });

            if (response.status === 200 || response.data?.status === "success") {
                if (response.data?.token) {
                    localStorage.setItem('token', response.data.token);
                }

                const userData = response.data?.user;
                loginUser(userData);

                if (userData?.role === "admin") {
                    navigate("/admin/dashboard");
                } else if (userData?.role === "cashier") {
                    navigate("/cashier/sale");
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else if (error.response && error.response.data.message) {
                setErrors({ email: [error.response.data.message] });
            } else {
                setErrors({ email: ["Unable to log in, please try again later."] });
            }
        } finally {
            setProcessing(false);
        }
    }
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#F9FAFB] font-sans">
            {/* Left side: login form */}
            <div className="w-full md:w-[55%] min-h-[65vh] md:min-h-screen bg-[#F9FAFB] flex justify-center items-center relative overflow-hidden p-6">
                <div className="absolute w-55 h-55 bg-[#10B981] opacity-15 rounded-full -left-20 -bottom-20 pointer-events-none"></div>

                <div className="w-full max-w-105 z-10">
                    <div className="text-center mb-8.75">
                        <ShoppingBasket className="w-13.75 h-13.75 text-[#059669] mx-auto" />
                        <h1 className="text-[48px] font-bold text-[#08634b] mt-2.5 leading-none tracking-tight">Mart4U</h1>
                        <p className="text-[#08634b] text-[15px] mt-2 font-medium">Smart POS System</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        {/* Email Field */}
                        <div className="mb-5.5">
                            <label className="block mb-2 text-[#0a7a5d] font-medium text-[15px]">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                placeholder="Enter your email"
                                className="w-full h-13 px-4.5 border-2 border-[#D1D5DB] rounded-[14px] text-[15px] outline-none transition duration-300 focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.email[0]}</p>}
                        </div>

                        {/* Password Field */}
                        <div className="mb-5.5">
                            <label className="block mb-2 text-[#0a7a5d] font-medium text-[15px]">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    placeholder="Enter your password"
                                    className="w-full h-13 pl-4.5 pr-12 border-2 border-[#D1D5DB] rounded-[14px] text-[15px] outline-none transition duration-300 focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/15"
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#10B981] transition duration-200 cursor-pointer"
                                >
                                    {showPassword ? (
                                        <Eye className="w-5 h-5" />
                                    ) : (
                                        <EyeOff className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.password[0]}</p>}
                        </div>

                        {/* Forgot Password Link */}
                        <div className="text-right -mt-2 mb-6">
                            <button
                                type="button"
                                onClick={() => navigate("/forgot-password")}
                                className="text-[#10B981] text-[14px] font-semibold no-underline transition duration-300 hover:text-[#047857]"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full h-13 border-none rounded-[14px] bg-linear-to-br from-[#059669] to-[#10B981] text-white text-[17px] font-bold cursor-pointer transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(5,150,105,0.35)] disabled:opacity-50"
                        >
                            {processing ? "Logging in..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right side: graphic banner */}
            <div className="w-full md:w-[45%] h-95 md:h-auto bg-linear-to-br from-[#065F46] via-[#059669] to-[#10B981] flex justify-center items-center relative overflow-hidden p-6">
                <div className="absolute w-95 h-95 bg-white/5 rounded-full -top-30 -right-30 pointer-events-none"></div>
                <div className="absolute w-65 h-65 bg-white/5 rounded-full -bottom-20 -left-20 pointer-events-none"></div>

                <div className="text-center text-white w-full max-w-[85%] z-10">
                    <img
                        src={LoginBanner}
                        alt="Cashier"
                        className="relative top-5 md:top-12.5 w-65 md:w-85 max-w-full mx-auto mb-6 md:mb-6.25 drop-shadow-[0_25px_40px_rgba(0,0,0,0.35)] hover:drop-shadow-[0_25px_40px_rgba(0,0,0,0.5)] transition duration-300"
                    />
                    <h2 className="text-[34px] md:text-[42px] font-bold mb-3.75 text-white leading-tight">Welcome Back!</h2>
                    <p className="text-[15px] md:text-[16px] leading-relaxed md:leading-7.5 text-emerald-50">
                        Manage your retail business effortlessly with <strong className="text-[#D1FAE5] font-bold">Mart4U POS</strong>.<br /><br />
                        Fast • Secure • Smart
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
