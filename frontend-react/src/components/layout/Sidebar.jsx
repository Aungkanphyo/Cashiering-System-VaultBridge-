export default function Sidebar({ currentView, setCurrentView }) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', section: 'MAIN' },
        { id: 'categories_view', label: 'Categories View', section: 'CATEGORY SETTINGS' },
        { id: 'add_category', label: 'Add Category', section: 'CATEGORY SETTINGS' },
        { id: 'products_view', label: 'Products View', section: 'PRODUCT SETTINGS' },
        { id: 'add_product', label: 'Add Product', section: 'PRODUCT SETTINGS' },
        { id: 'users', label: 'User & Cashiers', section: 'STAFF & SECURITY' }, // 👈 မင်း လက်ရှိလုပ်နေတဲ့ အပိုင်း
        { id: 'payment', label: 'Payment Methods', section: 'SYSTEM SETTINGS' },
        { id: 'sessions', label: 'Register Sessions', section: 'AUDITS' },
        { id: 'sales', label: 'Sales & Split Payments', section: 'AUDITS' }
    ];

    return (
        <div className="sidebar">
            <div className="logo-section"> MANDALAY MART </div>
            <nav>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-link ${currentView === item.id ? 'active' : ''}`}
                        onClick={() => setCurrentView(item.id)}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>
        </div>
    );
}