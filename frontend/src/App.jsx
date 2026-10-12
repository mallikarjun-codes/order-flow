import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

function App() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch inventory on mount
  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/inventory`);
      setInventory(res.data);
      if (!selectedProduct && res.data.length > 0) {
        setSelectedProduct(res.data[0].id); // Auto-select first item
      }
    } catch (error) {
      console.error("Failed to fetch inventory", error);
      setStatusMsg({ text: 'Error connecting to database', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMsg({ text: 'Processing transaction...', type: 'info' });

    try {
      // We hardcode customerId 1 for the demo since we skipped Auth
      const payload = {
        customerId: 1, 
        items: [{ productId: parseInt(selectedProduct), quantity: parseInt(quantity) }]
      };

      const res = await axios.post(`${API_BASE_URL}/orders`, payload);
      
      setStatusMsg({ text: `Success: ${res.data.message} (Order #${res.data.orderId})`, type: 'success' });
      
      // Re-fetch inventory to show the live database deduction
      await fetchInventory(); 
      
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message;
      setStatusMsg({ text: `Failed: ${errMsg}`, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">OrderFlow Admin</h1>
          <p className="text-gray-600">Event-Driven Transaction Monitor</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT PANEL: Checkout Simulator */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Checkout Simulator</h2>
            
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                <select 
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  disabled={loading}
                >
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} - ${item.price} (Stock: {item.stock_quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isProcessing}
                className={`w-full text-white font-bold py-2 px-4 rounded transition-colors ${
                  isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isProcessing ? 'Processing Transaction...' : 'Simulate Purchase'}
              </button>

              {statusMsg.text && (
                <div className={`p-3 rounded text-sm font-medium ${
                  statusMsg.type === 'error' ? 'bg-red-100 text-red-700' : 
                  statusMsg.type === 'success' ? 'bg-green-100 text-green-700' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  {statusMsg.text}
                </div>
              )}
            </form>
          </div>

          {/* RIGHT PANEL: Live Inventory DB State */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold">PostgreSQL State</h2>
              <button onClick={fetchInventory} className="text-sm text-blue-600 hover:underline">Refresh</button>
            </div>
            
            {loading ? (
              <p className="text-gray-500">Loading database state...</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 border-b text-sm font-medium text-gray-600">ID</th>
                    <th className="p-2 border-b text-sm font-medium text-gray-600">Product</th>
                    <th className="p-2 border-b text-sm font-medium text-gray-600">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-2 border-b text-gray-600">{item.id}</td>
                      <td className="p-2 border-b font-medium">{item.name}</td>
                      <td className={`p-2 border-b font-bold ${
                        item.stock_quantity === 0 ? 'text-red-600' : 
                        item.stock_quantity < 10 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {item.stock_quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;