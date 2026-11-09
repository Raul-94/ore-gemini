import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Menu, X, Shield, Truck, Phone, 
  ArrowRight, CheckCircle, AlertCircle, Settings, Trash2, 
  Plus, Edit, Eye, Filter, RefreshCw, ChevronRight, Lock, User
} from 'lucide-react';
import { supabase } from './supabase';
import AdminDashboard from './AdminDashboard';

export default function App() {
  // Estados de navegación y vistas
  const [currentView, setCurrentView] = useState('home'); // 'home', 'shop', 'gold', 'about', 'contact', 'admin', 'product-detail'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  
  // Autenticación Admin
  const [adminPin, setAdminPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('ore_admin_auth') === 'true';
  });
  
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

  // Estados de categorías y materiales globales
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Cargar categorías y materiales desde Supabase al iniciar la tienda
  useEffect(() => {
    fetchCategoriesAndMaterials();
    fetchProductsFromSupabase();
  }, []);

  const fetchCategoriesAndMaterials = async () => {
    const { data: catData } = await supabase.from('categories').select('*').order('name');
    if (catData) setCategories(catData);

    const { data: matData } = await supabase.from('materials').select('*').order('name');
    if (matData) setMaterials(matData);
  };
  
  // DETECCIÓN DE RUTA SECRETA /#admin o /admin
  useEffect(() => {
    const checkAdminPath = () => {
      if (
        window.location.pathname === '/admin' || 
        window.location.hash === '#admin'
      ) {
        setCurrentView('admin');
      }
    };

    checkAdminPath();

    window.addEventListener('popstate', checkAdminPath);
    window.addEventListener('hashchange', checkAdminPath);

    return () => {
      window.removeEventListener('popstate', checkAdminPath);
      window.removeEventListener('hashchange', checkAdminPath);
    };
  }, []);

  // Productos iniciales de respaldo (fallback)
  const sampleProducts = [
    {
      id: 1,
      title: 'Anillo Solitario Clásico',
      category: 'Anillos',
      material: 'Oro 18k',
      price: 285000,
      image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      description: 'Elegante anillo solitario en oro amarillo de 18 kilates con acabado pulido a mano.',
      stock: 5,
      featured: true
    },
    {
      id: 2,
      title: 'Pulsera Eslabón Cartier',
      category: 'Pulseras',
      material: 'Plata con Oro',
      price: 142000,
      image_url: 'https://images.unsplash.com/photo-1611591475281-197e4125b682?auto=format&fit=crop&w=800&q=80',
      description: 'Pulsera combinada en plata 925 con apliques de oro de 18k.',
      stock: 3,
      featured: true
    }
  ];

  const [products, setProducts] = useState(sampleProducts);
  
  // Cargar productos desde Supabase
  const fetchProductsFromSupabase = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), materials(name)')
      .order('id', { ascending: false });
    
    if (!error && data && data.length > 0) {
      const formatted = data.map(p => ({
        ...p,
        name: p.title,
        image: p.image_url || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
        category: p.categories?.name || 'Joyas',
        material: p.materials?.name || 'General'
      }));
      setProducts(formatted);
    }
  };

  // Filtros de Tienda
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterMaterial, setFilterMaterial] = useState('Todos');

  // Consultas de Compra de Oro
  const [goldForm, setGoldForm] = useState({
    name: '', phone: '', email: '', pieceType: 'Anillo', karat: '18k', weight: '', description: ''
  });
  const [goldSuccess, setGoldSuccess] = useState(false);

  const handleGoldSubmit = (e) => {
    e.preventDefault();
    setGoldSuccess(true);
    setGoldForm({ name: '', phone: '', email: '', pieceType: 'Anillo', karat: '18k', weight: '', description: '' });
  };

  // Carrito helpers
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

  return (
    <div className="min-h-screen bg-ore-dark text-ore-cream flex flex-col font-sans selection:bg-ore-gold selection:text-ore-dark">
      
      {/* AVISO DE DEMOSTRACIÓN */}
      <div className="bg-ore-gold text-ore-dark text-xs font-semibold py-1.5 px-4 text-center tracking-wider flex items-center justify-center gap-2">
        <AlertCircle size={14} />
        <span>ENTORNO DE DEMOSTRACIÓN — Gestión y catálogo sincronizados con Supabase</span>
      </div>

      {/* ENCABEZADO */}
      <header className="sticky top-0 z-40 bg-ore-dark/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-ore-cream p-2">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* LOGO INSTITUCIONAL ORE */}
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

          {/* MENÚ DE NAVEGACIÓN */}
          <nav className="hidden md:flex items-center space-x-8 text-sm tracking-wide">
            <button onClick={() => setCurrentView('shop')} className={`transition hover:text-ore-gold ${currentView === 'shop' ? 'text-ore-gold border-b border-ore-gold pb-1' : 'text-ore-cream/80'}`}>Tienda</button>
            <button onClick={() => setCurrentView('gold')} className={`transition hover:text-ore-gold ${currentView === 'gold' ? 'text-ore-gold border-b border-ore-gold pb-1' : 'text-ore-cream/80'}`}>Compramos oro</button>
            <button onClick={() => setCurrentView('about')} className={`transition hover:text-ore-gold ${currentView === 'about' ? 'text-ore-gold border-b border-ore-gold pb-1' : 'text-ore-cream/80'}`}>Nosotros</button>
            <button onClick={() => setCurrentView('contact')} className={`transition hover:text-ore-gold ${currentView === 'contact' ? 'text-ore-gold border-b border-ore-gold pb-1' : 'text-ore-cream/80'}`}>Contacto</button>
            {isAdminAuthenticated && (
              <button onClick={() => { setCurrentView('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className="bg-ore-gold/20 text-ore-gold border border-ore-gold/40 px-3 py-1 rounded text-xs uppercase tracking-wider font-semibold hover:bg-ore-gold hover:text-ore-dark transition"
              >
                Panel Admin
              </button>
            )}
          </nav>

          {/* ACCIONES */}
          <div className="flex items-center gap-4">
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
          <button onClick={() => { setCurrentView('shop'); setMobileMenuOpen(false); }} className="block py-2 text-ore-cream">Tienda</button>
          <button onClick={() => { setCurrentView('gold'); setMobileMenuOpen(false); }} className="block py-2 text-ore-cream">Compramos oro</button>
          <button onClick={() => { setCurrentView('about'); setMobileMenuOpen(false); }} className="block py-2 text-ore-cream">Nosotros</button>
          <button onClick={() => { setCurrentView('contact'); setMobileMenuOpen(false); }} className="block py-2 text-ore-cream">Contacto</button>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow">
        
        {/* VISTA: INICIO */}
        {currentView === 'home' && (
          <div>
            <section className="relative h-[80vh] flex items-center justify-center text-center px-4 overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1920&q=80" 
                  alt="Joyería ORE" 
                  className="w-full h-full object-cover opacity-40 brightness-75 scale-105"
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

            {/* PRODUCTOS DESTACADOS */}
            <section className="py-16 bg-ore-card/50 border-t border-b border-white/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <span className="text-ore-gold text-xs uppercase tracking-[0.2em] font-semibold">Selección exclusiva</span>
                    <h2 className="font-serif text-3xl mt-1">Piezas Recientes</h2>
                  </div>
                  <button onClick={() => setCurrentView('shop')} className="text-xs uppercase tracking-widest text-ore-gold hover:underline flex items-center gap-1">
                    Ver todo <ArrowRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {products.slice(0, 4).map(product => (
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
                          <span className="text-ore-gold font-semibold text-lg">${Number(product.price || 0).toLocaleString('es-AR')}</span>
                          <span className="text-xs uppercase tracking-widest text-ore-cream/60">Ver detalle</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VISTA DE LA TIENDA */}
        {currentView === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">

            {filterCategory !== 'Todos' && filterMaterial !== 'Todos' ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-ore-card p-4 rounded-lg border border-ore-gold/30">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-ore-muted">Filtro aplicado:</span>
                    <h3 className="font-serif text-2xl text-ore-gold">
                      {filterCategory} <span className="text-ore-cream text-lg">en</span> {filterMaterial}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setFilterMaterial('Todos')}
                      className="text-xs bg-ore-dark border border-white/10 text-ore-cream px-3 py-2 rounded hover:border-ore-gold transition uppercase tracking-wider"
                    >
                      ← Cambiar Material
                    </button>
                    <button 
                      onClick={() => { setFilterCategory('Todos'); setFilterMaterial('Todos'); }}
                      className="text-xs bg-ore-gold/20 border border-ore-gold/40 text-ore-gold px-3 py-2 rounded hover:bg-ore-gold hover:text-ore-dark transition uppercase tracking-wider"
                    >
                      Ver todas las Categorías
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {products
                    .filter(p => {
                      const matchesCategoryName = p.category && p.category.toLowerCase().trim() === filterCategory.toLowerCase().trim();
                      const matchesCategoryId = categories.find(c => c.name === filterCategory)?.id === p.category_id;
                      return matchesCategoryName || matchesCategoryId;
                    })
                    .filter(p => {
                      const matchesMaterialName = p.material && p.material.toLowerCase().trim() === filterMaterial.toLowerCase().trim();
                      const matchesMaterialId = materials.find(m => m.name === filterMaterial)?.id === p.material_id;
                      return matchesMaterialName || matchesMaterialId;
                    })
                    .map(p => {
                      const productImg = p.image || p.image_url;
                      return (
                        <div 
                          key={p.id} 
                          onClick={() => {
                            setSelectedProduct(p);
                            setCurrentView('product-detail');
                          }}
                          className="bg-ore-card border border-white/5 rounded-lg overflow-hidden shadow-lg hover:border-ore-gold transition group cursor-pointer"
                        >
                          <div className="h-64 overflow-hidden relative bg-ore-dark flex items-center justify-center">
                            {productImg ? (
                              <img 
                                src={productImg} 
                                alt={p.title || p.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                              />
                            ) : (
                              <span className="text-xs text-ore-muted italic">Sin imagen disponible</span>
                            )}
                          </div>
                          <div className="p-5 space-y-2">
                            <h4 className="font-serif text-lg text-ore-cream group-hover:text-ore-gold transition">{p.title || p.name}</h4>
                            <div className="flex justify-between items-center pt-2">
                              <span className="text-ore-gold font-bold text-lg">${Number(p.price || 0).toLocaleString('es-AR')}</span>
                              <span className="text-xs uppercase tracking-widest text-ore-muted underline">Ver detalle</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : filterCategory !== 'Todos' ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-ore-card p-4 rounded-lg border border-white/10">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-ore-gold font-semibold">Paso 2 de 2</span>
                    <h2 className="font-serif text-2xl text-ore-cream">Selecciona un Material para <span className="text-ore-gold">{filterCategory}</span></h2>
                  </div>
                  <button 
                    onClick={() => setFilterCategory('Todos')}
                    className="text-xs bg-ore-dark border border-white/10 text-ore-cream px-4 py-2 rounded hover:border-ore-gold transition uppercase tracking-wider"
                  >
                    ← Volver a Categorías
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {materials && materials.map(mat => {
                    const catMatProducts = products.filter(p => {
                      const matchesCat = (p.category && p.category.toLowerCase().trim() === filterCategory.toLowerCase().trim()) || (categories.find(c => c.name === filterCategory)?.id === p.category_id);
                      const matchesMat = (p.material && p.material.toLowerCase().trim() === mat.name.toLowerCase().trim()) || (mat.id === p.material_id);
                      return matchesCat && matchesMat;
                    });

                    const lastValidProduct = catMatProducts.slice().reverse().find(p => (p.image && p.image.trim() !== '') || (p.image_url));
                    const matCoverImg = lastValidProduct ? (lastValidProduct.image || lastValidProduct.image_url) : null;

                    return (
                      <div 
                        key={mat.id}
                        onClick={() => setFilterMaterial(mat.name)}
                        className="group relative h-48 rounded-lg overflow-hidden cursor-pointer border border-white/10 hover:border-ore-gold transition-all shadow-xl bg-ore-card flex items-center justify-center"
                      >
                        {matCoverImg ? (
                          <img 
                            src={matCoverImg} 
                            alt={mat.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100" 
                          />
                        ) : (
                          <div className="text-ore-muted text-xs italic p-4 text-center">Sin productos con imagen</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-ore-dark via-ore-dark/40 to-transparent flex items-end p-4">
                          <h3 className="font-serif text-lg text-ore-cream group-hover:text-ore-gold transition font-bold">{mat.name}</h3>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-4 text-center">
                  <span className="text-[10px] uppercase tracking-widest text-ore-gold font-semibold">Paso 1 de 2</span>
                  <h2 className="font-serif text-3xl text-ore-cream mt-1">Selecciona una Categoría</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {categories && categories.map(cat => {
                    const catProducts = products.filter(p => {
                      const matchesName = p.category && p.category.toLowerCase().trim() === cat.name.toLowerCase().trim();
                      const matchesId = p.category_id === cat.id;
                      return matchesName || matchesId;
                    });

                    const lastValidProduct = catProducts.slice().reverse().find(p => (p.image && p.image.trim() !== '') || (p.image_url));
                    const coverImg = lastValidProduct ? (lastValidProduct.image || lastValidProduct.image_url) : null;

                    return (
                      <div 
                        key={cat.id}
                        onClick={() => setFilterCategory(cat.name)}
                        className="group relative h-56 rounded-lg overflow-hidden cursor-pointer border border-white/10 hover:border-ore-gold transition-all shadow-xl bg-ore-card flex items-center justify-center"
                      >
                        {coverImg ? (
                          <img 
                            src={coverImg} 
                            alt={cat.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100" 
                          />
                        ) : (
                          <div className="text-ore-muted text-xs italic p-4 text-center">Sin productos con imagen</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-ore-dark via-ore-dark/40 to-transparent flex items-end p-4">
                          <h3 className="font-serif text-xl text-ore-cream group-hover:text-ore-gold transition font-bold">{cat.name}</h3>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* VISTA: FICHA DE PRODUCTO */}
        {currentView === 'product-detail' && selectedProduct && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button onClick={() => setCurrentView('shop')} className="text-xs uppercase tracking-widest text-ore-gold mb-8 hover:underline">
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
                  <p className="text-2xl font-semibold text-ore-gold mt-4">${Number(selectedProduct.price || 0).toLocaleString('es-AR')}</p>
                  <p className="text-xs text-ore-muted mt-1">Stock disponible: {selectedProduct.stock} unidades</p>
                </div>

                <p className="text-ore-cream/80 text-sm leading-relaxed">{selectedProduct.description}</p>

                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => addToCart(selectedProduct, 'Estándar')}
                    className="flex-grow bg-ore-gold text-ore-dark font-semibold py-4 px-8 uppercase text-xs tracking-widest hover:bg-ore-gold-light transition shadow-lg"
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

       {/* VISTA: COMPRAMOS ORO */}
       {currentView === 'gold' && (
          <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="text-center space-y-4 mb-10">
              <span className="text-ore-gold text-xs uppercase tracking-[0.25em] font-semibold">Tasación y Adquisición Profesional</span>
              <h1 className="font-serif text-4xl sm:text-5xl text-ore-cream">Compramos Oro</h1>
              <p className="text-ore-cream/80 max-w-xl mx-auto text-sm leading-relaxed font-light">
                Brindamos un servicio confidencial, transparente y con cotización competitiva basada en los estándares internacionales del mercado. Complete el formulario con los detalles de su pieza para iniciar una evaluación preliminar.
              </p>
            </div>

            {goldSuccess ? (
              <div className="bg-ore-card p-10 rounded-lg border border-ore-gold/30 text-center space-y-6 shadow-2xl">
                <CheckCircle size={48} className="text-ore-gold mx-auto" />
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-ore-cream">Solicitud de Tasación Registrada</h3>
                  <p className="text-ore-muted text-sm max-w-md mx-auto leading-relaxed">
                    Hemos recibido los datos de su pieza correctamente. Un especialista de <strong className="text-ore-gold">ORE Joyería</strong> se comunicará con usted a la brevedad vía WhatsApp o llamada para coordinar la evaluación presencial y segura.
                  </p>
                </div>
                <button 
                  onClick={() => setGoldSuccess(false)} 
                  className="bg-ore-gold text-ore-dark font-semibold px-8 py-3.5 uppercase text-xs tracking-wider rounded hover:bg-ore-cream transition shadow-lg"
                >
                  Enviar otra consulta
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                setGoldSuccess(true);
              }} className="bg-ore-card p-8 sm:p-10 rounded-lg border border-white/5 space-y-6 shadow-2xl">
                
                <div className="border-b border-white/10 pb-4">
                  <h3 className="font-serif text-xl text-ore-cream">Detalles de la Pieza a Tasar</h3>
                  <p className="text-xs text-ore-muted mt-1">Cuantos más detalles nos proporcione, más precisa será nuestra orientación inicial.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Tipo de Pieza *</label>
                    <select 
                      value={goldForm.pieceType} 
                      onChange={e => setGoldForm({...goldForm, pieceType: e.target.value})} 
                      className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                    >
                      <option value="Anillo">Anillo / Solitario</option>
                      <option value="Alianzas">Alianzas (Par)</option>
                      <option value="Cadena">Cadena o Gargantilla</option>
                      <option value="Pulsera">Pulsera / Esclava</option>
                      <option value="Dije / Medalla">Dije / Medalla</option>
                      <option value="Moneda / Lingote">Moneda / Lingote</option>
                      <option value="Oro roto o desparejo">Oro roto / Joyas desparejas</option>
                      <option value="Otro">Otro tipo de pieza</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Kilates Estimado *</label>
                    <select 
                      value={goldForm.karat} 
                      onChange={e => setGoldForm({...goldForm, karat: e.target.value})} 
                      className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                    >
                      <option value="18k">Oro 18k (Ley 750 - Estándar Joyería)</option>
                      <option value="14k">Oro 14k (Ley 585)</option>
                      <option value="24k">Oro 24k (Oro puro / Lingotes)</option>
                      <option value="No lo sé">No estoy seguro / Desconozco</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Peso Aproximado (en gramos)</label>
                    <input 
                      type="text" 
                      placeholder="Ej: 12.5 grs (si lo desconoce, déjelo en blanco)" 
                      value={goldForm.weight} 
                      onChange={e => setGoldForm({...goldForm, weight: e.target.value})} 
                      className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Estado / Observaciones</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Con sello visible, buen estado, grabado interno..." 
                      value={goldForm.description} 
                      onChange={e => setGoldForm({...goldForm, description: e.target.value})} 
                      className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                    />
                  </div>
                </div>

                <div className="border-b border-white/10 pt-4 pb-2">
                  <h3 className="font-serif text-xl text-ore-cream">Información de Contacto</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Nombre y Apellido *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Su nombre completo"
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
                      placeholder="Ej: 261..."
                      value={goldForm.phone} 
                      onChange={e => setGoldForm({...goldForm, phone: e.target.value})} 
                      className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Correo Electrónico (Opcional)</label>
                  <input 
                    type="email" 
                    placeholder="correo@ejemplo.com"
                    value={goldForm.email || ''} 
                    onChange={e => setGoldForm({...goldForm, email: e.target.value})} 
                    className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full bg-ore-gold text-ore-dark font-semibold py-4 uppercase text-xs tracking-widest hover:bg-ore-gold-light transition shadow-lg rounded"
                  >
                    Solicitar Tasación Profesional
                  </button>
                  <p className="text-[11px] text-ore-muted text-center mt-3">
                    🔒 Sus datos y consultas son absolutamente confidenciales y tratados bajo rigurosas normas de seguridad.
                  </p>
                </div>

              </form>
            )}
          </div>
        )}

        {/* VISTA: NOSOTROS */}
        {currentView === 'about' && (
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
            <h1 className="font-serif text-4xl">Nosotros</h1>
            <p className="text-ore-cream/80 text-base leading-relaxed">
              En <strong className="text-ore-gold font-serif">ORE Joyería</strong> nos especializamos en la selección y comercialización de piezas contemporáneas en plata, plata con oro y oro 18k.
            </p>
          </div>
        )}

        {/* VISTA: CONTACTO */}
        {currentView === 'contact' && (
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
            <h1 className="font-serif text-4xl">Contacto y Asesoramiento</h1>
            <div className="bg-ore-card p-8 rounded-lg border border-white/5 space-y-4">
              <p className="text-sm">📧 Correo: <span className="text-ore-gold">contacto@orejoyeria.com</span></p>
            </div>
          </div>
        )}

        {/* VISTA: PANEL DE ADMINISTRACIÓN SEGURO */}
        {currentView === 'admin' && (
          <div className="max-w-6xl mx-auto px-4 py-12">
            {!isAdminAuthenticated ? (
              <div className="max-w-md mx-auto bg-ore-card p-8 rounded-lg border border-ore-gold/30 shadow-xl space-y-6">
                <div className="text-center space-y-2">
                  <Lock className="text-ore-gold mx-auto" size={32}/>
                  <h2 className="font-serif text-2xl">Panel de Administración ORE</h2>
                  <p className="text-xs text-ore-muted">Ingrese su contraseña de acceso seguro.</p>
                </div>
                <form onSubmit={(e) => { 
                  e.preventDefault(); 
                  if(adminPin === 'Francesca#230426') {
                    setIsAdminAuthenticated(true);
                    sessionStorage.setItem('ore_admin_auth', 'true');
                  } else {
                    alert('PIN incorrecto');
                  } 
                }} className="space-y-4">
                  
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Contraseña" 
                      autoComplete="new-password"
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      className="w-full bg-ore-dark border border-white/10 rounded p-3 pr-10 text-sm text-ore-cream text-center focus:outline-none focus:border-ore-gold"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-ore-muted hover:text-ore-gold text-xs"
                    >
                      {showPassword ? "Ocultar" : "Ver"}
                    </button>
                  </div>

                  <button type="submit" className="w-full bg-ore-gold text-ore-dark font-semibold py-3 uppercase text-xs tracking-wider">
                    Desbloquear Panel
                  </button>
                </form>
              </div>
            ) : (
              <AdminDashboard 
                categories={categories}
                materials={materials}
                fetchCategoriesAndMaterials={fetchCategoriesAndMaterials}
                fetchProductsFromSupabase={fetchProductsFromSupabase}
                products={products}
                onLogout={() => {
                  setIsAdminAuthenticated(false);
                  sessionStorage.removeItem('ore_admin_auth');
                  setCurrentView('home');
                  window.location.hash = '';
                }}
              />
            )}
          </div>
        )}

      </main>

      {/* CARRITO LATERAL */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-ore-card h-full flex flex-col border-l border-white/10 p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="font-serif text-xl">Tu Carrito ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} className="text-ore-cream hover:text-ore-gold"><X size={20}/></button>
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
                      <p className="text-ore-gold font-semibold text-sm mt-1">${Number(item.price * item.qty).toLocaleString('es-AR')}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => removeFromCart(item.cartKey)} className="text-ore-muted hover:text-red-400"><Trash2 size={16}/></button>
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
                  onClick={() => { setCartOpen(false); alert('Iniciando checkout de demostración.'); }}
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
            </ul>
          </div>
          <div>
            <h4 className="font-serif text-sm uppercase tracking-wider mb-4 text-ore-gold">Seguridad</h4>
            <p className="text-xs text-ore-muted leading-relaxed">Entorno protegido para gestiones comerciales.</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 mt-12 pt-6 text-center text-xs text-ore-muted">
          © 2026 ORE Joyería. Todos los derechos reservados. Mendoza, Argentina.
        </div>
      </footer>

    </div>
  );
}