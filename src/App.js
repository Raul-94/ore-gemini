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

  // Productos desde Supabase con fallback a sampleProducts
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
  
  // Cargar productos y tablas desde Supabase al iniciar
  useEffect(() => {
    fetchProductsFromSupabase();
  }, []);

  const fetchProductsFromSupabase = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), materials(name)')
      .order('id', { ascending: false });
    
    if (!error && data && data.length > 0) {
      // Mapeamos para mantener compatibilidad con las propiedades visuales
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
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de Admin y CRUD interno
  const [adminPin, setAdminPin] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminTab, setAdminTab] = useState('products'); // 'products', 'gold'
  
  // Estados para formulario de gestión en Admin
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAdminMetadata();
    }
  }, [isAdminAuthenticated]);

  const fetchAdminMetadata = async () => {
    const { data: catData } = await supabase.from('categories').select('*').order('name');
    if (catData) setCategories(catData);

    const { data: matData } = await supabase.from('materials').select('*').order('name');
    if (matData) setMaterials(matData);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await supabase.from('categories').insert([{ name: newCategory.trim() }]);
    setNewCategory('');
    fetchAdminMetadata();
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterial.trim()) return;
    await supabase.from('materials').insert([{ name: newMaterial.trim() }]);
    setNewMaterial('');
    fetchAdminMetadata();
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminMessage('');

    try {
      let imageUrl = '';
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      const productData = {
        title,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        category_id: selectedCategory ? parseInt(selectedCategory, 10) : null,
        material_id: selectedMaterial ? parseInt(selectedMaterial, 10) : null,
      };

      if (imageUrl) productData.image_url = imageUrl;

      if (editingId) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingId);
        if (error) throw error;
        setAdminMessage('¡Producto actualizado con éxito!');
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        setAdminMessage('¡Producto agregado con éxito!');
      }

      resetAdminForm();
      fetchProductsFromSupabase();
    } catch (err) {
      setAdminMessage(`Error: ${err.message}`);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleEditProduct = (p) => {
    setEditingId(p.id);
    setTitle(p.title || p.name);
    setDescription(p.description || '');
    setPrice(p.price);
    setStock(p.stock);
    setSelectedCategory(p.category_id || '');
    setSelectedMaterial(p.material_id || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setAdminMessage('Producto eliminado correctamente');
      fetchProductsFromSupabase();
    } else {
      setAdminMessage(`Error al eliminar: ${error.message}`);
    }
  };

  const resetAdminForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setStock(0);
    setSelectedCategory('');
    setSelectedMaterial('');
    setImageFile(null);
  };

  // Consultas de Compra de Oro
  const [goldForm, setGoldForm] = useState({
    name: '', phone: '', email: '', pieceType: 'Anillo', karat: '18k', weight: '', description: ''
  });
  const [goldSubmissions, setGoldSubmissions] = useState([]);
  const [goldSuccess, setGoldSuccess] = useState(false);

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

      {/* ENCABEZADO (SIN BOTÓN DE ENGRANAJE VISIBLE PARA MAYOR SEGURIDAD) */}
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
          </nav>

          {/* ACCIONES (Sólo Carrito visible públicamente) */}
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
                          <span className="text-ore-gold font-semibold text-lg">${product.price.toLocaleString('es-AR')}</span>
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

        {/* VISTA: TIENDA */}
        {currentView === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
              <h1 className="font-serif text-4xl mb-2">Catálogo de Joyas</h1>
              <p className="text-ore-muted text-sm">Explora nuestra colección completa sincronizada con el sistema.</p>
            </div>

            <div className="bg-ore-card p-6 rounded-lg border border-white/5 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search size={18} className="absolute left-3 top-3 text-ore-muted" />
                <input 
                  type="text" 
                  placeholder="Buscar pieza..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-ore-dark border border-white/10 rounded px-4 py-2 pl-10 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                />
              </div>
            </div>

            {products && products.length === 0 ? (
              <div className="text-center py-16 text-ore-muted">
                <p>No hay productos cargados en el inventario actualmente.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products
                  .filter(p => {
                    const productName = p.name || p.title || '';
                    return productName.toLowerCase().includes((searchTerm || '').toLowerCase());
                  })
                  .map(product => (
                    <div 
                      key={product.id} 
                      className="group cursor-pointer bg-ore-card rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition border border-white/5 flex flex-col" 
                      onClick={() => { setSelectedProduct(product); setCurrentView('product-detail'); }}
                    >
                      <div className="relative h-80 overflow-hidden bg-ore-dark">
                        <img 
                          src={product.image || product.image_url || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'} 
                          alt={product.name || product.title || 'Joya ORE'} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-ore-dark/80 backdrop-blur text-ore-gold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded">
                          {product.material || 'General'}
                        </span>
                      </div>
                      <div className="p-6 flex flex-col flex-grow justify-between">
                        <div>
                          <p className="text-xs text-ore-muted uppercase tracking-wider">{product.category || 'Joyas'}</p>
                          <h3 className="font-serif text-xl font-medium mt-1 text-ore-cream">{product.name || product.title || 'Sin nombre'}</h3>
                        </div>
                        <div className="mt-6 flex items-center justify-between">
                          <span className="text-ore-gold font-semibold text-xl">
                            ${Number(product.price || 0).toLocaleString('es-AR')}
                          </span>
                          <span className="text-xs uppercase tracking-widest text-ore-gold underline">Ver pieza</span>
                        </div>
                      </div>
                    </div>
                ))}
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
                  <p className="text-2xl font-semibold text-ore-gold mt-4">${selectedProduct.price.toLocaleString('es-AR')}</p>
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
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center space-y-4 mb-12">
              <span className="text-ore-gold text-xs uppercase tracking-[0.25em] font-semibold">Tasación y Adquisición</span>
              <h1 className="font-serif text-4xl sm:text-5xl">Compramos Oro</h1>
              <p className="text-ore-cream/80 max-w-xl mx-auto text-sm">El proceso es simple, transparente y confidencial.</p>
            </div>

            {goldSuccess ? (
              <div className="bg-ore-card p-8 rounded-lg border border-ore-gold/30 text-center space-y-4">
                <CheckCircle size={48} className="text-ore-gold mx-auto" />
                <h3 className="font-serif text-2xl">¡Consulta enviada con éxito!</h3>
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
                    <input type="text" required value={goldForm.name} onChange={e => setGoldForm({...goldForm, name: e.target.value})} className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"/>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Teléfono / WhatsApp *</label>
                    <input type="text" required value={goldForm.phone} onChange={e => setGoldForm({...goldForm, phone: e.target.value})} className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"/>
                  </div>
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

        {/* VISTA: PANEL DE ADMINISTRACIÓN SEGURO (ACCESIBLE VÍA /#admin) */}
        {currentView === 'admin' && (
          <div className="max-w-6xl mx-auto px-4 py-12">
            {!isAdminAuthenticated ? (
              <div className="max-w-md mx-auto bg-ore-card p-8 rounded-lg border border-ore-gold/30 shadow-xl space-y-6">
                <div className="text-center space-y-2">
                  <Lock className="text-ore-gold mx-auto" size="{32}"/>
                  <h2 className="font-serif text-2xl">Panel de Administración ORE</h2>
                  <p className="text-xs text-ore-muted">Ingrese su contraseña de acceso seguro.</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if(adminPin === 'Francesca#230426') setIsAdminAuthenticated(true); else alert('PIN incorrecto'); }} className="space-y-4">
                  <input 
                    type="password" 
                    placeholder="Contraseña" 
                    autoComplete="new-password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream text-center focus:outline-none focus:border-ore-gold"
                  />
                  <button type="submit" className="w-full bg-ore-gold text-ore-dark font-semibold py-3 uppercase text-xs tracking-wider">
                    Desbloquear Panel
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h1 className="font-serif text-3xl">Gestión de Inventario y Catálogo</h1>
                  
                </div>

                {adminMessage && (
                  <div className="p-3 bg-ore-card border border-ore-gold/40 text-sm rounded">
                    {adminMessage}
                  </div>
                )}

                {/* GESTIÓN DE CATEGORÍAS Y MATERIALES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-ore-card p-6 rounded-lg border border-white/5">
                  <form onSubmit={handleAddCategory} className="space-y-3">
                    <h3 className="font-serif text-sm uppercase tracking-wider text-ore-gold">Agregar Categoría</h3>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Ej: Anillos, Cadenas" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full bg-ore-dark border border-white/10 rounded p-2 text-sm text-ore-cream" required />
                      <button type="submit" className="bg-ore-gold text-ore-dark px-4 py-2 text-xs font-bold uppercase rounded">Crear</button>
                    </div>
                  </form>
                  <form onSubmit={handleAddMaterial} className="space-y-3">
                    <h3 className="font-serif text-sm uppercase tracking-wider text-ore-gold">Agregar Material</h3>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Ej: Plata 925, Oro 18k" value={newMaterial} onChange={e => setNewMaterial(e.target.value)} className="w-full bg-ore-dark border border-white/10 rounded p-2 text-sm text-ore-cream" required />
                      <button type="submit" className="bg-ore-gold text-ore-dark px-4 py-2 text-xs font-bold uppercase rounded">Crear</button>
                    </div>
                  </form>
                </div>

                {/* FORMULARIO DE ALTA Y EDICIÓN DE PRODUCTOS */}
                <div className="bg-ore-card p-6 rounded-lg border border-white/5 space-y-4">
                  <h3 className="font-serif text-xl">{editingId ? 'Editar Producto' : 'Cargar Nuevo Producto con Foto'}</h3>
                  <form onSubmit={handleSubmitProduct} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase text-ore-muted mb-1">Título del Producto</label>
                      <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-ore-dark border border-white/10 rounded p-2.5 text-sm text-ore-cream" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase text-ore-muted mb-1">Precio ($)</label>
                        <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-ore-dark border border-white/10 rounded p-2.5 text-sm text-ore-cream" required />
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-ore-muted mb-1">Stock Inicial</label>
                        <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full bg-ore-dark border border-white/10 rounded p-2.5 text-sm text-ore-cream" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase text-ore-muted mb-1">Categoría</label>
                        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full bg-ore-dark border border-white/10 rounded p-2.5 text-sm text-ore-cream">
                          <option value="">-- Seleccionar --</option>
                          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-ore-muted mb-1">Material</label>
                        <select value={selectedMaterial} onChange={e => setSelectedMaterial(e.target.value)} className="w-full bg-ore-dark border border-white/10 rounded p-2.5 text-sm text-ore-cream">
                          <option value="">-- Seleccionar --</option>
                          {materials.map(mat => <option key={mat.id} value={mat.id}>{mat.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-ore-muted mb-1">Descripción</label>
                      <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-ore-dark border border-white/10 rounded p-2.5 text-sm text-ore-cream" />
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-ore-muted mb-1">Imagen (Sube al bucket product-images)</label>
                      <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="text-sm text-ore-muted" />
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button type="submit" disabled={adminLoading} className="bg-ore-gold text-ore-dark font-semibold px-6 py-3 uppercase text-xs tracking-wider rounded">
                        {adminLoading ? 'Guardando...' : editingId ? 'Actualizar Producto' : 'Guardar Producto'}
                      </button>
                      {editingId && (
                        <button type="button" onClick={resetAdminForm} className="bg-gray-600 text-white px-6 py-3 uppercase text-xs tracking-wider rounded">
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* LISTADO DE INVENTARIO */}
                <div className="space-y-4">
                  <h3 className="font-serif text-xl">Inventario Actual ({products.length} productos)</h3>
                  <div className="space-y-3">
                    {products.map(p => (
                      <div key={p.id} className="bg-ore-card p-4 rounded-lg border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img src={p.image} alt={p.title} className="w-12 h-12 object-cover rounded" />
                          <div>
                            <h4 className="font-serif text-base">{p.title || p.name}</h4>
                            <p className="text-xs text-ore-muted">Precio: ${p.price} | Stock: {p.stock} u. | Cat: {p.category} | Mat: {p.material}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditProduct(p)} className="bg-sky-600 text-white px-3 py-1.5 rounded text-xs">Editar</button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="bg-red-600 text-white px-3 py-1.5 rounded text-xs">Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
            {/* BOTÓN DE SALIDA AL FINAL DE LA PÁGINA DE ADMINISTRACIÓN */}
<div className="mt-12 pt-6 border-t border-white/10 flex justify-between items-center bg-ore-card p-6 rounded-lg">
  <div>
    <h4 className="font-serif text-sm text-ore-gold">Sesión de Administrador Activa</h4>
    <p className="text-xs text-ore-muted">Recuerda cerrar sesión al terminar de gestionar el stock.</p>
  </div>
  <button 
    onClick={() => {
      setIsAdminAuthenticated(false);
      setCurrentView('home');
      window.history.pushState("", document.title, window.location.pathname);
    }}
    className="bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 px-6 py-3 rounded text-xs uppercase tracking-widest transition"
  >
    Cerrar sesión y salir
  </button>
</div>
          </div>
        )}

      </main>

      {/* CARRITO LATERAL */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-ore-card h-full flex flex-col border-l border-white/10 p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="font-serif text-xl">Tu Carrito ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} className="text-ore-cream hover:text-ore-gold"><X size="{20}"/></button>
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
                      <p className="text-ore-gold font-semibold text-sm mt-1">${(item.price * item.qty).toLocaleString('es-AR')}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => removeFromCart(item.cartKey)} className="text-ore-muted hover:text-red-400"><Trash2 size="{16}"/></button>
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