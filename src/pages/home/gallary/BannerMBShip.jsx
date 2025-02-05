import React from 'react'
import { useNavigate } from 'react-router-dom'

const BannerMBShip = () => {
    const navigation = useNavigate()
    const handleNavi = () => {
        navigation('/membership')
    }
  return (
    <div className='mt-10'>
        <img className='cursor-pointer' onClick={handleNavi} src="./membership.jpg" alt="" />
    </div>
  )
}

export default BannerMBShip