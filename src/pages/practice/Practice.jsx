import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import ExerciseItem from './ExerciseCards';
import { FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';

const BODY_PARTS = [
  "all",
  "back",
  "cardio", 
  "chest",
  "lower arms",
  "lower legs",
  "neck",
  "shoulders",
  "upper arms",
  "upper legs",
  "waist"
];

const ExerciseList = () => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 6;

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState('all');

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await axios.get('http://localhost:3000/exercises');
        setExercises(response.data);
        setFilteredExercises(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
    setHasSearched(true);
    setCurrentPage(1);
  };

  // Reset search
  const handleReset = () => {
    setSearchTerm('');
    setSearchQuery('');
    setHasSearched(false);
    setSelectedBodyPart('all');
  };

  // Handle search and filter
  useEffect(() => {
    let result = [...exercises];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(exercise => 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.equipment.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply body part filter
    if (selectedBodyPart !== 'all') {
      result = result.filter(exercise => 
        exercise.body_part === selectedBodyPart ||
        exercise.bodyPart === selectedBodyPart
      );
    }

    setFilteredExercises(result);
  }, [searchQuery, selectedBodyPart, exercises]);

  // Pagination
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
      {/* Search and Filter Section */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-6">
            {/* Search Input with Icon */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search exercises by name, target muscle, or equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Body Part Filter */}
            <div className="md:w-64">
              <select
                value={selectedBodyPart}
                onChange={(e) => setSelectedBodyPart(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all duration-200"
              >
                {BODY_PARTS.map(part => (
                  <option key={part} value={part}>
                    {part.charAt(0).toUpperCase() + part.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </form>

          {/* Results count and reset button */}
          <div className="flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600 font-medium"
            >
              
            </motion.div>
            
            {hasSearched && (searchQuery || selectedBodyPart !== 'all') && (
              <button
                onClick={handleReset}
                className="text-red-600 hover:text-red-800 font-medium flex items-center gap-2"
              >
                <span>Reset Search</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Show "No Results" message with reset button */}
      {hasSearched && filteredExercises.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow max-w-6xl mx-auto px-6 mb-12">
          <div className="text-gray-500 text-xl mb-4">
            No exercises found matching your criteria
          </div>
          <button
            onClick={handleReset}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Back to All Exercises
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      ) : (
        <>
          {/* Exercise Grid */}
          <div className="max-w-6xl mx-auto px-6 mb-12">
            {filteredExercises.length > 0 && (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {currentExercises.map((exercise, index) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ExerciseItem exercise={exercise} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Pagination */}
          {filteredExercises.length > 0 && (
            <div className="flex justify-center pb-12">
              <Pagination
                count={Math.ceil(filteredExercises.length / exercisesPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                className="bg-white rounded-lg shadow-md p-2"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExerciseList;
