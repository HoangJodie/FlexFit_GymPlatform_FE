 import React from 'react'
 
 
 export default function Footer() {
   return (
     <footer className="bg-gray-800 text-white py-8 w-full">
       <div className="container mx-auto px-4 w-full">
         <div className="grid grid-cols-1 md:grid-cols-5 gap-8 w-full">
           <div className=''>
             <h3 className="text-xl font-bold mb-4">About Us</h3>
             <p className="text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
           </div>
           <div>
             <h3 className="text-xl font-bold mb-4">Quick Links</h3>
             <ul className="space-y-2">
               <li><a  className="text-gray-400 hover:text-white">Home</a></li>
               <li><a  className="text-gray-400 hover:text-white">Practices</a></li>
               <li><a  className="text-gray-400 hover:text-white">Classes</a></li>
               <li><a  className="text-gray-400 hover:text-white">Instructor</a></li>
               <li><a  className="text-gray-400 hover:text-white">Membership</a></li>
             </ul>
           </div>
           <div>
             <h3 className="text-xl font-bold mb-4">Contact Info</h3>
             <ul className="text-gray-400 space-y-2">
               <li>123 Street Name</li>
               <li>City, Country</li>
               <li>Phone: (123) 456-7890</li>
               <li>Email: info@example.com</li>
             </ul>
           </div>
           <div>
             <h3 className="text-xl font-bold mb-4">Follow Us</h3>
             <div className="flex space-x-4">
               <a href="#" className="text-gray-400 hover:text-white">
                 <span className="sr-only">Facebook</span>
                 <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                 </svg>
               </a>
               <a href="#" className="text-gray-400 hover:text-white">
                 <span className="sr-only">Twitter</span>
                 <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                 </svg>
               </a>
             </div>
           </div>
           <div className="">
            <h3 className="text-xl font-bold mb-4">Support</h3>
            <h1 className='text-3xl font-extrabold text-secondary'>1900 1000</h1>
            <img className='w-[60%] mt-2' src="./footer-logo.webp" alt="" />
           </div>
         </div>
         <div className="text-center mt-8 pt-8 border-t border-gray-700 w-full">
           <p className="text-gray-400">&copy; 2024 Your Company. All rights reserved ..</p>
         </div>
       </div>
     </footer>

   )
 }