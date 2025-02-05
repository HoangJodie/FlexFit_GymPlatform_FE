import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PT1 = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate()

  const handleNavi = () => {
    navigate('/instructors')
  }

  return (
    <div 
      className="relative w-[60%] mx-auto" 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <img 
        className={`w-full transition-opacity duration-300 ${isHovered ? 'opacity-50' : 'opacity-100'}`} 
        src="./pt1.jpg" 
        alt="" 
      />
      {isHovered && (
        <button onClick={handleNavi} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  text-white borde rounded-md w-32 h-12 bg-secondary">
          View more
        </button>
      )}
    </div>
  );
};

export default PT1;
