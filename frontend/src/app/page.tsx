import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/home/HeroSection';
import CategoriasDestacadas from '../components/home/CategoriasDestacadas';
import SeccionProductos from '../components/home/SeccionProductos';
import SeccionConfianza from '../components/home/SeccionConfianza';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <CategoriasDestacadas />
        <SeccionProductos
          titulo="Productos Populares"
          subtitulo="Más vendidos"
          tipo="destacados"
          verMasRuta="/productos?destacado=true"
        />
        <SeccionConfianza />
        <SeccionProductos
          titulo="Ofertas del Día"
          subtitulo="Precios increíbles"
          tipo="ofertas"
          verMasRuta="/productos?enOferta=true"
        />
      </main>
      <Footer />
    </>
  );
}
