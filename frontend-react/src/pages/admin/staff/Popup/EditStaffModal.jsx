import { useState } from "react";
import api from "../../../../api/axios";


const EditStaffModal = ({ onClose, staff, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: staff?.username || '',
        phone_number: staff?.phone_number || '',
        nrc: staff?.nrc || '',
        date_of_birth: staff?.date_of_birth || '',
        address: staff?.address || '',
        gender: staff?.gender || 'Male',
        email: staff?.email || '',
        join_date: staff?.join_date || ''
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg w-125 shadow-2xl overflow-hidden border border-gray-300">
                <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Edit Staff: {staff.username}</h3>
                    <button onClick={onClose} className="text-white text-xl font-bold">✖</button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-3 text-sm max-h-[80vh] overflow-y-auto">
                    <div>
                        <label className="block font-semibold mb-1">Username</label>
                        <input type="text" name="username" value={formData.username} required onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold mb-1">Email</label>
                            <input type="email" name="email" value={formData.email} required onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Phone Number</label>
                            <input type="text" name="phone_number" value={formData.phone_number} required onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold mb-1">NRC Number</label>
                            <input type="text" name="nrc" value={formData.nrc} required onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border p-2 rounded">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold mb-1">Date of Birth</label>
                            <input type="date" name="date_of_birth" value={formData.date_of_birth} required onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Join Date</label>
                            <input type="date" name="join_date" value={formData.join_date} required onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Address</label>
                        <textarea name="address" value={formData.address} required onChange={handleChange} rows="2" className="w-full border p-2 rounded"></textarea>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded font-medium">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">Update</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditStaffModal
