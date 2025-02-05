import React from 'react'
import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <main className='dark:bg-black overflow-hidden'>
        <Outlet />
    </main>
  )
}

export default AuthLayout 