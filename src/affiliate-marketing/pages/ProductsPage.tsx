import React, { useState } from 'react';
import { Search, Plus, Copy, Check, ExternalLink, Trash2, FolderPlus, Package, ChevronDown } from 'lucide-react';
import { mockProducts, mockProductLists, mockAffiliateLinks } from '../services/mockData';
import { Product, ProductCategory, ProductList } from '../types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [productLists] = useState<ProductList[]>(mockProductLists);
  const [showAddModal, setShowAddModal] = useState(false);
  const [shopeeUrl, setShopeeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedProduct, setParsedProduct] = useState<Partial<Product> | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');

  const handleParseUrl = async () => {
    if (!shopeeUrl) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setParsedProduct({
      name: '智能手錶 運動手環 心率監測',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
      price: 899,
      category: '3C',
      sourceUrl: shopeeUrl,
      commissionRate: 0.05,
    });
    setIsLoading(false);
  };

  const handleAddProduct = () => {
    if (!parsedProduct) return;
    const newProduct: Product = {
      id: Date.now().toString(),
      name: parsedProduct.name!,
      imageUrl: parsedProduct.imageUrl!,
      price: parsedProduct.price!,
      category: parsedProduct.category as ProductCategory,
      commissionRate: parsedProduct.commissionRate!,
      sourceUrl: parsedProduct.sourceUrl!,
      createdAt: new Date().toISOString(),
    };
    setProducts([newProduct, ...products]);
    setShowAddModal(false);
    setShopeeUrl('');
    setParsedProduct(null);
  };

  const handleCopyLink = async (productId: string) => {
    const link = mockAffiliateLinks.find((l) => l.productId === productId);
    await navigator.clipboard.writeText(link?.shortUrl || `https://aff.tw/s/${productId}`);
    setCopiedId(productId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories: ProductCategory[] = ['生活小物', '美妝', '3C', '服飾', '食品', '家電', '其他'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">選品 & 商品庫</h1>
          <p className="text-gray-600">管理你的蝦皮聯盟商品</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          <Plus className="w-5 h-5" />新增商品
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜尋商品名稱..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
        </div>
        <div className="relative">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | 'all')} className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white">
            <option value="all">所有類別</option>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Product Lists */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {productLists.map((list) => (
          <div key={list.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition cursor-pointer">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{list.name}</h3>
              <span className="text-sm text-gray-500">{list.productIds.length} 商品</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{list.description}</p>
          </div>
        ))}
        <button className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition">
          <FolderPlus className="w-5 h-5" />新增清單
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const affiliateLink = mockAffiliateLinks.find((l) => l.productId === product.id);
          return (
            <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition">
              <div className="aspect-video bg-gray-100 relative">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 px-2 py-1 bg-white/90 text-sm rounded-md font-medium">{product.category}</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xl font-bold text-indigo-600">${product.price}</span>
                  <span className="text-sm text-gray-500">傭金 {(product.commissionRate * 100).toFixed(0)}%</span>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">聯盟短網址</span>
                    <span className="text-gray-500">{affiliateLink?.clicks || 0} 點擊</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 text-sm text-indigo-600 truncate">{affiliateLink?.shortUrl || `https://aff.tw/s/${product.id}`}</code>
                    <button onClick={() => handleCopyLink(product.id)} className="p-1.5 text-gray-400 hover:text-indigo-600 transition">
                      {copiedId === product.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <ExternalLink className="w-4 h-4" />查看商品
                  </a>
                  <button className="p-2 text-gray-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>找不到符合條件的商品</p>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">新增商品</h2>
              <p className="text-gray-600 mt-1">貼上蝦皮商品網址，自動抓取資訊</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">蝦皮商品網址</label>
                <div className="flex gap-2">
                  <input type="url" value={shopeeUrl} onChange={(e) => setShopeeUrl(e.target.value)} placeholder="https://shopee.tw/product/..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                  <button onClick={handleParseUrl} disabled={!shopeeUrl || isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? '解析中...' : '解析'}
                  </button>
                </div>
              </div>
              {parsedProduct && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-4">
                    <img src={parsedProduct.imageUrl} alt={parsedProduct.name} className="w-24 h-24 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{parsedProduct.name}</h3>
                      <p className="text-xl font-bold text-indigo-600 mt-1">${parsedProduct.price}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>類別：{parsedProduct.category}</span>
                        <span>傭金：{(parsedProduct.commissionRate! * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => { setShowAddModal(false); setShopeeUrl(''); setParsedProduct(null); }} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">取消</button>
              <button onClick={handleAddProduct} disabled={!parsedProduct} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed">新增商品</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
