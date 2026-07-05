import { useState } from "react";
import api from "../../../../api/axios";
import { UserRoundPen, X } from "lucide-react";


const EditStaffModal = ({ onClose, staff, onSuccess }) => {

    const [formData, setFormData] = useState({
        username: staff.username || '',
        phone_number: staff.phone_number || '',
        nrc: staff.nrc || '',
        date_of_birth: staff.date_of_birth || '',
        address: staff.address || '',
        gender: staff.gender || 'Male',
        email: staff.email || '',
        join_date: staff.join_date || ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/staff/${staff.user_id}`, formData);
            if (response.data.status === 'success') {
                alert('Employee information has been edited.');
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error(error);
            alert('There was an error while editing.');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-800">
                        {/* UserRoundPen Icon */}
                        <UserRoundPen className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                        <h3 className="text-lg font-bold text-gray-800">Edit Staff Profile</h3>
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
                            <input type="text" name="username" value={formData.username} required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Password</label>
                            <input type="password" name="password" placeholder="•••••••• (Leave blank if unchanged)" onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800 placeholder-gray-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Email Address</label>
                            <input type="email" name="email" value={formData.email} required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Phone Number</label>
                            <input type="text" name="phone_number" value={formData.phone_number} required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">NRC Number</label>
                            <input type="text" name="nrc" value={formData.nrc} required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 bg-white rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Date of Birth</label>
                            <input type="date" name="date_of_birth" value={formData.date_of_birth} required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">System Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 bg-white rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800">
                                <option value="staff">Staff / Cashier</option>
                                <option value="admin">Admin / Manager</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Joining Date</label>
                        <input type="date" name="join_date" value={formData.join_date} required onChange={handleChange} className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Home Address</label>
                        <textarea name="address" value={formData.address} required onChange={handleChange} rows="3" className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-gray-800 resize-none"></textarea>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition">Save Staff Profile</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditStaffModal
