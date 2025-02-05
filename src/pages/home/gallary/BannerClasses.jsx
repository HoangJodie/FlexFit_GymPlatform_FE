import React from 'react'
import { useNavigate } from 'react-router-dom'

const BannerClasses = () => {
    const navigate = useNavigate()
    
    const handleViewClass = () => {
        navigate('/classes')
    }

  return (
    <div className='flex gap-4'>
        <div className="max-w-[30%] mt-5 ml-5">
            <h1 className='font-extrabold text-4xl text-secondary text-justify'>WE ARE FLEXFIT ONLINE</h1>
            <p className='font-thin italic text-justify'> 
                Flexfit Online is built to bring happiness and create fulfilling moments in your life by providing comprehensive physical health, 
                nutrition and mental wellness services.
            </p>
        </div>

        <div className="flex gap-2 mt-5 max-w-[70%]">
            <div className="w-[40%] mx-auto">
                <img src="./ori-yoga.webp" alt="" />
                <h1 className='font-bold text-2xl mt-2'>ORIGINAL YOGA CLASS</h1>
                <p className='text-justify font-thin'>Practice authentic Yoga under the guidance of Indian Yoga masters. 
                    Achieve perfect balance by building strength, 
                    flexibility and body grace while completely relaxing all senses and freeing the mind
                </p>
                <h1 onClick={handleViewClass} className='cursor-pointer text-secondary font-bold mt-2'>Learn More</h1>
            </div>
            <div className="w-[40%] mx-auto mt-[10%]">
                <img src="./PT_FAQ.jpg" alt="" />
                <h1 className='font-bold text-2xl mt-2'>IMPROVE YOUR OWN BODY</h1>
                <p className='text-justify font-thin'>Practice authentic Yoga under the guidance of Indian Yoga masters. 
                    Achieve perfect balance by building strength, 
                    flexibility and body grace while completely relaxing all senses and freeing the mind
                </p>
                <h1 onClick={handleViewClass} className='cursor-pointer text-secondary font-bold mt-2'>Learn More</h1>
            </div>
        </div>
    </div>
  )
}

export default BannerClasses