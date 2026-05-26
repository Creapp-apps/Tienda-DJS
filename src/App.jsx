import SmoothScroll from './components/Layout/SmoothScroll';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import HeroSection from './sections/HeroSection';
import BiographyNarrative from './sections/BiographyNarrative';
import ManifestoSection from './sections/ManifestoSection';
import GigsCarousel from './sections/GigsCarousel';
import VideoMediaCenter from './sections/VideoMediaCenter';
import ArtistVault from './sections/ArtistVault';
import FarewellOutro from './sections/FarewellOutro';
import CartModal from './components/Store/CartModal';
import GrainOverlay from './components/GrainOverlay';
import AdminDashboard from './components/Admin/AdminDashboard';
import { CartProvider } from './context/CartContext';
import { SiteDataProvider } from './context/SiteDataContext';
import './styles/index.css';

export default function App() {
  return (
    <SiteDataProvider>
      <CartProvider>
        <SmoothScroll>
          <GrainOverlay />
          
          <Navbar />
          
          <main>
            <HeroSection />
            <BiographyNarrative />
            <ManifestoSection />
            <GigsCarousel />
            <VideoMediaCenter />
            <ArtistVault />
            <FarewellOutro />
          </main>
          
          <Footer />
          
          <CartModal />
          <AdminDashboard />
        </SmoothScroll>
      </CartProvider>
    </SiteDataProvider>
  );
}
