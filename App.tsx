
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  Sparkles, 
  Plus, 
  Minus,
  Trash2, 
  Search, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  Menu,
  X,
  Save,
  Printer,
  CheckCircle2,
  Settings,
  Store,
  Phone,
  MapPin,
  Tag,
  Percent
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { Product, CartItem, Transaction, View, StoreInfo } from './types';
import { getBusinessInsights } from './services/geminiService';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'iPhone 15 Pro', category: 'Điện thoại', price: 28000000, costPrice: 22000000, stock: 15, image: 'https://picsum.photos/seed/iphone/200/200', description: 'Apple flagship' },
  { id: '2', name: 'MacBook Air M2', category: 'Laptop', price: 24500000, costPrice: 19000000, stock: 8, image: 'https://picsum.photos/seed/macbook/200/200', description: 'Thin and light' },
  { id: '3', name: 'AirPods Pro 2', category: 'Phụ kiện', price: 5900000, costPrice: 4000000, stock: 45, image: 'https://picsum.photos/seed/airpods/200/200', description: 'Noise cancelling' },
  { id: '4', name: 'Sony WH-1000XM5', category: 'Phụ kiện', price: 8490000, costPrice: 6000000, stock: 4, image: 'https://picsum.photos/seed/sony/200/200', description: 'Premium headphones' },
];

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDiscountPercent, setCartDiscountPercent] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiInsights, setAiInsights] = useState<string>('Đang tải phân tích thông minh...');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Store Settings State
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: 'SMARTSHOP MANAGER',
    address: '123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh',
    phone: '0123.456.789'
  });

  // New Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    category: 'Điện thoại',
    price: 0,
    costPrice: 0,
    stock: 0,
    image: 'https://picsum.photos/seed/' + Math.random() + '/200/200',
    description: ''
  });

  // Last transaction for bill printing
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const stats = useMemo(() => {
    const totalSales = transactions.filter(t => t.type === 'sale').reduce((acc, curr) => acc + curr.total, 0);
    const totalPurchases = transactions.filter(t => t.type === 'purchase').reduce((acc, curr) => acc + curr.total, 0);
    const inventoryValue = products.reduce((acc, curr) => acc + (curr.stock * curr.price), 0);
    const lowStockCount = products.filter(p => p.stock < 10).length;
    return { totalSales, totalPurchases, inventoryValue, lowStockCount };
  }, [transactions, products]);

  const chartData = useMemo(() => {
    return transactions.slice(-7).map(t => ({
      name: new Date(t.date).toLocaleDateString('vi-VN', { weekday: 'short' }),
      total: t.total
    }));
  }, [transactions]);

  useEffect(() => {
    const loadInsights = async () => {
      const insights = await getBusinessInsights(products, transactions);
      setAiInsights(insights);
    };
    if (view === 'ai-insights' || view === 'dashboard') {
      loadInsights();
    }
  }, [view, products, transactions]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.price <= 0) {
      alert("Vui lòng nhập đầy đủ tên và giá sản phẩm!");
      return;
    }
    const productWithId: Product = {
      ...newProduct,
      id: Math.random().toString(36).substr(2, 9)
    };
    setProducts(prev => [productWithId, ...prev]);
    setIsAddModalOpen(false);
    setNewProduct({
      name: '', category: 'Điện thoại', price: 0, costPrice: 0, stock: 0,
      image: 'https://picsum.photos/seed/' + Math.random() + '/200/200',
      description: ''
    });
  };

  const deleteProduct = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing && existing.quantity >= product.stock) {
      alert(`Sản phẩm này chỉ còn ${product.stock} trong kho!`);
      return;
    }
    if (!existing && product.stock <= 0) {
      alert('Hết hàng!');
      return;
    }
    setCart(prev => {
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          const productInStock = products.find(p => p.id === id);
          if (newQty <= 0) return item;
          if (productInStock && newQty > productInStock.stock) {
            alert(`Chỉ còn tối đa ${productInStock.stock} sản phẩm trong kho!`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const printInvoice = (transaction: Transaction) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const subtotal = transaction.total + transaction.discount;
    const discountLabel = transaction.discount > 0 ? `Giảm giá (${((transaction.discount / subtotal) * 100).toFixed(0)}%)` : 'Giảm giá';

    const html = `
      <html>
        <head>
          <title>Hóa đơn #${transaction.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #4f46e5; text-transform: uppercase; }
            .header p { margin: 5px 0; color: #666; }
            .info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #eee; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .total-section { text-align: right; }
            .total-row { font-size: 20px; font-weight: bold; color: #4f46e5; margin-top: 10px; }
            .footer { text-align: center; margin-top: 50px; color: #94a3b8; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${storeInfo.name}</h1>
            <p>${storeInfo.address}</p>
            <p>Hotline: ${storeInfo.phone}</p>
          </div>
          <div class="info">
            <div>
              <p><strong>Mã hóa đơn:</strong> #${transaction.id}</p>
              <p><strong>Ngày tạo:</strong> ${new Date(transaction.date).toLocaleString('vi-VN')}</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Loại giao dịch:</strong> Bán lẻ</p>
              <p><strong>Trạng thái:</strong> Đã thanh toán</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th style="text-align: right;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${transaction.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price.toLocaleString()} đ</td>
                  <td style="text-align: right;">${(item.quantity * item.price).toLocaleString()} đ</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total-section">
            <p>Tạm tính: ${subtotal.toLocaleString()} đ</p>
            <p>${discountLabel}: - ${transaction.discount.toLocaleString()} đ</p>
            <div class="total-row">Tổng cộng: ${transaction.total.toLocaleString()} đ</div>
          </div>
          <div class="footer">
            <p>Cảm ơn quý khách đã mua sắm tại ${storeInfo.name}!</p>
            <p>Hẹn gặp lại quý khách lần sau.</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const checkout = () => {
    if (cart.length === 0) return;
    const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const discountAmount = Math.floor(subtotal * (cartDiscountPercent / 100));
    const total = Math.max(0, subtotal - discountAmount);
    
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toISOString(),
      items: [...cart],
      total,
      discount: discountAmount,
      type: 'sale'
    };
    setTransactions(prev => [...prev, newTransaction]);
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.quantity } : p;
    }));
    setLastTransaction(newTransaction);
    setShowSuccessModal(true);
    setCart([]);
    setCartDiscountPercent(0);
  };

  const handleStockIn = (id: string, amount: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: p.stock + amount } : p));
    const p = products.find(prod => prod.id === id);
    if (p) {
        const cost = p.costPrice * amount;
        setTransactions(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9).toUpperCase(),
            date: new Date().toISOString(),
            items: [{ ...p, quantity: amount }],
            total: cost,
            discount: 0,
            type: 'purchase'
        }]);
    }
  };

  const NavItem = ({ icon: Icon, label, target, color }: { icon: any, label: string, target: View, color: string }) => (
    <button 
      onClick={() => setView(target)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${view === target ? `bg-white shadow-sm text-${color}-600 font-semibold` : 'text-slate-500 hover:bg-slate-100'}`}
    >
      <Icon size={20} className={view === target ? `text-${color}-500` : ''} />
      <span>{label}</span>
    </button>
  );

  const cartSubtotal = useMemo(() => cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0), [cart]);
  const cartDiscountAmount = useMemo(() => Math.floor(cartSubtotal * (cartDiscountPercent / 100)), [cartSubtotal, cartDiscountPercent]);
  const cartTotal = useMemo(() => Math.max(0, cartSubtotal - cartDiscountAmount), [cartSubtotal, cartDiscountAmount]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Success Modal */}
      {showSuccessModal && lastTransaction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Thanh toán thành công!</h3>
            <p className="text-slate-500 mb-8">Đơn hàng <span className="font-mono font-bold text-slate-800">#{lastTransaction.id}</span> đã được lưu vào hệ thống.</p>
            
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => { printInvoice(lastTransaction); setShowSuccessModal(false); }}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Printer size={20} />
                <span>In hóa đơn (PDF)</span>
              </button>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Tiếp tục bán hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Thêm sản phẩm mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tên sản phẩm</label>
                  <input 
                    required type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
                    placeholder="VD: iPhone 15 Pro Max"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Danh mục</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option>Điện thoại</option><option>Laptop</option><option>Phụ kiện</option><option>Máy tính bảng</option><option>Khác</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Giá nhập (VNĐ)</label>
                  <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50" value={newProduct.costPrice} onChange={e => setNewProduct({...newProduct, costPrice: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Giá bán (VNĐ)</label>
                  <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Số lượng ban đầu</label>
                  <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">URL hình ảnh</label>
                  <div className="flex space-x-2">
                    <input type="text" className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 text-sm" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                      <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Mô tả</label>
                <textarea rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
              </div>
              <div className="flex space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-3 px-4 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2"><Save size={18} /><span>Lưu sản phẩm</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-50 border-r border-slate-200 transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center space-x-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><LayoutDashboard size={24} /></div>
          {isSidebarOpen && <span className="font-bold text-xl text-slate-800 tracking-tight">SmartShop</span>}
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={LayoutDashboard} label="Bảng điều khiển" target="dashboard" color="indigo" />
          <NavItem icon={Package} label="Kho hàng" target="inventory" color="blue" />
          <NavItem icon={ShoppingCart} label="Bán hàng (POS)" target="pos" color="emerald" />
          <NavItem icon={History} label="Lịch sử giao dịch" target="history" color="amber" />
          <NavItem icon={Sparkles} label="Phân tích AI" target="ai-insights" color="purple" />
          <NavItem icon={Settings} label="Cài đặt" target="settings" color="slate" />
        </nav>
        <div className="p-4 border-t border-slate-200">
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-200 text-slate-500">{isSidebarOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#fbfcfd]">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-slate-800 capitalize">
            {view === 'dashboard' && 'Tổng quan hệ thống'}
            {view === 'inventory' && 'Quản lý kho hàng'}
            {view === 'pos' && 'Điểm bán hàng'}
            {view === 'history' && 'Lịch sử giao dịch'}
            {view === 'ai-insights' && 'Trợ lý ảo AI'}
            {view === 'settings' && 'Cài đặt hệ thống'}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input type="text" placeholder="Tìm kiếm..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64 bg-slate-50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden"><img src="https://picsum.photos/seed/admin/40/40" alt="Admin" /></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {view === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Tổng doanh thu', value: stats.totalSales.toLocaleString() + ' đ', icon: TrendingUp, color: 'emerald', trend: '+12.5%' },
                  { label: 'Vốn nhập hàng', value: stats.totalPurchases.toLocaleString() + ' đ', icon: ArrowDownRight, color: 'rose', trend: '-2.4%' },
                  { label: 'Giá trị tồn kho', value: stats.inventoryValue.toLocaleString() + ' đ', icon: Package, color: 'blue', trend: '+5.1%' },
                  { label: 'Sản phẩm sắp hết', value: stats.lowStockCount, icon: ArrowUpRight, color: 'amber', trend: 'Cảnh báo' },
                ].map((item, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl bg-${item.color}-50 text-${item.color === 'rose' ? 'rose' : item.color === 'emerald' ? 'emerald' : item.color === 'blue' ? 'blue' : 'amber'}-600`}><item.icon size={24} /></div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{item.trend}</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{item.label}</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{item.value}</h3>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Biểu đồ doanh thu</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.length ? chartData : [{name: 'Empty', total: 0}]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={4} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-4"><Sparkles className="text-indigo-200" size={24} /><h3 className="text-lg font-bold">Smart Insights (AI)</h3></div>
                    <div className="bg-indigo-500/30 rounded-xl p-4 min-h-[150px]"><p className="text-indigo-50 leading-relaxed italic">"{aiInsights}"</p></div>
                  </div>
                  <button onClick={() => setView('ai-insights')} className="mt-6 w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2"><span>Xem chi tiết</span><ChevronRight size={18} /></button>
                </div>
              </div>
            </div>
          )}

          {view === 'inventory' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Danh sách sản phẩm</h3>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"><Plus size={18} /><span>Thêm sản phẩm</span></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">Sản phẩm</th><th className="px-6 py-4">Danh mục</th><th className="px-6 py-4">Giá bán</th><th className="px-6 py-4">Tồn kho</th><th className="px-6 py-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4"><div className="flex items-center space-x-3"><img src={product.image} className="w-10 h-10 rounded-lg object-cover" alt="" /><span className="font-medium text-slate-700">{product.name}</span></div></td>
                        <td className="px-6 py-4"><span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{product.category}</span></td>
                        <td className="px-6 py-4 font-semibold text-slate-800">{product.price.toLocaleString()} đ</td>
                        <td className="px-6 py-4"><div className="flex items-center space-x-2"><span className={`font-bold ${product.stock < 10 ? 'text-rose-600' : 'text-slate-700'}`}>{product.stock}</span><button onClick={() => handleStockIn(product.id, 10)} className="opacity-0 group-hover:opacity-100 bg-emerald-100 text-emerald-600 p-1 rounded-md hover:bg-emerald-200 transition-all" title="Nhập thêm 10"><Plus size={14} /></button></div></td>
                        <td className="px-6 py-4 text-center"><div className="flex justify-center space-x-3"><button onClick={() => deleteProduct(product.id)} className="text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === 'pos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-500">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                    <div key={product.id} onClick={() => addToCart(product)} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer group transition-all">
                      <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-slate-50"><img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" alt="" /></div>
                      <h4 className="font-bold text-slate-800 line-clamp-1">{product.name}</h4>
                      <p className="text-indigo-600 font-bold mt-1">{product.price.toLocaleString()} đ</p>
                      <div className="mt-2 flex justify-between items-center"><span className="text-xs text-slate-500">Kho: {product.stock}</span><div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Plus size={16} /></div></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xl flex flex-col h-[calc(100vh-200px)] sticky top-0">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between"><h3 className="text-lg font-bold text-slate-800">Giỏ hàng</h3><span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-xs font-bold">{cart.length} món</span></div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400"><ShoppingCart size={48} className="mb-4 opacity-20" /><p>Giỏ hàng đang trống</p></div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex flex-col bg-slate-50 p-3 rounded-xl space-y-3">
                        <div className="flex items-center space-x-3">
                          <img src={item.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                          <div className="flex-1"><h5 className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</h5><span className="text-xs text-slate-500 font-medium">{item.price.toLocaleString()} đ</span></div>
                          <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-1">
                            <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 rounded-md text-slate-500 disabled:opacity-30" disabled={item.quantity <= 1}><Minus size={14} /></button>
                            <span className="w-8 text-center text-sm font-bold text-slate-700">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 rounded-md text-indigo-600"><Plus size={14} /></button>
                          </div>
                          <div className="text-right"><span className="text-sm font-bold text-indigo-600">{(item.quantity * item.price).toLocaleString()} đ</span></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-6 border-t border-slate-100 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Percent size={12} />
                        <span>Giảm giá theo %</span>
                      </div>
                      <span className="text-rose-500">{cartDiscountAmount.toLocaleString()} đ</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        max="100"
                        min="0"
                        className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-bold text-rose-600"
                        placeholder="Nhập % giảm..."
                        value={cartDiscountPercent || ''}
                        onChange={(e) => setCartDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 text-sm">
                    <span>Tạm tính</span>
                    <span>{cartSubtotal.toLocaleString()} đ</span>
                  </div>
                  {cartDiscountPercent > 0 && (
                    <div className="flex justify-between items-center text-rose-500 text-sm">
                      <span>Giảm giá ({cartDiscountPercent}%)</span>
                      <span>- {cartDiscountAmount.toLocaleString()} đ</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-black text-slate-800 pt-2 border-t border-slate-100 border-dashed">
                    <span>Tổng cộng</span>
                    <span className="text-indigo-600">
                      {cartTotal.toLocaleString()} đ
                    </span>
                  </div>
                  <button disabled={cart.length === 0} onClick={checkout} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200">Thanh toán</button>
                </div>
              </div>
            </div>
          )}

          {view === 'history' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800">Lịch sử giao dịch</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase tracking-wider">
                        <th className="px-6 py-4">Mã đơn</th><th className="px-6 py-4">Loại</th><th className="px-6 py-4">Thời gian</th><th className="px-6 py-4">Chi tiết</th><th className="px-6 py-4 text-right">Giảm giá</th><th className="px-6 py-4 text-right">Thao tác</th><th className="px-6 py-4 text-right">Tổng tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-12 text-slate-400">Chưa có giao dịch nào</td></tr>
                      ) : (
                        transactions.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-sm text-slate-600 font-bold">#{t.id}</td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${t.type === 'sale' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{t.type === 'sale' ? 'Bán ra' : 'Nhập hàng'}</span></td>
                            <td className="px-6 py-4 text-slate-600 text-sm">{new Date(t.date).toLocaleString('vi-VN')}</td>
                            <td className="px-6 py-4 text-slate-500 text-sm line-clamp-1">{t.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}</td>
                            <td className="px-6 py-4 text-right text-rose-500 text-sm">{t.discount > 0 ? `-${t.discount.toLocaleString()}` : '-'}</td>
                            <td className="px-6 py-4 text-right"><button onClick={() => printInvoice(t)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Printer size={18} /></button></td>
                            <td className="px-6 py-4 text-right font-bold text-slate-800">{t.total.toLocaleString()} đ</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                 </table>
               </div>
            </div>
          )}

          {view === 'ai-insights' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
               <div className="text-center space-y-4">
                 <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl shadow-indigo-200"><Sparkles size={40} /></div>
                 <h2 className="text-3xl font-black text-slate-800">Trợ lý Phân tích Thông minh</h2>
                 <p className="text-slate-500">Phân tích dữ liệu kinh doanh của bạn bằng sức mạnh của Gemini AI</p>
               </div>
               <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl space-y-6">
                 <div className="flex items-center space-x-3 text-indigo-600"><TrendingUp size={24} /><h4 className="font-bold text-lg">Báo cáo tóm tắt từ AI</h4></div>
                 <div className="prose prose-slate max-w-none"><div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed text-lg italic">"{aiInsights}"</div></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                   <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100"><h5 className="font-bold text-emerald-800 mb-2">Đề xuất tối ưu</h5><p className="text-sm text-emerald-700">Dựa trên xu hướng mua hàng, bạn nên cân nhắc nhập thêm các mặt hàng thuộc danh mục "Phụ kiện" vì tốc độ xoay vòng vốn đang ở mức cao.</p></div>
                   <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100"><h5 className="font-bold text-rose-800 mb-2">Rủi rỏ cần lưu ý</h5><p className="text-sm text-rose-700">Giá trị tồn kho Laptop đang tăng nhưng doanh số bán ra chậm lại. Hãy xem xét các chương trình khuyến mãi để kích cầu.</p></div>
                 </div>
               </div>
            </div>
          )}

          {view === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
               <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                 <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center space-x-3 text-slate-800 mb-2">
                      <Store className="text-indigo-600" size={28} />
                      <h3 className="text-2xl font-bold">Thông tin cửa hàng</h3>
                    </div>
                    <p className="text-slate-500">Thông tin này sẽ xuất hiện trên hóa đơn (Bill) in ra cho khách hàng.</p>
                 </div>
                 
                 <div className="p-8 space-y-6">
                   <div className="space-y-2">
                     <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                       <Store size={16} className="text-slate-400" />
                       <span>Tên cửa hàng</span>
                     </label>
                     <input 
                       type="text" 
                       className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-lg font-medium"
                       value={storeInfo.name}
                       onChange={e => setStoreInfo({...storeInfo, name: e.target.value})}
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                       <MapPin size={16} className="text-slate-400" />
                       <span>Địa chỉ</span>
                     </label>
                     <input 
                       type="text" 
                       className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                       value={storeInfo.address}
                       onChange={e => setStoreInfo({...storeInfo, address: e.target.value})}
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                       <Phone size={16} className="text-slate-400" />
                       <span>Số điện thoại / Hotline</span>
                     </label>
                     <input 
                       type="text" 
                       className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                       value={storeInfo.phone}
                       onChange={e => setStoreInfo({...storeInfo, phone: e.target.value})}
                     />
                   </div>

                   <div className="pt-6">
                     <div className="bg-indigo-50 p-4 rounded-2xl flex items-start space-x-3">
                        <Sparkles className="text-indigo-600 shrink-0 mt-1" size={20} />
                        <p className="text-sm text-indigo-700 leading-relaxed">
                          Hệ thống sẽ tự động cập nhật thông tin này vào mẫu hóa đơn PDF ngay sau khi bạn thay đổi. Bạn không cần nhấn nút lưu riêng biệt.
                        </p>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
