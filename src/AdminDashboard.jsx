import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

export default function AdminDashboard() {
  // Estados para listas existentes
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Estados para formularios de Categoría y Material
  const [newCategory, setNewCategory] = useState('');
  const [newMaterial, setNewMaterial] = useState('');

  // Estado para el formulario de Producto
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Cargar Categorías y Materiales al montar el componente
  useEffect(() => {
    fetchCategories();
    fetchMaterials();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (!error && data) setCategories(data);
  };

  const fetchMaterials = async () => {
    const { data, error } = await supabase.from('materials').select('*').order('name');
    if (!error && data) setMaterials(data);
  };

  // Crear nueva Categoría
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    const { error } = await supabase.from('categories').insert([{ name: newCategory.trim() }]);
    if (error) {
      setMessage(`Error al crear categoría: ${error.message}`);
    } else {
      setMessage('Categoría agregada con éxito');
      setNewCategory('');
      fetchCategories();
    }
  };

  // Crear nuevo Material
  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterial.trim()) return;

    const { error } = await supabase.from('materials').insert([{ name: newMaterial.trim() }]);
    if (error) {
      setMessage(`Error al crear material: ${error.message}`);
    } else {
      setMessage('Material agregado con éxito');
      setNewMaterial('');
      fetchMaterials();
    }
  };

  // Crear Producto con Foto en Supabase Storage
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let imageUrl = '';

      // 1. Subir la imagen si existe
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // Obtener la URL pública de la foto
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      // 2. Insertar el producto en la base de datos
      const { error: insertError } = await supabase.from('products').insert([
        {
          title,
          description,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          category_id: selectedCategory ? parseInt(selectedCategory, 10) : null,
          material_id: selectedMaterial ? parseInt(selectedMaterial, 10) : null,
          image_url: imageUrl,
        },
      ]);

      if (insertError) throw insertError;

      setMessage('¡Producto agregado con éxito!');
      // Limpiar formulario
      setTitle('');
      setDescription('');
      setPrice('');
      setStock(0);
      setSelectedCategory('');
      setSelectedMaterial('');
      setImageFile(null);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Panel de Administración - ORE Joyería</h1>

      {message && (
        <div style={{ padding: '10px', marginBottom: '20px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
          {message}
        </div>
      )}

      {/* Sección Categorías y Materiales */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div>
          <h3>Nueva Categoría</h3>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Ej: Anillos, Cadenas"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ flex: 1, padding: '8px' }}
              required
            />
            <button type="submit" style={{ padding: '8px 16px' }}>Agregar</button>
          </form>
        </div>

        <div>
          <h3>Nuevo Material</h3>
          <form onSubmit={handleAddMaterial} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Ej: Plata 925, Oro 18k"
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              style={{ flex: 1, padding: '8px' }}
              required
            />
            <button type="submit" style={{ padding: '8px 16px' }}>Agregar</button>
          </form>
        </div>
      </div>

      <hr style={{ margin: '30px 0' }} />

      {/* Formulario de Alta de Producto */}
      <h2>Cargar Nuevo Producto</h2>
      <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Título del producto:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Precio ($):</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Stock:</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Categoría:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">-- Seleccionar Categoría --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Material:</label>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">-- Seleccionar Material --</option>
              {materials.map((mat) => (
                <option key={mat.id} value={mat.id}>{mat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Descripción:</label>
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Imagen del producto:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            style={{ padding: '8px 0' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Guardando producto e imagen...' : 'Guardar Producto'}
        </button>
      </form>
    </div>
  );
}