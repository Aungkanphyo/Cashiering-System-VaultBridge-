import { useEffect, useState } from "react";
import api from "../../../../api/axios";
import { UserPlus, X } from "lucide-react";
import nrcData from "../../../../data/nrc.json";


const AddStaffModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: '', password: '', role: 'staff', status: 'Active',
        phone_number: '', nrc: '', date_of_birth: '', address: '',
        gender: 'Male', email: '', join_date: ''
    });

    // nrc states
    const [nrcState, setNrcState] = useState("");
    const [nrcTownship, setNrcTownship] = useState("");
    const [nrcType, setNrcType] = useState("(N)");
    const [nrcNumber, setNrcNumber] = useState("");
    const [availableTownships, setAvailableTownships] = useState([]);

    useEffect(() => {
        if (!nrcState || !nrcData || !nrcData.data) {
            setAvailableTownships([]);
            setNrcTownship("");
            return;
        }

        const filteredTownships = 
    }, [input])

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/staff', formData);
            if (response.data.status === 'success') {
                alert('New employee successfully added.');
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error(error);
            alert('There was an error while entering the data. Please check the data again.');
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-800">
                        {/* UserPlus Icon */}
                        <UserPlus className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                        <h3 className="text-lg font-bold text-gray-800">Add New Staff Profile</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        {/* X (Close) Icon */}
                        <X className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Full Name</label>
                            <input type="text" name="username" required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Password</label>
                            <input type="password" name="password" required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Email Address</label>
                            <input type="email" name="email" required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Phone Number</label>
                            <input type="text" name="phone_number" required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">NRC Number</label>
                            <input type="text" name="nrc" required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Gender</label>
                            <select name="gender" onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 bg-white rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Date of Birth</label>
                            <input type="date" name="date_of_birth" required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">System Role</label>
                            <select name="role" onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 bg-white rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800">
                                <option value="staff">Staff / Cashier</option>
                                <option value="admin">Admin / Manager</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Join Date</label>
                        <input type="date" name="join_date" required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Address</label>
                        <textarea name="address" required onChange={handleChange} rows="2" className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800 resize-none"></textarea>
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
