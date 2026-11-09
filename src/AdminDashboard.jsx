import React, { useState } from 'react';
import { supabase } from './supabase';
import { Trash2, Edit, Plus, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

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

  // Formulario Producto
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(''); // <--- NUEVO: Para guardar la URL actual al editar

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Crear o Editar Producto
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
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

      const productData = {
        title,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        category_id: selectedCategory ? parseInt(selectedCategory, 10) : null,
        material_id: selectedMaterial ? parseInt(selectedMaterial, 10) : null,
        image_url: imageUrl
      };

      if (editingId) {
        // Actualizar producto existente
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId);
    
        if (error) throw error;
        setMessage('¡Producto actualizado con éxito!');
      } else {
        // Crear nuevo producto
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        setMessage('¡Producto agregado con éxito!');
      }
    
      setIsSuccess(true);
      resetForm();
      fetchProductsFromSupabase();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setTitle(product.title || product.name);
    setDescription(product.description || '');
    setPrice(product.price);
    setStock(product.stock);
    setSelectedCategory(product.category_id || '');
    setSelectedMaterial(product.material_id || '');
    
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
      fetchProductsFromSupabase();
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
              <button onClick={resetForm} className="text-xs text-ore-muted hover:text-ore-gold underline uppercase tracking-wider">
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
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-ore-muted mb-1">Stock Inicial *</label>
                <input 
                  type="number" 
                  value={stock} 
                  onChange={e => setStock(e.target.value)} 
                  className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold" 
                  required 
                />
              </div>
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
        <h3 className="font-serif text-2xl text-ore-cream">Inventario Actual ({products.length} products)</h3>
        
        <div className="space-y-3">
          {products && products.length > 0 ? (
            products.map((p) => {
              const prodImg = p.image || p.image_url;
              return (
                <div key={p.id} className="bg-ore-card p-4 rounded-lg border border-white/5 flex items-center justify-between gap-4 shadow">
                  <div className="flex items-center gap-4">
                    {prodImg ? (
                      <img src={prodImg} alt={p.title || p.name} className="w-14 h-14 object-cover rounded border border-white/10" />
                    ) : (
                      <div className="w-14 h-14 bg-ore-dark border border-white/10 rounded flex items-center justify-center text-[10px] text-ore-muted italic">Sin foto</div>
                    )}
                    <div>
                      <h4 className="font-serif text-base text-ore-cream">{p.title || p.name}</h4>
                      <p className="text-xs text-ore-muted mt-0.5">
                        Precio: <strong className="text-ore-gold">${Number(p.price || 0).toLocaleString('es-AR')}</strong> | 
                        Stock: <strong>{p.stock} u.</strong> | 
                        Cat: {p.category || p.categories?.name || 'N/A'} | 
                        Mat: {p.material || p.materials?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded text-xs transition uppercase tracking-wider font-semibold"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="bg-red-600/80 hover:bg-red-600 text-white px-3.5 py-2 rounded text-xs transition uppercase tracking-wider font-semibold"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-ore-muted text-sm italic py-8 text-center bg-ore-card rounded-lg border border-white/5">No hay productos registrados en el inventario.</p>
          )}
        </div>
      </div>

    </div>
  );
}