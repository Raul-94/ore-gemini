import React, { useState } from 'react';
import { supabase } from './supabase';
import { Trash2, CheckCircle } from 'lucide-react';

export default function AdminDashboard({ 
  categories, 
  materials, 
  fetchCategoriesAndMaterials, 
  fetchProductsFromSupabase, 
  products, 
  onLogout 
}) {
  // Estados formularios auxiliares
  const [newCategory, setNewCategory] = useState('');
  const [newMaterial, setNewMaterial] = useState('');

  // Estados para búsqueda y filtrado en inventario
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todos');
  const [stockFilter, setStockFilter] = useState('Todos'); // 'Todos' | 'ConStock' | 'SinStock'

  // Formulario Producto
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [measure, setMeasure] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(''); 

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const normalizeStock = (val) => {
    if (val === '' || val === null || val === undefined) return 0;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
  };

  // Crear o Editar Producto
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (stock === '' || stock === null || stock === undefined) {
        setMessage('Error: El campo de stock no puede quedar vacío. Escribí 0 si no tenés unidades.');
        setLoading(false);
        return;
      }

      const cleanStock = parseInt(String(stock).trim(), 10);
      if (Number.isNaN(cleanStock) || cleanStock < 0) {
        setMessage('Error: Ingresá un número válido para el stock (0 o mayor).');
        setLoading(false);
        return;
      }

      let imageUrl = currentImageUrl; // Mantenemos por defecto la imagen que ya tenía

      // Si hay archivo de imagen nuevo, lo subimos a Supabase Storage y reemplazamos
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

      const cleanPrice = parseFloat(price);

      const productData = {
        title: title.trim(),
        description,
        price: Number.isNaN(cleanPrice) ? 0 : cleanPrice,
        stock: cleanStock,
        category_id: selectedCategory ? parseInt(selectedCategory, 10) : null,
        material_id: selectedMaterial ? parseInt(selectedMaterial, 10) : null,
        measure: measure || null,
        image_url: imageUrl
      };

      if (editingId) {
        // Actualizar producto existente y verificar fila devuelta
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId)
          .select()
          .single();
    
        if (error) throw error;
        if (!data) throw new Error('No se pudo confirmar la actualización del producto.');

        setMessage(
          cleanStock === 0
            ? '¡Producto actualizado! Como su stock es 0, se ocultó automáticamente del catálogo del cliente y quedó marcado como SIN STOCK en el inventario.'
            : '¡Producto actualizado con éxito!'
        );
      } else {
        // Crear nuevo producto
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        setMessage('¡Producto agregado con éxito!');
      }
    
      setIsSuccess(true);
      resetForm();
      await fetchProductsFromSupabase();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setTitle(product.title || product.name || '');
    setDescription(product.description || '');
    setPrice(product.price ?? '');
    setStock(normalizeStock(product.stock));
    setSelectedCategory(product.category_id || '');
    setSelectedMaterial(product.material_id || '');
    setMeasure(product.measure || ''); 
    
    // Capturamos la imagen actual del producto para mostrarla en el panel
    const existingImg = product.image_url || product.image || '';
    setCurrentImageUrl(existingImg);

    setIsSuccess(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      setMessage(`Error al eliminar: ${error.message}`);
    } else {
      setMessage('Producto eliminado correctamente');
      await fetchProductsFromSupabase();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setStock(0);
    setSelectedCategory('');
    setSelectedMaterial('');
    setMeasure('');
    setImageFile(null);
    setCurrentImageUrl('');
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const { error } = await supabase.from('categories').insert([{ name: newCategory.trim() }]);
    if (!error) {
      setNewCategory('');
      fetchCategoriesAndMaterials();
      setMessage('Categoría creada correctamente.');
    } else {
      setMessage(`Error al crear categoría: ${error.message}`);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      fetchCategoriesAndMaterials();
      setMessage('Categoría eliminada.');
    } else {
      setMessage(`No se puede eliminar la categoría si hay productos asociados: ${error.message}`);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterial.trim()) return;
    const { error } = await supabase.from('materials').insert([{ name: newMaterial.trim() }]);
    if (!error) {
      setNewMaterial('');
      fetchCategoriesAndMaterials();
      setMessage('Material creado correctamente.');
    } else {
      setMessage(`Error al crear material: ${error.message}`);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('¿Eliminar este material?')) return;
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (!error) {
      fetchCategoriesAndMaterials();
      setMessage('Material eliminado.');
    } else {
      setMessage(`No se puede eliminar el material si hay productos asociados: ${error.message}`);
    }
  };

  const outOfStockCount = products.filter(p => normalizeStock(p.stock) === 0).length;

  // Lógica de filtrado en tiempo real para el inventario
  const filteredProducts = products.filter(product => {
    const codigoStr = `ORE-${String(product.id).padStart(4, '0')}`.toLowerCase();
    const nombreStr = (product.title || product.name || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase().trim();

    const matchesSearch = codigoStr.includes(searchLower) || nombreStr.includes(searchLower);
    const matchesCategory = selectedCategoryFilter === 'Todos' || 
      (product.category && product.category.toLowerCase().trim() === selectedCategoryFilter.toLowerCase().trim()) ||
      (categories.find(c => c.name === selectedCategoryFilter)?.id === product.category_id);

    const prodStock = normalizeStock(product.stock);
    const matchesStock =
      stockFilter === 'Todos' ||
      (stockFilter === 'SinStock' && prodStock === 0) ||
      (stockFilter === 'ConStock' && prodStock > 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-10">
      
      {/* CABECERA DEL PANEL */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-ore-gold font-semibold">Panel de Control</span>
          <h1 className="font-serif text-3xl text-ore-cream mt-1">Gestión de Inventario y Catálogo</h1>
        </div>
        <button 
          onClick={onLogout}
          className="bg-red-600/25 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 px-4 py-2 rounded text-xs uppercase tracking-widest transition"
        >
          Cerrar sesión
        </button>
      </div>

      {message && (
        <div className="p-4 bg-ore-card border border-ore-gold/40 text-sm rounded text-ore-cream flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-ore-muted hover:text-ore-gold text-xs uppercase">Cerrar</button>
        </div>
      )}

      {/* SECCIÓN SUPERIOR: GESTIÓN DE CATEGORÍAS Y MATERIALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TARJETA CATEGORÍAS */}
        <div className="bg-ore-card p-6 rounded-lg border border-white/5 space-y-4 shadow-lg">
          <h3 className="font-serif text-sm uppercase tracking-wider text-ore-gold">Gestionar Categorías</h3>
          
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              placeholder="Ej: Anillos, Cadenas"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 bg-ore-dark border border-white/10 rounded p-2.5 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
              required
            />
            <button type="submit" className="bg-ore-gold text-ore-dark px-4 py-2 text-xs font-bold uppercase rounded hover:bg-ore-cream transition">
              Crear
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {categories && categories.length > 0 ? (
              categories.map(cat => (
                <span 
                  key={cat.id} 
                  className="bg-ore-dark border border-white/10 px-3 py-1.5 rounded-full text-xs flex items-center gap-2 text-ore-cream"
                >
                  {cat.name}
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-red-400 hover:text-red-300 transition"
                    title="Eliminar categoría"
                  >
                    <Trash2 size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs italic text-ore-muted">No hay categorías cargadas</span>
            )}
          </div>
        </div>

        {/* TARJETA MATERIALES */}
        <div className="bg-ore-card p-6 rounded-lg border border-white/5 space-y-4 shadow-lg">
          <h3 className="font-serif text-sm uppercase tracking-wider text-ore-gold">Gestionar Materiales</h3>
          
          <form onSubmit={handleAddMaterial} className="flex gap-2">
            <input
              type="text"
              placeholder="Ej: Plata 925, Oro 18k"
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              className="flex-1 bg-ore-dark border border-white/10 rounded p-2.5 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
              required
            />
            <button type="submit" className="bg-ore-gold text-ore-dark px-4 py-2 text-xs font-bold uppercase rounded hover:bg-ore-cream transition">
              Crear
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {materials && materials.length > 0 ? (
              materials.map(mat => (
                <span 
                  key={mat.id} 
                  className="bg-ore-dark border border-white/10 px-3 py-1.5 rounded-full text-xs flex items-center gap-2 text-ore-cream"
                >
                  {mat.name}
                  <button
                    type="button"
                    onClick={() => handleDeleteMaterial(mat.id)}
                    className="text-red-400 hover:text-red-300 transition"
                    title="Eliminar material"
                  >
                    <Trash2 size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs italic text-ore-muted">No hay materiales cargados</span>
            )}
          </div>
        </div>

      </div>
      
      {/* VISTA DE ÉXITO O FORMULARIO DE PRODUCTOS */}
      {isSuccess ? (
        <div className="bg-ore-card border border-ore-gold/30 p-8 rounded-lg text-center space-y-4 shadow-xl">
          <CheckCircle size={40} className="text-ore-gold mx-auto" />
          <h3 className="font-serif text-2xl text-ore-cream">¡Operación realizada con éxito!</h3>
          <p className="text-ore-muted text-xs">El producto se ha guardado y sincronizado correctamente con Supabase.</p>
          
          <div className="flex gap-4 justify-center pt-2">
            <button 
              type="button"
              onClick={() => setIsSuccess(false)}
              className="bg-ore-gold text-ore-dark font-semibold px-6 py-3 rounded text-xs uppercase tracking-wider hover:bg-ore-cream transition"
            >
              Cargar otro producto
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-ore-card p-6 rounded-lg border border-white/5 space-y-6 shadow-lg">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h3 className="font-serif text-xl text-ore-cream">
              {editingId ? 'Editar Producto' : 'Cargar Nuevo Producto con Foto'}
            </h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-ore-muted hover:text-ore-gold underline uppercase tracking-wider">
                Cancelar edición
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitProduct} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ore-muted mb-1">Título del Producto *</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold" 
                required 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ore-muted mb-1">Precio ($) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold" 
                  required 
                />
              </div>
              <div>
              <label className="block text-xs uppercase tracking-wider text-ore-muted mb-1">Stock {editingId ? 'Actual' : 'Inicial'} *</label>
<input 
  type="number" 
  min="0"
  step="1"
  value={stock} 
  onChange={e => {
    const val = e.target.value;
    if (val === '') {
      setStock('');
      return;
    }
    const parsed = parseInt(val, 10);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      setStock(parsed);
    }
  }}
  onBlur={() => {
    if (stock === '') setStock(0);
  }}
  className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
  required
/>
<p className="text-[11px] text-ore-muted mt-1">
  Si el stock es <strong className="text-ore-cream">0</strong>, no se mostrará en la tienda del cliente pero seguirá visible aquí como <strong className="text-red-400">Sin stock</strong>.
</p>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ore-muted mb-1">Medida / Talle</label>
              <input 
                type="text"
                value={measure}
                onChange={(e) => setMeasure(e.target.value)}
                className="w-full bg-ore-dark border border-white/10 rounded p-2 text-ore-cream text-sm focus:border-ore-gold outline-none"
                placeholder="Ej. N° 16 / 45cm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ore-muted mb-1">Categoría</label>
                <select 
                  value={selectedCategory} 
                  onChange={e => setSelectedCategory(e.target.value)} 
                  className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                >
                  <option value="">-- Seleccionar Categoría --</option>
                  {categories && categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-ore-muted mb-1">Material</label>
                <select 
                  value={selectedMaterial} 
                  onChange={e => setSelectedMaterial(e.target.value)} 
                  className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                >
                  <option value="">-- Seleccionar Material --</option>
                  {materials && materials.map(mat => <option key={mat.id} value={mat.id}>{mat.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ore-muted mb-1">Descripción</label>
              <textarea 
                rows="3" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold" 
              />
            </div>

            {/* SECCIÓN DE IMAGEN CON PREVISUALIZACIÓN AL EDITAR */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs uppercase tracking-wider text-ore-muted">Imagen del Producto</label>
              
              {editingId && currentImageUrl && (
                <div className="flex items-center gap-4 bg-ore-dark p-3 rounded border border-white/10">
                  <img src={currentImageUrl} alt="Imagen actual" className="w-16 h-16 object-cover rounded border border-ore-gold/40" />
                  <div>
                    <p className="text-xs text-ore-gold font-semibold">Imagen actual cargada</p>
                    <p className="text-[10px] text-ore-muted">Si seleccionas un archivo nuevo abajo, se reemplazará automáticamente.</p>
                  </div>
                </div>
              )}

              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setImageFile(e.target.files[0])} 
                className="text-sm text-ore-muted file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-ore-gold file:text-ore-dark hover:file:bg-ore-cream cursor-pointer" 
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="submit" 
                disabled={loading} 
                className="bg-ore-gold text-ore-dark font-semibold px-8 py-3.5 uppercase text-xs tracking-widest rounded hover:bg-ore-gold-light transition shadow-lg"
              >
                {loading ? 'Guardando...' : editingId ? 'Actualizar Producto' : 'Guardar Producto'}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="bg-ore-dark border border-white/20 text-ore-cream px-6 py-3.5 uppercase text-xs tracking-wider rounded hover:border-white transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <hr className="border-white/10 my-8" />

      {/* LISTADO DE INVENTARIO ACTUAL */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-serif text-2xl text-ore-cream">
            Inventario Actual ({filteredProducts.length} de {products.length} productos)
          </h3>
          {outOfStockCount > 0 && (
            <button
              type="button"
              onClick={() => setStockFilter(stockFilter === 'SinStock' ? 'Todos' : 'SinStock')}
              className="text-xs bg-red-500/15 border border-red-500/40 text-red-300 px-3 py-1.5 rounded-full hover:bg-red-500/25 transition cursor-pointer"
            >
              {outOfStockCount} {outOfStockCount === 1 ? 'producto sin stock' : 'productos sin stock'}
            </button>
          )}
        </div>

        {/* BARRA DE BÚSQUEDA RÁPIDA Y FILTROS DE INVENTARIO */}
        <div className="bg-ore-card p-4 rounded-lg border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 items-center shadow">
          
          {/* Buscador por código o nombre */}
          <div className="relative">
            <input 
              type="text"
              placeholder="Buscar por código (ej: ORE-0001) o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-ore-dark border border-white/15 rounded p-2.5 pl-9 text-xs text-ore-cream focus:outline-none focus:border-ore-gold"
            />
            <span className="absolute left-3 top-3 text-ore-muted text-xs">🔍</span>
          </div>

          {/* Filtro por Categoría */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-ore-muted shrink-0">Categoría:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full bg-ore-dark border border-white/15 rounded p-2.5 text-xs text-ore-cream focus:outline-none focus:border-ore-gold cursor-pointer"
            >
              <option value="Todos">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado de Stock */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-ore-muted shrink-0">Stock:</span>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full bg-ore-dark border border-white/15 rounded p-2.5 text-xs text-ore-cream focus:outline-none focus:border-ore-gold cursor-pointer"
            >
              <option value="Todos">Todos los productos</option>
              <option value="ConStock">Con stock disponible</option>
              <option value="SinStock">Sin stock (0 unidades)</option>
            </select>
          </div>

        </div>
        
        <div className="space-y-3">
          {filteredProducts && filteredProducts.length > 0 ? (
            filteredProducts.map((p) => {
              const prodImg = p.image || p.image_url;
              const prodStock = normalizeStock(p.stock);
              const isOutOfStock = prodStock === 0;

              return (
                <div 
                  key={p.id} 
                  className={`bg-ore-card p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow ${
                    isOutOfStock ? 'border-red-500/35 bg-red-950/10' : 'border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {prodImg ? (
                      <img 
                        src={prodImg} 
                        alt={p.title || p.name} 
                        className={`w-14 h-14 object-cover rounded border border-white/10 ${isOutOfStock ? 'opacity-60' : ''}`} 
                      />
                    ) : (
                      <div className="w-14 h-14 bg-ore-dark border border-white/10 rounded flex items-center justify-center text-[10px] text-ore-muted italic">Sin foto</div>
                    )}
                    <div>
                      <h4 className="font-serif text-base text-ore-cream flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono bg-ore-dark border border-ore-gold/30 text-ore-gold px-2 py-0.5 rounded">
                          ORE-{String(p.id).padStart(4, '0')}
                        </span>
                        <span>{p.title || p.name}</span>
                        {isOutOfStock && (
                          <span className="bg-red-500/20 text-red-300 border border-red-500/50 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded">
                            Sin stock
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-ore-muted mt-1">
                        Precio: <strong className="text-ore-gold">${Number(p.price || 0).toLocaleString('es-AR')}</strong> | 
                        Stock: <strong className={isOutOfStock ? 'text-red-400' : 'text-ore-cream'}>{prodStock} u.</strong> | 
                        Cat: {p.category || p.categories?.name || 'N/A'} | 
                        Mat: {p.material || p.materials?.name || 'N/A'} {p.measure ? `| Medida: ${p.measure}` : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleEdit(p)}
                      className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded text-xs transition uppercase tracking-wider font-semibold cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-600/80 hover:bg-red-600 text-white px-3.5 py-2 rounded text-xs transition uppercase tracking-wider font-semibold cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-ore-muted text-sm italic py-8 text-center bg-ore-card rounded-lg border border-white/5">
              No se encontraron productos que coincidan con la búsqueda o el filtro.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}