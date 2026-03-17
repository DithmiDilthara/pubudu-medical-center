import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AppointmentCard from './AppointmentCard';

const AppointmentCarousel = ({ appointments = [], onManageClick, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  // Update items per page based on window width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % appointments.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + appointments.length) % appointments.length);
  };

  const getVisibleAppointments = () => {
    if (appointments.length === 0) return [];
    
    // If we have fewer appointments than cards to show, don't duplicate
    if (appointments.length <= itemsPerPage) {
        return appointments.map(appt => ({ ...appt, uniqueKey: `${appt.appointment_id}` }));
    }

    const visible = [];
    for (let i = 0; i < itemsPerPage; i++) {
        const index = (currentIndex + i) % appointments.length;
        visible.push({ ...appointments[index], uniqueKey: `${appointments[index].appointment_id}-${index}` });
    }
    return visible;
  };

  if (appointments.length === 0) return null;

  const currentVisible = getVisibleAppointments();

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <h2 style={styles.title}>Upcoming Appointments</h2>
        {appointments.length > itemsPerPage && (
          <div style={styles.navControls}>
            <button onClick={prevSlide} style={styles.navBtn}>
              <FiChevronLeft size={20} />
            </button>
            <button onClick={nextSlide} style={styles.navBtn}>
              <FiChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <div style={styles.carouselContainer}>
        <div style={{
            ...styles.cardsWrapper,
            gridTemplateColumns: currentVisible.length < itemsPerPage 
                ? `repeat(${currentVisible.length}, 1fr)` 
                : `repeat(${itemsPerPage}, 1fr)`,
            maxWidth: currentVisible.length < itemsPerPage ? `${currentVisible.length * 360}px` : '100%',
        }}>
          {currentVisible.map((appt) => (
            <AppointmentCard 
              key={appt.uniqueKey} 
              appt={appt} 
              variant="carousel"
              onViewDetails={onManageClick}
              onCancel={onCancel}
            />
          ))}
        </div>
      </div>

      {appointments.length > itemsPerPage && (
        <div style={styles.indicators}>
          {appointments.map((_, index) => (
            <div 
              key={index}
              onClick={() => setCurrentIndex(index)}
              style={{
                ...styles.dot,
                backgroundColor: currentIndex === index ? '#3B82F6' : '#D1D5DB',
                width: currentIndex === index ? '20px' : '8px'
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const styles = {
  section: {
    marginBottom: '40px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    paddingLeft: '4px',
    fontFamily: 'var(--font-accent)',
    letterSpacing: '-0.5px'
  },
  navControls: {
    display: 'flex',
    gap: '8px',
  },
  navBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: '1px solid #E5E7EB',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#374151',
    transition: 'all 0.2s ease',
  },
  carouselContainer: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: '24px',
  },
  cardsWrapper: {
    display: 'grid',
    gap: '20px',
    transition: 'all 0.5s ease',
  },
  indicators: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },
  dot: {
    height: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

export default AppointmentCarousel;
