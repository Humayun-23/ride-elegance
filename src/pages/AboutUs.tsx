import React from 'react';
import { SEO } from '../components/common/SEO';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CarFront, Laptop, Building2, Linkedin, Mail } from 'lucide-react';

export default function AboutUs() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: "-50px" },
    transition: { staggerChildren: 0.2 }
  };

  return (
    <div className="min-h-screen bg-[#f7fbf8] pb-24 font-body">
      <SEO
        title="About Us - GoPanda"
        description="Learn about GoPanda's mission to organize local vehicle rentals and build a connected mobility platform."
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Placeholder for Hero Background Pattern or Image */}
        <div className="absolute inset-0 bg-[#e7f4eb] opacity-50 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,184,129,0.1),transparent_50%)]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <img src="/logo-green-black.png" alt="GoPanda Logo" className="h-16 md:h-20 mx-auto object-contain mb-8" />
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-[#010101] tracking-tight"
            {...fadeIn}
          >
            Organizing Local <span className="text-[#3bb881]">Vehicle Rentals</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-[#3f4943] max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            We started with a simple problem: renting a bike, scooty, or car locally is still too dependent on phone calls, scattered WhatsApp messages, and uncertain availability. GoPanda exists to change that.
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-12 border border-[#dfeee6]">
          <motion.div className="space-y-6 text-center" {...fadeIn}>
            <h2 className="text-3xl font-display font-bold text-[#010101]">Our Mission</h2>
            <p className="text-[#3f4943] text-lg leading-relaxed">
              To organize local vehicle rentals by helping rental shops digitize operations and helping customers and businesses access reliable rental vehicles more easily.
            </p>
            <div className="w-24 h-1 bg-[#3bb881]/30 mx-auto rounded-full mt-8" />
          </motion.div>
        </div>
      </section>

      {/* What We Are Building */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeIn}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#010101] mb-4">What We Are Building</h2>
            <p className="text-[#3f4943] max-w-2xl mx-auto">GoPanda is evolving into a product portfolio with three connected parts.</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
          >
            {/* 1. Marketplace */}
            <motion.div variants={fadeIn} className="bg-white p-8 rounded-3xl shadow-sm border border-[#dfeee6] hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-[#e7f4eb] rounded-2xl flex items-center justify-center text-[#167a50] mb-6">
                <CarFront size={24} />
              </div>
              <h3 className="text-xl font-display font-bold text-[#010101] mb-3">Online Marketplace</h3>
              <p className="text-[#3f4943] leading-relaxed">
                A discovery platform where customers can find available rental vehicles from local, verified rental partners.
              </p>
            </motion.div>

            {/* 2. RentalOS */}
            <motion.div variants={fadeIn} className="bg-white p-8 rounded-3xl shadow-sm border border-[#dfeee6] hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-[#e7f4eb] rounded-2xl flex items-center justify-center text-[#167a50] mb-6">
                <Laptop size={24} />
              </div>
              <h3 className="text-xl font-display font-bold text-[#010101] mb-3">RentalOS</h3>
              <p className="text-[#3f4943] leading-relaxed">
                A digital operating system for rental shops to manage catalog, walk-in bookings, customer records, and payments.
              </p>
            </motion.div>

            {/* 3. B2B Network */}
            <motion.div variants={fadeIn} className="bg-white p-8 rounded-3xl shadow-sm border border-[#dfeee6] hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-[#e7f4eb] rounded-2xl flex items-center justify-center text-[#167a50] mb-6">
                <Building2 size={24} />
              </div>
              <h3 className="text-xl font-display font-bold text-[#010101] mb-3">B2B Mobility Network</h3>
              <p className="text-[#3f4943] leading-relaxed">
                A vehicle procurement network to help hotels, travel agencies, offices, and events source vehicles easily.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Founders Section (Placeholders) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" {...fadeIn}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#010101] mb-4">Meet the Founders</h2>
            <p className="text-[#3f4943] max-w-2xl mx-auto">The team behind GoPanda driving the vision forward.</p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-2 gap-10 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
          >
            {/* Founder 1 Placeholder */}
            <motion.div variants={fadeIn} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#dfeee6] hover:shadow-lg transition-all duration-300">
              <div className="aspect-[4/3] bg-muted relative overflow-hidden flex items-center justify-center">
                {/* Image Placeholder - User can replace src later */}
                <img
                  src="/People/humayun.jpeg"
                  alt="Founder Name"
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback block if image doesn't exist
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-medium">Add Photo Here</div>';
                  }}
                />
              </div>
              <div className="p-8 text-center">
                <h3 className="text-2xl font-display font-bold text-[#010101] mb-1">Humayun Roshid</h3>
                <p className="text-[#167a50] font-medium mb-4">Co-Founder & Product
                  Engineering Lead</p>
                <p className="text-[#3f4943] text-sm mb-6 leading-relaxed text-justify">
                  Co-founder of GoPanda, leading product and technology. Building a connected platform to make local vehicle rentals more organized and reliable.
                </p>
                <div className="flex justify-center gap-4">
                  <a href="https://www.linkedin.com/in/humayun-roshid-51180b1b6/" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#f7fbf8] rounded-full text-[#3bb881] hover:bg-[#3bb881] hover:text-white transition-colors">
                    <Linkedin size={20} />
                  </a>
                  <a href="mailto:[humayun@gopanda.in]" className="p-2 bg-[#f7fbf8] rounded-full text-[#3bb881] hover:bg-[#3bb881] hover:text-white transition-colors">
                    <Mail size={20} />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Founder 2 Placeholder */}
            <motion.div variants={fadeIn} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#dfeee6] hover:shadow-lg transition-all duration-300">
              <div className="aspect-[4/3] bg-muted relative overflow-hidden flex items-center justify-center">
                {/* Image Placeholder - User can replace src later */}
                <img
                  src="/People/saptarshi.jpeg"
                  alt="Saptarshi"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback block if image doesn't exist
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-medium">Add Photo Here</div>';
                  }}
                />
              </div>
              <div className="p-8 text-center">
                <h3 className="text-2xl font-display font-bold text-[#010101] mb-1">Saptarshi</h3>
                <p className="text-[#167a50] font-medium mb-4">Co-Founder & Business
                  Development Lead</p>
                <p className="text-[#3f4943] text-sm mb-6 leading-relaxed text-justify">
                  Co-founder of GoPanda, leading business development and partnerships. Building GoPanda’s rental partner network and local business relationships.
                </p>
                <div className="flex justify-center gap-4">
                  <a href="https://www.linkedin.com/in/saptarshi-borkataky-34a740231/" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#f7fbf8] rounded-full text-[#3bb881] hover:bg-[#3bb881] hover:text-white transition-colors">
                    <Linkedin size={20} />
                  </a>
                  <a href="mailto:[saptarshi@gopanda.in]" className="p-2 bg-[#f7fbf8] rounded-full text-[#3bb881] hover:bg-[#3bb881] hover:text-white transition-colors">
                    <Mail size={20} />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why GoPanda */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#010101] text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Why GoPanda?</h2>
            <div className="space-y-6 text-slate-300 leading-relaxed text-lg text-center font-display">
              <p>
                Local vehicle rental is highly fragmented. Customers often do not know which vehicles are available, what the real price is, which shop to trust, or how deposits work.
              </p>
              <p>
                Rental shops also face manual booking records, scattered documents, unclear payment tracking, and difficulty managing offline/online demand together.
              </p>
              <p className="text-white font-medium text-xl mt-8">
                GoPanda bridges this gap.
              </p>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to="/contact" className="w-full sm:w-auto px-8 py-3.5 bg-[#3bb881] hover:bg-[#2b9666] text-white rounded-full font-medium font-display transition-colors text-center">
                Contact Us
              </Link>
              <Link to="/search-vehicles" className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full font-medium font-display transition-colors text-center">
                Explore Vehicles
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
