import React from 'react';

const Details = ({ exerciseDetail }) => { // Nhận exerciseDetail từ props
    if (!exerciseDetail) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="flex p-6 max-w-4xl mx-auto">
            <img 
                src={exerciseDetail.gif_url} 
                alt={exerciseDetail.name} 
                className="w-1/2 h-auto" 
                loading="lazy" 
            />
            <div className="w-1/2 pl-6">
                <h2 className="text-4xl font-bold capitalize mb-4">{exerciseDetail.name}</h2>
                <p className="text-lg text-gray-600 mb-2">
                    <strong>Body Part:</strong> {exerciseDetail.body_part}
                </p>
                <p className="text-lg text-gray-600 mb-2">
                    <strong>Equipment:</strong> {exerciseDetail.equipment}
                </p>
                <p className="text-lg text-gray-600 mb-2">
                    <strong>Target Muscle:</strong> {exerciseDetail.target}
                </p>

                <h3 className="text-2xl font-semibold mt-6 mb-2">Secondary Muscles</h3>
                <div className="flex space-x-2 mb-4">
                    {exerciseDetail.secondaryMuscles.map((muscle, index) => (
                        <span key={index} className="text-lg text-primary bg-gray-200 rounded-full px-3 py-1">
                            {muscle}
                        </span>
                    ))}
                </div>

                <h3 className="text-2xl font-semibold mt-6 mb-2">Instructions</h3>
                <ul className="list-disc pl-5">
                    {exerciseDetail.instructions.map((step, index) => (
                        <li key={index} className="text-lg text-gray-600">
                            {`${Object.keys(step)[0]}: ${Object.values(step)[0]}`}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Details;
