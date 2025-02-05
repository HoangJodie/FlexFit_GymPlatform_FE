import React, { useState } from 'react'
import BannerContainer from './banner/BannerContainer'


import {Box, Stack, Typography} from '@mui/material'


import BannerClasses from './gallary/BannerClasses'
import BannerPT from './gallary/BannerPT'
import BannerMBShip from './gallary/BannerMBShip'





const Home = () => {

  const [exercises, setExercises] = useState([])
  const [bodyPart, setBodyPart] = useState('all')
  return (
    <div>
      <BannerContainer />
      <div className="max-w-[100%] mx-auto">
        <BannerClasses />

        <BannerPT />
        
        <BannerMBShip />
        
      </div>
    </div>
  )
}

export default Home