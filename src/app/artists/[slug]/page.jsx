"use client";

import { use, useState } from 'react';
import SmoothScroll from '../../../components/Layout/SmoothScroll';
import Navbar from '../../../components/Layout/Navbar';
import Footer from '../../../components/Layout/Footer';
import HeroSection from '../../../sections/HeroSection';
import BiographyNarrative from '../../../sections/BiographyNarrative';
import ManifestoSection from '../../../sections/ManifestoSection';
import GigsCarousel from '../../../sections/GigsCarousel';
import VideoMediaCenter from '../../../sections/VideoMediaCenter';
import ArtistVault from '../../../sections/ArtistVault';
import FarewellOutro from '../../../sections/FarewellOutro';
import CartModal from '../../../components/Store/CartModal';
import GrainOverlay from '../../../components/GrainOverlay';
import AdminDashboard from '../../../components/Admin/AdminDashboard';
import Preloader from '../../../components/Layout/Preloader';

export default function ArtistPage({ params }) {
  const { slug } = use(params);
  const [preloaderActive, setPreloaderActive] = useState(true);

  return (
    <>
      <Preloader slug={slug} onComplete={() => setPreloaderActive(false)} />
      
      <SmoothScroll>
        <GrainOverlay />
        
        <Navbar />
        
        <main>
          <HeroSection slug={slug} />
          <BiographyNarrative slug={slug} />
          <ManifestoSection slug={slug} />
          <GigsCarousel slug={slug} />
          <VideoMediaCenter slug={slug} />
          <ArtistVault slug={slug} />
          <FarewellOutro slug={slug} />
        </main>
        
        <Footer />
        
        <CartModal />
        <AdminDashboard />
      </SmoothScroll>
    </>
  );
}
