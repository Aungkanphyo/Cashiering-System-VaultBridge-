import { useState } from 'react';
import NrcInput from './NrcInput';

export default function AddStaffModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        fullName: '', password: '', phone: '', nrc: '',
        dob: '', gender: 'Male', role: 'Cashier',
        joiningDate: '2026-01-01', address: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("ထည့်သွင်းမည့် ဝန်ထမ်း Data:", formData);
        // TODO: Backend ချိတ်ဆက်သည့်အခါ ဤနေရာတွင် API Call ခေါ်ယူမည်
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>➕ Add New Staff Profile</h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group-grid">
                        <div>
                            <label>FULL NAME</label>
                            <input type="text" placeholder="e.g. Phyo Maung" onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
                        </div>
                        <div>
                            <label>PASSWORD</label>
                            <input type="password" placeholder="••••••••" onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                        </div>
                        <div>
                            <label>PHONE NUMBER</label>
                            <input type="text" placeholder="e.g. 0996847385" onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                        </div>
                        <div>
                            <label>NRC NUMBER</label>
                            {/* Custom NRC Component ကို အသုံးပြုခြင်း */}
                            <NrcInput value={formData.nrc} onChange={(val) => setFormData({ ...formData, nrc: val })} />
                        </div>
                        <div>
                            <label>DATE OF BIRTH</label>
                            <input type="date" onChange={e => setFormData({ ...formData, dob: e.target.value })} required />
                        </div>
                        <div>
                            <label>GENDER</label>
                            <select onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                <option value="Male">Male (ကျား)</option>
                                <option value="Female">Female (မ)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group-full">
                        <label>SYSTEM ROLE</label>
                        <select onChange={e => setFormData({ ...formData, role: e.target.value })}>
                            <option value="Cashier">Cashier (ကောင်တာစာရေး)</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-group-full">
                        <label>JOINING DATE</label>
                        <input type="date" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} required />
                    </div>

                    <div className="form-group-full">
                        <label>ADDRESS</label>
                        <textarea placeholder="e.g. Room 4, Building B..." onChange={e => setFormData({ ...formData, address: e.target.value })} required />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                        <button type="submit" className="btn-save">Save Staff Profile</button>
                    </div>
                </form>
            </div>
        </div>
    );
}