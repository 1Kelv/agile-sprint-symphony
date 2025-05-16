
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const FlowingText = ({
  text,
  className = "",
  size = "medium",
  color = "text-white"
}) => {
  const containerRef = useRef(null);
  
  // Size mapping
  const sizeClasses = {
    small: "text-xl md:text-2xl",
    medium: "text-2xl md:text-4xl",
    large: "text-3xl md:text-6xl",
  };
  
  const fontSizeClass = sizeClasses[size];

  // Split text into characters for animation
  const characters = text.split("");
  
  // Bubble animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3
      }
    }
  };
  
  const bubbleVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.8
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
        delay: i * 0.04,
        repeat: Infinity,
        repeatType: "reverse",
        repeatDelay: 10 + i * 0.5
      }
    })
  };
  
  // Create animated bubbles effect in the background
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Clean up any existing bubbles
    const existingBubbles = container.querySelectorAll('.animated-bubble');
    existingBubbles.forEach(bubble => bubble.remove());
    
    // Create new bubbles
    const numBubbles = 15;
    for (let i = 0; i < numBubbles; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'animated-bubble absolute rounded-full bg-white/10 backdrop-blur-sm';
      
      // Random properties
      const size = Math.random() * 40 + 10;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      
      // Initial position
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.top = `${Math.random() * 100}%`;
      bubble.style.opacity = `${Math.random() * 0.5 + 0.1}`;
      
      // Animation properties
      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 5;
      
      bubble.style.animation = `
        flow ${duration}s linear ${delay}s infinite alternate,
        sway ${duration * 0.5}s ease-in-out ${delay}s infinite alternate
      `;
      
      container.appendChild(bubble);
    }
    
    // Add animation keyframes if they don't exist
    if (!document.getElementById('bubble-keyframes')) {
      const style = document.createElement('style');
      style.id = 'bubble-keyframes';
      style.textContent = `
        @keyframes flow {
          0% { transform: translateY(100%); opacity: 0.1; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-100%); opacity: 0.1; }
        }
        @keyframes sway {
          0% { transform: translateX(-20px); }
          100% { transform: translateX(20px); }
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      // Clean up
      const bubbles = container.querySelectorAll('.animated-bubble');
      bubbles.forEach(bubble => bubble.remove());
    };
  }, [text]);
  
  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ perspective: '1000px', zIndex: 30 }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`relative z-30 font-bold tracking-tight ${fontSizeClass} ${color} flex`}
      >
        {characters.map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            custom={index}
            variants={bubbleVariants}
            className="inline-block"
            style={{ 
              textShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
              transform: 'translateZ(0)'
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

export default FlowingText;
