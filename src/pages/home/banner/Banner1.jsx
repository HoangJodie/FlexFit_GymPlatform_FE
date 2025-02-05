import React from 'react'
import { useNavigate } from 'react-router-dom'

const Banner1 = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token') // Kiểm tra token từ localStorage

  const handleJoinToday = () => {
    if (!token) {
      navigate('/login')
    }
  }

  const handleViewCourse = () => {
    navigate('/classes')
  }

  return (
    <div className='h-[90vh] bg-cover' style={{backgroundImage: `url(./src/assets/home/banner-1.jpg)`}}>
        <div className="min-h-screen flex justify-start items-center pl-11 text-white bg-black bg-opacity-60">
            <div className="">
              <div className="space-y-4">
                <p className='md:text-3xl text-2xl'>We Provide</p>
                <h1 className='md:text-5xl text-3xl font-bold'>Fitness&Yoga Course Online</h1>
                <div className='md:w-1/2'>
                  <p className='md:text-1xl'>
                    The goal of Flexfit
                    is to make you happy and give you the tools you need to build your physical, 
                    mental, and nutritional well-being.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-5">
                  {!token && ( // Kiểm tra hiển thị nút dựa vào token
                    <button 
                      onClick={handleJoinToday}
                      className='px-7 py-3 rounded-lg bg-secondary font-bold uppercase'
                    >
                      Join Today
                    </button>
                  )}
                  <button 
                    onClick={handleViewCourse}
                    className='px-7 py-3 rounded-lg border hover:bg-secondary font-bold uppercase'
                  >
                    View Course
                  </button>
                </div>
              </div>
            </div>
        </div>
    </div>
  )
}

export default Banner1