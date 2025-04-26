import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  rotation: number;
  rotationSpeed: number;
}

const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match its parent
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle colors - purple theme
    const colors = [
      '#F0ABFC', // purple-300
      '#E879F9', // purple-400
      '#D946EF', // purple-500
      '#C026D3', // purple-600
      '#A855F7', // purple-500
      '#8B5CF6', // violet-500
      '#FFFFFF'  // white
    ];
    
    // Create confetti particles
    const particles: Particle[] = [];
    const particleCount = 60;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width * Math.random(),
        y: canvas.height * (Math.random() * 0.5), // Start in the top half
        size: Math.random() * 8 + 4, // Size between 4-12
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity: {
          x: (Math.random() - 0.5) * 8,
          y: Math.random() * 3 + 1
        },
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2
      });
    }
    
    // Animation loop
    let animationFrameId: number;
    let startTime = Date.now();
    const duration = 2500; // 2.5 seconds
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (const particle of particles) {
        // Update position
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        
        // Add gravity
        particle.velocity.y += 0.1;
        
        // Add rotation
        particle.rotation += particle.rotationSpeed;
        
        // Draw particle
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = 1 - progress; // Fade out as animation progresses
        ctx.fillRect(
          -particle.size / 2,
          -particle.size / 2,
          particle.size,
          particle.size
        );
        ctx.restore();
      }
      
      // Continue animation if not complete
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

export default Confetti;