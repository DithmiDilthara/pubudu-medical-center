import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiPlus, FiArrowRight } from 'react-icons/fi';
import { FaStethoscope, FaHeartbeat, FaCalendarCheck } from 'react-icons/fa';

const slides = [
  {
    id: 1,
    title: "Book Your Doctor Appointment Online",
    subtitle: "Skip the queue and consult with our world-class medical specialists from the comfort of your home.",
    buttonText: "Book Now",
    buttonLink: "/patient/find-doctor",
    icon: FaStethoscope,
    gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)"
  },
  {
    id: 2,
    title: "New Specialists Have Joined Us",
    subtitle: "Consult top Cardiologists, Neurologists, and Pediatricians now available for online and in-person channeling.",
    buttonText: "View Doctors",
    buttonLink: "/patient/find-doctor",
    icon: FaHeartbeat,
    gradient: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)"
  },
  {
    id: 3,
    title: "24/7 Online Channeling Service",
    subtitle: "No more waiting in line. Access our medical portal any time of the day to schedule your next checkup.",
    buttonText: "Channel Now",
    buttonLink: "/patient/find-doctor",
    icon: FaCalendarCheck,
    gradient: "linear-gradient(135deg, #1E3A8A 0%, #172554 100%)"
  }
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isHovered, nextSlide]);

  return (
    <div 
      style={styles.carouselWrapper}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          style={{
            ...styles.slide,
            background: slide.gradient,
            opacity: currentSlide === index ? 1 : 0,
            transform: currentSlide === index ? 'translateX(0)' : (index < currentSlide ? 'translateX(-100%)' : 'translateX(100%)'),
            visibility: currentSlide === index ? 'visible' : 'hidden'
          }}
        >
          <div style={styles.content}>
            <h1 style={styles.title}>{slide.title}</h1>
            <p style={styles.subtitle}>{slide.subtitle}</p>
            <Link to={slide.buttonLink} style={styles.ctaButton}>
              {slide.buttonText}
            </Link>
          </div>
          
          <div style={styles.iconWrapper}>
            <slide.icon style={styles.decorativeIcon} />
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <div style={{...styles.navArrows, opacity: isHovered ? 1 : 0}}>
        <button onClick={prevSlide} style={styles.arrowBtn}>
          <FiChevronLeft size={24} />
        </button>
        <button onClick={nextSlide} style={styles.arrowBtn}>
          <FiChevronRight size={24} />
        </button>
      </div>

      {/* Indicators */}
      <div style={styles.indicators}>
        {slides.map((_, index) => (
          <div 
            key={index}
            onClick={() => setCurrentSlide(index)}
            style={{
              ...styles.dot,
              backgroundColor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.4)',
              width: currentSlide === index ? '24px' : '8px'
            }}
          />
        ))}
      </div>
    </div>
  );
};

const styles = {
  carouselWrapper: {
    position: 'relative',
    height: '220px',
    borderRadius: '24px',
    overflow: 'hidden',
    marginBottom: '40px',
    boxShadow: '0 20px 40px rgba(0, 50, 150, 0.15)',
  },
  slide: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '0 48px',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  content: {
    zIndex: 2,
    maxWidth: '600px',
  },
  title: {
    color: 'white',
    fontSize: '32px',
    fontWeight: '800',
    marginBottom: '12px',
    letterSpacing: '-0.5px',
    margin: 0,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '16px',
    lineHeight: '1.5',
    marginBottom: '24px',
    maxWidth: '500px',
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'white',
    color: '#1D4ED8',
    padding: '12px 28px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  iconWrapper: {
    position: 'absolute',
    right: '20px',
    bottom: '-20px',
    zIndex: 1,
    opacity: 0.1,
  },
  decorativeIcon: {
    fontSize: '180px',
    color: 'white',
  },
  navArrows: {
    position: 'absolute',
    top: '50%',
    left: '20px',
    right: '20px',
    transform: 'translateY(-50%)',
    display: 'flex',
    justifyContent: 'space-between',
    zIndex: 3,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  },
  arrowBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    pointerEvents: 'auto',
    transition: 'background 0.2s',
  },
  indicators: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
    zIndex: 3,
  },
  dot: {
    height: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  }
};

export default HeroCarousel;
