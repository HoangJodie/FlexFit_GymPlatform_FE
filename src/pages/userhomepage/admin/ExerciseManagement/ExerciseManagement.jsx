import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

const BASE_URL = 'http://localhost:3000';

// Định nghĩa các giá trị cố định
const BODY_PARTS = [
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

const EQUIPMENT = [
  "body weight",
  "cable",
  "dumbbell",
  "barbell",
  "kettlebell",
  "leverage machine",
  "resistance band",
  "medicine ball",
  "stability ball",
  "smith machine"
];

const TARGET_MUSCLES = [
  "abs",
  "biceps",
  "calves",
  "delts",
  "forearms",
  "glutes",
  "hamstrings",
  "lats",
  "pectorals",
  "quads",
  "triceps",
  "traps"
];

const ExerciseManagement = () => {
  const [exercises, setExercises] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allExercises, setAllExercises] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    bodyPart: '',
    equipment: '',
    target: '',
    gifFile: null,
    instructions: [''],
    secondaryMuscles: []
  });

  // Fetch data
  useEffect(() => {
    fetchExercises();
  }, [currentPage]);

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${BASE_URL}/exercises`);
      
      // Lưu toàn bộ dữ liệu
      setAllExercises(response.data);
      
      // Tính toán số trang
      const limit = 9;
      const total = Math.ceil(response.data.length / limit);
      setTotalPages(total);

      // Phân trang
      const startIndex = (currentPage - 1) * limit;
      const endIndex = startIndex + limit;
      setExercises(response.data.slice(startIndex, endIndex));

    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast.error('Error loading exercises');
      setExercises([]);
      setAllExercises([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      gifFile: e.target.files[0]
    }));
  };

  const handleInstructionChange = (index, value) => {
    setFormData(prev => {
      const newInstructions = Array.isArray(prev.instructions) 
        ? [...prev.instructions] 
        : [];
      
      // Nếu instruction là object, chuyển đổi thành string
      if (typeof newInstructions[index] === 'object') {
        newInstructions[index] = value;
      } else {
        newInstructions[index] = value;
      }
      
      return {
        ...prev,
        instructions: newInstructions
      };
    });
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index) => {
    const newInstructions = formData.instructions.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      instructions: newInstructions
    }));
  };

  const handleSecondaryMusclesChange = (selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      secondaryMuscles: selectedOptions
    }));
  };

  // CRUD Operations
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.name || !formData.bodyPart || !formData.equipment || !formData.target) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate file for new exercise
      if (!selectedExercise && !formData.gifFile) {
        toast.error('Please select a GIF file for new exercise');
        return;
      }

      // Chuẩn bị dữ liệu
      const exerciseData = {
        name: formData.name.trim(),
        body_part: formData.bodyPart.trim(),
        equipment: formData.equipment.trim(),
        target: formData.target.trim()
      };

      // Thêm instructions nếu có
      if (formData.instructions?.length > 0) {
        const validInstructions = formData.instructions
          .filter(inst => inst && typeof inst === 'string' && inst.trim())
          .map(inst => inst.trim());

        if (validInstructions.length > 0) {
          exerciseData.instructions = validInstructions;
        }
      }

      // Thêm secondaryMuscles nếu có
      if (formData.secondaryMuscles?.length > 0) {
        exerciseData.secondaryMuscles = formData.secondaryMuscles;
      }

      let response;
      const formDataToSend = new FormData();

      if (selectedExercise) {
        // Update existing exercise
        formDataToSend.append('data', JSON.stringify(exerciseData));
        
        if (formData.gifFile) {
          formDataToSend.append('file', formData.gifFile);
        }

        response = await axios.patch(
          `${BASE_URL}/exercises/${selectedExercise.post_id}`,
          formDataToSend,
          {
            headers: { 
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // Create new exercise
        if (!formData.gifFile) {
          throw new Error('GIF file is required for new exercise');
        }

        formDataToSend.append('file', formData.gifFile);
        
        // Append each field separately for create
        Object.entries(exerciseData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              formDataToSend.append(`${key}[${index}]`, item);
            });
          } else {
            formDataToSend.append(key, value);
          }
        });

        response = await axios.post(
          `${BASE_URL}/exercises`,
          formDataToSend,
          {
            headers: { 
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      console.log('Response:', response.data);
      toast.success(selectedExercise ? 'Exercise updated successfully' : 'Exercise added successfully');
      setIsModalOpen(false);
      fetchExercises();
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Có lỗi xảy ra khi lưu bài tập';
      
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        await axios.delete(`${BASE_URL}/exercises/${id}`);
        toast.success('Exercise deleted successfully');
        fetchExercises();
      } catch (error) {
        console.error('Error deleting exercise:', error);
        toast.error('Error occurred while deleting exercise');
      }
    }
  };

  const handleEdit = (exercise) => {
    console.log('Exercise to edit:', exercise);

    const exerciseToEdit = {
      post_id: exercise.id,
      name: exercise.name,
      body_part: exercise.body_part || exercise.bodyPart,
      equipment: exercise.equipment,
      target: exercise.target,
      gif_url: exercise.gif_url || exercise.gifUrl,
      instructions: Array.isArray(exercise.instructions) 
        ? exercise.instructions.map(inst => {
            if (typeof inst === 'object') {
              return Object.values(inst)[0];
            }
            return inst;
          })
        : [],
      secondaryMuscles: exercise.secondaryMuscles || []
    };

    console.log('Processed exercise for edit:', exerciseToEdit);

    setSelectedExercise(exerciseToEdit);
    setFormData({
      name: exerciseToEdit.name,
      bodyPart: exerciseToEdit.body_part,
      equipment: exerciseToEdit.equipment,
      target: exerciseToEdit.target,
      gifFile: null,
      instructions: exerciseToEdit.instructions,
      secondaryMuscles: exerciseToEdit.secondaryMuscles
    });

    setIsModalOpen(true);
  };

  // Thêm useEffect để xử lý phân trang khi currentPage thay đổi
  useEffect(() => {
    if (allExercises.length > 0) {
      const limit = 9;
      const startIndex = (currentPage - 1) * limit;
      const endIndex = startIndex + limit;
      setExercises(allExercises.slice(startIndex, endIndex));
    }
  }, [currentPage, allExercises]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exercise Management</h1>
        <button
          onClick={() => {
            setSelectedExercise(null);
            setFormData({
              name: '',
              bodyPart: '',
              equipment: '',
              target: '',
              gifFile: null,
              instructions: [''],
              secondaryMuscles: []
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Exercise
        </button>
      </div>

      {/* Exercise List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exercises && exercises.map(exercise => (
            <div key={exercise.id} className="border rounded-lg p-4 shadow">
              {/* Debug info */}
              
              
              <div className="aspect-w-1 aspect-h-1 mb-4">
                <img
                  src={exercise.gif_url || exercise.gifUrl}
                  alt={exercise.name}
                  className="object-cover rounded w-full h-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'placeholder-image-url.jpg';
                  }}
                />
              </div>
              <h3 className="font-bold text-lg mb-2">{exercise.name}</h3>
              <p className="text-gray-600 mb-1">Body Part: {exercise.body_part || exercise.bodyPart}</p>
              <p className="text-gray-600 mb-1">Equipment: {exercise.equipment}</p>
              <p className="text-gray-600 mb-4">Target: {exercise.target}</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(exercise)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(exercise.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {exercises.length === 0 && !isLoading && (
        <div className="col-span-3 text-center py-8 text-gray-500">
          No exercises found
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded ${
              currentPage === page
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <h2 className="text-xl font-bold mb-4">
          {selectedExercise ? 'Edit Exercise' : 'Add New Exercise'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Exercise Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1">Body Part</label>
              <select
                name="bodyPart"
                value={formData.bodyPart}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Chọn Body Part</option>
                {BODY_PARTS.map(part => (
                  <option key={part} value={part}>
                    {part}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Equipment</label>
              <select
                name="equipment"
                value={formData.equipment}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Chọn Equipment</option>
                {EQUIPMENT.map(eq => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Target Muscle</label>
              <select
                name="target"
                value={formData.target}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Chọn Target</option>
                {TARGET_MUSCLES.map(target => (
                  <option key={target} value={target}>
                    {target}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1">Secondary Muscles</label>
            <div className="border p-2 rounded min-h-[100px] bg-white">
              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.secondaryMuscles.map((muscle, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    {muscle}
                    <button
                      type="button"
                      onClick={() => {
                        const newMuscles = formData.secondaryMuscles.filter((_, i) => i !== index);
                        setFormData(prev => ({
                          ...prev,
                          secondaryMuscles: newMuscles
                        }));
                      }}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Dropdown for adding new tags */}
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    const muscle = e.target.value;
                    if (!formData.secondaryMuscles.includes(muscle)) {
                      setFormData(prev => ({
                        ...prev,
                        secondaryMuscles: [...prev.secondaryMuscles, muscle]
                      }));
                    }
                    e.target.value = ''; // Reset select
                  }
                }}
                className="w-full border p-2 rounded mt-2"
              >
                <option value="">+ Add secondary muscle</option>
                {TARGET_MUSCLES
                  .filter(muscle => 
                    muscle !== formData.target && 
                    !formData.secondaryMuscles.includes(muscle)
                  )
                  .map(muscle => (
                    <option key={muscle} value={muscle}>
                      {muscle}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1">GIF File</label>
            <input
              type="file"
              accept="image/gif"
              onChange={handleFileChange}
              className="w-full border p-2 rounded"
              required={!selectedExercise}
            />
          </div>

          <div>
            <label className="block mb-1">Instructions</label>
            {Array.isArray(formData.instructions) ? (
              formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={typeof instruction === 'object' ? instruction[index + 1] : instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    className="flex-1 border p-2 rounded"
                    placeholder={`Step ${index + 1}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div>No instructions</div>
            )}
            <button
              type="button"
              onClick={addInstruction}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Add Step
            </button>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {selectedExercise ? 'Update' : 'Add'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExerciseManagement; 