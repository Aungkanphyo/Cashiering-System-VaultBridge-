import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Role logic Mockup (this will need to be modified if connect to the API)
        if (email.includes('admin')) {
            navigate('/admin/dashboard');
        } else {
            navigate('/cashier/sale');
        }
    }
    return (
        <div className="w-full h-screen flex bg-white font-sans">
            {/* Left side: Login Form */}
            <div className="w-1/2 flex flex-col justify-center items-center px-20">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 text-[#5e66f3] font-bold text-3xl">
                            <ShoppingCart className="w-8 h-8" />
                            <span>Mart4U</span>
                        </div>
                        <p className="text-gray-400 text-xs font-semibold tracking-wider mt-1">Smart POS System</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5 pt-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter admin@gmail.com or cashier@gmail.com"
                                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#5e66f3] hover:bg-[#4d54d6] text-white font-bold py-3 rounded-full shadow-lg shadow-indigo-500/20 transition-all text-sm tracking-wide"
                        >
                            Login
                        </button>

                        <div className="text-center pt-2">
                            <button type="button" className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                                Forget Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right side: Graphics Banner */}
            <div className="w-1/2 bg-[#a3b3fd] flex flex-col justify-center items-center p-12 relative overflow-hidden">
                <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md transform translate-y-4 transition-transform duration-500">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="flex items-center gap-2 text-[#5e66f3] font-black text-4xl">
                            <ShoppingCart className="w-10 h-10" />
                            <span>Mart 4U</span>
                        </div>
                        <p className="text-gray-500 font-medium text-sm max-w-xs">
                            Simply the Best for Your Retail Business
                        </p>
                        <div className="w-full h-40 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100/50">
                            <span className="text-xs text-indigo-300 font-mono">[ Illustration Vector Workspace ]</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
