import React, { useState, useEffect } from 'react';
import Card from './Card'; 

const PopularClass = () => {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/classes.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    

    fetchData();
  }, []);

  return (
    <div className='md:w-[80%] mx-auto my-36'>
      <div>
        <h1 className='text-5xl font-bold text-center'>Our <span className='text-secondary'>Popular</span> Classes</h1>
        <div className="w-[40%] text-center mx-auto my-4">
          <p className='text-gray-500 italic'>Explore our popular classes, based on how many students enrolled</p>
        </div>
      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {/* slide(0, 7): hien 7 item */}
        {classes.slice(0,7).map((item, index) => <Card key={index} item={item} />)}
      </div>
    </div>
  );
}

export default PopularClass;
