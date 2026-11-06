import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function AdminDashboard() {
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);

  // Estados formularios
  const [newCategory, setNewCategory] = useState('');
  const [newMaterial, setNewMaterial] = useState('');

  // Formulario Producto
  const [editingId, setEditingId] = useState(null); // Si tiene ID, estamos editando
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchMaterials();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const fetchMaterials = async () => {
    const { data } = await supabase.from('materials').select('*').order('name');
    if (data) setMaterials(data);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name), materials(name)')
      .order('id', { ascending: false });
    if (!error && data) setProducts(data);
  };

  // Crear o Editar Producto
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let imageUrl = '';

      // Si hay archivo de imagen nuevo, lo subimos
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

      if (imageUrl) {
        productData.image_url = imageUrl;
      }

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
      fetchProducts();
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setTitle(product.title);
    setDescription(product.description || '');
    setPrice(product.price);
    setStock(product.stock);
    setSelectedCategory(product.category_id || '');
    setSelectedMaterial(product.material_id || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      setMessage(`Error al eliminar: ${error.message}`);
    } else {
      setMessage('Producto eliminado correctamente');
      fetchProducts();
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
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await supabase.from('categories').insert([{ name: newCategory.trim() }]);
    setNewCategory('');
    fetchCategories();
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterial.trim()) return;
    await supabase.from('materials').insert([{ name: newMaterial.trim() }]);
    setNewMaterial('');
    fetchMaterials();
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Panel de Administración - ORE Joyería</h1>

      {message && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
          {message}
        </div>
      )}

      {/* Sección Superior: Gestión de Categorías y Materiales */}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
  
  {/* TARJETA CATEGORÍAS */}
  <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
    <h3 style={{ color: '#d4af37', marginBottom: '15px', fontSize: '15px' }}>AGREGAR CATEGORÍA</h3>
    
    <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
      <input
        type="text"
        placeholder="Ej: Anillos, Cadenas"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        style={{ flex: 1, padding: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
        required
      />
      <button type="submit" style={{ padding: '10px 20px', background: '#d4af37', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>CREAR</button>
    </form>

    {/* LISTA DE CATEGORÍAS EXISTENTES CON TACHITO */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
      {categories && categories.length > 0 ? (
        categories.map(cat => (
          <span 
            key={cat.id} 
            style={{ 
              background: '#2d3748', 
              padding: '6px 12px', 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: '#fff',
              fontSize: '13px'
            }}
          >
            {cat.name}
            <button
              type="button"
              onClick={() => handleDeleteCategory(cat.id)}
              style={{ color: '#fc8181', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
              title="Eliminar categoría"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </span>
        ))
      ) : (
        <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#a0aec0' }}>No hay categorías cargadas</span>
      )}
    </div>
  </div>

  {/* TARJETA MATERIALES */}
  <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
    <h3 style={{ color: '#d4af37', marginBottom: '15px', fontSize: '15px' }}>AGREGAR MATERIAL</h3>
    
    <form onSubmit={handleAddMaterial} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
      <input
        type="text"
        placeholder="Ej: Plata 925, Oro 18k"
        value={newMaterial}
        onChange={(e) => setNewMaterial(e.target.value)}
        style={{ flex: 1, padding: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
        required
      />
      <button type="submit" style={{ padding: '10px 20px', background: '#d4af37', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>CREAR</button>
    </form>

    {/* LISTA DE MATERIALES EXISTENTES CON TACHITO */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
      {materials && materials.length > 0 ? (
        materials.map(mat => (
          <span 
            key={mat.id} 
            style={{ 
              background: '#2d3748', 
              padding: '6px 12px', 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: '#fff',
              fontSize: '13px'
            }}
          >
            {mat.name}
            <button
              type="button"
              onClick={() => handleDeleteMaterial(mat.id)}
              style={{ color: '#fc8181', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
              title="Eliminar material"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </span>
        ))
      ) : (
        <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#a0aec0' }}>No hay materiales cargados</span>
      )}
    </div>
  </div>

</div>
      
  {/* VISTA DE ÉXITO O FORMULARIO */}
{isSuccess ? (
    <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #d4af37', padding: '40px', borderRadius: '8px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
      <div style={{ color: '#d4af37', fontSize: '32px', marginBottom: '10px' }}>✓</div>
      <h3 style={{ color: '#f3f3f3', fontSize: '24px', marginBottom: '10px' }}>¡Producto creado con éxito!</h3>
      <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '25px' }}>El producto ya se encuentra registrado y disponible en el catálogo de la tienda.</p>
      
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button 
          type="button"
          onClick={() => setIsSuccess(false)}
          style={{ backgroundColor: '#d4af37', color: '#111', fontWeight: 'bold', padding: '12px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer', textTransform: 'uppercase', fontSize: '11px' }}
        >
          Crear nuevo producto
        </button>
        
        <button 
          type="button"
          onClick={() => setCurrentView('shop')}
          style={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.2)', color: '#f3f3f3', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer', textTransform: 'uppercase', fontSize: '11px' }}
        >
          Explorar catálogo
        </button>
      </div>
    </div>
  ) : (
    <div>
      <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#f3f3f3' }}>
        {editingId ? 'Editar Producto' : 'Cargar Nuevo Producto'}
      </h2>
      <form onSubmit={handleSubmitProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Tus inputs actuales */}
      </form>
    </div>
  )}

      <hr style={{ margin: '40px 0' }} />

      {/* Listado de Productos Existentes */}
      <h2>Inventario Actual ({products.length} productos)</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
        {products.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {p.image_url ? (
                <img src={p.image_url} alt={p.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
              ) : (
                <div style={{ width: '50px', height: '50px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b' }}>Sin foto</div>
              )}
              <div>
                <h4 style={{ margin: '0 0 5px 0' }}>{p.title}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
                  Precio: <strong>${p.price}</strong> | Stock: <strong>{p.stock}</strong> | 
                  Cat: {p.categories?.name || 'N/A'} | Mat: {p.materials?.name || 'N/A'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleEdit(p)}
                style={{ padding: '6px 12px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                style={{ padding: '6px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}