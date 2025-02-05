import React from 'react'
import {Link} from 'react-router-dom'
const Card = ({item, handleSelect}) => {
  const {image,instructorName,price,status,availableSeats, name, totalEnrolled, _id} = item
  console.log(item)
  return (
    <div className='shadow-lg rounded-lg p-3 flex flex-col justify-between border border-secondary overflow-hidden m-4'>
      <img src={image} />
      <div className="p-4">
        <h2 className='text-xl font-semibold mb-2 dark:text-white '>{name}</h2>
        <p className='text-gray-600 mb-2'>Available seats: {availableSeats}</p>
        <p className='text-gray-600 mb-2'>Price: {price}</p>
        <p className='text-gray-600 mb-2'>Total Enrolled: {totalEnrolled}</p>
      </div>
      <Link to={`class/${_id}`} className="text-center mt-2">
        <button className='px-2 w-full py-1 bg-secondary rounded-xl text-white font-bold mt-2' >
          View more!
        </button>
      </Link>
    </div>
  )
}

export default Card