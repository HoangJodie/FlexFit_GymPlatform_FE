import React from 'react';
import { format } from 'date-fns';

const UserClassCard = ({ classItem, isEnded }) => {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className={`relative bg-white rounded-lg shadow-md overflow-hidden 
      ${isEnded ? 'opacity-75' : ''}`}>
      {/* Class Image */}
      {(classItem.image_url || classItem.imageUrl) && (
        <div className="relative h-48">
          <img 
            src={classItem.image_url || classItem.imageUrl} 
            alt={classItem.class_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="text-xl font-bold text-white">{classItem.class_name}</h3>
          </div>
        </div>
      )}

      {/* Class Content */}
      <div className="p-5">
        {/* Show title if no image */}
        {!classItem.image_url && !classItem.imageUrl && (
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800">{classItem.class_name}</h3>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{classItem.class_description}</p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Type:</span>
            <span className="font-medium">{classItem.class_type === 1 ? 'One-on-One' : 'Many'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Fee:</span>
            <span className="font-medium text-green-600">{classItem.fee} VND</span>
          </div>
          <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-gray-500 text-xs uppercase tracking-wider">Start Date</div>
                <div className="font-medium">{formatDate(classItem.start_date)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-500 text-xs uppercase tracking-wider">End Date</div>
                <div className="font-medium">{formatDate(classItem.end_date)}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Max:</span>
            <span className="font-medium">{classItem.maxAttender || classItem.max_attender || 'Unlimited'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Subject:</span>
            <span className="font-medium">
              {classItem.class_subject || classItem.classSubject || 'Not specified'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Status: </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${classItem.status_id === 1 ? 'bg-yellow-100 text-yellow-800' : ''}
              ${classItem.status_id === 2 ? 'bg-green-100 text-green-800' : ''}
              ${classItem.status_id === 3 ? 'bg-red-100 text-red-800' : ''}
            `}>
              {classItem.status_id === 1 && 'Pending'}
              {classItem.status_id === 2 && 'Active'}
              {classItem.status_id === 3 && 'Locked'}
            </span>
          </div>
        </div>
      </div>

      {/* Ended Badge */}
      {isEnded && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
          Ended
        </div>
      )}
    </div>
  );
};

export default UserClassCard; 