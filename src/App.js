import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag, Menu, X, Truck, Phone, Mail,
  ArrowRight, CheckCircle, AlertCircle, Trash2, Lock, Plus, Gift
} from 'lucide-react';
import { supabase } from './supabase';
import AdminDashboard from './AdminDashboard';

// ============================================================================
// [NAVIDAD - 1] FRASES ROTATIVAS DEL BANNER SUPERIOR
// ============================================================================

const CHRISTMAS_BANNER_MESSAGES = [
  'Tu Joyería Online de Confianza',
  'Envíos a Todo El País',
  'Tus Regalos Para Navidad Encontralos Acá',
  'Plata 925, Plata con Oro y Oro 18k • Especial Navidad',
];

// ============================================================================
// [NAVIDAD - 2] NIEVE Y DECORACIONES NAVIDEÑAS CON MOVIMIENTO
// ============================================================================

function ChristmasMotionOverlay({ snowCount = 24 }) {
  const snowflakes = React.useMemo(
    () =>
      Array.from({ length: snowCount }, (_, idx) => ({
        id: idx,
        left: `${(idx * 29 + 11) % 100}%`,
        size: `${(idx % 4) + 2}px`,
        duration: `${9 + (idx % 7) * 1.3}s`,
        delay: `${-(idx % 9)}s`,
        opacity: 0.25 + (idx % 4) * 0.13,
      })),
    [snowCount]
  );

  const ornaments = [
    { id: 'orn-1', symbol: '✦', left: '9%', duration: '13s', delay: '-2s', size: '13px' },
    { id: 'orn-2', symbol: '❄', left: '24%', duration: '15s', delay: '-6s', size: '12px' },
    { id: 'orn-3', symbol: '✦', left: '52%', duration: '12s', delay: '-4s', size: '14px' },
    { id: 'orn-4', symbol: '❄', left: '74%', duration: '16s', delay: '-8s', size: '12px' },
    { id: 'orn-5', symbol: '✦', left: '89%', duration: '14s', delay: '-5s', size: '13px' },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none"
    >
      <style>{`
        @keyframes oreChristmasSnow {
          0% {
            transform: translate3d(0, -8vh, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(15px, 50vh, 0) rotate(180deg);
          }
          100% {
            transform: translate3d(-12px, 108vh, 0) rotate(360deg);
          }
        }

        @keyframes oreChristmasOrnament {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(-7deg);
          }
          50% {
            transform: translate3d(-16px, 50vh, 0) rotate(9deg);
          }
          100% {
            transform: translate3d(12px, 110vh, 0) rotate(-6deg);
          }
        }
      `}</style>

      {snowflakes.map((flake) => (
        <span
          key={flake.id}
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            animation: `oreChristmasSnow ${flake.duration} linear ${flake.delay} infinite`,
          }}
          className="absolute top-0 rounded-full bg-amber-100 shadow-[0_0_7px_rgba(253,230,138,0.45)]"
        />
      ))}

      {ornaments.map((item) => (
        <span
          key={item.id}
          style={{
            left: item.left,
            fontSize: item.size,
            animation: `oreChristmasOrnament ${item.duration} ease-in-out ${item.delay} infinite`,
          }}
          className="absolute top-0 text-amber-300/65 drop-shadow-[0_0_6px_rgba(245,158,11,0.35)]"
        >
          {item.symbol}
        </span>
      ))}
    </div>
  );
}

// ============================================================================
// [NAVIDAD - 3] COMPONENTE BANNER SUPERIOR ROTATIVO
// ============================================================================

function ChristmasRotatingBanner({ messages = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!messages.length) return undefined;

    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 240);
    }, 3500);

    return () => clearInterval(timer);
  }, [messages]);

  if (!messages.length) return null;

  return (
    <div className="bg-ore-gold text-ore-dark text-xs font-semibold py-1.5 px-4 text-center tracking-wider flex items-center justify-center gap-2">
      <span
        className={`transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        ✦ {messages[activeIndex]} ✦
      </span>
    </div>
  );
}

// ============================================================================
// [NAVIDAD - 4] GUIRNALDA FRONDOSA CON LUCES, ESFERAS, CASCABELES Y TRINEO
// INTERACTIVO COLGANDO BAJO EL HEADER
// ============================================================================

function ChristmasHeaderGarland({ onGoShop }) {
  const [sleighModalOpen, setSleighModalOpen] = useState(false);
  const [sleighHovered, setSleighHovered] = useState(false);

  const garlandSegments = Array.from({ length: 24 }, (_, i) => i);

  const bulbs = [
    { left: '5%', top: 7, delay: '0s', dur: '1.7s' },
    { left: '12%', top: 11, delay: '0.4s', dur: '2.1s' },
    { left: '19%', top: 6, delay: '0.9s', dur: '1.5s' },
    { left: '26%', top: 11, delay: '0.2s', dur: '2.3s' },
    { left: '33%', top: 7, delay: '1.1s', dur: '1.8s' },
    { left: '40%', top: 11, delay: '0.6s', dur: '2.0s' },
    { left: '47%', top: 6, delay: '1.3s', dur: '1.6s' },
    { left: '54%', top: 11, delay: '0.3s', dur: '2.2s' },
    { left: '61%', top: 7, delay: '0.8s', dur: '1.7s' },
    { left: '68%', top: 11, delay: '1.2s', dur: '2.1s' },
    { left: '75%', top: 6, delay: '0.5s', dur: '1.6s' },
    { left: '82%', top: 11, delay: '1.0s', dur: '1.9s' },
    { left: '89%', top: 7, delay: '0.1s', dur: '2.3s' },
    { left: '95%', top: 10, delay: '0.7s', dur: '1.8s' },
  ];

  // Esferas de colores y cascabeles colgantes sobre el cable de guirnalda
  const hangingItems = [
    { left: '8%', kind: 'ball', color: '#D4AF37', cord: 10, delay: '0s' },
    { left: '16%', kind: 'bell', color: '#FDE68A', cord: 9, delay: '0.5s' },
    { left: '25%', kind: 'ball', color: '#C53030', cord: 12, delay: '1.0s' },
    { left: '35%', kind: 'ball', color: '#2F855A', cord: 9, delay: '0.3s' },
    { left: '45%', kind: 'bell', color: '#F6E05E', cord: 11, delay: '0.8s' },
    { left: '56%', kind: 'ball', color: '#D4AF37', cord: 10, delay: '1.3s' },
    { left: '66%', kind: 'ball', color: '#C53030', cord: 12, delay: '0.2s' },
    { left: '76%', kind: 'bell', color: '#FDE68A', cord: 9, delay: '0.9s' },
    { left: '85%', kind: 'ball', color: '#2F855A', cord: 11, delay: '0.6s' },
    { left: '93%', kind: 'ball', color: '#D4AF37', cord: 10, delay: '1.2s' },
  ];

  return (
    <>
      <div
        aria-hidden="false"
        className="pointer-events-none absolute top-full left-0 right-0 h-14 overflow-visible z-30 select-none"
      >
        <style>{`
          @keyframes orePineBulbTwinkle {
            0%, 100% {
              opacity: 0.4;
              transform: translateX(-50%) scale(0.88);
            }
            50% {
              opacity: 1;
              transform: translateX(-50%) scale(1.18);
            }
          }

          @keyframes oreOrnamentSwing {
            0%, 100% {
              transform: translateX(-50%) rotate(-5deg);
            }
            50% {
              transform: translateX(-50%) rotate(5deg);
            }
          }

          /* Recorrido de derecha a izquierda */
          @keyframes oreSleighGlideRightToLeft {
            0% {
              right: -165px;
            }
            100% {
              right: calc(100% + 165px);
            }
          }

          @keyframes oreSleighBob {
            0%, 100% {
              transform: translateY(0px) rotate(1.5deg);
            }
            50% {
              transform: translateY(-2.5px) rotate(-1.5deg);
            }
          }
        `}</style>

        {/* Guirnalda frondosa tipo pino */}
        <div className="relative w-full h-4 flex items-center justify-between overflow-hidden">
          {garlandSegments.map((idx) => (
            <svg
              key={idx}
              viewBox="0 0 64 24"
              className="h-4 flex-1 shrink-0 -mx-1"
              preserveAspectRatio="none"
            >
              <path
                d="M2,12 L16,4 L12,12 L24,3 L20,12 L34,2 L29,12 L44,4 L39,12 L54,5 L49,12 L63,11"
                fill="none"
                stroke="#1B4332"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M1,13 L15,21 L12,13 L25,22 L21,13 L35,22 L30,13 L45,21 L40,13 L55,20 L50,13 L63,13"
                fill="none"
                stroke="#2D6A4F"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M6,12 L20,7 L18,12 L32,6 L29,12 L46,7 L42,12 L58,8"
                fill="none"
                stroke="#40916C"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          ))}
        </div>

        {/* Luces cálidas titilando entre la guirnalda */}
        {bulbs.map((bulb, i) => (
          <span
            key={`bulb-${i}`}
            style={{
              left: bulb.left,
              top: `${bulb.top}px`,
              animation: `orePineBulbTwinkle ${bulb.dur} ease-in-out ${bulb.delay} infinite`,
            }}
            className="absolute w-2 h-2 rounded-full bg-[#FEF08A] shadow-[0_0_9px_rgba(254,240,138,0.95),0_0_4px_rgba(212,175,55,0.85)]"
          />
        ))}

        {/* Esferas de colores y cascabeles colgantes */}
        {hangingItems.map((item, i) => (
          <span
            key={`hang-${i}`}
            style={{
              left: item.left,
              top: '8px',
              animation: `oreOrnamentSwing 2.8s ease-in-out ${item.delay} infinite`,
            }}
            className="absolute flex flex-col items-center origin-top"
          >
            <span
              style={{ height: `${item.cord}px` }}
              className="w-[1px] bg-amber-200/50"
            />
            {item.kind === 'ball' ? (
              <span
                style={{
                  backgroundColor: item.color,
                  boxShadow: `0 0 8px ${item.color}88`,
                }}
                className="w-2.5 h-2.5 rounded-full border border-white/25 relative"
              >
                <span className="w-1 h-1 rounded-full bg-white/70 absolute top-0.5 left-0.5" />
              </span>
            ) : (
              <span className="flex flex-col items-center">
                <span
                  style={{
                    backgroundColor: item.color,
                    boxShadow: '0 0 7px rgba(253, 230, 138, 0.75)',
                  }}
                  className="w-2.5 h-2.5 rounded-full border border-amber-900/40 flex items-center justify-center"
                >
                  <span className="w-1 h-[1.5px] bg-amber-950/60 rounded-full" />
                </span>
              </span>
            )}
          </span>
        ))}

        {/* Trineo con renos y Papá Noel moviéndose de DERECHA a IZQUIERDA */}
        <div
          style={{
            top: '17px',
            animation: 'oreSleighGlideRightToLeft 26s linear infinite',
            animationPlayState: sleighHovered || sleighModalOpen ? 'paused' : 'running',
          }}
          className="absolute right-0 pointer-events-auto cursor-pointer group flex flex-col items-center"
          onMouseEnter={() => setSleighHovered(true)}
          onMouseLeave={() => setSleighHovered(false)}
          onClick={() => setSleighModalOpen(true)}
          title="Felices Fiestas • ORE"
        >
          {sleighHovered && !sleighModalOpen && (
            <div className="mb-1 px-2.5 py-0.5 rounded-full bg-ore-card/95 border border-ore-gold/70 text-[10px] font-semibold tracking-wider text-ore-gold whitespace-nowrap shadow-lg text-center">
              ✦ Felices Fiestas • ORE ✦
            </div>
          )}

          <div
            style={{ animation: 'oreSleighBob 2.2s ease-in-out infinite' }}
            className="flex items-center"
          >
            {/* Se refleja horizontalmente el conjunto para que los renos avancen hacia la izquierda */}
            <svg
              viewBox="0 0 156 36"
              className={`h-9 sm:h-10 w-auto -scale-x-100 drop-shadow-[0_2px_9px_rgba(212,175,55,0.45)] transition-transform duration-200 ${
                sleighHovered ? 'scale-105 -scale-x-105' : ''
              }`}
            >
              {/* Riendas doradas */}
              <line
                x1="44"
                y1="19"
                x2="112"
                y2="16"
                stroke="#FDE68A"
                strokeWidth="0.95"
                strokeDasharray="2 1.5"
              />

              {/* Reno 2 (delantero, guía hacia la izquierda en pantalla) */}
              <g transform="translate(114, 11)">
                <path d="M18,7 L24,5 L26,8" fill="none" stroke="#D4AF37" strokeWidth="1.2" />
                <path d="M21,6 L22,2 M23,5 L25,3" stroke="#FDE68A" strokeWidth="1" />
                <ellipse cx="14" cy="11" rx="6" ry="3.4" fill="#A47148" />
                <circle cx="19.5" cy="9.5" r="2.5" fill="#A47148" />
                <circle cx="21.8" cy="9.5" r="1.1" fill="#E53E3E" />
                <line x1="10" y1="14" x2="9" y2="19" stroke="#8B5A2B" strokeWidth="1.3" />
                <line x1="17" y1="14" x2="18" y2="19" stroke="#8B5A2B" strokeWidth="1.3" />
              </g>

              {/* Reno 1 */}
              <g transform="translate(82, 12)">
                <path d="M17,7 L22,5 L24,8" fill="none" stroke="#D4AF37" strokeWidth="1.2" />
                <path d="M19,6 L20,2 M21,5 L23,3" stroke="#FDE68A" strokeWidth="1" />
                <ellipse cx="13" cy="11" rx="5.8" ry="3.3" fill="#8D5B4C" />
                <circle cx="18.2" cy="9.5" r="2.4" fill="#8D5B4C" />
                <circle cx="20.4" cy="9.5" r="0.9" fill="#FDE68A" />
                <line x1="9.5" y1="14" x2="8.5" y2="19" stroke="#6F4537" strokeWidth="1.3" />
                <line x1="16" y1="14" x2="17" y2="19" stroke="#6F4537" strokeWidth="1.3" />
              </g>

              {/* Trineo elegante rojo y dorado */}
              <g transform="translate(5, 11)">
                <path
                  d="M2,21 L38,21 Q43,21 44,16"
                  fill="none"
                  stroke="#FDE68A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line x1="10" y1="17" x2="10" y2="21" stroke="#D4AF37" strokeWidth="1.3" />
                <line x1="32" y1="17" x2="32" y2="21" stroke="#D4AF37" strokeWidth="1.3" />
                <path
                  d="M5,10 L37,10 Q36,17 28,17 L11,17 Q6,17 5,10 Z"
                  fill="#B91C1C"
                  stroke="#FDE68A"
                  strokeWidth="1"
                />
                {/* Regalo dorado en el trineo */}
                <rect x="25" y="4.5" width="7.5" height="5.5" rx="0.9" fill="#D4AF37" />
                <line x1="28.75" y1="4.5" x2="28.75" y2="10" stroke="#FEF08A" strokeWidth="1" />

                {/* Papá Noel a penas más grande */}
                <g transform="translate(16.5, 10) scale(1.22) translate(-16.5, -10)">
                  <circle cx="16" cy="5.5" r="3.2" fill="#FBD38D" />
                  <path d="M12.8,6.6 Q16,10.8 19.2,6.6 Z" fill="#FFFFFF" />
                  <path d="M12.2,4.2 L16.5,0.2 L20.8,4.2 Z" fill="#DC2626" />
                  <circle cx="21.3" cy="4.2" r="1.5" fill="#FFFFFF" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* MENSAJE GRANDE AL APRETAR EL TRINEO */}
      {sleighModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setSleighModalOpen(false)}
        >
          <div
            className="w-full max-w-lg my-auto bg-ore-card border border-ore-gold/60 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSleighModalOpen(false)}
              aria-label="Cerrar mensaje navideño"
              className="absolute top-4 right-4 text-ore-muted hover:text-ore-gold p-1 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-14 h-14 rounded-full bg-ore-gold/15 border border-ore-gold/50 flex items-center justify-center mx-auto text-ore-gold shadow-lg">
              <Gift size={26} />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.25em] text-ore-gold font-semibold">
                ✦ Felices Fiestas • ORE Joyería ✦
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-ore-cream leading-snug">
                Felices Fiestas te desea ORE Joyería
              </h3>
            </div>

            <div className="bg-ore-dark/90 border border-ore-gold/35 rounded-xl p-5 space-y-2">
              <p className="text-sm sm:text-base text-ore-cream leading-relaxed">
                Tenemos un regalo para vos: con tu primera compra te llevás unos{' '}
                <strong className="text-ore-gold font-bold">
                  Aros de Plata 925 DE REGALO!!
                </strong>
              </p>
              <p className="text-[11px] text-ore-muted">
                Válido en tu primera compra • Stock sujeto a disponibilidad.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              {onGoShop && (
                <button
                  type="button"
                  onClick={() => {
                    setSleighModalOpen(false);
                    onGoShop();
                  }}
                  className="flex-1 bg-ore-gold hover:bg-ore-gold-light text-ore-dark font-bold py-3.5 px-5 uppercase text-xs tracking-widest rounded-lg transition shadow-lg cursor-pointer"
                >
                  Explorar la tienda
                </button>
              )}
              <button
                type="button"
                onClick={() => setSleighModalOpen(false)}
                className="flex-1 bg-ore-dark hover:bg-white/10 text-ore-cream border border-white/15 font-semibold py-3.5 px-5 uppercase text-xs tracking-widest rounded-lg transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const HERO_BACKGROUND_IMAGE =
  'https://gxjpsfchccljmnpdyegn.supabase.co/storage/v1/object/public/product-images/joyasfondo.jpg';
const MP_ISOTIPO_URL =
  'https://gxjpsfchccljmnpdyegn.supabase.co/storage/v1/object/public/product-images/mp-isotipo.svg';

const VIEW_TO_HASH = {
  home: '#/',
  shop: '#/tienda',
  gold: '#/compramos-oro',
  about: '#/nosotros',
  contact: '#/contacto',
  admin: '#/admin'
};

const slugifyProduct = (product) => {
  const rawName = String(product?.title || product?.name || 'pieza').toLowerCase();
  const cleanSlug = rawName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${product.id}-${cleanSlug || 'pieza'}`;
};

const buildProductHash = (product) => `#/producto/${slugifyProduct(product)}`;

export default function App() {
  // Estados de navegación y vistas
  const [currentView, setCurrentView] = useState('home'); // 'home', 'shop', 'gold', 'about', 'contact', 'admin', 'product-detail'
  const [shopMode, setShopMode] = useState('step'); // 'step' (Ver Catalogo: Categoria -> Material) | 'collection' (Explorar Coleccion: todo + filtro desplegable)
  const [collectionCategory, setCollectionCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Toast temporal solo para "Agregado al carrito" (la barra de envío gratis queda persistente mientras haya items)
  const [addedToast, setAddedToast] = useState(null);
  const toastTimeoutRef = useRef(null);
  const pendingProductSlugRef = useRef(null);

  // Autenticación Admin
  const [adminPin, setAdminPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('ore_admin_auth') === 'true';
  });

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);

  // Estados para cálculo dinámico de envío
  const [postalCode, setPostalCode] = useState('');
  const [deliveryType, setDeliveryType] = useState('domicilio'); // 'domicilio' | 'sucursal'

  const calcularEnvioAndreani = (cp, tipoEntrega, subtotalCarrito) => {
    const cpClean = (cp || '').replace(/\D/g, '');
    const cpNum = Number(cpClean);

    if (cpClean.length < 4 || !cpNum) {
      return {
        costo: 0,
        zona: 'Ingresá tu Código Postal para calcular',
        calculado: false,
        esMendoza: false
      };
    }

    // 1. Gran Mendoza (CPs 5500 a 5549) -> Envío gratis local a partir de $50.000
    if (cpNum >= 5500 && cpNum <= 5549) {
      const esGratisMendoza = subtotalCarrito >= 50000;
      const costoEnvio = tipoEntrega === 'domicilio' ? (esGratisMendoza ? 0 : 7000) : 0;

      return {
        costo: costoEnvio,
        zona: esGratisMendoza
          ? `Gran Mendoza (CP ${cpClean}) - ¡Envío Local GRATIS (Superaste $50.000)!`
          : (tipoEntrega === 'domicilio' ? `Gran Mendoza (CP ${cpClean}) - Envío a Domicilio ($7.000)` : `Gran Mendoza (CP ${cpClean}) - Retiro en ORE ($0)`),
        calculado: true,
        esMendoza: true
      };
    }

    // 2. Resto del país -> Costo habitual de Andreani según la región
    if ((cpNum >= 1000 && cpNum <= 1440) || (cpNum >= 1600 && cpNum <= 1999)) {
      return {
        costo: tipoEntrega === 'domicilio' ? 13900 : 11500,
        zona: `CABA / Buenos Aires (CP ${cpClean}) - Andreani ${tipoEntrega === 'domicilio' ? 'Domicilio' : 'Sucursal'}`,
        calculado: true,
        esMendoza: false
      };
    }

    if ((cpNum >= 2000 && cpNum <= 3999) || (cpNum >= 5000 && cpNum <= 5880)) {
      return {
        costo: tipoEntrega === 'domicilio' ? 15200 : 12500,
        zona: `Centro / Litoral / Paraná (CP ${cpClean}) - Andreani ${tipoEntrega === 'domicilio' ? 'Domicilio' : 'Sucursal'}`,
        calculado: true,
        esMendoza: false
      };
    }

    if (cpNum >= 8300 && cpNum <= 9490) {
      return {
        costo: tipoEntrega === 'domicilio' ? 16000 : 13800,
        zona: `Patagonia / Ushuaia (CP ${cpClean}) - Andreani ${tipoEntrega === 'domicilio' ? 'Domicilio' : 'Sucursal'}`,
        calculado: true,
        esMendoza: false
      };
    }

    return {
      costo: tipoEntrega === 'domicilio' ? 14500 : 12000,
      zona: `Resto del País (CP ${cpClean}) - Andreani ${tipoEntrega === 'domicilio' ? 'Domicilio' : 'Sucursal'}`,
      calculado: true,
      esMendoza: false
    };
  };

  // Carrito de compras
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ore_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ore_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const triggerAddedToast = (productName) => {
    setAddedToast({
      productName: productName || 'Producto'
    });
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setAddedToast(null);
    }, 3200);
  };

  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);

  const sortByPriceAsc = (list) =>
    [...list].sort((a, b) => Number(a?.price ?? 0) - Number(b?.price ?? 0));

  const sampleProducts = sortByPriceAsc([
    {
      id: 1,
      title: 'Anillo Solitario Clásico',
      category: 'Anillos',
      material: 'Oro 18k',
      price: 285000,
      image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      description: 'Elegante anillo solitario en oro amarillo de 18 kilates con acabado pulido a mano.',
      stock: 1,
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
  ]).map(p => ({
    ...p,
    name: p.title,
    image: p.image_url
  }));

  const [products, setProducts] = useState(sampleProducts);

  const findProductBySlug = (slugOrId, productList) => {
    if (!slugOrId) return null;
    const cleaned = decodeURIComponent(String(slugOrId)).replace(/^\/+|\/+$/g, '');
    const idPrefixMatch = cleaned.match(/^(\d+)(?:-|$)/);
    const parsedId = idPrefixMatch ? Number(idPrefixMatch[1]) : Number(cleaned);

    return (
      productList.find(p => Number(p.id) === parsedId) ||
      productList.find(p => slugifyProduct(p) === cleaned) ||
      null
    );
  };

  const syncStateWithUrl = (productList = products) => {
    const rawHash = window.location.hash || '';
    const pathname = window.location.pathname || '/';

    if (pathname === '/admin' || rawHash === '#admin' || rawHash === '#/admin') {
      pendingProductSlugRef.current = null;
      setCurrentView('admin');
      return;
    }

    const normalizedHash = rawHash.startsWith('#/')
      ? rawHash.slice(1)
      : rawHash.startsWith('#')
        ? `/${rawHash.slice(1)}`
        : '/';

    const productMatch = normalizedHash.match(/^\/producto\/(.+)$/);
    if (productMatch) {
      const slug = productMatch[1];
      const matched = findProductBySlug(slug, productList);
      if (matched) {
        pendingProductSlugRef.current = null;
        setSelectedProduct(matched);
        setCurrentView('product-detail');
      } else {
        pendingProductSlugRef.current = slug;
        setCurrentView('product-detail');
      }
      return;
    }

    pendingProductSlugRef.current = null;

    if (normalizedHash === '/tienda' || normalizedHash === '/shop') {
      setCurrentView('shop');
      return;
    }
    if (normalizedHash === '/compramos-oro' || normalizedHash === '/gold') {
      setCurrentView('gold');
      return;
    }
    if (normalizedHash === '/nosotros' || normalizedHash === '/about') {
      setCurrentView('about');
      return;
    }
    if (normalizedHash === '/contacto' || normalizedHash === '/contact') {
      setCurrentView('contact');
      return;
    }

    setCurrentView('home');
  };

  const pushHashRoute = (nextHash, replace = false) => {
    if (window.location.hash === nextHash) return;
    if (replace) {
      window.history.replaceState(null, '', nextHash);
    } else {
      window.history.pushState(null, '', nextHash);
    }
  };

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

  useEffect(() => {
    if (!window.location.hash && window.location.pathname === '/') {
      window.history.replaceState(null, '', '#/');
    }
    syncStateWithUrl(sampleProducts);

    const handleRouteChange = () => {
      syncStateWithUrl(products);
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, [products]);

  const availableProducts = sortByPriceAsc(
    products.filter(p => Number(p.stock ?? 0) > 0)
  );

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
      const sorted = sortByPriceAsc(formatted);
      setProducts(sorted);

      if (pendingProductSlugRef.current) {
        const matched = findProductBySlug(pendingProductSlugRef.current, sorted);
        if (matched) {
          pendingProductSlugRef.current = null;
          setSelectedProduct(matched);
          setCurrentView('product-detail');
        }
      }
    }
  };

  const [filterCategory, setFilterCategory] = useState('Todos');
  const [filterMaterial, setFilterMaterial] = useState('Todos');

  const openStepCatalog = () => {
    setFilterCategory('Todos');
    setFilterMaterial('Todos');
    setCollectionCategory('Todos');
    setShopMode('step');
    setCurrentView('shop');
    pushHashRoute(VIEW_TO_HASH.shop);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openFullCollection = () => {
    setFilterCategory('Todos');
    setFilterMaterial('Todos');
    setCollectionCategory('Todos');
    setShopMode('collection');
    setCurrentView('shop');
    pushHashRoute(VIEW_TO_HASH.shop);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProductDetail = (product) => {
    if (!product) return;
    setSelectedProduct(product);
    setCurrentView('product-detail');
    pushHashRoute(buildProductHash(product));
    setCartOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [goldForm, setGoldForm] = useState({
    name: '', phone: '', email: '', pieceType: 'Anillo', karat: '18k', weight: '', description: '', acceptedTerms: false
  });
  const [goldSuccess, setGoldSuccess] = useState(false);

  const handleGoldSubmit = (e) => {
    e.preventDefault();
    setGoldSuccess(true);
    setGoldForm({ name: '', phone: '', email: '', pieceType: 'Anillo', karat: '18k', weight: '', description: '', acceptedTerms: false });
  };

  const addToCart = (product, selectedSize, options = { openCart: false, showToast: true }) => {
    if (!product || Number(product.stock ?? 0) <= 0) return;

    const maxStock = Number(product.stock ?? 1);
    const itemKey = `${product.id}-${selectedSize || 'unico'}`;
    const existing = cart.find(item => item.cartKey === itemKey);

    let nextCart;
    if (existing) {
      const nextQty = Math.min(existing.qty + 1, maxStock);
      nextCart = cart.map(item => item.cartKey === itemKey ? { ...item, qty: nextQty } : item);
    } else {
      nextCart = [...cart, { ...product, selectedSize: selectedSize || 'Estándar', qty: 1, cartKey: itemKey }];
    }

    setCart(nextCart);

    if (options.openCart) {
      setCartOpen(true);
    } else if (options.showToast !== false) {
      triggerAddedToast(product.name || product.title);
    }
  };

  const updateQty = (cartKey, delta) => {
    setCart(cart.map(item => {
      if (item.cartKey === cartKey) {
        const maxStock = Number(item.stock ?? 99);
        const newQty = item.qty + delta;
        if (newQty <= 0) return null;
        return newQty > maxStock ? item : { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (cartKey) => {
    setCart(cart.filter(item => item.cartKey !== cartKey));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const transferDiscountAmount = Math.round(cartTotal * 0.15);
  const cartTotalWithTransfer = Math.max(cartTotal - transferDiscountAmount, 0);

  const suggestedProducts = sortByPriceAsc(
    availableProducts.filter(p => !cart.some(item => item.id === p.id))
  ).slice(0, 2);

  const getSizeGuideType = (product) => {
    if (!product) return null;
    const cat = (product.category || product.categories?.name || product.title || product.name || '').toLowerCase();

    if (cat.includes('anillo') || cat.includes('alianza') || cat.includes('cintillo') || cat.includes('solitario')) {
      return 'ring';
    }
    if (cat.includes('cadena') || cat.includes('collar') || cat.includes('gargantilla')) {
      return 'chain';
    }
    if (cat.includes('pulsera') || cat.includes('esclava')) {
      return 'bracelet';
    }
    return null;
  };

  const isProductNew = (product) => {
    if (!product.created_at) return false;
    const createdDate = new Date(product.created_at);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  };

  const validarSoloTexto = (valor) => valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  const validarSoloNumerosPeso = (valor) => valor.replace(/[^0-9.,]/g, '');
  const validarSoloTelefono = (valor) => valor.replace(/[^0-9+\s-]/g, '');

  const renderLastUnitBadge = (product, large = false) => {
    if (Number(product?.stock ?? 0) !== 1) return null;

    return (
      <span
        className={`absolute ${large ? 'top-4 right-4 px-3 py-1' : 'top-3 right-3 px-2 py-0.5'} z-10 bg-ore-gold text-ore-dark ${large ? 'text-[10px]' : 'text-[9px]'} font-bold uppercase tracking-[0.2em] rounded shadow-md select-none`}
      >
        Última unidad
      </span>
    );
  };

  const MercadoPagoLogo = ({ className = "h-5 w-auto shrink-0 object-contain" }) => (
    <img
      src={MP_ISOTIPO_URL}
      alt="Mercado Pago"
      loading="lazy"
      className={className}
    />
  );

  const WhatsAppLogo = ({ className = "w-4 h-4 shrink-0" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );

  const navigateToView = (viewId) => {
    if (viewId === 'shop') {
      openStepCatalog();
      return;
    }
    setCurrentView(viewId);
    pushHashRoute(VIEW_TO_HASH[viewId] || '#/');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasFreeShippingBar = cartCount > 0 && !cartOpen && !checkoutModalOpen && !sizeModalOpen;
  const showFloatingWhatsapp = !cartOpen && !checkoutModalOpen && !sizeModalOpen && !hasFreeShippingBar && !addedToast;

  const freeShippingGoal = 50000;
  const shippingPct = Math.min(Math.round((cartTotal / freeShippingGoal) * 100), 100);
  const shippingWidthPct = Math.min((cartTotal / freeShippingGoal) * 100, 100);
  const shippingRemaining = Math.max(freeShippingGoal - cartTotal, 0);

  return (
    <div className="min-h-screen bg-ore-dark text-ore-cream flex flex-col font-sans selection:bg-ore-gold selection:text-ore-dark">

      {/* [NAVIDAD - 2 ACTIVACION] NIEVE Y DECORACIONES EN MOVIMIENTO */}
      <ChristmasMotionOverlay snowCount={24} />

      {/* [NAVIDAD - 3 ACTIVACION] BANNER SUPERIOR NAVIDEÑO ROTATIVO */}
      <ChristmasRotatingBanner messages={CHRISTMAS_BANNER_MESSAGES} />

      <header className="sticky top-0 z-40 bg-ore-dark/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="md:hidden text-ore-cream hover:text-ore-gold p-2 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div onClick={() => navigateToView('home')} className="cursor-pointer flex items-center gap-3">
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

          <nav className="hidden md:flex items-center space-x-9">
            {[
              { id: 'shop', label: 'Tienda' },
              { id: 'gold', label: 'Compramos Oro' },
              { id: 'about', label: 'Nosotros' },
              { id: 'contact', label: 'Contacto' }
            ].map((item) => {
              const isActive = currentView === item.id || (item.id === 'shop' && currentView === 'product-detail');
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToView(item.id)}
                  className={`relative py-2 text-[11px] uppercase tracking-[0.22em] font-medium transition-colors duration-300 cursor-pointer group ${
                    isActive
                      ? 'text-ore-gold'
                      : 'text-ore-cream/85 hover:text-ore-gold-light'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`absolute bottom-0 left-0 h-[1.5px] bg-gradient-to-r from-transparent via-ore-gold to-transparent transition-all duration-300 ${
                      isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-80'
                    }`}
                  />
                </button>
              );
            })}

            {isAdminAuthenticated && (
              <button
                onClick={() => navigateToView('admin')}
                className="bg-ore-gold/20 text-ore-gold border border-ore-gold/40 px-3 py-1 rounded text-[11px] uppercase tracking-widest hover:bg-ore-gold/30 transition cursor-pointer"
              >
                Panel Admin
              </button>
            )}
          </nav>

          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com/ore.joyeria"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de ORE Joyería"
              className="relative py-2 text-[11px] uppercase tracking-[0.22em] font-medium text-ore-cream/85 hover:text-ore-gold transition-colors duration-300 cursor-pointer group flex items-center gap-2"
            >
              <svg
                className="w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span className="hidden lg:inline">Instagram</span>
              <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-gradient-to-r from-transparent via-ore-gold to-transparent transition-all duration-300 group-hover:w-full opacity-80" />
            </a>

            <button
              onClick={() => setCartOpen(true)}
              className="relative py-2 text-[11px] uppercase tracking-[0.22em] font-medium text-ore-cream/85 hover:text-ore-gold transition-colors duration-300 cursor-pointer group flex items-center gap-2"
              aria-label="Ver carrito"
            >
              <div className="relative">
                <ShoppingBag size={20} className="transition-transform duration-300 group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-ore-gold text-ore-dark text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline">Carrito</span>
              <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-gradient-to-r from-transparent via-ore-gold to-transparent transition-all duration-300 group-hover:w-full opacity-80" />
            </button>
          </div>
        </div>

        {/* [NAVIDAD - 4 ACTIVACION] GUIRNALDA FRONDOSA, ESFERAS, CASCABELES Y TRINEO */}
        <ChristmasHeaderGarland onGoShop={openStepCatalog} />

        {/* MENÚ MÓVIL DESPLEGABLE */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-ore-card/98 backdrop-blur-md border-t border-white/10 px-6 py-4 space-y-1 shadow-2xl">
            {[
              { id: 'shop', label: 'Tienda' },
              { id: 'gold', label: 'Compramos Oro' },
              { id: 'about', label: 'Nosotros' },
              { id: 'contact', label: 'Contacto' }
            ].map((item) => {
              const isActive = currentView === item.id || (item.id === 'shop' && currentView === 'product-detail');
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToView(item.id)}
                  className={`block w-full text-left py-2.5 text-xs uppercase tracking-[0.2em] border-b border-white/5 last:border-b-0 transition-colors cursor-pointer ${
                    isActive ? 'text-ore-gold font-semibold' : 'text-ore-cream hover:text-ore-gold'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {isAdminAuthenticated && (
              <button
                onClick={() => navigateToView('admin')}
                className="block w-full text-left py-2.5 text-xs uppercase tracking-[0.2em] text-ore-gold font-semibold cursor-pointer"
              >
                Panel Admin
              </button>
            )}
          </div>
        )}
      </header>

      {/* AVISO TEMPORAL DE PRODUCTO AGREGADO (SE BORRA SOLO, SIN BORRAR LA BARRA DE ENVÍO GRATIS) */}
      {addedToast && !cartOpen && (
        <div className="fixed top-24 right-4 sm:right-6 z-50 bg-ore-card/95 backdrop-blur-md border border-ore-gold/60 text-ore-cream px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2.5 text-xs">
          <CheckCircle size={15} className="text-emerald-400 shrink-0" />
          <span className="truncate max-w-[220px]">
            Agregado: <strong className="text-ore-gold">{addedToast.productName}</strong>
          </span>
        </div>
      )}

      {/* BARRA DE ENVÍO GRATIS PERSISTENTE Y DISCRETA (PC Y CELULAR) MIENTRAS HAYA ITEMS EN EL CARRITO */}
      {hasFreeShippingBar && (
        <div className="fixed bottom-4 right-4 z-40 w-[calc(100%-2rem)] max-w-xs bg-ore-dark/75 backdrop-blur-md border border-ore-gold/45 text-ore-cream px-3.5 py-2.5 rounded-xl shadow-lg space-y-1.5 text-left pointer-events-auto">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] uppercase tracking-[0.18em] text-ore-gold font-bold">
              Envío Gran Mendoza
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="text-[9px] uppercase tracking-wider text-ore-cream/85 hover:text-ore-gold underline cursor-pointer"
              >
                Carrito ({cartCount})
              </button>
              <span className="text-[9px] font-mono text-ore-gold font-bold">
                {shippingPct}%
              </span>
            </div>
          </div>

          <p className="text-[11px] text-ore-cream/95 leading-snug">
            {cartTotal >= freeShippingGoal ? (
              <span className="text-emerald-300 font-semibold">¡Envío gratis desbloqueado en Gran Mendoza!</span>
            ) : (
              <>
                Te faltan{' '}
                <strong className="text-ore-gold font-bold">
                  ${shippingRemaining.toLocaleString('es-AR')}
                </strong>{' '}
                para envío gratis
              </>
            )}
          </p>

          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-ore-gold h-full transition-all duration-500 ease-out"
              style={{ width: `${shippingWidthPct}%` }}
            />
          </div>
        </div>
      )}

      <main className="flex-grow">

        {currentView === 'home' && (
          <div>
            <section className="relative h-[80vh] flex items-center justify-center text-center px-4 overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img
                  src={HERO_BACKGROUND_IMAGE}
                  alt="Joyería ORE"
                  className="w-full h-full object-cover opacity-90 brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/35"></div>
              </div>

              <div className="relative z-10 max-w-3xl space-y-6">
                <span className="text-ore-gold uppercase tracking-[0.3em] text-xs font-semibold">Tu Joyería Online de Confianza</span>
                <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-wide leading-tight">Joyas que acompañan tu historia</h1>
                <p className="text-ore-cream/80 text-sm sm:text-base max-w-xl mx-auto font-light">Diseños exclusivos en Plata, Plata con Oro y Oro 18k creados para perdurar en el tiempo.</p>
                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={openStepCatalog} className="bg-ore-gold text-ore-dark font-semibold px-8 py-3.5 tracking-wider uppercase text-xs hover:bg-ore-gold-light transition shadow-lg cursor-pointer">
                    Ver Catalogo
                  </button>
                  <button onClick={() => navigateToView('gold')} className="border border-ore-gold text-ore-gold hover:bg-ore-gold/10 font-semibold px-8 py-3.5 tracking-wider uppercase text-xs transition cursor-pointer">
                    Vender mi oro
                  </button>
                </div>
              </div>
            </section>

            <section className="py-16 bg-ore-card/50 border-t border-b border-white/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <span className="text-ore-gold text-xs uppercase tracking-[0.2em] font-semibold">Nuestra Selección</span>
                    <h2 className="font-serif text-3xl mt-1">Piezas Recientes</h2>
                  </div>
                  <button onClick={openFullCollection} className="text-xs uppercase tracking-widest text-ore-gold hover:underline flex items-center gap-1 cursor-pointer">
                    Explorar Colección <ArrowRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {availableProducts.slice(0, 4).map(product => (
                    <div key={product.id} className="group cursor-pointer bg-ore-card rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition border border-white/5 flex flex-col" onClick={() => openProductDetail(product)}>
                      <div className="relative h-72 overflow-hidden bg-ore-dark flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                        />

                        {renderLastUnitBadge(product)}
                        {Number(product.stock) !== 1 && isProductNew(product) && (
                          <span className="absolute top-3 right-3 z-10 bg-ore-gold text-ore-dark text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded shadow-md">
                            Nuevo
                          </span>
                        )}

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

        {currentView === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">

            {/* MODO 1: EXPLORAR COLECCIÓN COMPLETA + FILTRO DESPLEGABLE POR CATEGORÍA + ORDEN MENOR A MAYOR PRECIO */}
            {shopMode === 'collection' ? (() => {
              const filteredCollection = sortByPriceAsc(
                availableProducts.filter(p => {
                  if (collectionCategory === 'Todos') return true;
                  const matchesName = p.category && p.category.toLowerCase().trim() === collectionCategory.toLowerCase().trim();
                  const matchesId = categories.find(c => c.name === collectionCategory)?.id === p.category_id;
                  return matchesName || matchesId;
                })
              );

              return (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-ore-card p-5 rounded-lg border border-ore-gold/30">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.22em] text-ore-gold font-semibold">
                        Colección Completa • Ordenado por menor precio
                      </span>
                      <h2 className="font-serif text-2xl sm:text-3xl text-ore-cream mt-0.5">
                        {collectionCategory === 'Todos' ? 'Toda la Colección' : collectionCategory}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        aria-label="Filtrar por categoría"
                        value={collectionCategory}
                        onChange={(e) => setCollectionCategory(e.target.value)}
                        className="bg-ore-dark border border-ore-gold/40 rounded px-3.5 py-2.5 text-xs uppercase tracking-wider text-ore-cream focus:outline-none focus:border-ore-gold cursor-pointer"
                      >
                        <option value="Todos">Todas las categorías</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={openStepCatalog}
                        className="text-xs bg-ore-dark border border-white/15 text-ore-cream px-3.5 py-2.5 rounded hover:border-ore-gold transition uppercase tracking-wider cursor-pointer"
                      >
                        Ver por Categoría y Material
                      </button>
                    </div>
                  </div>

                  {filteredCollection.length === 0 ? (
                    <div className="bg-ore-card border border-white/10 rounded-lg p-10 text-center space-y-3">
                      <p className="text-sm text-ore-muted">No hay piezas disponibles en esta categoría por el momento.</p>
                      <button
                        type="button"
                        onClick={() => setCollectionCategory('Todos')}
                        className="text-xs uppercase tracking-wider text-ore-gold hover:underline cursor-pointer"
                      >
                        Mostrar todas las categorías
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filteredCollection.map(p => {
                        const productImg = p.image || p.image_url;
                        return (
                          <div
                            key={p.id}
                            onClick={() => openProductDetail(p)}
                            className="bg-ore-card border border-white/5 rounded-lg overflow-hidden shadow-lg hover:border-ore-gold transition group cursor-pointer flex flex-col justify-between"
                          >
                            <div className="h-64 overflow-hidden relative bg-ore-dark flex items-center justify-center">
                              {renderLastUnitBadge(p)}
                              {Number(p.stock) !== 1 && isProductNew(p) && (
                                <span className="absolute top-3 right-3 z-10 bg-ore-gold text-ore-dark text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded shadow-md">
                                  Nuevo
                                </span>
                              )}

                              {productImg ? (
                                <img
                                  src={productImg}
                                  alt={p.title || p.name}
                                  loading="lazy"
                                  className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                                />
                              ) : (
                                <span className="text-xs text-ore-muted italic">Sin imagen disponible</span>
                              )}
                            </div>

                            <div className="p-5 space-y-2">
                              <p className="text-[10px] text-ore-muted uppercase tracking-wider">
                                {p.category} {p.material ? `• ${p.material}` : ''}
                              </p>
                              <h4 className="font-serif text-lg text-ore-cream group-hover:text-ore-gold transition">
                                {p.title || p.name}
                              </h4>
                              <div className="flex justify-between items-center pt-2">
                                <span className="text-ore-gold font-bold text-lg">
                                  ${Number(p.price || 0).toLocaleString('es-AR')}
                                </span>
                                <span className="text-xs uppercase tracking-widest text-ore-muted underline">
                                  Ver detalle
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })() : (
              /* MODO 2: VER CATÁLOGO PASO A PASO (CATEGORÍA -> MATERIAL -> PRODUCTOS ORDENADOS DE MENOR A MAYOR PRECIO) */
              <>
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
                          className="text-xs bg-ore-dark border border-white/10 text-ore-cream px-3 py-2 rounded hover:border-ore-gold transition uppercase tracking-wider cursor-pointer"
                        >
                          Cambiar Material
                        </button>
                        <button
                          onClick={() => { setFilterCategory('Todos'); setFilterMaterial('Todos'); }}
                          className="text-xs bg-ore-gold/20 border border-ore-gold/40 text-ore-gold px-3 py-2 rounded hover:bg-ore-gold hover:text-ore-dark transition uppercase tracking-wider cursor-pointer"
                        >
                          Ver todas las Categorías
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {sortByPriceAsc(
                        availableProducts
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
                      )
                        .map(p => {
                          const productImg = p.image || p.image_url;
                          return (
                            <div
                              key={p.id}
                              onClick={() => openProductDetail(p)}
                              className="bg-ore-card border border-white/5 rounded-lg overflow-hidden shadow-lg hover:border-ore-gold transition group cursor-pointer"
                            >
                              <div className="h-64 overflow-hidden relative bg-ore-dark flex items-center justify-center">
                                {renderLastUnitBadge(p)}
                                {Number(p.stock) !== 1 && isProductNew(p) && (
                                  <span className="absolute top-3 right-3 z-10 bg-ore-gold text-ore-dark text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded shadow-md">
                                    Nuevo
                                  </span>
                                )}

                                {productImg ? (
                                  <img
                                    src={productImg}
                                    alt={p.title || p.name}
                                    loading="lazy"
                                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
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
                        className="text-xs bg-ore-dark border border-white/10 text-ore-cream px-4 py-2 rounded hover:border-ore-gold transition uppercase tracking-wider cursor-pointer"
                      >
                        Volver a Categorías
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {materials && materials.map(mat => {
                        const catMatProducts = availableProducts.filter(p => {
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
                            className="group relative h-48 rounded-lg overflow-hidden cursor-pointer border border-white/10 hover:border-ore-gold transition-all shadow-xl bg-ore-dark flex items-center justify-center"
                          >
                            {matCoverImg ? (
                              <img
                                src={matCoverImg}
                                alt={mat.name}
                                loading="lazy"
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100"
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
                        const catProducts = availableProducts.filter(p => {
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
                            className="group relative h-56 rounded-lg overflow-hidden cursor-pointer border border-white/10 hover:border-ore-gold transition-all shadow-xl bg-ore-dark flex items-center justify-center"
                          >
                            {coverImg ? (
                              <img
                                src={coverImg}
                                alt={cat.name}
                                loading="lazy"
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100"
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
              </>
            )}

          </div>
        )}

        {currentView === 'product-detail' && selectedProduct && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button onClick={openStepCatalog} className="text-xs uppercase tracking-widest text-ore-gold mb-8 flex items-center gap-2 hover:underline cursor-pointer">
              Volver al catálogo
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              <div className="rounded-lg overflow-hidden border border-white/10 bg-ore-dark shadow-xl flex items-center justify-center relative">
                {renderLastUnitBadge(selectedProduct, true)}
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  loading="lazy"
                  className="w-full h-[500px] object-cover object-center"
                />
              </div>

              {/* INFORMACIÓN Y ACCIONES: PAGAR AHORA EN NEGRO CON FILO DORADO + AGREGAR AL CARRITO */}
              <div className="space-y-6">
                <div>
                  <span className="text-xs text-ore-gold uppercase tracking-widest font-semibold">
                    {selectedProduct.category || 'Joyería Fina'} {selectedProduct.material ? `• ${selectedProduct.material}` : ''}
                  </span>

                  <h1 className="font-serif text-3xl sm:text-4xl text-ore-cream mt-1">
                    {selectedProduct.name}
                  </h1>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl sm:text-3xl font-semibold text-ore-gold">
                        ${Number(selectedProduct.price).toLocaleString('es-AR')}
                      </span>
                      <span className="text-xs text-ore-muted uppercase tracking-wider">
                        (Precio Regular)
                      </span>
                    </div>

                    <div className="inline-block bg-ore-gold/10 border border-ore-gold/30 px-3 py-1 rounded text-xs text-ore-gold font-medium">
                      ✦ 15% de descuento abonando por transferencia o efectivo: <strong className="font-bold">${Math.round(selectedProduct.price * 0.85).toLocaleString('es-AR')}</strong>
                    </div>
                  </div>

                  <div className="mt-3">
                    {(() => {
                      const stockActual = Number(selectedProduct.stock ?? 0);

                      if (stockActual <= 0) {
                        return (
                          <p className="text-xs text-red-400 flex items-center gap-1.5 font-medium">
                            Sin stock disponible por el momento.
                          </p>
                        );
                      }

                      if (stockActual === 1) {
                        return (
                          <p className="text-xs text-ore-gold flex items-center gap-1.5 font-medium">
                            <span>✦</span> Pieza única disponible en taller — Lista para entrega inmediata.
                          </p>
                        );
                      }

                      if (stockActual <= 3) {
                        return (
                          <p className="text-xs text-amber-400 flex items-center gap-1.5 font-medium">
                            <span>✦</span> Disponibilidad limitada: Quedan solo {stockActual} unidades.
                          </p>
                        );
                      }

                      return (
                        <p className="text-xs text-ore-muted">
                          Stock disponible para envío asegurado a todo el país.
                        </p>
                      );
                    })()}
                  </div>

                  <p className="text-ore-muted mt-3 leading-relaxed">
                    {selectedProduct.description || 'Pieza elaborada con los más altos estándares de calidad y acabado artesanal.'}
                  </p>

                  <div className="mt-6 border border-white/10 rounded overflow-hidden text-xs">
                    <div className="bg-ore-card p-3 text-ore-gold font-serif font-semibold border-b border-white/10 tracking-wider uppercase">
                      Especificaciones de la Pieza
                    </div>
                    <div className="divide-y divide-white/5 bg-ore-dark">
                      <div className="flex justify-between p-3">
                        <span className="text-ore-muted">Código de Pieza:</span>
                        <span className="text-ore-gold font-mono font-semibold">
                          ORE-{String(selectedProduct.id).padStart(4, '0')}
                        </span>
                      </div>
                      <div className="flex justify-between p-3">
                        <span className="text-ore-muted">Material:</span>
                        <span className="text-ore-cream font-medium">
                          {selectedProduct.material || 'Oro / Plata'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3">
                        <span className="text-ore-muted">Medida / Talle:</span>
                        <div className="flex items-center gap-3">
                          <span className="text-ore-cream font-medium">
                            {selectedProduct.measure || selectedProduct.size || 'Consultar disponibilidad'}
                          </span>
                          {getSizeGuideType(selectedProduct) && (
                            <button
                              onClick={() => setSizeModalOpen(true)}
                              className="text-[11px] text-ore-gold hover:underline uppercase tracking-wider font-semibold cursor-pointer"
                            >
                              {getSizeGuideType(selectedProduct) === 'chain' ? 'Guía de largos' : '¿No conocés tu talle?'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DETALLES VISIBLES EN CELULAR Y PC */}
                <div className="grid grid-cols-3 gap-2 py-4 my-3 border-y border-white/10 bg-ore-card/40 rounded-lg px-2 sm:px-3">
                  <div className="flex flex-col items-center text-center space-y-1 px-1">
                    <div className="w-8 h-8 rounded-full bg-ore-gold/10 border border-ore-gold/30 flex items-center justify-center text-ore-gold">
                      <span className="text-[11px] font-bold">15d</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-ore-cream uppercase tracking-wider leading-snug">
                      Ajuste sin Cargo
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-ore-muted leading-snug">
                      1 modificación por pieza (15 días)
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-1 px-1 border-x border-white/10">
                    <div className="w-8 h-8 rounded-full bg-ore-gold/10 border border-ore-gold/30 flex items-center justify-center text-ore-gold">
                      <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <polyline points="20 12 20 22 4 22 4 12" />
                        <rect width="20" height="5" x="2" y="7" />
                        <line x1="12" x2="12" y1="22" y2="7" />
                        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                      </svg>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-ore-cream uppercase tracking-wider leading-snug">
                      Estuche ORE
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-ore-muted leading-snug">
                      Presentación de lujo
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-1 px-1">
                    <div className="w-8 h-8 rounded-full bg-ore-gold/10 border border-ore-gold/30 flex items-center justify-center text-ore-gold">
                      <Truck size={15} />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-ore-cream uppercase tracking-wider leading-snug">
                      Envío Asegurado
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-ore-muted leading-snug">
                      A todo el país
                    </span>
                  </div>
                </div>

                {/* BOTÓN PAGAR AHORA EN NEGRO CON FILO DORADO + AGREGAR AL CARRITO */}
                <div className="space-y-3 pt-2">
                  <button
                    disabled={Number(selectedProduct.stock ?? 0) <= 0}
                    onClick={() => {
                      addToCart(selectedProduct, undefined, { openCart: false, showToast: false });
                      setCheckoutModalOpen(true);
                    }}
                    className={`w-full font-semibold py-4 px-6 uppercase text-xs tracking-widest rounded transition shadow-xl flex items-center justify-center gap-2 ${
                      Number(selectedProduct.stock ?? 0) > 0
                        ? 'bg-[#0B0B0B] hover:bg-[#141414] text-ore-gold border border-ore-gold/60 hover:border-ore-gold cursor-pointer'
                        : 'bg-white/10 text-ore-muted border border-white/10 cursor-not-allowed'
                    }`}
                  >
                    <span>
                      {Number(selectedProduct.stock ?? 0) > 0 ? 'Pagar ahora' : 'Sin stock disponible'}
                    </span>
                    {Number(selectedProduct.stock ?? 0) > 0 && <MercadoPagoLogo />}
                  </button>

                  {Number(selectedProduct.stock ?? 0) > 0 && (
                    <button
                      onClick={() => {
                        addToCart(selectedProduct, undefined, { openCart: false, showToast: true });
                      }}
                      className="w-full bg-ore-card hover:bg-white/10 text-ore-cream border border-ore-gold/40 font-semibold py-3.5 px-6 uppercase text-xs tracking-wider rounded transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Agregar al carrito y seguir viendo</span>
                    </button>
                  )}
                </div>

              </div>
            </div>

            <div className="mt-20 border-t border-white/10 pt-14 w-full">
              <h3 className="font-serif text-3xl text-ore-cream mb-8 text-center">
                También te puede interesar
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {sortByPriceAsc(
                  availableProducts
                    .filter(p => p.id !== selectedProduct.id && p.material_id === selectedProduct.material_id)
                )
                  .slice(0, 4)
                  .map(relatedProduct => {
                    const relatedImg = relatedProduct.image_url || relatedProduct.image;
                    return (
                      <div
                        key={relatedProduct.id}
                        onClick={() => openProductDetail(relatedProduct)}
                        className="bg-ore-card border border-white/5 rounded-lg overflow-hidden group cursor-pointer hover:border-ore-gold/50 transition shadow-xl flex flex-col justify-between"
                      >
                        <div className="aspect-square w-full overflow-hidden bg-ore-dark relative flex items-center justify-center">
                          {renderLastUnitBadge(relatedProduct)}
                          {Number(relatedProduct.stock) !== 1 && isProductNew(relatedProduct) && (
                            <span className="absolute top-3 right-3 z-10 bg-ore-gold text-ore-dark text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded shadow-md">
                              Nuevo
                            </span>
                          )}

                          <img
                            src={relatedImg}
                            alt={relatedProduct.title || relatedProduct.name}
                            loading="lazy"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                          />
                        </div>

                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-xs text-ore-gold uppercase tracking-widest block">
                              {relatedProduct.material || 'Joyería Fina'}
                            </span>
                            <h4 className="font-serif text-base text-ore-cream mt-1 line-clamp-1">
                              {relatedProduct.title || relatedProduct.name}
                            </h4>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <span className="text-base font-semibold text-ore-gold">
                              ${Number(relatedProduct.price).toLocaleString('es-AR')}
                            </span>
                            <span className="text-xs uppercase tracking-wider text-ore-muted group-hover:text-ore-cream transition">
                              Ver pieza &rarr;
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

          </div>
        )}

        {currentView === 'gold' && (
          <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="text-center space-y-4 mb-10">
              <span className="text-ore-gold text-xs uppercase tracking-[0.25em] font-semibold">Tasacion y Adquisicion Profesional</span>
              <h1 className="font-serif text-4xl sm:text-5xl text-ore-cream">Compramos Oro</h1>
              <p className="text-ore-cream/80 max-w-xl mx-auto text-sm leading-relaxed font-light">
                Brindamos un servicio confidencial, transparente y con cotizacion competitiva basada en los estandares internacionales del mercado. Complete el formulario con los detalles de su pieza para iniciar una evaluacion preliminar.
              </p>
            </div>

            {goldSuccess ? (
              <div className="bg-ore-card p-10 rounded-lg border border-ore-gold/30 text-center space-y-6 shadow-2xl">
                <CheckCircle size={48} className="text-ore-gold mx-auto" />
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-ore-cream">Solicitud de Tasacion Registrada</h3>
                  <p className="text-ore-muted text-sm max-w-md mx-auto leading-relaxed">
                    Hemos recibido los datos de su pieza correctamente. Un especialista de <strong className="text-ore-gold">ORE Joyeria</strong> se comunicara con usted a la brevedad via WhatsApp o llamada para coordinar la evaluacion presencial y segura.
                  </p>
                </div>
                <button
                  onClick={() => setGoldSuccess(false)}
                  className="bg-ore-gold text-ore-dark font-semibold px-8 py-3.5 uppercase text-xs tracking-wider rounded hover:bg-ore-cream transition shadow-lg cursor-pointer"
                >
                  Enviar otra consulta
                </button>
              </div>
            ) : (
              <form onSubmit={handleGoldSubmit} className="bg-ore-card p-8 sm:p-10 rounded-lg border border-white/5 space-y-6 shadow-2xl">

                <div className="border-b border-white/10 pb-4">
                  <h3 className="font-serif text-xl text-ore-cream">Detalles de la Pieza a Tasar</h3>
                  <p className="text-xs text-ore-muted mt-1">Cuantos mas detalles nos proporcione, mas precisa sera nuestra orientacion inicial.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Tipo de Pieza *</label>
                    <select
                      value={goldForm.pieceType}
                      onChange={e => setGoldForm({ ...goldForm, pieceType: e.target.value })}
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
                      onChange={e => setGoldForm({ ...goldForm, karat: e.target.value })}
                      className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                    >
                      <option value="18k">Oro 18k (Ley 750 - Estandar Joyeria)</option>
                      <option value="14k">Oro 14k (Ley 585)</option>
                      <option value="24k">Oro 24k (Oro puro / Lingotes)</option>
                      <option value="No lo se">No estoy seguro / Desconozco</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Peso Aproximado (en gramos)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Ej: 12.5 (solo numeros, punto o coma)"
                      value={goldForm.weight}
                      onChange={e => setGoldForm({ ...goldForm, weight: validarSoloNumerosPeso(e.target.value) })}
                      className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Estado / Observaciones</label>
                    <input
                      type="text"
                      placeholder="Ej: Buen estado, sello visible..."
                      value={goldForm.description}
                      onChange={e => setGoldForm({ ...goldForm, description: validarSoloTexto(e.target.value) })}
                      className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                    />
                  </div>
                </div>

                <div className="border-b border-white/10 pt-4 pb-2">
                  <h3 className="font-serif text-xl text-ore-cream">Informacion de Contacto</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Nombre y Apellido *</label>
                    <input
                      type="text"
                      required
                      placeholder="Su nombre completo"
                      value={goldForm.name}
                      onChange={e => setGoldForm({ ...goldForm, name: validarSoloTexto(e.target.value) })}
                      className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Telefono / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      inputMode="tel"
                      placeholder="Ej: 2613737159"
                      value={goldForm.phone}
                      onChange={e => setGoldForm({ ...goldForm, phone: validarSoloTelefono(e.target.value) })}
                      className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-ore-muted mb-2">Correo Electronico (Opcional)</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={goldForm.email || ''}
                    onChange={e => setGoldForm({ ...goldForm, email: e.target.value })}
                    className="w-full bg-ore-dark border border-white/10 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold"
                  />
                </div>

                <div className="bg-ore-dark/60 border border-white/10 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={goldForm.acceptedTerms}
                      onChange={e => setGoldForm({ ...goldForm, acceptedTerms: e.target.checked })}
                      className="mt-1 w-4 h-4 accent-[#D4AF37] rounded border-white/20 bg-ore-dark cursor-pointer shrink-0"
                    />
                    <span className="text-xs text-ore-cream/90 leading-relaxed">
                      Autorizo expresamente a <strong className="text-ore-gold">ORE Joyeria</strong> a utilizar los datos personales y de contacto proporcionados en este formulario con el unico fin de evaluar mi consulta y comunicarme para coordinar la tasacion. *
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!goldForm.acceptedTerms}
                    className={`w-full font-semibold py-4 uppercase text-xs tracking-widest transition shadow-lg rounded ${
                      goldForm.acceptedTerms
                        ? 'bg-ore-gold text-ore-dark hover:bg-ore-gold-light cursor-pointer'
                        : 'bg-white/10 text-ore-muted cursor-not-allowed'
                    }`}
                  >
                    Solicitar Tasacion Profesional
                  </button>

                  <p className="text-[11px] text-ore-muted text-center mt-3">
                    Sus datos y consultas son absolutamente confidenciales y tratados bajo rigurosas normas de seguridad.
                  </p>
                </div>

              </form>
            )}
          </div>
        )}

        {currentView === 'about' && (
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
            <h1 className="font-serif text-4xl">Nosotros</h1>
            <p className="text-ore-cream/80 text-base leading-relaxed">
              En <strong className="text-ore-gold font-serif">ORE Joyería</strong> seleccionamos cuidadosamente cada pieza...
            </p>
            <p className="text-ore-cream/80 text-base leading-relaxed">
              Con más de 30 años de experiencia, ofrecemos joyas en Plata 925, Plata con Oro y Oro 18k, acompañándote con atención personalizada...
            </p>
            <p className="pt-2">
              <strong className="text-ore-gold font-serif text-lg">ORE Joyería - Elegancia en cada Detalle</strong>
            </p>
          </div>
        )}

        {currentView === 'contact' && (
          <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
            <div className="space-y-2">
              <span className="text-ore-gold text-xs uppercase tracking-[0.25em] font-semibold">Atención Personalizada</span>
              <h1 className="font-serif text-4xl text-ore-cream">Contacto y Asesoramiento</h1>
              <p className="text-ore-muted text-sm">Comunícate con nosotros por cualquiera de nuestros canales oficiales.</p>
            </div>

            <div className="bg-ore-card p-8 rounded-lg border border-white/5 space-y-6 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-ore-dark border border-ore-gold/30 flex items-center justify-center text-ore-gold shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-ore-muted">Correo Electrónico</span>
                  <a href="mailto:orejoyeria23@gmail.com" className="text-sm sm:text-base text-ore-gold hover:underline font-medium">
                    orejoyeria23@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                <div className="w-10 h-10 rounded-full bg-ore-dark border border-ore-gold/30 flex items-center justify-center text-ore-gold shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-ore-muted">Teléfono / WhatsApp</span>
                  <a href="https://wa.me/5492613737159" target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base text-ore-gold hover:underline font-medium">
                    +54 9 261 373-7159
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t border-white/5 pt-6">
                <div className="w-10 h-10 rounded-full bg-ore-dark border border-ore-gold/30 flex items-center justify-center text-ore-gold shrink-0">
                  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider text-ore-muted">Instagram Oficial</span>
                  <a href="https://instagram.com/ore.joyeria" target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base text-ore-gold hover:underline font-medium">
                    @ore.joyeria
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'admin' && (
          <div className="max-w-6xl mx-auto px-4 py-12">
            {!isAdminAuthenticated ? (
              <div className="max-w-md mx-auto bg-ore-card p-8 rounded-lg border border-ore-gold/30 shadow-xl space-y-6">
                <div className="text-center space-y-2">
                  <Lock className="text-ore-gold mx-auto" size={32} />
                  <h2 className="font-serif text-2xl">Panel de Administración ORE</h2>
                  <p className="text-xs text-ore-muted">Ingrese su contraseña de acceso seguro.</p>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (adminPin === 'Francesca#230426') {
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
                      className="absolute right-3 top-3.5 text-ore-muted hover:text-ore-gold text-xs cursor-pointer"
                    >
                      {showPassword ? "Ocultar" : "Ver"}
                    </button>
                  </div>
                  <button type="submit" className="w-full bg-ore-gold text-ore-dark font-semibold py-3 uppercase text-xs tracking-wider cursor-pointer">
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
                  navigateToView('home');
                }}
              />
            )}
          </div>
        )}

      </main>

      {/* CARRITO */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-ore-card h-full flex flex-col border-l border-white/10 p-5 sm:p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3.5">
              <h2 className="font-serif text-xl text-ore-cream">Tu Carrito ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} className="text-ore-cream hover:text-ore-gold cursor-pointer"><X size={20} /></button>
            </div>

            {/* 1. LISTA DE PRODUCTOS DEL CARRITO (SCROLL PROPIO CON TOPE EN MÓVIL) */}
            <div className="flex-1 min-h-0 max-h-[34vh] sm:max-h-none overflow-y-auto py-3 space-y-2.5 pr-1">
              {cart.length === 0 ? (
                <p className="text-center text-ore-muted text-sm py-8">Tu carrito está vacío.</p>
              ) : (
                cart.map(item => (
                  <div key={item.cartKey} className="flex gap-3 items-center bg-ore-dark p-2.5 sm:p-3 rounded-lg border border-white/5">
                    <img src={item.image} alt={item.name} loading="lazy" className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded shrink-0" />
                    <div className="flex-grow min-w-0">
                      <h4 className="font-serif text-xs sm:text-sm text-ore-cream truncate">{item.name}</h4>
                      <p className="text-ore-gold font-semibold text-xs sm:text-sm mt-0.5">${Number(item.price * item.qty).toLocaleString('es-AR')}</p>
                      <p className="text-[10px] text-emerald-400/90 mt-0.5">
                        Con -15% transf.: ${Math.round(item.price * item.qty * 0.85).toLocaleString('es-AR')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button onClick={() => removeFromCart(item.cartKey)} className="text-ore-muted hover:text-red-400 cursor-pointer"><Trash2 size={14} /></button>
                      <div className="flex items-center gap-2 border border-white/10 rounded px-2 py-0.5 text-xs text-ore-cream">
                        <button onClick={() => updateQty(item.cartKey, -1)} className="cursor-pointer">-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.cartKey, 1)} className="cursor-pointer">+</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 2. SECCIÓN FIJA Y SEPARADA: TAMBIÉN TE PUEDE INTERESAR */}
            {suggestedProducts.length > 0 && (
              <div className="shrink-0 pt-2.5 pb-2.5 border-t border-ore-gold/25 bg-ore-card space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-ore-gold font-semibold">
                    También te puede interesar
                  </h3>
                  <span className="text-[10px] text-ore-muted">Sugeridos ORE</span>
                </div>

                <div className="space-y-1.5">
                  {suggestedProducts.map(sug => (
                    <div
                      key={sug.id}
                      className="flex items-center justify-between gap-2 bg-ore-dark/80 border border-white/10 rounded-lg p-1.5 sm:p-2"
                    >
                      <div
                        onClick={() => openProductDetail(sug)}
                        className="flex items-center gap-2 min-w-0 cursor-pointer group"
                      >
                        <img
                          src={sug.image || sug.image_url}
                          alt={sug.name || sug.title}
                          loading="lazy"
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-serif text-ore-cream group-hover:text-ore-gold truncate">
                            {sug.name || sug.title}
                          </p>
                          <p className="text-xs text-ore-gold font-semibold">
                            ${Number(sug.price || 0).toLocaleString('es-AR')}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(sug, undefined, { openCart: false, showToast: true })}
                        className="shrink-0 bg-ore-gold/15 hover:bg-ore-gold text-ore-gold hover:text-ore-dark border border-ore-gold/40 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Agregar</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. RESUMEN Y BOTÓN INICIAR COMPRA (SIEMPRE ACCESIBLE EN CELULAR) */}
            {cart.length > 0 && (
              <div className="shrink-0 border-t border-white/10 pt-2.5 space-y-2 bg-ore-card">
                <div className="bg-ore-dark/90 border border-ore-gold/30 rounded-lg p-2.5 sm:p-3 space-y-1 text-[11px] sm:text-xs">
                  <div className="flex justify-between text-ore-cream/85">
                    <span>Subtotal (precio regular):</span>
                    <span className="font-semibold">${cartTotal.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Ahorrás con 15% por transferencia:</span>
                    <span>-${transferDiscountAmount.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-ore-gold font-bold pt-1 border-t border-white/10">
                    <span>Total con 15% OFF transferencia:</span>
                    <span>${cartTotalWithTransfer.toLocaleString('es-AR')}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutModalOpen(true);
                  }}
                  className="w-full bg-ore-gold text-ore-dark font-bold py-3 sm:py-4 uppercase text-xs tracking-widest hover:bg-ore-gold-light transition shadow-lg rounded cursor-pointer"
                >
                  Iniciar compra
                </button>

                <div className="hidden sm:flex items-start justify-center gap-1.5 text-[10px] sm:text-[11px] text-[#9CA3AF] pt-0.5 leading-snug">
                  <Lock size={11} className="text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="text-center">
                    <strong className="text-[#D4AF37] font-semibold tracking-[0.03em]">Compra Protegida</strong>
                    {' • Pago encriptado y Envío Asegurado'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {sizeModalOpen && selectedProduct && (() => {
        const guideType = getSizeGuideType(selectedProduct);
        if (!guideType) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-ore-card border border-ore-gold/40 rounded-lg p-6 sm:p-8 shadow-2xl space-y-6 text-left animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-[0.25em] text-ore-gold font-semibold">Guía Práctica ORE</span>
                  <h3 className="font-serif text-2xl text-ore-cream mt-0.5">
                    {guideType === 'ring' && '¿Cómo calcular tu talle de anillo?'}
                    {guideType === 'chain' && 'Guía de largos para cadenas'}
                    {guideType === 'bracelet' && '¿Cómo medir tu muñeca para pulseras?'}
                  </h3>
                </div>
                <button onClick={() => setSizeModalOpen(false)} className="text-ore-cream hover:text-ore-gold p-1 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-ore-cream/90 leading-relaxed">
                {guideType === 'ring' && (
                  <>
                    <p className="font-light">Si tenés un anillo o alianza que te quede cómodo en el dedo que querés usar, medí su interior siguiendo estos pasos:</p>
                    <div className="bg-ore-dark p-4 rounded border border-white/10 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-ore-gold/20 text-ore-gold font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                        <p>Colocá el anillo sobre una superficie plana y bien iluminada.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-ore-gold/20 text-ore-gold font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                        <p>Con una regla milimetrada, medí el <strong className="text-ore-gold">diámetro interno</strong> de lado a lado pasando por el centro.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-ore-gold/20 text-ore-gold font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                        <p>El valor en milímetros equivale a tu medida estándar (Ej: 16 mm = Talle 16 | 18 mm = Talle 18).</p>
                      </div>
                    </div>
                  </>
                )}

                {guideType === 'chain' && (
                  <>
                    <p className="font-light">Elegí el largo ideal según cómo te gustaría que luzca la caída de la cadena o el dije:</p>
                    <div className="bg-ore-dark p-4 rounded border border-white/10 divide-y divide-white/5 text-xs sm:text-sm">
                      <div className="py-2.5 flex justify-between items-center gap-4">
                        <span className="font-mono font-bold text-ore-gold shrink-0">40 cm</span>
                        <span className="text-ore-cream/90 text-right">Estilo gargantilla; cae justo en la base del cuello.</span>
                      </div>
                      <div className="py-2.5 flex justify-between items-center gap-4">
                        <span className="font-mono font-bold text-ore-gold shrink-0">45 cm</span>
                        <span className="text-ore-cream/90 text-right">Medida clásica femenina; descansa sobre la clavícula.</span>
                      </div>
                      <div className="py-2.5 flex justify-between items-center gap-4">
                        <span className="font-mono font-bold text-ore-gold shrink-0">50 cm</span>
                        <span className="text-ore-cream/90 text-right">Caída media; llega ligeramente por debajo de la clavícula.</span>
                      </div>
                      <div className="py-2.5 flex justify-between items-center gap-4">
                        <span className="font-mono font-bold text-ore-gold shrink-0">60 cm</span>
                        <span className="text-ore-cream/90 text-right">Largo pronunciado; cae a la altura del centro del pecho.</span>
                      </div>
                    </div>
                  </>
                )}

                {guideType === 'bracelet' && (
                  <>
                    <p className="font-light">Para asegurar un calce cómodo y que el cierre no tire, calculá tu medida de muñeca así:</p>
                    <div className="bg-ore-dark p-4 rounded border border-white/10 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-ore-gold/20 text-ore-gold font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                        <p>Rodeá tu muñeca justo debajo del hueso con un centímetro flexible.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-ore-gold/20 text-ore-gold font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                        <p>Sumale entre <strong className="text-ore-gold">1 cm y 1,5 cm</strong> a la medida justa de tu contorno.</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-ore-gold/20 text-ore-gold font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                        <p>Ejemplo: Si tu muñeca mide 16,5 cm, tu largo ideal de pulsera es <strong className="text-ore-gold">18 cm</strong>.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2">
                <button onClick={() => setSizeModalOpen(false)} className="w-full bg-ore-gold hover:bg-ore-gold-light text-ore-dark font-semibold py-3.5 uppercase text-xs tracking-wider rounded transition shadow-lg cursor-pointer">
                  Entendido, volver al producto
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {checkoutModalOpen && (() => {
        const envioInfo = calcularEnvioAndreani(postalCode, deliveryType, cartTotal);
        const finalTotal = cartTotal + envioInfo.costo;
        const modalTransferSavings = Math.round(cartTotal * 0.15);
        const modalTotalWithTransfer = Math.max(cartTotal - modalTransferSavings, 0) + envioInfo.costo;

        const buildTransferWhatsAppUrl = () => {
          const phone = "5492613737159";
          const itemsList = cart.map(i => {
            const codigo = `ORE-${String(i.id).padStart(4, '0')}`;
            const medida = i.measure ? ` | Medida: ${i.measure}` : '';
            return `- [${codigo}] ${i.qty}x ${i.name}${medida} ($${(i.price * i.qty).toLocaleString('es-AR')})`;
          }).join('%0A');

          const envioTexto = envioInfo.calculado
            ? `*Entrega:* ${envioInfo.zona} (${envioInfo.costo === 0 ? 'GRATIS' : `$${envioInfo.costo.toLocaleString('es-AR')}`})`
            : `*Entrega:* A coordinar según CP`;

          const message = `Hola ORE Joyería! Quisiera abonar por transferencia con el 15% OFF los siguientes productos:%0A%0A${itemsList}%0A%0A${envioTexto}%0A*Valor Final con Descuento: $${modalTotalWithTransfer.toLocaleString('es-AR')} (Ahorro: $${modalTransferSavings.toLocaleString('es-AR')})*`;
          return `https://wa.me/${phone}?text=${message}`;
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-lg bg-ore-card border border-ore-gold/40 rounded-lg p-5 sm:p-8 shadow-2xl space-y-5 text-center animate-in fade-in zoom-in duration-200 my-auto">
              <div className="w-12 h-12 rounded-full bg-ore-gold/10 border border-ore-gold flex items-center justify-center mx-auto text-ore-gold">
                <Truck size={24} />
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-[0.25em] text-ore-gold font-semibold">Envío y Finalización</span>
                <h3 className="font-serif text-2xl sm:text-3xl text-ore-cream">Calculá tu entrega</h3>
                <p className="text-ore-muted text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                  Ingresá tu Código Postal para calcular el envío asegurado o retiro en Gran Mendoza (Envío local sin cargo superando $50.000).
                </p>
              </div>

              <div className="bg-ore-dark p-4 rounded border border-white/10 text-left space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ore-gold font-semibold mb-1.5">
                    1. Código Postal de Destino *
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    placeholder="Ej: 5500 (Mendoza), 1050 (CABA)..."
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-ore-card border border-white/15 rounded p-3 text-sm text-ore-cream focus:outline-none focus:border-ore-gold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-ore-gold font-semibold mb-1.5">
                    2. Modalidad de Entrega
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('domicilio')}
                      className={`p-3 rounded border text-left transition cursor-pointer ${
                        deliveryType === 'domicilio'
                          ? 'bg-ore-gold/15 border-ore-gold text-ore-cream'
                          : 'bg-ore-card border-white/10 text-ore-muted hover:border-white/30'
                      }`}
                    >
                      <span className="block text-xs font-semibold uppercase tracking-wider">A Domicilio</span>
                      <span className="block text-[10px] mt-0.5 opacity-85">
                        {envioInfo.esMendoza ? (cartTotal >= 50000 ? 'GRATIS (Superó $50k)' : 'Cadetería ($7.000)') : 'Andreani puerta a puerta'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('sucursal')}
                      className={`p-3 rounded border text-left transition cursor-pointer ${
                        deliveryType === 'sucursal'
                          ? 'bg-ore-gold/15 border-ore-gold text-ore-cream'
                          : 'bg-ore-card border-white/10 text-ore-muted hover:border-white/30'
                      }`}
                    >
                      <span className="block text-xs font-semibold uppercase tracking-wider">
                        {envioInfo.esMendoza ? 'Retiro en ORE' : 'A Sucursal'}
                      </span>
                      <span className="block text-[10px] mt-0.5 opacity-85">
                        {envioInfo.esMendoza ? 'Sin cargo ($0)' : 'Retiro en Andreani'}
                      </span>
                    </button>
                  </div>
                </div>

                {envioInfo.calculado && (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-ore-cream/90 font-medium">{envioInfo.zona}</span>
                    <span className="text-ore-gold font-bold">
                      {envioInfo.costo === 0 ? 'GRATIS' : `$${envioInfo.costo.toLocaleString('es-AR')}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-ore-dark p-4 rounded border border-white/10 text-left space-y-2">
                <p className="text-xs text-ore-muted uppercase tracking-wider font-semibold border-b border-white/10 pb-1">Resumen del pedido</p>
                <div className="max-h-24 overflow-y-auto space-y-1 text-xs text-ore-cream">
                  {cart.map(item => (
                    <div key={item.cartKey} className="flex justify-between">
                      <span>{item.qty}x {item.name}</span>
                      <span className="text-ore-gold font-semibold">${Number(item.price * item.qty).toLocaleString('es-AR')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-ore-muted pt-1.5 border-t border-white/5">
                    <span>Costo de envío:</span>
                    <span className="text-ore-cream font-medium">
                      {!envioInfo.calculado
                        ? 'Pendiente de CP'
                        : envioInfo.costo === 0
                          ? 'GRATIS ($0)'
                          : `$${envioInfo.costo.toLocaleString('es-AR')}`}
                    </span>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between items-center text-sm font-serif text-ore-cream">
                  <span>Total:</span>
                  <span className="text-ore-gold font-bold text-lg">${finalTotal.toLocaleString('es-AR')}</span>
                </div>
              </div>

              <div className="bg-emerald-950/35 border border-emerald-400/35 rounded-lg p-3.5 text-left space-y-1">
                <p className="text-xs text-emerald-300 font-bold">
                  15% OFF abonando por transferencia
                </p>
                <p className="text-xs text-ore-cream/90">
                  Ahorrás <strong className="text-emerald-300">${modalTransferSavings.toLocaleString('es-AR')}</strong> en joyas
                  {envioInfo.calculado
                    ? <> — Con transferencia{envioInfo.costo > 0 ? ' + envío' : ''}: <strong className="text-ore-gold">${modalTotalWithTransfer.toLocaleString('es-AR')}</strong></>
                    : <> — Subtotal con transferencia: <strong className="text-ore-gold">${Math.max(cartTotal - modalTransferSavings, 0).toLocaleString('es-AR')}</strong></>
                  }.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    window.open(buildTransferWhatsAppUrl(), '_blank');
                    setCheckoutModalOpen(false);
                  }}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-ore-dark font-bold py-3.5 px-6 uppercase text-xs tracking-widest rounded transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <WhatsAppLogo className="w-4 h-4 shrink-0" />
                  <span>Transferencia -15% OFF</span>
                </button>

                <button
                  disabled={!envioInfo.calculado}
                  onClick={async () => {
                    try {
                      const itemsConEnvio = envioInfo.costo > 0
                        ? [
                            ...cart,
                            {
                              id: 'envio-logistica',
                              name: envioInfo.zona,
                              title: envioInfo.zona,
                              price: envioInfo.costo,
                              qty: 1
                            }
                          ]
                        : cart;

                      const response = await fetch('/api/create-preference', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ items: itemsConEnvio })
                      });

                      const data = await response.json();

                      if (data.init_point) {
                        window.location.href = data.init_point;
                      } else {
                        alert('Error al iniciar el pago con Mercado Pago. Intente nuevamente.');
                      }
                    } catch (err) {
                      console.error("Error al conectar con Mercado Pago:", err);
                      alert("Ocurrió un error al procesar el pago.");
                    }
                  }}
                  className={`w-full font-semibold py-3.5 px-6 text-xs uppercase tracking-widest rounded transition flex items-center justify-center gap-2.5 shadow-lg ${
                    envioInfo.calculado
                      ? 'bg-[#0B0B0B] hover:bg-[#141414] text-ore-gold border border-ore-gold/60 hover:border-ore-gold cursor-pointer'
                      : 'bg-white/10 text-ore-muted border border-white/10 cursor-not-allowed'
                  }`}
                >
                  <span>{envioInfo.calculado ? 'Pagar ahora' : 'Ingresá tu CP para pagar ahora'}</span>
                  {envioInfo.calculado && <MercadoPagoLogo />}
                </button>

                <div className="flex items-start justify-center gap-1.5 text-[10px] sm:text-[11px] text-[#9CA3AF] pt-1 leading-snug">
                  <Lock size={11} className="text-[#D4AF37] shrink-0 mt-0.5" />
                  <span className="text-center">
                    <strong className="text-[#D4AF37] font-semibold tracking-[0.03em]">Compra Protegida</strong>
                    {' • Pago encriptado y Envío Asegurado'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="text-xs text-ore-muted hover:text-ore-cream uppercase tracking-wider pt-1 cursor-pointer"
                >
                  Volver al carrito
                </button>
              </div>

            </div>
          </div>
        );
      })()}

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
              <li><button onClick={openStepCatalog} className="hover:text-ore-cream cursor-pointer">Tienda</button></li>
              <li><button onClick={() => navigateToView('gold')} className="hover:text-ore-cream cursor-pointer">Compramos oro</button></li>
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

      {showFloatingWhatsapp && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center group">
          <div className="absolute right-full mr-3 bg-ore-card border border-ore-gold/40 text-ore-cream text-xs px-3 py-2 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap font-sans">
            <span className="text-ore-gold font-semibold">¿Necesitás asesoramiento?</span> Escribinos
          </div>
          <a
            href="https://wa.me/5492613737159?text=Hola%20ORE%20Joyería!%20Quisiera%20realizar%20una%20consulta%20sobre%20sus%20piezas."
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Consultar por WhatsApp"
            className="w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-ore-dark rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer border-2 border-ore-dark"
          >
            <WhatsAppLogo className="w-7 h-7" />
          </a>
        </div>
      )}

    </div>
  );
}