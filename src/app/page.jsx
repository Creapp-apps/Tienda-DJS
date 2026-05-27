"use client";

import SmoothScroll from '../components/Layout/SmoothScroll';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import HeroSection from '../sections/HeroSection';
import BiographyNarrative from '../sections/BiographyNarrative';
import ManifestoSection from '../sections/ManifestoSection';
import GigsCarousel from '../sections/GigsCarousel';
import VideoMediaCenter from '../sections/VideoMediaCenter';
import ArtistVault from '../sections/ArtistVault';
import FarewellOutro from '../sections/FarewellOutro';
import CartModal from '../components/Store/CartModal';
import GrainOverlay from '../components/GrainOverlay';
import AdminDashboard from '../components/Admin/AdminDashboard';

export default function Home() {
  const defaultSlug = 'nehuen-lozano';

  return (
    <SmoothScroll>
      <GrainOverlay />
      
      <Navbar />
      
      <main>
        <HeroSection slug={defaultSlug} />
        <BiographyNarrative slug={defaultSlug} />
        <ManifestoSection slug={defaultSlug} />
        <GigsCarousel slug={defaultSlug} />
        <VideoMediaCenter slug={defaultSlug} />
        <ArtistVault slug={defaultSlug} />
        <FarewellOutro slug={defaultSlug} />
      </main>
      
      <Footer />
      
      <CartModal />
      <AdminDashboard />
    </SmoothScroll>
  );
}
