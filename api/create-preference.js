import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(req, res) {
  // Configuración de cabeceras CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

// Inicializar MercadoPago leyendo la variable de entorno de Vercel
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN 
  });

    const preference = new Preference(client);

    // Mapear los productos del carrito al formato de MercadoPago
    const mpItems = items.map(item => ({
      id: String(item.id || item.cartKey),
      title: item.name || item.title,
      unit_price: Number(item.price),
      quantity: Number(item.qty),
      currency_id: 'ARS'
    }));

    // Crear la preferencia de cobro
    const result = await preference.create({
      body: {
        items: mpItems,
        statement_descriptor: 'ORE JOYERIA',
        back_urls: {
          success: 'https://ore-joyeria.vercel.app',
          failure: 'https://ore-joyeria.vercel.app',
          pending: 'https://ore-joyeria.vercel.app'
        },
        auto_return: 'approved'
      }
    });

    return res.status(200).json({ 
      id: result.id, 
      init_point: result.init_point 
    });

  } catch (error) {
    console.error('Error al crear preferencia en MP:', error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
}