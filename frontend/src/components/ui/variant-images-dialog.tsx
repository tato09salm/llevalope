'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Image as ImageIcon, X, Upload, Star } from 'lucide-react';
import { useState } from 'react';

interface VariantImage {
  url: string;
  alt: string;
  orden: number;
  principal: boolean;
}

interface VariantImagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  variantIndex: number;
  images: VariantImage[];
  onUpdateImages: (variantIndex: number, images: VariantImage[]) => void;
}

export default function VariantImagesDialog({
  isOpen,
  onClose,
  variantIndex,
  images,
  onUpdateImages,
}: VariantImagesDialogProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [tempImageUrl, setTempImageUrl] = useState('');

  const agregarImagen = (url: string) => {
    const newImages = [...images, { 
      url, 
      alt: '', 
      orden: images.length, 
      principal: images.length === 0 
    }];
    onUpdateImages(variantIndex, newImages);
    setTempImageUrl('');
  };

  const eliminarImagen = (index: number) => {
    const newImages = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, orden: i, principal: i === 0 }));
    onUpdateImages(variantIndex, newImages);
  };

  const setImagenPrincipal = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      principal: i === index
    }));
    onUpdateImages(variantIndex, newImages);
  };

  const actualizarAlt = (index: number, alt: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], alt };
    onUpdateImages(variantIndex, newImages);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('El tamaño máximo es de 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      agregarImagen(base64);
    };
    reader.readAsDataURL(file);
    
    // Limpiar input
    event.target.value = '';
  };

  const handleAddUrl = () => {
    if (tempImageUrl.trim()) {
      agregarImagen(tempImageUrl.trim());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border"
          >
            {/* Header */}
            <div className="p-6 border-b bg-crema/50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-6 h-6 text-teal" />
                  <h3 className="text-lg font-semibold text-azul-oscuro">Imágenes de la Variante</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-black/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gris-elegante" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {/* Existing Images Grid */}
              {images.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-azul-oscuro mb-3">Imágenes Agregadas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-transparent hover:border-teal transition-all">
                          {img.url ? (
                            <img 
                              src={img.url} 
                              alt={img.alt || 'Imagen del producto'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              <ImageIcon className="w-10 h-10 text-gray-300" />
                            </div>
                          )}
                        </div>
                        
                        {/* Principal Badge */}
                        {img.principal && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Star size={10} fill="currentColor" />
                            Principal
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-2 flex gap-2">
                          {!img.principal && (
                            <button
                              onClick={() => setImagenPrincipal(idx)}
                              className="flex-1 text-xs bg-gray-100 hover:bg-yellow-500 hover:text-white text-gray-700 px-2 py-1 rounded-lg transition-colors"
                            >
                              Principal
                            </button>
                          )}
                          <button
                            onClick={() => eliminarImagen(idx)}
                            className="px-2 py-1 text-xs bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Alt Text */}
                        <input
                          type="text"
                          value={img.alt}
                          onChange={(e) => actualizarAlt(idx, e.target.value)}
                          placeholder="Ej: Frontal, Lateral, Espalda..."
                          className="mt-2 w-full text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Image Section */}
              <div className="border border-gray-200 rounded-xl p-4 bg-crema/30">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-5 h-5 text-teal" />
                  <span className="font-semibold text-azul-oscuro">Agregar Nueva Imagen</span>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${
                      activeTab === 'upload' 
                        ? 'bg-teal text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Upload size={16} />
                      Subir Imagen
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('url')}
                    className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${
                      activeTab === 'url' 
                        ? 'bg-teal text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon size={16} />
                      URL de Imagen
                    </div>
                  </button>
                </div>

                {/* Upload Tab */}
                {activeTab === 'upload' && (
                  <div className="flex items-center justify-center">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                      <Upload className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Haz clic para seleccionar una imagen</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF (max 5MB)</p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                )}

                {/* URL Tab */}
                {activeTab === 'url' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={tempImageUrl}
                      onChange={(e) => setTempImageUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                    />
                    <button
                      onClick={handleAddUrl}
                      disabled={!tempImageUrl.trim()}
                      className="w-full btn-primario flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Plus size={18} />
                      Agregar Imagen
                    </button>
                  </div>
                )}
              </div>

              {/* Empty State */}
              {images.length === 0 && (
                <div className="text-center py-8 text-gris-elegante">
                  <ImageIcon size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium">No hay imágenes aún</p>
                  <p className="text-sm opacity-70">Agrega la primera imagen de la variante</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="btn-primario px-8"
                >
                  Listo
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
