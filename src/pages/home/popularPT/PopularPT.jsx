import React, { useState, useEffect } from 'react';



const PopularPT = () => {
  const [pt, setPT] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/personalTrainer.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPT(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    

    fetchData();
  }, []);
  
  return (
    <div className='md:w-[80%] mx-auto my-36'>
      <div>
        <h1 className='text-5xl font-bold text-center'>Our <span className='text-secondary'>Popular</span> Personal Trainers</h1>
        <div className="w-[40%] text-center mx-auto my-4">
          <p className='text-gray-500 italic'>Explore our popular classes, based on how many students enrolled</p>
        </div>
      </div>

      {pt ? <>
        <div className="grid mb-28 md:grid-cols-2 lg:grid-cols-3 w-[90%] gap-4 mx-auto">
          {pt?.slice(0,3).map((item, index) => (
            <div key={index} className="flex dark:text-white hover:-translate-y-2 duration-200 cursor-pointer flex-col shadow-md py-8 px=10 md:px-8 rounded-md">
              <div className="flex-col flex gap-6 md:gap-8">
                <img className='rounded-full border-4 border-gray-300 h-24 w-24 mx-auto' 
                src={item?.item?.photoUrl || './src/assets/home/girl.jpg'}/>

                <div className='flex flex-col text-center'>
                  <p className="font-medium text-lg dark:text-white text-gray-800">{item.instructorName}</p>
                  <p className='text-gray-500 whitespace-nowrap '>Personal Trainer</p>
                  <p className='text-gray-500 whitespace-nowrap mb-4 '>Total Students: {item.totalEnrolled}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </> : <></>}
    </div>
  )
}

export default PopularPT