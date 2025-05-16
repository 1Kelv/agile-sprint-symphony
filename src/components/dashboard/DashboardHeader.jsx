
import React, { useEffect, useRef } from "react";
import { Bell, Search, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import FlowingText from "@/components/animations/FlowingText";

const DashboardHeader = ({ username: propUsername }) => {
  const { profile, user } = useAuth();
  // Use the profile username, fallback to email or use a default
  const displayName = propUsername || profile?.username || (user?.email ? user.email.split('@')[0] : "User");
  const containerRef = useRef(null);

  // Enhanced animation effect for the floating elements
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrame;
    let mouseX = 0;
    let mouseY = 0;
    const speed = 0.05;
    
    // Track mouse position for parallax effect
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    
    // Create particles
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'absolute inset-0 overflow-hidden pointer-events-none';
    container.appendChild(particlesContainer);
    
    const particles = [];
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full bg-white/10 backdrop-blur-sm';
      particle.style.width = `${Math.random() * 8 + 2}px`;
      particle.style.height = particle.style.width;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.opacity = `${Math.random() * 0.5 + 0.2}`;
      particlesContainer.appendChild(particle);
      particles.push(particle);
    }
    
    // Animation loop
    let currentX = 0;
    let currentY = 0;
    const animate = () => {
      // Smooth tracking of mouse position for parallax
      currentX += (mouseX - currentX) * speed;
      currentY += (mouseY - currentY) * speed;
      
      // Animate particles
      const time = Date.now() / 1000;
      particles.forEach((particle, index) => {
        const speed = 0.2 + index * 0.01;
        const x = Math.sin(time * speed + index) * 20;
        const y = Math.cos(time * speed + index) * 20;
        particle.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrame);
      container.removeEventListener('mousemove', handleMouseMove);
      if (particlesContainer.parentNode === container) {
        container.removeChild(particlesContainer);
      }
    };
  }, []);

  return (
    <div className="flex flex-col space-y-6 mb-8">
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600/40 via-purple-600/30 to-pink-500/20 p-8 animate-fade-in shadow-xl"
        style={{
          backgroundImage: `url(public/lovable-uploads/a739618a-60dc-4cb1-9c82-41e86a3c207c.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay with gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/70 to-black/60 backdrop-blur-sm"
          style={{ mixBlendMode: 'overlay' }}
        ></div>
        
        {/* Dynamic background shapes */}
        <div className="absolute inset-0 overflow-hidden opacity-25">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse-subtle"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl transform translate-x-1/2 translate-y-1/2 animate-pulse-subtle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-pink-500 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse-subtle" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Particle effect container is added via JS */}
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium text-white mb-2 animate-pulse-subtle">
                <Sparkles className="h-3 w-3 mr-1" />
                Welcome back
              </div>
              
              {/* Replace static header with animated FlowingText */}
              <FlowingText 
                text="AgileFlow Dashboard" 
                size="large"
                className="mb-2"
              />
              
              <p className="text-white/80 mt-2 max-w-md animate-fade-up backdrop-blur-sm bg-black/10 inline-block px-3 py-1 rounded-lg">
                Hello, {displayName}! Here's what's happening with your projects today.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-white/70" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 h-10 w-full md:w-64 bg-white/10 backdrop-blur-md border-0 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus-visible:outline-none hover:bg-white/20 transition-colors text-white"
                />
              </div>
              
              <button className="relative p-2 rounded-lg bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
                <Bell className="h-5 w-5 text-white" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
