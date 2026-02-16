"use client"
import Link from "next/link";
import React, { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import Offcanvas from "./Menu/Offcanvas";

const PublicHeader = () => {
   const [isScrolled, setIsScrolled] = useState(false);
   const [offCanvas, setOffCanvas] = useState(false);
   const { scrollY } = useScroll();

   useMotionValueEvent(scrollY, "change", (latest) => {
      setIsScrolled(latest > 20);
   });

   return (
      <motion.header
         className="fixed-top w-100"
         initial={{ y: -100 }}
         animate={{ y: 0 }}
         transition={{ duration: 0.5 }}
         style={{
            zIndex: 1000,
            background: isScrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
            backdropFilter: isScrolled ? 'blur(16px)' : 'none',
            borderBottom: isScrolled ? '1px solid #E2E8F0' : '1px solid transparent',
            padding: isScrolled ? '16px 0' : '24px 0',
            transition: 'all 0.3s ease'
         }}
      >
         <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <div className="d-flex align-items-center justify-content-between">

               {/* Logo Area */}
               <Link href="/" className="text-decoration-none d-flex align-items-center gap-2">
                  <div style={{ width: 24, height: 24, background: '#2563EB', borderRadius: 6 }}></div>
                  <h4 className="m-0 fw-bold text-dark" style={{ fontSize: '20px', letterSpacing: '-0.03em', color: '#0F172A' }}>
                     99Sellers.
                  </h4>
               </Link>

               {/* Desktop Navigation */}
               <div className="d-none d-lg-flex align-items-center gap-4">
                  {['Features', 'Live Data', 'Pricing'].map((item) => (
                     <Link key={item} href={`/${item.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}>
                        {item}
                     </Link>
                  ))}
               </div>

               {/* Action Buttons */}
               <div className="d-flex align-items-center gap-2 gap-md-3">
                  <Link href="/signin" className="d-none d-sm-block text-decoration-none" style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>
                     Log in
                  </Link>
                  <Link href="/signin" className="d-none d-md-block" style={{
                     background: '#0F172A',
                     color: 'white',
                     padding: '10px 20px',
                     borderRadius: '6px',
                     fontSize: '14px',
                     fontWeight: '600',
                     textDecoration: 'none'
                  }}>
                     Start Free Trial
                  </Link>

                  {/* Mobile Menu Toggle */}
                  <button
                     onClick={() => setOffCanvas(true)}
                     className="d-lg-none border-0 bg-transparent p-2"
                     style={{ color: '#0F172A', fontSize: '20px' }}
                  >
                     <i className="fa-light fa-bars"></i>
                  </button>
               </div>
            </div>
         </div>

         <Offcanvas offCanvas={offCanvas} setOffCanvas={setOffCanvas} />
      </motion.header>
   );
};

export default PublicHeader;