import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Menu, X, Shield, Truck, Phone, 
  ArrowRight, CheckCircle, AlertCircle, Settings, Trash2, 
  Plus, Edit, Eye, Filter, RefreshCw, ChevronRight, Lock, User
} from 'lucide-react';
import { supabase } from './supabase';

export default function App() {
  // Estados de navegación y vistas
  const [currentView, setCurrentView] = useState('home'); // 'home', 'shop', 'gold', 'about', 'contact', 'admin', 'product-detail'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  
  // Carrito de compras
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ore_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistencia del carrito
  useEffect(() => {
    localStorage.setItem('ore_cart', JSON.stringify(cart));
  }, [cart]);

  // Catálogo de demostración (en caso de que Supabase esté vacío)
  const sampleProducts = [
    {
      id: 1,
      name: 'Anillo Solitario Clásico',
      category: 'Anillos',
      material: 'Oro 18k',
      price: 285000,
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      description: 'Elegante anillo solitario en oro amarillo de 18 kilates con acabado pulido a mano.',
      sizes: ['12', '14', '16', '18'],
      stock: 5,
      featured: true
    },
    {
      id: 2,
      name: 'Pulsera Eslabón Cartier',
      category: 'Pulseras',
      material: 'Plata con Oro',
      price: 142000,
      image: 'https://images.unsplash.com/photo-1611591475281-197e4125b682?auto=format&fit=crop&w=800&q=80',
      description: 'Pulsera combinada en plata 925 con apliques de oro de 18k.',
      sizes: ['18cm', '20cm'],
      stock: 3,
      featured: true
    },
    {
      id: 3,
      name: 'Anillo Minimalista Texturado',
      category: 'Anillos',
      material: 'Plata',
      price: 48000,
      image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
      description: 'Anillo de plata 925 con textura martillada artesanal.',
      sizes: ['10', '12', '14', '16', '20'],
      stock: 8,
      featured: true
    },
    {
      id: 4,
      name: 'Pulsera Rigida Bicolor',
      category: 'Pulseras',
      material: 'Oro 18k',
      price: 420000,
      image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80',
      description: 'Pulsera rígida de diseño contemporáneo en oro 18k.',
      sizes: ['17cm', '19cm'],
      stock: 2,
      featured: true
    }
  ];

  const [products, setProducts] = useState(sampleProducts);
  
  // Filtros de Tienda
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterMaterial, setFilterMaterial] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de Admin
  const [adminPin, setAdminPin] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminTab, setAdminTab] = useState('products'); // 'products', 'orders', 'gold'
  
  // Consultas de Compra de Oro
  const [goldForm, setGoldForm] = useState({
    name: '',
    phone: '',
    email: '',
    pieceType: 'Anillo',
    karat: '18k',
    weight: '',
    description: '',
    file: null
  });
  const [goldSubmissions, setGoldSubmissions] = useState([]);
  const [goldSuccess, setGoldSuccess] = useState(false);

  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [buyerInfo, setBuyerInfo] = useState({
    name: '', email: '', phone: '', address: '', city: '', province: 'Mendoza', postalCode: '', paymentMethod: 'transfer'
  });
  const [orderPlaced, setOrderPlaced] = useState(null);

  // Funciones de Carrito
  const addToCart = (product, selectedSize) => {
    const itemKey = `${product.id}-${selectedSize || 'unico'}`;
    const existing = cart.find(item => item.cartKey === itemKey);
    if (existing) {
      setCart(cart.map(item => item.cartKey === itemKey ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, selectedSize: selectedSize || 'Estándar', qty: 1, cartKey: itemKey }]);
    }
    setCartOpen(true);
  };

  const updateQty = (cartKey, delta) => {
    setCart(cart.map(item => {
      if (item.cartKey === cartKey) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (cartKey) => {
    setCart(cart.filter(item => item.cartKey !== cartKey));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Manejo de Compra de Oro
  const handleGoldSubmit = (e) => {
    e.preventDefault();
    const newSubmission = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      ...goldForm,
      status: 'Nueva'
    };
    setGoldSubmissions([newSubmission, ...goldSubmissions]);
    setGoldSuccess(true);
    setGoldForm({ name: '', phone: '', email: '', pieceType: 'Anillo', karat: '18k', weight: '', description: '', file: null });
  };

  return (
    <div className="min-h-screen bg-ore-dark text-ore-cream flex flex-col font-sans selection:bg-ore-gold selection:text-ore-dark">
      
      {/* AVISO DE DEMOSTRACIÓN */}
      <div className="bg-ore-gold text-ore-dark text-xs font-semibold py-1.5 px-4 text-center tracking-wider flex items-center justify-center gap-2">
        <AlertCircle size={14} />
        <span>ENTORNO DE DEMOSTRACIÓN — Pagos en línea deshabilitados hasta configurar credenciales</span>
      </div>

      {/* ENCABEZADO */}
      <header className="sticky top-0 z-40 bg-ore-dark/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Menú Móvil Botón */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-ore-cream p-2">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* LOGO INSTITUCIONAL CON EMBLEMA EXACTO */}
          <div onClick={() => setCurrentView('home')} className="cursor-pointer flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-ore-gold flex items-center justify-center p-0.5 shadow-lg">
              <div className="w-full h-full rounded-full border border-ore-gold/50 flex flex-col items-center justify-center bg-ore-card">
                <span className="font-serif text-ore-gold font-bold text-xs tracking-tighter">ORE</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl tracking-widest text-ore-cream font-semibold">ORE</span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-ore-gold">Joyería</span>
            </div>
          </div>

          {/* MENÚ DE NAVEGACIÓN ESCRITORIO */}
          <nav className="hidden md:flex items-center space-x-8 text-sm tracking-wide">
            <button onClick={() => setCurrentView('shop')} className={`transition hover:text-ore-gold ${currentView === 'shop' ? 'text-ore-gold border-b border-ore-gold pb-1' : 'text-ore-cream/80'}`}>Tienda</button>
            <button onClick={() => setCurrentView('gold')} className={`transition hover:text-ore-gold ${currentView === 'gold' ? 'text-ore-gold border-b border-ore-gold pb-1' : 'text-ore-cream/80'}`}>Compramos oro</button>
            <button onClick={() => setCurrentView('about')} className={`transition hover:text-ore-gold ${currentView === 'about' ? 'text-ore-gold border-b border-ore-gold pb-1' : 'text-ore-cream/80'}`}>Nosotros</button>
            <button onClick={() => setCurrentView('contact')} className={`transition hover:text-ore-gold ${currentView === 'contact' ? 'text-ore-gold border-b border-ore-gold pb-1' : 'text-ore-cream/80'}`}>Contacto</button>
          </nav>

          {/* ACCIONES (Buscador, Carrito, Admin) */}
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView('admin')} className="text-ore-cream/70 hover:text-ore-gold transition" title="Panel de Administración">
              <Settings size={20} />
            </button>
            <button onClick={() => setCartOpen(true)} className="relative text-ore-cream hover:text-ore-gold transition p-2">
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-ore-gold text-ore-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-ore-card border-b border-white/10 px-6 py-4 space-y-4">
          <button onClick={() => { setCurrentView('shop'); setMobileMenuOpen(false); }} className="block w-text-left py-2 text-ore-cream">Tienda</button>
          <button onClick={() => { setCurrentView('gold'); setMobileMenuOpen(false); }} className="block w-text-left py-2 text-ore-cream">Compramos oro</button>
          <button onClick={() => { setCurrentView('about'); setMobileMenuOpen(false); }} className="block w-text-left py-2 text-ore-cream">Nosotros</button>
          <button onClick={() => { setCurrentView('contact'); setMobileMenuOpen(false); }} className="block w-text-left py-2 text-ore-cream">Contacto</button>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL SEGÚN VISTA */}
      <main className="flex-grow">
        
        {/* VISTA: INICIO */}
        {currentView === 'home' && (
          <div>
            {/* PORTADA EDITORIAL */}
            <section className="relative h-[80vh] flex items-center justify-center text-center px-4 overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1920&q=80" 
                  alt="Joyería ORE" 
                  className="w-full h-full object-cover opacity-40 brightness-75 scale-105 animate-pulse duration-[10000ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ore-dark via-ore-dark/40 to-transparent"></div>
              </div>
              
              <div className="relative z-10 max-w-3xl space-y-6">
                <span className="text-ore-gold uppercase tracking-[0.3em] text-xs font-semibold">Alta Joyería Contemporánea</span>
                <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-wide leading-tight">Joyas que acompañan tu historia</h1>
                <p className="text-ore-cream/80 text-sm sm:text-base max-w-xl mx-auto font-light">Diseños exclusivos en plata, plata con oro y oro 18k creados para perdurar en el tiempo.</p>
                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => setCurrentView('shop')} className="bg-ore-gold text-ore-dark font-semibold px-8 py-3.5 tracking-wider uppercase text-xs hover:bg-ore-gold-light transition shadow-lg">
                    Explorar colección
                  </button>
                  <button onClick={() => setCurrentView('gold')} className="border border-ore-gold text-ore-gold hover:bg-ore-gold/10 font-semibold px-8 py-3.5 tracking-wider uppercase text-xs transition">
                    Vender mi oro
                  </button>
                </div>
              </div>
            </section>

            {/* ACCESOS MATERIALES */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => { setFilterMaterial('Plata'); setCurrentView('shop'); }} className="group relative h-64 rounded-lg overflow-hidden cursor-pointer shadow-xl">
                  <img src="https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80" alt="Plata" className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-ore-dark via-ore-dark/20 to-transparent flex items-end p-6">
                    <div>
                      <h3 className="font-serif text-xl font-medium text-ore-cream">Plata 925</h3>
                      <p className="text-xs text-ore-gold tracking-wider uppercase mt-1">Ver piezas</p>
                    </div>
                  </div>
                </div>
                <div onClick={() => { setFilterMaterial('Plata con Oro'); setCurrentView('shop'); }} className="group relative h-64 rounded-lg overflow-hidden cursor-pointer shadow-xl">
                  <img src="https://images.unsplash.com/photo-1611591475281-197e4125b682?auto=format&fit=crop&w=600&q=80" alt="Plata con Oro" className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-ore-dark via-ore-dark/20 to-transparent flex items-end p-6">
                    <div>
                      <h3 className="font-serif text-xl font-medium text-ore-cream">Plata con Oro</h3>
                      <p className="text-xs text-ore-gold tracking-wider uppercase mt-1">Ver piezas</p>
                    </div>
                  </div>
                </div>
                <div onClick={() => { setFilterMaterial('Oro 18k'); setCurrentView('shop'); }} className="group relative h-64 rounded-lg overflow-hidden cursor-pointer shadow-xl">
                  <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80" alt="Oro 18k" className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-ore-dark via-ore-dark/20 to-transparent flex items-end p-6">
                    <div>
                      <h3 className="font-serif text-xl font-medium text-ore-cream">Oro 18k</h3>
                      <p className="text-xs text-ore-gold tracking-wider uppercase mt-1">Ver piezas</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* PRODUCTOS DESTACADOS */}
            <section className="py-16 bg-ore-card/50 border-t border-b border-white/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <span className="text-ore-gold text-xs uppercase tracking-[0.2em] font-semibold">Selección exclusiva</span>
                    <h2 className="font-serif text-3xl mt-1">Piezas Destacadas</h2>
                  </div>
                  <button onClick={() => setCurrentView('shop')} className="text-xs uppercase tracking-widest text-ore-gold hover:underline flex items-center gap-1">
                    Ver todo <ArrowRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {products.filter(p => p.featured).map(product => (
                    <div key={product.id} className="group cursor-pointer bg-ore-card rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition border border-white/5 flex flex-col" onClick={() => { setSelectedProduct(product); setCurrentView('product-detail'); }}>
                      <div className="relative h-72 overflow-hidden bg-ore-dark">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                        <span className="absolute top-3 left-3 bg-ore-dark/80 backdrop-blur text-ore-gold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded">
                          {product.material}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-grow justify-between">
                        <div>
                          <p className="text-xs text-ore-muted uppercase tracking-wider">{product.category}</p>
                          <h3 className="font-serif text-lg font-medium mt-1 text-ore-cream group-hover:text-ore-gold transition">{product.name}</h3>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-ore-gold font-semibold text-lg">${product.price.toLocaleString('es-AR')}</span>
                          <span className="text-xs uppercase tracking-widest text-ore-cream/60 group-hover:text-ore-cream transition">Ver detalle</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* BLOQUE COMPRAMOS ORO BANNER */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-ore-card to-ore-dark border border-ore-gold/30 rounded-2xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                <div className="space-y-4 max-w-xl">
                  <span className="text-ore-gold text-xs uppercase tracking-[0.25em] font-semibold">Tasación y Adquisición</span>
                  <h2 className="font-serif text-3xl sm:text-4xl">Dale un nuevo valor a tu oro</h2>
                  <p className="text-ore-cream/80 text-sm leading-relaxed">Evaluamos tus piezas con transparencia y profesionalismo. Consultá online de forma segura y coordiná tu tasación presencial.</p>
                  <button onClick={() => setCurrentView('gold')} className="bg-ore-gold text-ore-dark font-semibold px-8 py-3.5 tracking-wider uppercase text-xs hover:bg-ore-gold-light transition shadow-lg inline-block">
                    Iniciar consulta de oro
                  </button>
                </div>
                <div className="w-full md:w-1/3 flex justify-center">
                  <div className="w-32 h-32 rounded-full border border-ore-gold/40 flex items-center justify-center p-2 shadow-2xl bg-ore-dark/50">
                    <Shield size={64} className="text-ore-gold animate-pulse" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VISTA: TIENDA / CATÁLOGO */}
        {currentView === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
              <h1 className="font-serif text-4xl mb-2">Catálogo de Joyas</h1>
              <p className="text-ore-muted text-sm">Explora nuestra colección de anillos y pulseras en metales nobles.</p>
            </div>

            {/* FILTROS Y BUSCADOR */}
            <div className="bg-ore-card p-6 rounded-lg border border-white/5 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search size={18} className="absolute left-3 top-3 text-ore-muted" />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre, material..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-ore-dark border border-white/10 rounded px-4 py-2 pl-10 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                />
              </div>

              <div className="flex flex-wrap gap-4 w-full md:w-auto">
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-ore-dark border border-white/10 rounded px-4 py-2 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                >
                  <option value="Todos">Todas las categorías</option>
                  <option value="Anillos">Anillos</option>
                  <option value="Pulseras">Pulseras</option>
                </select>

                <select 
                  value={filterMaterial} 
                  onChange={(e) => setFilterMaterial(e.target.value)}
                  className="bg-ore-dark border border-white/10 rounded px-4 py-2 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                >
                  <option value="Todos">Todos los materiales</option>
                  <option value="Plata">Plata</option>
                  <option value="Plata con Oro">Plata con Oro</option>
                  <option value="Oro 18k">Oro 18k</option>
                </select>
              </div>
            </div>

            {/* GRILLA DE PRODUCTOS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products
                .filter(p => filterCategory === 'Todos' || p.category === filterCategory)
                .filter(p => filterMaterial === 'Todos' || p.material === filterMaterial)
                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.material.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(product => (
                  <div key={product.id} className="group cursor-pointer bg-ore-card rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition border border-white/5 flex flex-col" onClick={() => { setSelectedProduct(product); setCurrentView('product-detail'); }}>
                    <div className="relative h-80 overflow-hidden bg-ore-dark">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                      <span className="absolute top-3 left-3 bg-ore-dark/80 backdrop-blur text-ore-gold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded">
                        {product.material}
                      </span>
                    </div>
                    <div className="p-6 flex flex-col flex-grow justify-between">
                      <div>
                        <p className="text-xs text-ore-muted uppercase tracking-wider">{product.category}</p>
                        <h3 className="font-serif text-xl font-medium mt-1 text-ore-cream">{product.name}</h3>
                      </div>
                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-ore-gold font-semibold text-xl">${product.price.toLocaleString('es-AR')}</span>
                        <span className="text-xs uppercase tracking-widest text-ore-gold underline">Ver pieza</span>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA: FICHA DE PRODUCTO */}
        {currentView === 'product-detail' && selectedProduct && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button onClick={() => setCurrentView('shop')} className="text-xs uppercase tracking-widest text-ore-gold mb-8 hover:underline flex items-center gap-2">
              ← Volver al catálogo
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="rounded-lg overflow-hidden border border-white/10 bg-ore-card">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-[500px] object-cover" />
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-xs text-ore-gold uppercase tracking-widest">{selectedProduct.material} • {selectedProduct.category}</span>
                  <h1 className="font-serif text-4xl mt-1">{selectedProduct.name}</h1>
                  <p className="text-2xl font-semibold text-ore-gold mt-4">${selectedProduct.price.toLocaleString('es-AR')}</p>
                </div>

                <p className="text-ore-cream/80 text-sm leading-relaxed">{selectedProduct.description}</p>

                {selectedProduct.sizes && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Seleccionar talle / medida:</label>
                    <div className="flex gap-3">
                      {selectedProduct.sizes.map(size => (
                        <button key={size} className="border border-white/20 hover:border-ore-gold px-4 py-2 rounded text-sm text-ore-cream transition">
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => addToCart(selectedProduct, selectedProduct.sizes ? selectedProduct.sizes[0] : null)}
                    className="flex-grow bg-ore-gold text-ore-dark font-semibold py-4 px-8 uppercase text-xs tracking-widest hover:bg-ore-gold-light transition shadow-lg"
                  >
                    Agregar al carrito
                  </button>
                </div>

                <div className="border-t border-white/10 pt-6 space-y-3 text-xs text-ore-muted">
                  <p>✓ Garantía oficial de calidad ORE</p>
                  <p>✓ Envíos a todo el país coordinados de forma segura</p>
                  <p>✓ Asesoramiento personalizado vía WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA: COMPRAMOS ORO */}
        {currentView === 'gold' && (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center space-y-4 mb-12">
              <span className="text-ore-gold text-xs uppercase tracking-[0.25em] font-semibold">Servicio Independiente</span>
              <h1 className="font-serif text-4xl sm:text-5xl">Compramos Oro</h1>
              <p className="text-ore-cream/80 max-w-xl mx-auto text-sm">El proceso es simple, transparente y confidencial. Tasamos tus piezas con rigurosidad profesional.</p>
            </div>

            {/* 3 PASOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="bg-ore-card p-6 rounded-lg border border-white/5 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-ore-gold/10 text-ore-gold flex items-center justify-center mx-auto font-serif font-bold">1</div>
                <h3 className="font-serif text-lg">Contanos qué pieza tenés</h3>
                <p className="text-xs text-ore-muted">Completá el formulario detallando tipo y peso aproximado.</p>
              </div>
              <div className="bg-ore-card p-6 rounded-lg border border-white/5 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-ore-gold/10 text-ore-gold flex items-center justify-center mx-auto font-serif font-bold">2</div>
                <h3 className="font-serif text-lg">Coordinamos evaluación</h3>
                <p className="text-xs text-ore-muted">Un asesor se pondrá en contacto para coordinar la revisión segura.</p>
              </div>
              <div className="bg-ore-card p-6 rounded-lg border border-white/5 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-ore-gold/10 text-ore-gold flex items-center justify-center mx-auto font-serif font-bold">3</div>
                <h3 className="font-serif text-lg">Recibís propuesta</h3>
                <p className="text-xs text-ore-muted">Evaluamos pureza y peso final para ofrecerte la mejor cotización.</p>
              </div>
            </div>

            {/* FORMULARIO DE ORO */}
            {goldSuccess ? (
              <div className="bg-ore-card p-8 rounded-lg border border-ore-gold/30 text-center space-y-4">
                <CheckCircle size={48} className="text-ore-gold mx-auto" />
                <h3 className="font-serif text-2xl">¡Consulta enviada con éxito!</h3>
                <p className="text-sm text-ore-muted">Hemos recibido los datos de tu pieza. Nos pondremos en contacto a la brevedad para coordinar la evaluación.</p>
                <button onClick={() => setGoldSuccess(false)} className="bg-ore-gold text-ore-dark font-semibold px-6 py-3 uppercase text-xs tracking-wider mt-4">
                  Nueva consulta
                </button>
              </div>
            ) : (
              <form onSubmit={handleGoldSubmit} className="bg-ore-card p-8 rounded-lg border border-white/5 space-y-6">
                <h3 className="font-serif text-2xl mb-4 border-b border-white/10 pb-4">Formulario de Tasación de Oro</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Nombre y Apellido *</label>
                    <input 
                      type="text" 
                      required 
                      value={goldForm.name} 
                      onChange={e => setGoldForm({...goldForm, name: e.target.value})}
                      className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Teléfono / WhatsApp *</label>
                    <input 
                      type="text" 
                      required 
                      value={goldForm.phone} 
                      onChange={e => setGoldForm({...goldForm, phone: e.target.value})}
                      className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Tipo de Pieza</label>
                    <select 
                      value={goldForm.pieceType} 
                      onChange={e => setGoldForm({...goldForm, pieceType: e.target.value})}
                      className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                    >
                      <option value="Anillo">Anillo</option>
                      <option value="Cadena">Cadena</option>
                      <option value="Pulsera">Pulsera</option>
                      <option value="Moneda">Moneda</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Quilataje</label>
                    <select 
                      value={goldForm.karat} 
                      onChange={e => setGoldForm({...goldForm, karat: e.target.value})}
                      className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                    >
                      <option value="18k">18k</option>
                      <option value="14k">14k</option>
                      <option value="24k">24k</option>
                      <option value="No lo sé">No lo sé</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Peso aproximado (g)</label>
                    <input 
                      type="text" 
                      placeholder="Ej. 10g" 
                      value={goldForm.weight} 
                      onChange={e => setGoldForm({...goldForm, weight: e.target.value})}
                      className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Descripción de la pieza</label>
                  <textarea 
                    rows="4" 
                    placeholder="Detalles adicionales..."
                    value={goldForm.description} 
                    onChange={e => setGoldForm({...goldForm, description: e.target.value})}
                    className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                  ></textarea>
                </div>

                <button type="submit" className="w-full bg-ore-gold text-ore-dark font-semibold py-4 uppercase text-xs tracking-widest hover:bg-ore-gold-light transition shadow-lg">
                  Solicitar evaluación
                </button>
              </form>
            )}
          </div>
        )}

        {/* VISTA: NOSOTROS */}
        {currentView === 'about' && (
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
            <h1 className="font-serif text-4xl">Nosotros</h1>
            <p className="text-ore-cream/80 text-base leading-relaxed">
              En <strong className="text-ore-gold font-serif">ORE Joyería</strong> nos especializamos en la selección y comercialización de piezas contemporáneas en plata, plata con oro y oro 18k. Nuestro compromiso es ofrecer elegancia, sobriedad y transparencia en cada vínculo con quienes confían en nosotros.
            </p>
          </div>
        )}

        {/* VISTA: CONTACTO */}
        {currentView === 'contact' && (
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
            <h1 className="font-serif text-4xl">Contacto y Asesoramiento</h1>
            <p className="text-ore-cream/80 text-sm">Ponete en contacto con nuestro equipo para recibir asesoramiento personalizado sobre nuestras colecciones o servicios de tasación.</p>
            <div className="bg-ore-card p-8 rounded-lg border border-white/5 space-y-4">
              <p className="text-sm">📧 Correo: <span className="text-ore-gold">contacto@orejoyeria.com</span></p>
              <p className="text-sm">💬 WhatsApp de atención: <span className="text-ore-gold">Configuración pendiente</span></p>
            </div>
          </div>
        )}

        {/* VISTA: PANEL DE ADMINISTRACIÓN PROTEGIDO */}
        {currentView === 'admin' && (
          <div className="max-w-6xl mx-auto px-4 py-12">
            {!isAdminAuthenticated ? (
              <div className="max-w-md mx-auto bg-ore-card p-8 rounded-lg border border-ore-gold/30 shadow-xl space-y-6">
                <div className="text-center space-y-2">
                  <Lock size={32} className="text-ore-gold mx-auto" />
                  <h2 className="font-serif text-2xl">Panel de Administración</h2>
                  <p className="text-xs text-ore-muted">Ingresa el PIN de seguridad para acceder.</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if(adminPin === 'admin123') setIsAdminAuthenticated(true); else alert('PIN incorrecto (Prueba con admin123)'); }} className="space-y-4">
                  <input 
                    type="password" 
                    placeholder="PIN (admin123)" 
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream text-center focus:outline-none focus:border-ore-gold"
                  />
                  <button type="submit" className="w-full bg-ore-gold text-ore-dark font-semibold py-3 uppercase text-xs tracking-wider">
                    Ingresar
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h1 className="font-serif text-3xl">Panel de Gestión ORE</h1>
                  <button onClick={() => setIsAdminAuthenticated(false)} className="text-xs text-ore-muted uppercase tracking-wider hover:text-ore-gold">Cerrar sesión</button>
                </div>

                <div className="flex gap-4 border-b border-white/10 pb-4">
                  <button onClick={() => setAdminTab('products')} className={`px-4 py-2 text-xs uppercase tracking-widest ${adminTab === 'products' ? 'bg-ore-gold text-ore-dark font-semibold' : 'text-ore-cream/70'}`}>Productos ({products.length})</button>
                  <button onClick={() => setAdminTab('gold')} className={`px-4 py-2 text-xs uppercase tracking-widest ${adminTab === 'gold' ? 'bg-ore-gold text-ore-dark font-semibold' : 'text-ore-cream/70'}`}>Consultas de Oro ({goldSubmissions.length})</button>
                </div>

                {adminTab === 'products' && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-xl">Inventario de Piezas</h3>
                    <div className="bg-ore-card rounded-lg border border-white/5 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-ore-dark text-ore-muted uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-4">Producto</th>
                            <th className="p-4">Categoría</th>
                            <th className="p-4">Material</th>
                            <th className="p-4">Precio</th>
                            <th className="p-4">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {products.map(p => (
                            <tr key={p.id}>
                              <td className="p-4 font-serif flex items-center gap-3">
                                <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" />
                                {p.name}
                              </td>
                              <td className="p-4 text-ore-muted">{p.category}</td>
                              <td className="p-4 text-ore-muted">{p.material}</td>
                              <td className="p-4 text-ore-gold font-semibold">${p.price.toLocaleString('es-AR')}</td>
                              <td className="p-4">{p.stock} u.</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminTab === 'gold' && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-xl">Solicitudes de Tasación de Oro</h3>
                    {goldSubmissions.length === 0 ? (
                      <p className="text-ore-muted text-sm">No hay consultas de oro registradas en esta sesión.</p>
                    ) : (
                      <div className="space-y-4">
                        {goldSubmissions.map(sub => (
                          <div key={sub.id} className="bg-ore-card p-6 rounded-lg border border-white/5 flex flex-col md:flex-row justify-between gap-4">
                            <div>
                              <span className="text-xs text-ore-gold uppercase tracking-wider">{sub.date} • {sub.status}</span>
                              <h4 className="font-serif text-lg mt-1">{sub.name} — {sub.pieceType} ({sub.karat})</h4>
                              <p className="text-xs text-ore-muted mt-1">Teléfono: {sub.phone} | Peso aprox: {sub.weight || 'No especificado'}</p>
                              <p className="text-xs text-ore-cream/80 mt-2">{sub.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-ore-gold/10 text-ore-gold text-xs px-3 py-1 rounded">Pendiente de contacto</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* CARRITO LATERAL DESPLEGABLE */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-ore-card h-full flex flex-col border-l border-white/10 p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="font-serif text-xl">Tu Carrito ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} className="text-ore-cream hover:text-ore-gold"><X size={20} /></button>
            </div>

            <div className="flex-grow overflow-y-auto py-6 space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-ore-muted text-sm py-12">Tu carrito está vacío.</p>
              ) : (
                cart.map(item => (
                  <div key={item.cartKey} className="flex gap-4 items-center bg-ore-dark p-4 rounded-lg border border-white/5">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-grow">
                      <h4 className="font-serif text-sm">{item.name}</h4>
                      <p className="text-xs text-ore-muted">Talle: {item.selectedSize}</p>
                      <p className="text-ore-gold font-semibold text-sm mt-1">${(item.price * item.qty).toLocaleString('es-AR')}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => removeFromCart(item.cartKey)} className="text-ore-muted hover:text-red-400"><Trash2 size={16} /></button>
                      <div className="flex items-center gap-2 border border-white/10 rounded px-2 py-1 text-xs">
                        <button onClick={() => updateQty(item.cartKey, -1)}>-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.cartKey, 1)}>+</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-white/10 pt-4 space-y-4">
                <div className="flex justify-between text-lg font-serif">
                  <span>Total:</span>
                  <span className="text-ore-gold">${cartTotal.toLocaleString('es-AR')}</span>
                </div>
                <button 
                  onClick={() => { setCartOpen(false); alert('Iniciando checkout de demostración (Configuración de pago pendiente).'); }}
                  className="w-full bg-ore-gold text-ore-dark font-semibold py-4 uppercase text-xs tracking-widest hover:bg-ore-gold-light transition shadow-lg"
                >
                  Iniciar compra
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PIE DE PÁGINA */}
      <footer className="bg-ore-card border-t border-white/10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-ore-gold flex items-center justify-center p-0.5">
                <div className="w-full h-full rounded-full border border-ore-gold/50 flex flex-col items-center justify-center bg-ore-dark">
                  <span className="font-serif text-ore-gold font-bold text-[10px]">ORE</span>
                </div>
              </div>
              <span className="font-serif text-lg tracking-widest font-semibold">ORE</span>
            </div>
            <p className="text-xs text-ore-muted">Alta joyería contemporánea en metales nobles.</p>
          </div>
          <div>
            <h4 className="font-serif text-sm uppercase tracking-wider mb-4 text-ore-gold">Navegación</h4>
            <ul className="space-y-2 text-xs text-ore-muted">
              <li><button onClick={() => setCurrentView('shop')} className="hover:text-ore-cream">Tienda</button></li>
              <li><button onClick={() => setCurrentView('gold')} className="hover:text-ore-cream">Compramos oro</button></li>
              <li><button onClick={() => setCurrentView('about')} className="hover:text-ore-cream">Nosotros</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-sm uppercase tracking-wider mb-4 text-ore-gold">Legal y Ayuda</h4>
            <ul className="space-y-2 text-xs text-ore-muted">
              <li><span>Guía de Talles</span></li>
              <li><span>Cuidados y Garantía</span></li>
              <li><span>Políticas de Privacidad</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-sm uppercase tracking-wider mb-4 text-ore-gold">Seguridad</h4>
            <p className="text-xs text-ore-muted leading-relaxed">Entorno protegido y cifrado para gestiones comerciales y tasaciones.</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 mt-12 pt-6 text-center text-xs text-ore-muted">
          © 2026 ORE Joyería. Todos los derechos reservados. Mendoza, Argentina.
        </div>
      </footer>

    </div>
  );
}