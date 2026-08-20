import { useEffect, useState, useCallback } from 'react';

const ClickSpark = () => {
  const [sparks, setSparks] = useState([]);

  const handleClick = useCallback((e) => {
    const id = Date.now();
    setSparks((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
    
    // Remove the spark after animation finishes
    setTimeout(() => {
      setSparks((prev) => prev.filter(spark => spark.id !== id));
    }, 600);
  }, []);

  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [handleClick]);

  return (
    <>
      {sparks.map((spark) => (
        <SparkElement key={spark.id} x={spark.x} y={spark.y} />
      ))}
    </>
  );
};

const SparkElement = ({ x, y }) => {
  return (
    <div 
      className="fixed pointer-events-none z-[9999] flex items-center justify-center"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 bg-indigo-500 rounded-full animate-spark"
          style={{
            transformOrigin: 'center',
            '--angle': `${i * 45}deg`,
          }}
        />
      ))}
    </div>
  );
};

export default ClickSpark;
