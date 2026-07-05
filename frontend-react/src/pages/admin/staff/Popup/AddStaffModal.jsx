import { useState } from "react";
import api from "../../../../api/axios";


const AddStaffModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: '', password: '', role: 'staff', status: 'Active',
        phone_number: '', nrc: '', date_of_birth: '', address: '',
        gender: 'Male', email: '', join_date: ''
    });

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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg w-125 shadow-2xl overflow-hidden border border-gray-300">
                <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Add New Staff</h3>
                    <button onClick={onClose} className="text-white text-xl font-bold">✖</button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-3 text-sm max-h-[80vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold mb-1">Username</label>
                            <input type="text" name="username" required onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Password</label>
                            <input type="password" name="password" required onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold mb-1">Email</label>
                            <input type="email" name="email" required onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Phone Number</label>
                            <input type="text" name="phone_number" required onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold mb-1">NRC Number</label>
                            <input type="text" name="nrc" required onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Gender</label>
                            <select name="gender" onChange={handleChange} className="w-full border p-2 rounded">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold mb-1">Date of Birth</label>
                            <input type="date" name="date_of_birth" required onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Join Date</label>
                            <input type="date" name="join_date" required onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Address</label>
                        <textarea name="address" required onChange={handleChange} rows="2" className="w-full border p-2 rounded"></textarea>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded font-medium">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddStaffModal
