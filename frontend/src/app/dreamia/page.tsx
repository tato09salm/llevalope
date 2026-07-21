'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, ArrowRight, Loader2, ShoppingCart, CheckCircle, Info, Trash2, Upload, X, Image as ImageIcon, Palette, Star, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { dreamiaAPI } from '../../lib/api';
import { useCarritoStore } from '../../store/carrito.store';
import { useAuthStore } from '../../store/auth.store';
import { Producto, VarianteProducto } from '../../types';

// Imágenes de muestra por defecto
const IMAGEN_ANTES = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200';

// Estilos decorativos con previews
const ESTILOS_DECORATIVOS = [
  {
    id: 'moderno',
    label: 'Moderno Glam',
    desc: 'Metales, dorado y elegancia contemporánea',
    emoji: '✨',
    color: 'from-amber-400 to-yellow-600',
    previewImg: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=400',
  },
  {
    id: 'nordico',
    label: 'Nórdico Escandinavo',
    desc: 'Madera clara, minimalismo y colores pastel',
    emoji: '🌿',
    color: 'from-teal-400 to-cyan-600',
    previewImg: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
  },
  {
    id: 'industrial',
    label: 'Industrial Loft',
    desc: 'Madera oscura, metal expuesto y ladrillo',
    emoji: '🏭',
    color: 'from-gray-500 to-zinc-700',
    previewImg: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400',
  },
  {
    id: 'rustico',
    label: 'Rústico Country',
    desc: 'Madera natural, texturas cálidas y acogedor',
    emoji: '🪵',
    color: 'from-orange-400 to-amber-700',
    previewImg: 'https://images.unsplash.com/photo-1600210491369-e753d80a41f3?w=400',
  },
];

// Productos simulados de respaldo (cuando el backend no retorna productos)
const PRODUCTOS_SIMULADOS: Record<string, any[]> = {
  moderno: [
    {
      id: 9001,
      nombre: 'Sofá Seccional Milano Premium',
      slug: 'sofa-seccional-milano-premium',
      descripcionCorta: 'Sofá seccional en tela premium color gris perla con patas doradas. Diseño moderno y elegante para salas amplias.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
      calificacion: 4.8,
      totalResenas: 124,
      variantes: [{ id: 90011, sku: 'SOF-MIL-001', precioBase: 3499.90, precioOferta: 2899.90, stock: 8, esPrincipal: true, activo: true, stockMinimo: 2, enOferta: true, orden: 1 }],
    },
    {
      id: 9002,
      nombre: 'Mesa de Centro Cristal Dorado',
      slug: 'mesa-centro-cristal-dorado',
      descripcionCorta: 'Mesa de centro con tapa de cristal templado y estructura geométrica en acabado dorado mate.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=600',
      calificacion: 4.6,
      totalResenas: 89,
      variantes: [{ id: 90021, sku: 'MES-CRI-001', precioBase: 1299.90, precioOferta: 999.90, stock: 15, esPrincipal: true, activo: true, stockMinimo: 3, enOferta: true, orden: 1 }],
    },
    {
      id: 9003,
      nombre: 'Lámpara de Pie Arco Luxe',
      slug: 'lampara-pie-arco-luxe',
      descripcionCorta: 'Lámpara de pie tipo arco con pantalla en lino y base de mármol negro. Luz cálida regulable.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab82f?w=600',
      calificacion: 4.9,
      totalResenas: 67,
      variantes: [{ id: 90031, sku: 'LAM-ARC-001', precioBase: 899.90, precioOferta: null, stock: 22, esPrincipal: true, activo: true, stockMinimo: 5, enOferta: false, orden: 1 }],
    },
    {
      id: 9004,
      nombre: 'Espejo Decorativo Sunburst',
      slug: 'espejo-decorativo-sunburst',
      descripcionCorta: 'Espejo de pared con marco tipo sunburst en metal dorado. Diámetro 80cm, perfecto como pieza central.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?w=600',
      calificacion: 4.7,
      totalResenas: 45,
      variantes: [{ id: 90041, sku: 'ESP-SUN-001', precioBase: 549.90, precioOferta: 449.90, stock: 30, esPrincipal: true, activo: true, stockMinimo: 5, enOferta: true, orden: 1 }],
    },
    {
      id: 9005,
      nombre: 'Alfombra Geométrica Ivory',
      slug: 'alfombra-geometrica-ivory',
      descripcionCorta: 'Alfombra de pelo corto con patrón geométrico en tonos ivory y dorado. 200x300cm, antideslizante.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600',
      calificacion: 4.5,
      totalResenas: 156,
      variantes: [{ id: 90051, sku: 'ALF-GEO-001', precioBase: 799.90, precioOferta: 649.90, stock: 12, esPrincipal: true, activo: true, stockMinimo: 3, enOferta: true, orden: 1 }],
    },
    {
      id: 9006,
      nombre: 'Set Cojines Decorativos Velvet',
      slug: 'set-cojines-velvet',
      descripcionCorta: 'Set de 4 cojines decorativos en terciopelo con detalles dorados. Colores: gris, mostaza, crema y negro.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600',
      calificacion: 4.4,
      totalResenas: 203,
      variantes: [{ id: 90061, sku: 'COJ-VEL-001', precioBase: 249.90, precioOferta: 189.90, stock: 50, esPrincipal: true, activo: true, stockMinimo: 10, enOferta: true, orden: 1 }],
    },
  ],
  nordico: [
    {
      id: 9010,
      nombre: 'Sofá 3 Cuerpos Malmö',
      slug: 'sofa-3-cuerpos-malmo',
      descripcionCorta: 'Sofá de 3 cuerpos en lino natural con patas de madera de haya. Diseño escandinavo minimalista.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600',
      calificacion: 4.9,
      totalResenas: 187,
      variantes: [{ id: 90101, sku: 'SOF-MAL-001', precioBase: 2899.90, precioOferta: 2499.90, stock: 6, esPrincipal: true, activo: true, stockMinimo: 2, enOferta: true, orden: 1 }],
    },
    {
      id: 9011,
      nombre: 'Mesa Auxiliar Abedul Natural',
      slug: 'mesa-auxiliar-abedul',
      descripcionCorta: 'Mesa auxiliar redonda en madera de abedul con acabado natural. Ø50cm, perfecta para espacios nórdicos.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=600',
      calificacion: 4.7,
      totalResenas: 92,
      variantes: [{ id: 90111, sku: 'MES-ABE-001', precioBase: 599.90, precioOferta: null, stock: 18, esPrincipal: true, activo: true, stockMinimo: 5, enOferta: false, orden: 1 }],
    },
    {
      id: 9012,
      nombre: 'Lámpara Colgante Esfera Blanca',
      slug: 'lampara-colgante-esfera',
      descripcionCorta: 'Lámpara colgante esférica en papel de arroz blanco. Luz difusa y cálida, estilo Japandi.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600',
      calificacion: 4.8,
      totalResenas: 134,
      variantes: [{ id: 90121, sku: 'LAM-ESF-001', precioBase: 349.90, precioOferta: 289.90, stock: 25, esPrincipal: true, activo: true, stockMinimo: 5, enOferta: true, orden: 1 }],
    },
    {
      id: 9013,
      nombre: 'Estantería Escalera Roble',
      slug: 'estanteria-escalera-roble',
      descripcionCorta: 'Estantería tipo escalera en roble blanqueado con 5 niveles. Perfecta para plantas y decoración.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600',
      calificacion: 4.6,
      totalResenas: 78,
      variantes: [{ id: 90131, sku: 'EST-ESC-001', precioBase: 849.90, precioOferta: 699.90, stock: 10, esPrincipal: true, activo: true, stockMinimo: 3, enOferta: true, orden: 1 }],
    },
    {
      id: 9014,
      nombre: 'Alfombra Tejida Algodón Natural',
      slug: 'alfombra-tejida-algodon',
      descripcionCorta: 'Alfombra tejida a mano en algodón orgánico color natural. 160x230cm, lavable a máquina.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600',
      calificacion: 4.5,
      totalResenas: 211,
      variantes: [{ id: 90141, sku: 'ALF-TEJ-001', precioBase: 699.90, precioOferta: 549.90, stock: 14, esPrincipal: true, activo: true, stockMinimo: 3, enOferta: true, orden: 1 }],
    },
    {
      id: 9015,
      nombre: 'Macetero Cerámico Copenhagen',
      slug: 'macetero-ceramico-copenhagen',
      descripcionCorta: 'Set de 3 maceteros en cerámica mate blanca con base de madera. Diferentes tamaños.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600',
      calificacion: 4.3,
      totalResenas: 65,
      variantes: [{ id: 90151, sku: 'MAC-COP-001', precioBase: 189.90, precioOferta: null, stock: 40, esPrincipal: true, activo: true, stockMinimo: 10, enOferta: false, orden: 1 }],
    },
  ],
  industrial: [
    {
      id: 9020,
      nombre: 'Mesa de Centro Hierro & Madera',
      slug: 'mesa-centro-hierro-madera',
      descripcionCorta: 'Mesa de centro con tapa de madera reciclada y estructura de hierro negro. Estilo industrial auténtico.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=600',
      calificacion: 4.7,
      totalResenas: 143,
      variantes: [{ id: 90201, sku: 'MES-HIE-001', precioBase: 1199.90, precioOferta: 949.90, stock: 9, esPrincipal: true, activo: true, stockMinimo: 2, enOferta: true, orden: 1 }],
    },
    {
      id: 9021,
      nombre: 'Estantería Industrial Pipe',
      slug: 'estanteria-industrial-pipe',
      descripcionCorta: 'Estantería de pared con tubería industrial en hierro negro y repisas de madera de pino. 5 niveles.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600',
      calificacion: 4.8,
      totalResenas: 98,
      variantes: [{ id: 90211, sku: 'EST-IND-001', precioBase: 1599.90, precioOferta: 1299.90, stock: 7, esPrincipal: true, activo: true, stockMinimo: 2, enOferta: true, orden: 1 }],
    },
    {
      id: 9022,
      nombre: 'Sofá Capitoneado Chester',
      slug: 'sofa-capitoneado-chester',
      descripcionCorta: 'Sofá 3 cuerpos tipo Chesterfield en cuero sintético marrón envejecido. Capitoneado clásico.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=600',
      calificacion: 4.9,
      totalResenas: 76,
      variantes: [{ id: 90221, sku: 'SOF-CHE-001', precioBase: 3999.90, precioOferta: 3299.90, stock: 4, esPrincipal: true, activo: true, stockMinimo: 1, enOferta: true, orden: 1 }],
    },
    {
      id: 9023,
      nombre: 'Lámpara Edison Vintage',
      slug: 'lampara-edison-vintage',
      descripcionCorta: 'Lámpara colgante con 5 bombillas Edison y cable tejido. Base de madera envejecida.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600',
      calificacion: 4.6,
      totalResenas: 189,
      variantes: [{ id: 90231, sku: 'LAM-EDI-001', precioBase: 449.90, precioOferta: 379.90, stock: 20, esPrincipal: true, activo: true, stockMinimo: 5, enOferta: true, orden: 1 }],
    },
    {
      id: 9024,
      nombre: 'Reloj de Pared Engranajes',
      slug: 'reloj-pared-engranajes',
      descripcionCorta: 'Reloj decorativo de pared con mecanismo de engranajes visibles en metal envejecido. Ø60cm.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600',
      calificacion: 4.4,
      totalResenas: 112,
      variantes: [{ id: 90241, sku: 'REL-ENG-001', precioBase: 349.90, precioOferta: null, stock: 16, esPrincipal: true, activo: true, stockMinimo: 3, enOferta: false, orden: 1 }],
    },
    {
      id: 9025,
      nombre: 'Alfombra Kilim Industrial',
      slug: 'alfombra-kilim-industrial',
      descripcionCorta: 'Alfombra estilo kilim desgastado en tonos carbón y óxido. 200x300cm, resistente al tráfico.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600',
      calificacion: 4.5,
      totalResenas: 87,
      variantes: [{ id: 90251, sku: 'ALF-KIL-001', precioBase: 899.90, precioOferta: 749.90, stock: 11, esPrincipal: true, activo: true, stockMinimo: 3, enOferta: true, orden: 1 }],
    },
  ],
  rustico: [
    {
      id: 9030,
      nombre: 'Sofá Rural Lino Natural',
      slug: 'sofa-rural-lino-natural',
      descripcionCorta: 'Sofá de 3 plazas tapizado en lino natural con estructura de madera maciza vista. Almohadones incluidos.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600',
      calificacion: 4.7,
      totalResenas: 95,
      variantes: [{ id: 90301, sku: 'SOF-RUR-001', precioBase: 2799.90, precioOferta: 2299.90, stock: 5, esPrincipal: true, activo: true, stockMinimo: 1, enOferta: true, orden: 1 }],
    },
    {
      id: 9031,
      nombre: 'Mesa Comedor Tronco Rústico',
      slug: 'mesa-comedor-tronco-rustico',
      descripcionCorta: 'Mesa de comedor hecha con tronco de cedro natural con bordes vivos y patas de hierro forjado. 180cm.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=600',
      calificacion: 4.9,
      totalResenas: 62,
      variantes: [{ id: 90311, sku: 'MES-TRO-001', precioBase: 2499.90, precioOferta: 1999.90, stock: 3, esPrincipal: true, activo: true, stockMinimo: 1, enOferta: true, orden: 1 }],
    },
    {
      id: 9032,
      nombre: 'Lámpara Farol Campestre',
      slug: 'lampara-farol-campestre',
      descripcionCorta: 'Lámpara colgante tipo farol en hierro forjado con cristal ahumado. Estilo farmhouse elegante.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600',
      calificacion: 4.5,
      totalResenas: 108,
      variantes: [{ id: 90321, sku: 'LAM-FAR-001', precioBase: 399.90, precioOferta: 329.90, stock: 18, esPrincipal: true, activo: true, stockMinimo: 5, enOferta: true, orden: 1 }],
    },
    {
      id: 9033,
      nombre: 'Estante Flotante Madera Maciza',
      slug: 'estante-flotante-madera-maciza',
      descripcionCorta: 'Set de 3 estantes flotantes en madera maciza de pino con soportes ocultos. Diferentes largos.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600',
      calificacion: 4.6,
      totalResenas: 145,
      variantes: [{ id: 90331, sku: 'EST-FLO-001', precioBase: 449.90, precioOferta: 369.90, stock: 22, esPrincipal: true, activo: true, stockMinimo: 5, enOferta: true, orden: 1 }],
    },
    {
      id: 9034,
      nombre: 'Alfombra Yute Trenzado',
      slug: 'alfombra-yute-trenzado',
      descripcionCorta: 'Alfombra redonda de yute natural trenzado a mano. Ø200cm, ideal para salas y comedores rústicos.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600',
      calificacion: 4.4,
      totalResenas: 167,
      variantes: [{ id: 90341, sku: 'ALF-YUT-001', precioBase: 599.90, precioOferta: 479.90, stock: 13, esPrincipal: true, activo: true, stockMinimo: 3, enOferta: true, orden: 1 }],
    },
    {
      id: 9035,
      nombre: 'Candelabro Rústico 5 Velas',
      slug: 'candelabro-rustico-5-velas',
      descripcionCorta: 'Candelabro de mesa para 5 velas en hierro forjado con base de madera. Acabado envejecido artesanal.',
      imagenPrincipal: 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600',
      calificacion: 4.3,
      totalResenas: 54,
      variantes: [{ id: 90351, sku: 'CAN-RUS-001', precioBase: 199.90, precioOferta: null, stock: 35, esPrincipal: true, activo: true, stockMinimo: 8, enOferta: false, orden: 1 }],
    },
  ],
};

export default function DreamiaPage() {
  const router = useRouter();
  const { usuario } = useAuthStore();
  const { agregar } = useCarritoStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [estilo, setEstilo] = useState('moderno');
  const [antesImagen, setAntesImagen] = useState(IMAGEN_ANTES);
  const [fotoSubida, setFotoSubida] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [nombreEstancia, setNombreEstancia] = useState('Mi Sala de Estar');
  const [cargando, setCargando] = useState(false);
  const [pasoActual, setPasoActual] = useState(0);
  const [disenoGenerado, setDisenoGenerado] = useState<any | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [estiloHover, setEstiloHover] = useState<string | null>(null);
  const [productosAgregados, setProductosAgregados] = useState<Set<number>>(new Set());

  // Pasos de carga del motor IA
  const pasosCarga = [
    'Escaneando dimensiones del espacio...',
    'Identificando contornos de paredes y distribución de luz...',
    'Analizando paleta de colores y textura del ambiente...',
    'Buscando mobiliario complementario en el catálogo de LlevaloPe...',
    'Generando iluminación y renderizado fotorrealista final...',
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cargando) {
      setPasoActual(0);
      interval = setInterval(() => {
        setPasoActual((prev) => {
          if (prev >= pasosCarga.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [cargando]);

  // Manejar subida de foto
  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return;

    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(file.type)) {
      toast.error('Formato no soportado. Usa JPG, PNG o WebP.');
      return;
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande. Máximo 10MB.');
      return;
    }

    setFotoSubida(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setAntesImagen(url);
    setDisenoGenerado(null); // Resetear diseño si se sube nueva foto
    toast.success('¡Foto cargada exitosamente! 📸');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  }, [handleFileChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const eliminarFoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFotoSubida(null);
    setPreviewUrl(null);
    setAntesImagen(IMAGEN_ANTES);
    setDisenoGenerado(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast('Foto eliminada', { icon: '🗑️' });
  };

  const procesarDiseno = async () => {
    setCargando(true);
    setDisenoGenerado(null);
    setProductosAgregados(new Set());
    try {
      const resp = await dreamiaAPI.generar(estilo);

      // Si el backend no retorna productos (o retorna array vacío), usar los simulados
      const productosResp = resp.productosRecomendados;
      const tieneProductos = productosResp && productosResp.length > 0;

      setDisenoGenerado({
        ...resp,
        productosRecomendados: tieneProductos
          ? productosResp
          : PRODUCTOS_SIMULADOS[estilo] || PRODUCTOS_SIMULADOS.moderno,
      });

      toast.success('¡Diseño decorativo generado con éxito! ✨');
    } catch (err: any) {
      // Si falla el API completamente, usar datos simulados
      const estiloData = ESTILOS_DECORATIVOS.find(e => e.id === estilo);
      setDisenoGenerado({
        imagenResultado: estiloData?.previewImg || ESTILOS_DECORATIVOS[0].previewImg,
        estilo,
        productosRecomendados: PRODUCTOS_SIMULADOS[estilo] || PRODUCTOS_SIMULADOS.moderno,
      });
      toast.success('¡Diseño decorativo generado con datos de muestra! ✨');
    } finally {
      setCargando(false);
    }
  };

  const getPrecioVigente = (variante: VarianteProducto) => {
    return variante.precioOferta || variante.precioBase || 0;
  };

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(precio);
  };

  const agregarAlCarrito = (producto: Producto, variante: VarianteProducto) => {
    if (!usuario) {
      toast.error('Debe iniciar sesión para agregar productos al carrito');
      router.push('/auth/iniciar-sesion?redirigido=agregar-carrito');
      return;
    }
    agregar(producto, variante, 1);
    setProductosAgregados(prev => new Set(prev).add(producto.id));
    toast.success(`${producto.nombre} agregado al carrito!`);
  };

  const agregarTodoAlCarrito = () => {
    if (!usuario) {
      toast.error('Debe iniciar sesión para agregar productos al carrito');
      router.push('/auth/iniciar-sesion?redirigido=agregar-carrito');
      return;
    }
    if (!disenoGenerado?.productosRecomendados) return;

    disenoGenerado.productosRecomendados.forEach((prod: Producto) => {
      const principal = prod.variantes?.find(v => v.esPrincipal) || prod.variantes?.[0];
      if (principal) {
        agregar(prod, principal, 1);
      }
    });

    const allIds = new Set<number>(disenoGenerado.productosRecomendados.map((p: any) => p.id));
    setProductosAgregados(allIds);
    toast.success('¡Todos los muebles del diseño han sido agregados al carrito! 🎉');
  };

  // Calcular total del diseño
  const totalDiseno = disenoGenerado?.productosRecomendados?.reduce((sum: number, prod: any) => {
    const principal = prod.variantes?.find((v: any) => v.esPrincipal) || prod.variantes?.[0];
    if (!principal) return sum;
    return sum + (principal.precioOferta || principal.precioBase || 0);
  }, 0) || 0;

  const estiloActual = ESTILOS_DECORATIVOS.find(e => e.id === estilo);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-crema">
        {/* Banner Hero */}
        <section className="bg-gradient-to-br from-azul-oscuro via-azul-corp to-teal py-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-48 h-48 border border-white rounded-full" />
            <div className="absolute bottom-10 right-10 w-96 h-96 border border-white rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-white rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-full px-4 py-1.5 mb-6">
                <Sparkles size={16} className="text-dorado" />
                <span className="text-xs font-semibold uppercase tracking-wider">DreamHome AI Portal</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold font-montserrat tracking-tight mb-4">
                Dream<span className="text-teal-claro text-dorado">IA</span>: Decora con Inteligencia Artificial
              </h1>
              <p className="max-w-2xl mx-auto text-white/80 text-sm md:text-base leading-relaxed">
                Transforma cualquier habitación al instante. Sube una foto de tu sala, cocina u oficina, elige un estilo y visualiza muebles reales de nuestra tienda integrados perfectamente en tu espacio.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Formulario de configuración y subida */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Opciones */}
            <div className="bg-white rounded-3xl p-6 shadow-premium space-y-6">
              <h2 className="text-lg font-bold text-azul-oscuro flex items-center gap-2">
                ⚙️ Configurar Escenario
              </h2>

              {/* Nombre de la estancia */}
              <div>
                <label className="label-campo">Nombre del espacio</label>
                <input
                  type="text"
                  value={nombreEstancia}
                  onChange={(e) => setNombreEstancia(e.target.value)}
                  placeholder="Ej. Mi Sala de Estar, Dormitorio principal"
                  className="input-campo"
                />
              </div>

              {/* Selector de estilos decorativos mejorado */}
              <div>
                <label className="label-campo flex items-center gap-2">
                  <Palette size={14} className="text-teal" />
                  Estilo decorativo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ESTILOS_DECORATIVOS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setEstilo(item.id);
                        setDisenoGenerado(null);
                      }}
                      onMouseEnter={() => setEstiloHover(item.id)}
                      onMouseLeave={() => setEstiloHover(null)}
                      className={`relative p-3 rounded-2xl text-left border-2 transition-all duration-300 cursor-pointer overflow-hidden group ${
                        estilo === item.id
                          ? 'border-teal bg-teal/5 shadow-md ring-2 ring-teal/20'
                          : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Mini preview image */}
                      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-2">
                        <img
                          src={item.previewImg}
                          alt={item.label}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${item.color} opacity-20`} />
                        {estilo === item.id && (
                          <div className="absolute top-1.5 right-1.5">
                            <CheckCircle size={18} className="text-white drop-shadow-lg" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="text-sm">{item.emoji}</span>
                        <div>
                          <p className="font-bold text-xs text-azul-oscuro leading-tight">{item.label}</p>
                          <p className="text-[9px] text-gris-elegante mt-0.5 leading-tight">{item.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subida de foto con funcionalidad real */}
              <div>
                <label className="label-campo flex items-center gap-2">
                  <Camera size={14} className="text-teal" />
                  Subir foto de tu espacio
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleInputChange}
                  className="hidden"
                  id="dreamia-file-input"
                />

                {!fotoSubida ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                      isDragging
                        ? 'border-teal bg-teal/10 scale-[1.02]'
                        : 'border-gray-200 bg-crema/20 hover:bg-crema/40 hover:border-teal/40'
                    }`}
                  >
                    <div className={`transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-105'}`}>
                      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-teal/10 to-teal/5 flex items-center justify-center">
                        <Upload size={24} className={`transition-colors ${isDragging ? 'text-teal' : 'text-gris-elegante'}`} />
                      </div>
                      <p className="text-xs font-semibold text-azul-oscuro">
                        {isDragging ? '¡Suelta tu foto aquí!' : 'Arrastra tu foto aquí'}
                      </p>
                      <p className="text-[10px] text-gris-elegante mt-1">o haz clic para seleccionar</p>
                      <p className="text-[9px] text-gris-elegante mt-2 opacity-60">JPG, PNG, WebP • Máx. 10MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-teal/30 bg-teal/5">
                    {/* Preview miniatura */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <img
                        src={previewUrl!}
                        alt="Preview de tu foto"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                        <div>
                          <p className="text-white text-[10px] font-semibold truncate max-w-[160px]">
                            {fotoSubida.name}
                          </p>
                          <p className="text-white/70 text-[9px]">
                            {(fotoSubida.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-all flex items-center justify-center"
                            title="Cambiar foto"
                          >
                            <Camera size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              eliminarFoto();
                            }}
                            className="w-7 h-7 rounded-lg bg-red-500/70 backdrop-blur-sm text-white hover:bg-red-500 transition-all flex items-center justify-center"
                            title="Eliminar foto"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Indicador de éxito */}
                    <div className="px-3 py-2 flex items-center gap-2">
                      <CheckCircle size={14} className="text-teal shrink-0" />
                      <p className="text-[10px] text-teal font-semibold">Foto lista para procesar</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón generar */}
              <button
                onClick={procesarDiseno}
                disabled={cargando}
                className="btn-primario w-full text-center flex items-center justify-center gap-2 text-base"
              >
                {cargando ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Procesando...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} className="text-white" /> Diseñar con IA
                  </>
                )}
              </button>

              {/* Info sobre el estilo seleccionado */}
              {estiloActual && (
                <div className="bg-crema/40 rounded-2xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gris-elegante uppercase tracking-wider font-semibold mb-1">Estilo seleccionado</p>
                  <p className="text-sm font-bold text-azul-oscuro">{estiloActual.emoji} {estiloActual.label}</p>
                  <p className="text-[10px] text-gris-elegante mt-0.5">{estiloActual.desc}</p>
                </div>
              )}
            </div>

            {/* Visualizador central */}
            <div className="lg:col-span-2 space-y-6">
              {cargando && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-12 shadow-premium text-center flex flex-col items-center justify-center aspect-[16/9] border border-gray-100"
                >
                  <div className="relative">
                    <Loader2 size={48} className="text-teal animate-spin mb-6" />
                    <Sparkles size={20} className="text-dorado absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-azul-oscuro font-montserrat">
                    El motor DreamIA está decorando tu habitación
                  </h3>
                  <div className="w-72 h-2.5 bg-crema rounded-full overflow-hidden mt-4 relative">
                    <motion.div
                      className="h-full bg-gradient-to-r from-teal to-dorado rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${((pasoActual + 1) / pasosCarga.length) * 100}%` }}
                      transition={{ duration: 0.7, ease: 'easeInOut' }}
                    />
                  </div>
                  <p className="text-sm text-gris-elegante mt-3 italic animate-pulse">
                    {pasosCarga[pasoActual]}
                  </p>
                  <div className="flex gap-1.5 mt-4">
                    {pasosCarga.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          idx <= pasoActual ? 'bg-teal scale-110' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {!cargando && !disenoGenerado && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 shadow-premium space-y-4 border border-gray-100"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-azul-oscuro">{nombreEstancia}</h3>
                      <p className="text-xs text-gris-elegante">
                        {fotoSubida ? 'Tu foto cargada' : 'Foto de ejemplo — sube tu propia foto'}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                      fotoSubida
                        ? 'bg-teal/15 text-teal'
                        : 'bg-gray-100 text-gris-elegante'
                    }`}>
                      {fotoSubida ? '📸 Tu foto' : 'Ejemplo'}
                    </span>
                  </div>
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-card group">
                    <img src={antesImagen} alt="Habitación original" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

                    {/* Overlay con estilo */}
                    {estiloActual && (
                      <div className="absolute bottom-3 left-3">
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                          <span className="text-sm">{estiloActual.emoji}</span>
                          <span className="text-xs font-semibold text-azul-oscuro">{estiloActual.label}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bg-crema/40 rounded-2xl p-4 flex items-start gap-3 border border-gray-100">
                    <Info size={18} className="text-teal shrink-0 mt-0.5" />
                    <p className="text-xs text-azul-oscuro leading-relaxed">
                      {fotoSubida
                        ? <>¡Tu foto está lista! Presiona el botón <strong>Diseñar con IA</strong> para ver la transformación con estilo <strong>{estiloActual?.label}</strong>.</>
                        : <>Sube una foto de tu espacio o presiona <strong>Diseñar con IA</strong> para usar la imagen de ejemplo y comenzar el renderizado.</>
                      }
                    </p>
                  </div>
                </motion.div>
              )}

              {!cargando && disenoGenerado && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-6 shadow-premium space-y-6 border border-gray-100"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-azul-oscuro flex items-center gap-2">
                        {nombreEstancia}
                        <span className="text-xs font-normal text-gris-elegante bg-crema px-2 py-0.5 rounded-full">
                          {estiloActual?.emoji} {estiloActual?.label}
                        </span>
                      </h3>
                      <p className="text-xs text-gris-elegante">Desliza la barra central para comparar el antes y después</p>
                    </div>
                    <span className="bg-dorado/15 text-dorado text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1">
                      <Sparkles size={12} /> Decorado con IA
                    </span>
                  </div>

                  {/* Comparador deslizante Before/After */}
                  <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-premium group select-none">
                    {/* Después */}
                    <img
                      src={disenoGenerado.imagenResultado}
                      alt="Habitación decorada"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Antes */}
                    <div
                      className="absolute inset-y-0 left-0 right-0 overflow-hidden"
                      style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                    >
                      <img
                        src={antesImagen}
                        alt="Habitación original"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>

                    {/* Labels */}
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10">
                      Antes
                    </div>
                    <div className="absolute top-3 right-3 bg-dorado/90 backdrop-blur-sm text-azul-oscuro text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10">
                      Después
                    </div>

                    {/* Línea divisoria */}
                    <div
                      className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center shadow-lg"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="w-10 h-10 bg-white text-azul-oscuro rounded-full shadow-premium flex items-center justify-center border-2 border-gray-100 text-sm font-bold scale-90 group-hover:scale-100 transition-transform">
                        ↔
                      </div>
                    </div>

                    {/* Control de rango invisible */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPos}
                      onChange={(e) => setSliderPos(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                    />
                  </div>

                  {/* Resultados y compra consolidada */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-teal/5 to-dorado/5 border border-teal/10 rounded-2xl p-5">
                    <div>
                      <p className="font-bold text-azul-oscuro text-sm">¿Te gusta todo el diseño?</p>
                      <p className="text-xs text-gris-elegante mt-0.5">
                        {disenoGenerado.productosRecomendados?.length || 0} productos por un total de{' '}
                        <span className="font-bold text-teal">{formatPrecio(totalDiseno)}</span>
                      </p>
                    </div>
                    <button
                      onClick={agregarTodoAlCarrito}
                      className="btn-primario inline-flex items-center gap-2 cursor-pointer w-full sm:w-auto text-center justify-center"
                    >
                      <ShoppingCart size={16} /> Comprar todo el diseño
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Listado de productos recomendados */}
        <AnimatePresence>
          {disenoGenerado && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-7xl mx-auto px-4 pb-20"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-montserrat text-azul-oscuro mb-1 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal to-teal-claro flex items-center justify-center text-white">
                      <Star size={18} />
                    </span>
                    Productos recomendados
                  </h2>
                  <p className="text-gris-elegante text-sm">
                    Muebles y decoración que encajan con tu diseño <strong>{estiloActual?.label}</strong>
                  </p>
                </div>
                <div className="bg-white rounded-2xl px-4 py-2 shadow-card border border-gray-100">
                  <p className="text-[10px] text-gris-elegante uppercase tracking-wider font-semibold">Total del diseño</p>
                  <p className="text-lg font-bold text-teal">{formatPrecio(totalDiseno)}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {disenoGenerado.productosRecomendados &&
                  disenoGenerado.productosRecomendados.map((prod: any, index: number) => {
                    const principal = prod.variantes?.find((v: any) => v.esPrincipal) || prod.variantes?.[0];
                    if (!principal) return null;

                    const precioVigente = principal.precioOferta || principal.precioBase || 0;
                    const tieneOferta = principal.precioOferta && principal.precioOferta < principal.precioBase;
                    const descuento = tieneOferta
                      ? Math.round(((principal.precioBase - principal.precioOferta) / principal.precioBase) * 100)
                      : 0;
                    const estaAgregado = productosAgregados.has(prod.id);

                    return (
                      <motion.div
                        key={prod.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="bg-white rounded-3xl overflow-hidden shadow-card border border-gray-100 hover:shadow-hover transition-all duration-300 group"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-crema/20">
                          <img
                            src={prod.imagenPrincipal}
                            alt={prod.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            {tieneOferta && (
                              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                                -{descuento}%
                              </span>
                            )}
                            <span className="bg-teal/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                              <Sparkles size={10} /> IA Pick
                            </span>
                          </div>

                          {/* Quick view overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg transform translate-y-4 group-hover:translate-y-0">
                              <Eye size={14} className="text-azul-oscuro" />
                              <span className="text-xs font-semibold text-azul-oscuro">Ver detalle</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <div>
                            <span className="text-[10px] text-teal font-bold uppercase tracking-wider bg-teal/10 px-2 py-0.5 rounded-full">
                              Recomendado {estiloActual?.emoji}
                            </span>
                            <h3 className="font-bold text-azul-oscuro mt-2 line-clamp-1 text-sm">
                              {prod.nombre}
                            </h3>
                            <p className="text-xs text-gris-elegante mt-1 line-clamp-2">
                              {prod.descripcionCorta}
                            </p>
                          </div>

                          {/* Rating */}
                          {prod.calificacion && (
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={12}
                                    className={star <= Math.round(prod.calificacion) ? 'text-dorado fill-dorado' : 'text-gray-200'}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-gris-elegante">
                                {prod.calificacion} ({prod.totalResenas})
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                            <div>
                              {tieneOferta && (
                                <p className="text-[10px] text-gris-elegante line-through">
                                  {formatPrecio(principal.precioBase)}
                                </p>
                              )}
                              <p className={`text-lg font-bold ${tieneOferta ? 'text-red-500' : 'text-azul-oscuro'}`}>
                                {formatPrecio(precioVigente)}
                              </p>
                            </div>
                            <button
                              onClick={() => agregarAlCarrito(prod as Producto, principal as VarianteProducto)}
                              disabled={estaAgregado}
                              className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                                estaAgregado
                                  ? 'bg-teal text-white shadow-md'
                                  : 'bg-teal/10 text-teal hover:bg-teal hover:text-white'
                              }`}
                              title={estaAgregado ? 'Agregado al carrito' : 'Añadir al carrito'}
                            >
                              {estaAgregado ? (
                                <CheckCircle size={18} />
                              ) : (
                                <ShoppingCart size={18} />
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>

              {/* Resumen al final */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-10 bg-gradient-to-r from-azul-oscuro to-azul-corp rounded-3xl p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6"
              >
                <div>
                  <h3 className="text-xl font-bold font-montserrat mb-1">
                    ¿Listo para transformar tu espacio?
                  </h3>
                  <p className="text-white/70 text-sm">
                    Lleva todos los {disenoGenerado.productosRecomendados?.length || 0} productos por solo{' '}
                    <span className="font-bold text-dorado">{formatPrecio(totalDiseno)}</span>
                  </p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={agregarTodoAlCarrito}
                    className="btn-primario flex-1 sm:flex-none flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={16} /> Agregar todo
                  </button>
                  <button
                    onClick={() => {
                      setDisenoGenerado(null);
                      setSliderPos(50);
                    }}
                    className="border-2 border-white/30 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} /> Nuevo diseño
                  </button>
                </div>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
