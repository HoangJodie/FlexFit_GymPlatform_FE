import React from 'react'

import Navbar from '../components/header/Navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../components/footer/Footer'
import FloatingChatButton from '../components/FloatingChatButton'

const Mainlayout = () => {
  return (
    <main className='dark:bg-black overflow-hidden'>
        <Navbar />
        <Outlet />
        <Footer />
        <FloatingChatButton />
    </main>
  )
}

export default Mainlayout