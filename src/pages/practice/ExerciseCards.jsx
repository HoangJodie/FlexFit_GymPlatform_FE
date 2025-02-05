import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ExerciseItem = ({ exercise }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
      onClick={() => navigate(`/exercise/${exercise.id}`)}
    >
      <div className="aspect-w-16 aspect-h-9 overflow-hidden">
        <img
          src={exercise.gif_url || exercise.gifUrl}
          alt={exercise.name}
          className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          {exercise.name.charAt(0).toUpperCase() + exercise.name.slice(1)}
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 w-24">Body Part:</span>
            <span className="text-sm text-gray-700 capitalize">
              {exercise.body_part || exercise.bodyPart}
            </span>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 w-24">Equipment:</span>
            <span className="text-sm text-gray-700 capitalize">
              {exercise.equipment}
            </span>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 w-24">Target:</span>
            <span className="text-sm text-gray-700 capitalize">
              {exercise.target}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExerciseItem;
