import React from 'react';
import { format } from 'date-fns';

const ClassCard = ({ classItem, onCardClick, actions, isAdmin, isEnded }) => {
  console.log('ClassCard received data:', classItem);
  console.log('Class name:', classItem.class_name);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div 
      className={`relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105 
        ${isEnded ? 'opacity-75' : ''}`}
      onClick={() => onCardClick(classItem)}
    >
      {/* Ảnh lớp học */}
      {(classItem.image_url || classItem.imageUrl) ? (
        <div className="relative h-48">
          <img 
            src={classItem.image_url || classItem.imageUrl} 
            alt={classItem.className || classItem.class_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="text-xl font-bold text-white">{classItem.className || classItem.class_name}</h3>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-100">
          <h3 className="text-xl font-bold text-gray-800">{classItem.className || classItem.class_name}</h3>
        </div>
      )}

      {/* Nội dung chính */}
      <div className="p-5">
        {/* Mô tả */}
        <p className="text-gray-600 text-sm mb-4">{classItem.class_description}</p>

        {/* Thông tin chi tiết */}
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

        {/* Actions */}
        {actions && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {actions}
          </div>
        )}
      </div>

      {isEnded && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
          Ended
        </div>
      )}
    </div>
  );
};

export default ClassCard;