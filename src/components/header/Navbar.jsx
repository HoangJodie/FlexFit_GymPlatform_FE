import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Switch } from '@mui/material';
import { FaBars, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const navLinks = [
    { name: 'Home', route: '/' },
    { name: 'Practice', route: '/practice' },
    { name: 'Classes', route: '/classes' },
    { name: 'Instructor', route: '/instructors' },
    { name: 'Membership', route: '/membership' },
];

// theme - MUI theme
const theme = createTheme({
    palette: {
        primary: {
            main: "#ff0000",
        },
        secondary: {
            main: "#00ff00",
        },
    },
});

const Navbar = () => {
    const [navBg, setNavBg] = useState('bg-[#15151580]');
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(false);
    const [isHome, setIsHome] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isFix, setIsFix] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [user, setUser] = useState(!!localStorage.getItem('accessToken')); // Kiểm tra xem token có tồn tại không
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const [userInfo, setUserInfo] = useState(null);

    // event handle
    const toggleMobileMenu = () => {
        setIsMobile(!isMobile);
    };

    useEffect(() => {
        const darkClass = 'dark';
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add(darkClass);
        } else {
            root.classList.remove(darkClass);
        }
    }, [isDarkMode]);

    useEffect(() => {
        setIsHome(location.pathname === '/');
        setIsFix(location.pathname === '/register' || location.pathname === '/login');
    }, [location]);

    // handle scroll page
    useEffect(() => {
        const updateNavBackground = () => {
            if (isFix) {
                setNavBg('bg-white dark:bg-black dark:text-white text-black');
                return;
            }

            if (scrollPosition > 100) {
                setNavBg('bg-white backdrop-blur-lg bg-opacity-90 dark:bg-black dark:bg-opacity-90 dark:text-white text-black');
            } else {
                if (isHome) {
                    setNavBg('bg-transparent text-white');
                } else {
                    setNavBg('bg-white dark:bg-black dark:text-white text-black');
                }
            }
        };

        updateNavBackground();
    }, [scrollPosition, isHome, isFix]);

    const handleLogout = async () => {
        console.log('Bắt đầu xử lý logout');
        try {
            await axios.post('http://localhost:3000/auth/logout', {}, { withCredentials: true });
            console.log('API logout thành công');
            
            localStorage.removeItem('accessToken');
            console.log('Đã xóa accessToken');
            
            setUser(null);
            console.log('Đã cập nhật state user');
            
            navigate('/login');
            console.log('Đã chuyển hướng về trang login');
        } catch (error) {
            console.error('Lỗi trong quá trình logout:', error);
        }
    };
    
      

    // handle scroll
    useEffect(() => {
        const handleScroll = () => {
            const currentPosition = window.pageYOffset;
            setScrollPosition(currentPosition);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                console.log('Click outside menu detected');
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMenuItemClick = async (action) => {
        console.log('handleMenuItemClick được gọi với action:', action);
        if (action === 'logout') {
            await handleLogout();
        }
        setShowMenu(false);
        console.log('Đã đóng menu');
    };

    // Thêm hàm xử lý riêng cho việc chuyển trang
    const handleNavigateToProfile = () => {
        scrollToTop();
        navigate('/userhomepage');
        setShowMenu(false);
    };

    useEffect(() => {
        console.log('Menu state changed:', showMenu);
    }, [showMenu]);

    useEffect(() => {
        console.log('User state:', user);
    }, [user]);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (user) {  // Chỉ fetch khi đã đăng nhập
                try {
                    const accessToken = localStorage.getItem('accessToken');
                    const response = await axios.get('http://localhost:3000/user/profile', {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        },
                        withCredentials: true
                    });
                    setUserInfo(response.data);
                    console.log('Thông tin user đã được lấy:', response.data);
                } catch (error) {
                    console.error('Lỗi khi lấy thông tin user:', error);
                    if (error.response) {
                        switch (error.response.status) {
                            case 401:
                                console.log('Token không hợp lệ hoặc hết hạn');
                                localStorage.removeItem('accessToken');
                                setUser(null);
                                navigate('/login');
                                break;
                            case 404:
                                console.log('Không tìm thấy endpoint hoặc user');
                                break;
                            default:
                                console.log('Lỗi server:', error.response.status);
                        }
                    } else if (error.request) {
                        console.log('Không nhận được response từ server');
                    } else {
                        console.log('Lỗi khi gửi request:', error.message);
                    }
                }
            }
        };

        fetchUserInfo();
    }, [user, navigate]);

    // Hàm lấy chữ cái đầu của tên user
    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    // Thêm hàm scrollToTop
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`${navBg} ${isFix ? 'static' : 'fixed'} top-0 transition-colors duration-300 ease-in-out w-full z-10`}
        >
            <div className="lg:w-[95%] mx-auto sm:px-6 lg:px-6">
                <div className="px-4 py-4 flex items-center justify-between">
                    {/* logo */}
                    <div onClick={() => navigate('/')} className='flex-shrink-0 cursor-pointer pl-7 md:p-0 flex items-center'>
                        <div>
                            <h1 className='text-2xl inline-flex gap-3 items-center font-bold'>
                                FlexFit Online
                                <img src='./public/yoga-logo.png' alt='logo' className='w-8 h-8' />
                            </h1>
                            <p className='font-bold text-[13px] tracking-[8px]'>Quick Explore</p>
                        </div>
                    </div>

                    {/* mobile menu */}
                    <div className="md:hidden flex items-center">
                        <button onClick={toggleMobileMenu} className='text-gray-300 hover:text-white focus:outline-none'>
                            <FaBars className='h-6 w-6 hover:text-primary' />
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="hidden md:block text-black dark:text-white">
                        <div className="flex">
                            <ul className='ml-10 flex items-center space-x-4 pr-4'>
                                {navLinks.map((link) => (
                                    <li key={link.route}>
                                        <NavLink
                                            to={link.route}
                                            onClick={scrollToTop}
                                            style={{ whiteSpace: 'nowrap' }}
                                            className={({ isActive }) =>
                                                `font-[800] ${isActive ? 'text-secondary' : `${navBg.includes('bg-transparent') ? 'text-white' : 'text-black dark:text-white'}`} hover:text-secondary duration-30`}
                                        >{link.name}
                                        </NavLink>
                                    </li>
                                ))}

                                {/* user */}
                                {
                                    user ? (
                                        <li className="flex items-center relative" ref={menuRef}>
                                            <div className="relative">
                                                {userInfo?.imgurl ? (
                                                    <img 
                                                        src={userInfo.imgurl} 
                                                        alt='avatar' 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            console.log('Avatar được click, showMenu hiện tại:', !showMenu);
                                                            setShowMenu(!showMenu);
                                                        }}
                                                        className='h-[40px] w-[40px] rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity'
                                                    />
                                                ) : (
                                                    <div 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            console.log('Avatar được click, showMenu hiện tại:', !showMenu);
                                                            setShowMenu(!showMenu);
                                                        }}
                                                        className='h-[40px] w-[40px] rounded-full cursor-pointer hover:opacity-80 transition-opacity bg-secondary flex items-center justify-center text-white font-bold'
                                                    >
                                                        {getInitial(userInfo?.name)}
                                                    </div>
                                                )}
                                                
                                                {showMenu && (
                                                    <motion.div 
                                                        onClick={(e) => e.stopPropagation()}
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border dark:border-gray-700"
                                                    >
                                                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                                                Xin chào, {userInfo?.name || 'User'}!
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                {userInfo?.email || 'Loading...'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                SĐT: {userInfo?.phoneNum || 'Chưa cập nhật'}
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="py-1">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    console.log('Nút Trang cá nhân được click');
                                                                    handleNavigateToProfile();
                                                                }}
                                                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                                                            >
                                                                <FaUser className="w-4 h-4 mr-3 text-gray-400" />
                                                                <span>Profile</span>
                                                            </button>
                                                            
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    scrollToTop();
                                                                    setShowMenu(false);
                                                                    navigate('/membership/history');
                                                                }}
                                                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                                                            >
                                                                <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                </svg>
                                                                <span>Membership History</span>
                                                            </button>
                                                            
                                                            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        console.log('Nút Sign Out được click');
                                                                        handleMenuItemClick('logout');
                                                                    }}
                                                                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                                                                >
                                                                    <FaSignOutAlt className="w-4 h-4 mr-3" />
                                                                    <span>Sign Out</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </li>
                                    ) : (
                                        <>
                                            <li>
                                                <NavLink
                                                    to='/auth/login'
                                                    onClick={scrollToTop}
                                                    className={({ isActive }) =>
                                                        `font-bold ${isActive ? 'text-secondary' : `${navBg.includes('bg-transparent') ? 'text-white' : 'text-black dark:text-white'}`} hover:text-secondary duration-30`}
                                                >Login
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink
                                                    to='/auth/register'
                                                    onClick={scrollToTop}
                                                    className={({ isActive }) =>
                                                        `font-bold ${isActive ? 'text-secondary' : `${navBg.includes('bg-transparent') ? 'text-white' : 'text-black dark:text-white'}`} hover:text-secondary duration-30`}
                                                >Get Started
                                                </NavLink>
                                            </li>
                                        </>
                                    )
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
