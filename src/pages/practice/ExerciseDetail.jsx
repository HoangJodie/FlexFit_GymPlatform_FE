import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExerciseDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/exercises/${id}`);
        setExercise(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchExerciseDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
        <button
          onClick={() => navigate('/practice')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Exercises
        </button>
      </div>
    );
  }

  if (!exercise) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-6"
      >
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left side - Image */}
            <div className="md:w-1/2">
              <div className="sticky top-20 p-6">
                <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                  <img
                    src={exercise.gif_url || exercise.gifUrl}
                    alt={exercise.name}
                    className="object-contain w-full h-full"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-4">
                  {exercise.name.charAt(0).toUpperCase() + exercise.name.slice(1)}
                </h1>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-700">Body Part</h2>
                    <p className="text-sm text-gray-600 capitalize">{exercise.body_part || exercise.bodyPart}</p>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-700">Equipment</h2>
                    <p className="text-sm text-gray-600 capitalize">{exercise.equipment}</p>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-700">Target Muscle</h2>
                    <p className="text-sm text-gray-600 capitalize">{exercise.target}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Instructions and Details */}
            <div className="md:w-1/2 border-l border-gray-200">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">Secondary Muscles</h2>
                  <div className="flex flex-wrap gap-2">
                    {exercise.secondaryMuscles?.map((muscle, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">Instructions</h2>
                  <ol className="list-decimal list-inside space-y-3">
                    {exercise.instructions && Array.isArray(exercise.instructions) ? (
                      exercise.instructions.map((instruction, index) => (
                        <li key={index} className="text-gray-600 text-sm leading-relaxed pl-2">
                          <span className="text-gray-900 font-medium">Step {index + 1}:</span>{' '}
                          {typeof instruction === 'object' ? Object.values(instruction)[0] : instruction}
                        </li>
                      ))
                    ) : exercise.instructions && typeof exercise.instructions === 'object' ? (
                      Object.entries(exercise.instructions).map(([key, value]) => (
                        <li key={key} className="text-gray-600 text-sm leading-relaxed pl-2">
                          <span className="text-gray-900 font-medium">Step {parseInt(key) + 1}:</span>{' '}
                          {value}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-600">No instructions available</li>
                    )}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExerciseDetail;
