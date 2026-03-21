import { motion } from "framer-motion";

const StatsCard = ({ title, value, icon: Icon, gradient, shadow, delay = 0, trend = "+12%", trendText = "vs last week", onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      style={{
        background: gradient,
        borderRadius: '24px',
        padding: '24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 10px 25px -5px ${shadow}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '160px',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {/* Decorative Circles */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.05)',
        pointerEvents: 'none'
      }} />

      {/* Top Row: Title and Icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '14px', fontWeight: '500', opacity: 0.8 }}>{title}</span>
        <div style={{
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(8px)',
          padding: '10px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {Icon}
        </div>
      </div>

      {/* Middle: Value */}
      <div style={{ marginTop: '8px' }}>
        <h3 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>{value}</h3>
      </div>

    </motion.div>
  );
};

export default StatsCard;
