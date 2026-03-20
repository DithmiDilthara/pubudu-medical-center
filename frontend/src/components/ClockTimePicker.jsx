import React, { useState, useEffect, useRef } from 'react';
import { FiClock, FiCheck, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ClockTimePicker = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('hours'); // 'hours' or 'minutes'
  const [tempTime, setTempTime] = useState(value || '18:00');
  const containerRef = useRef(null);

  // Parse time
  const [h, m] = tempTime.split(':').map(Number);
  const [displayH, setDisplayH] = useState(h > 12 ? h - 12 : h === 0 ? 12 : h);
  const [displayM, setDisplayM] = useState(m);
  const [ampm, setAmpm] = useState(h >= 12 ? 'PM' : 'AM');

  useEffect(() => {
    if (value) {
      const [vh, vm] = value.split(':').map(Number);
      setDisplayH(vh > 12 ? vh - 12 : vh === 0 ? 12 : vh);
      setDisplayM(vm);
      setAmpm(vh >= 12 ? 'PM' : 'AM');
    }
  }, [value]);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (val) => {
    if (mode === 'hours') {
      setDisplayH(val);
      setMode('minutes');
    } else {
      setDisplayM(val);
    }
  };

  const finalizeTime = () => {
    let finalH = displayH;
    if (ampm === 'PM' && displayH < 12) finalH += 12;
    if (ampm === 'AM' && displayH === 12) finalH = 0;
    
    const timeStr = `${String(finalH).padStart(2, '0')}:${String(displayM).padStart(2, '0')}`;
    onChange(timeStr);
    setIsOpen(false);
  };

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const getPosition = (index, total, radius) => {
    const angle = (index / total) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    return {
      x: radius * Math.cos(rad),
      y: radius * Math.sin(rad)
    };
  };

  return (
    <div style={styles.wrapper} ref={containerRef}>
      {label && <label style={styles.label}>{label}</label>}
      <div style={styles.trigger} onClick={handleToggle}>
        <FiClock style={styles.icon} />
        <span style={styles.value}>{value ? `${displayH}:${String(displayM).padStart(2, '0')} ${ampm}` : 'Select Time'}</span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.overlay} 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={styles.pickerModal}
            >
              <div style={styles.modalHeader}>
                <div style={styles.timeDisplay}>
                  <span 
                    style={{ ...styles.displayNum, color: mode === 'hours' ? '#2563eb' : '#64748b' }}
                    onClick={() => setMode('hours')}
                  >
                    {displayH}
                  </span>
                  <span style={styles.displaySeparator}>:</span>
                  <span 
                    style={{ ...styles.displayNum, color: mode === 'minutes' ? '#2563eb' : '#64748b' }}
                    onClick={() => setMode('minutes')}
                  >
                    {String(displayM).padStart(2, '0')}
                  </span>
                </div>
                <div style={styles.ampmToggle}>
                  <button 
                    style={{ ...styles.ampmBtn, ...(ampm === 'AM' ? styles.ampmBtnActive : {}) }}
                    onClick={() => setAmpm('AM')}
                  >AM</button>
                  <button 
                    style={{ ...styles.ampmBtn, ...(ampm === 'PM' ? styles.ampmBtnActive : {}) }}
                    onClick={() => setAmpm('PM')}
                  >PM</button>
                </div>
              </div>

              <div style={styles.clockFace}>
                <div style={styles.clockCenter} />
                <div style={{
                  ...styles.clockHand,
                  transform: `rotate(${((mode === 'hours' ? displayH % 12 : displayM / 5) / 12) * 360}deg)`
                }} />
                
                {(mode === 'hours' ? hours : minutes).map((val, i) => {
                  const pos = getPosition(i, 12, 90);
                  const isSelected = mode === 'hours' ? displayH === val : displayM === val;
                  return (
                    <button
                      key={val}
                      onClick={() => handleSelect(val)}
                      style={{
                        ...styles.clockNum,
                        left: `calc(50% + ${pos.x}px)`,
                        top: `calc(50% + ${pos.y}px)`,
                        backgroundColor: isSelected ? '#2563eb' : 'transparent',
                        color: isSelected ? 'white' : '#1e293b'
                      }}
                    >
                      {val === 0 && mode === 'minutes' ? '00' : val}
                    </button>
                  );
                })}
              </div>

              <div style={styles.modalFooter}>
                <button style={styles.cancelBtn} onClick={() => setIsOpen(false)}>
                  <FiX /> Cancel
                </button>
                <button style={styles.okBtn} onClick={finalizeTime}>
                  <FiCheck /> OK
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  wrapper: { position: 'relative', width: '100%' },
  label: { fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block', marginLeft: '4px' },
  trigger: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  icon: { fontSize: '18px', color: '#2563eb' },
  value: { fontSize: '15px', fontWeight: '700', color: '#1e293b', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 1000 },
  pickerModal: { 
    position: 'absolute', 
    top: 'calc(100% + 12px)', 
    left: '0', 
    width: '280px', 
    backgroundColor: 'white', 
    borderRadius: '24px', 
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', 
    zIndex: 1001, 
    padding: '24px', 
    overflow: 'hidden' 
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  timeDisplay: { display: 'flex', alignItems: 'center', gap: '4px' },
  displayNum: { fontSize: '32px', fontWeight: '800', cursor: 'pointer', transition: 'color 0.2s' },
  displaySeparator: { fontSize: '32px', fontWeight: '800', color: '#cbd5e1' },
  ampmToggle: { display: 'flex', flexDirection: 'column', gap: '4px' },
  ampmBtn: { padding: '4px 8px', fontSize: '12px', fontWeight: '800', borderRadius: '6px', border: 'none', backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'pointer' },
  ampmBtnActive: { backgroundColor: '#eff6ff', color: '#2563eb' },
  clockFace: { position: 'relative', width: '230px', height: '230px', backgroundColor: '#f8fafc', borderRadius: '50%', margin: '0 auto', border: '1px solid #f1f5f9' },
  clockCenter: { position: 'absolute', top: '50%', left: '50%', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb', transform: 'translate(-50%, -50%)', zIndex: 2 },
  clockHand: { position: 'absolute', top: '50%', left: '50%', width: '2px', height: '90px', backgroundColor: '#2563eb', transformOrigin: 'bottom center', marginTop: '-90px', marginLeft: '-1px', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  clockNum: { position: 'absolute', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', border: 'none', transform: 'translate(-50%, -50%)', cursor: 'pointer', transition: 'all 0.2s', zIndex: 3 },
  modalFooter: { display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#94a3b8', fontWeight: '700', cursor: 'pointer', fontSize: '14px' },
  okBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#2563eb', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }
};

export default ClockTimePicker;
