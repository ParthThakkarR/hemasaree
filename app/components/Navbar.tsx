// // 'use client';

// // import React, { useState } from 'react';
// // import Link from 'next/link';
// // import { motion, AnimatePresence } from 'framer-motion';
// // import { useAuth } from '@/app/contexts/AuthContext';
// // import {
// //   ShoppingCart,
// //   User,
// //   Package,
// //   Tag,
// //   LayoutDashboard,
// //   ClipboardList,
// //   LogOut,
// //   LogIn,
// //   ChevronDown,
// //   Search,
// //   X,
// // } from 'lucide-react';

// // export default function Navbar() {
// //   const { user, logout, isLoading } = useAuth();
// //   const [isProfileOpen, setIsProfileOpen] = useState(false);
// //   const [isCartOpen, setIsCartOpen] = useState(false);
// //   const [isMobileOpen, setIsMobileOpen] = useState(false);

// //   // Placeholder for cart count – replace with real state
// //   const cartCount = 3;

// //   // Functions
// //   const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
// //   const closeMobile = () => setIsMobileOpen(false);
// //   const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
// //   const toggleCart = () => setIsCartOpen(!isCartOpen);

// //   return (
// //     <>
// //       {/* Sticky Navbar with Bootstrap – Fixed Horizontal Layout */}
// //       <nav className="fixed top-0 left-0 right-0 z-3 bg-white shadow-sm border-bottom border-mauve-100 py-3 transition-all duration-300" style={{ backdropFilter: 'blur(10px)' }}>
// //         <div className="container-xl"> {/* Constrained width: max 1140px on xl screens */}
// //           <div className="d-flex justify-content-between align-items-center position-relative">
// //             {/* Brand – Serif Elegance */}
// //             <Link href="/" className="d-flex align-items-center text-decoration-none">
// //               <span className="fs-3 fw-bold font-serif text-mauve-600 transition-all duration-300">
// //                 SareeShop
// //               </span>
// //               <small className="ms-2 font-serif text-muted transition-colors duration-300">
// //                 Timeless Weaves
// //               </small>
// //             </Link>

// //             {/* Desktop Search – Central, Constrained */}
// //             <div className="flex-grow-1 mx-4 d-none d-md-block position-relative mx-auto" style={{ maxWidth: '400px' }}> {/* Constrain search width */}
// //               <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
// //               <input
// //                 type="search"
// //                 className="form-control form-control-sm ps-5 rounded-pill border-mauve-200 focus-border-mauve-300 focus-ring-0 shadow-none transition-all duration-200 bg-light"
// //                 placeholder="Search Sarees, Fabrics..."
// //                 style={{ background: 'rgba(255,255,255,0.8)' }}
// //               />
// //             </div>

// //             {/* Desktop Menu – Horizontal with Spacing */}
// //             <ul className="navbar-nav d-none d-md-flex align-items-center mb-0 ms-auto flex-row gap-3"> {/* flex-row explicit + gap-3 for spacing */}
// //               {/* Public Links */}
// //               <li className="nav-item me-0"> {/* Remove extra me on last */}
// //                 <Link href="/" className="nav-link text-muted hover-text-mauve-600 fw-medium transition-all duration-300 position-relative group">
// //                   <Package size={18} className="me-1 group-hover-scale-110 transition-transform duration-200" />
// //                   Home
// //                   <span className="position-absolute bottom-0 start-0 w-0 h-1 bg-mauve-600 group-hover-w-full transition-all duration-300" style={{ transitionProperty: 'width' }}></span>
// //                 </Link>
// //               </li>
// //               <li className="nav-item me-0">
// //                 <Link href="/products" className="nav-link text-muted hover-text-mauve-600 fw-medium transition-all duration-300 position-relative group">
// //                   <Tag size={18} className="me-1 group-hover-scale-110 transition-transform duration-200" />
// //                   Products
// //                   <span className="position-absolute bottom-0 start-0 w-0 h-1 bg-mauve-600 group-hover-w-full transition-all duration-300" style={{ transitionProperty: 'width' }}></span>
// //                 </Link>
// //               </li>
// //               <li className="nav-item me-0">
// //                 <Link href="/categories" className="nav-link text-muted hover-text-mauve-600 fw-medium transition-all duration-300 position-relative group">
// //                   <LayoutDashboard size={18} className="me-1 group-hover-scale-110 transition-transform duration-200" />
// //                   Categories
// //                   <span className="position-absolute bottom-0 start-0 w-0 h-1 bg-mauve-600 group-hover-w-full transition-all duration-300" style={{ transitionProperty: 'width' }}></span>
// //                 </Link>
// //               </li>

// //               {/* Authenticated Links */}
// //               {!isLoading && user ? (
// //                 <>
// //                   {user.isAdmin && (
// //                     <li className="nav-item me-0">
// //                       <Link href="/admin" className="nav-link text-muted hover-text-mauve-600 fw-medium transition-all duration-300 position-relative group">
// //                         <LayoutDashboard size={18} className="me-1 group-hover-scale-110 transition-transform duration-200" />
// //                         Admin
// //                         <span className="position-absolute bottom-0 start-0 w-0 h-1 bg-mauve-600 group-hover-w-full transition-all duration-300" style={{ transitionProperty: 'width' }}></span>
// //                       </Link>
// //                     </li>
// //                   )}
// //                   <li className="nav-item me-0">
// //                     <Link href="/orders" className="nav-link text-muted hover-text-mauve-600 fw-medium transition-all duration-300 position-relative group">
// //                       <ClipboardList size={18} className="me-1 group-hover-scale-110 transition-transform duration-200" />
// //                       Orders
// //                       <span className="position-absolute bottom-0 start-0 w-0 h-1 bg-mauve-600 group-hover-w-full transition-all duration-300" style={{ transitionProperty: 'width' }}></span>
// //                     </Link>
// //                   </li>
// //                   <li className="nav-item position-relative me-0">
// //                     <button
// //                       type="button"
// //                       onClick={toggleCart}
// //                       className="nav-link btn btn-link text-muted hover-text-mauve-600 fw-medium transition-all duration-300 position-relative group p-0"
// //                     >
// //                       <ShoppingCart size={18} className="me-1 group-hover-scale-110 transition-transform duration-200" />
// //                       Cart
// //                       {cartCount > 0 && (
// //                         <span className="position-absolute top-0 end-0 badge rounded-pill bg-mauve-500 text-white fs-2xsmall animate-pulse">
// //                           {cartCount}
// //                         </span>
// //                       )}
// //                       <span className="position-absolute bottom-0 start-0 w-0 h-1 bg-mauve-600 group-hover-w-full transition-all duration-300" style={{ transitionProperty: 'width' }}></span>
// //                     </button>
// //                     {/* Cart Flyout */}
// //                     <AnimatePresence>
// //                       {isCartOpen && (
// //                         <motion.div
// //                           initial={{ opacity: 0, scale: 0.95, y: 10 }}
// //                           animate={{ opacity: 1, scale: 1, y: 0 }}
// //                           exit={{ opacity: 0, scale: 0.95, y: 10 }}
// //                           className="position-absolute end-0 mt-2 card shadow-lg border-mauve-100 z-3" style={{ width: '280px', borderRadius: '12px' }}
// //                         >
// //                           <div className="card-body p-3">
// //                             <h6 className="card-title font-serif text-mauve-700 mb-2">Your Cart</h6>
// //                             <p className="text-muted small mb-3">3 items – ₹1,250</p>
// //                             <button className="btn btn-outline-mauve w-100 rounded-pill transition-all duration-200">
// //                               View Cart
// //                             </button>
// //                           </div>
// //                         </motion.div>
// //                       )}
// //                     </AnimatePresence>
// //                   </li>
// //                   {/* Profile Dropdown */}
// //                   <li className="nav-item dropdown position-relative me-0">
// //                     <button
// //                       type="button"
// //                       onClick={toggleProfile}
// //                       className="nav-link dropdown-toggle btn btn-link text-muted hover-text-mauve-600 fw-medium transition-all duration-300 group p-0 d-flex align-items-center gap-1"
// //                       aria-expanded={isProfileOpen}
// //                     >
// //                       <User size={18} className="group-hover-scale-110 transition-transform duration-200" />
// //                       {user?.firstName || 'Profile'}
// //                       <ChevronDown size={16} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
// //                     </button>
// //                     <AnimatePresence>
// //                       {isProfileOpen && (
// //                         <motion.ul
// //                           initial={{ opacity: 0, y: -10, scale: 0.95 }}
// //                           animate={{ opacity: 1, y: 0, scale: 1 }}
// //                           exit={{ opacity: 0, y: -10, scale: 0.95 }}
// //                           className="dropdown-menu show position-absolute end-0 mt-2 shadow-lg border-mauve-100 rounded-3 z-3" style={{ minWidth: '200px', borderRadius: '12px' }}
// //                         >
// //                           <li>
// //                             <Link href="/profile" className="dropdown-item text-muted hover-bg-mauve-50 hover-text-mauve-600 transition-all duration-200 d-flex align-items-center gap-2 p-2" onClick={() => setIsProfileOpen(false)}>
// //                               <User size={16} />
// //                               My Profile
// //                             </Link>
// //                           </li>
// //                           <li>
// //                             <Link href="/orders" className="dropdown-item text-muted hover-bg-mauve-50 hover-text-mauve-600 transition-all duration-200 d-flex align-items-center gap-2 p-2" onClick={() => setIsProfileOpen(false)}>
// //                               <ClipboardList size={16} />
// //                               My Orders
// //                             </Link>
// //                           </li>
// //                           <li className="dropdown-divider border-mauve-200"></li>
// //                           <li>
// //                             <button
// //                               onClick={() => {
// //                                 logout();
// //                                 setIsProfileOpen(false);
// //                               }}
// //                               className="dropdown-item text-danger hover-bg-mauve-50 transition-all duration-200 d-flex align-items-center gap-2 p-2 w-100 text-start"
// //                             >
// //                               <LogOut size={16} />
// //                               Logout
// //                             </button>
// //                           </li>
// //                         </motion.ul>
// //                       )}
// //                     </AnimatePresence>
// //                   </li>
// //                 </>
// //               ) : (
// //                 !isLoading && (
// //                   <li className="nav-item me-0">
// //                     <Link
// //                       href="/login"
// //                       className="btn btn-outline-mauve rounded-pill px-4 py-2 fw-medium hover-bg-mauve-50 transition-all duration-300 shadow-sm hover-shadow d-flex align-items-center gap-2"
// //                       style={{ borderColor: '#E0BBE4', color: '#E0BBE4' }}
// //                     >
// //                       <LogIn size={16} />
// //                       Login
// //                     </Link>
// //                   </li>
// //                 )
// //               )}
// //             </ul>

// //             {/* Mobile Toggle */}
// //             <button
// //               className="navbar-toggler d-md-none border-0 p-0" type="button"
// //               onClick={toggleMobile}
// //               aria-expanded={isMobileOpen}
// //             >
// //               <span className="navbar-toggler-icon-custom"></span>
// //             </button>
// //           </div>
// //         </div>
// //       </nav>

// //       {/* Mobile Menu – Fixed Vertical Stacking */}
// //       <AnimatePresence>
// //         {isMobileOpen && (
// //           <motion.div
// //             initial={{ opacity: 0 }}
// //             animate={{ opacity: 1 }}
// //             exit={{ opacity: 0 }}
// //             className="position-fixed top-0 end-0 h-100 w-75 bg-white shadow-lg z-4 d-md-none border-start border-mauve-100"
// //             style={{ top: '80px' }}
// //             onClick={(e) => e.stopPropagation()}
// //           >
// //             <div className="p-4 h-100 d-flex flex-column">
// //               {/* Close Button */}
// //               <button className="btn btn-link text-muted ms-auto mb-4" onClick={closeMobile}>
// //                 <X size={24} />
// //               </button>

// //               {/* Mobile Search */}
// //               <div className="mb-4 position-relative">
// //                 <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
// //                 <input
// //                   type="search"
// //                   className="form-control ps-5 rounded-pill border-mauve-200 focus-border-mauve-300 transition-all duration-200"
// //                   placeholder="Search Sarees..."
// //                 />
// //               </div>

// //               <ul className="nav flex-column flex-grow-1 mb-0">
// //                 {/* Public Links – Stacked with Spacing */}
// //                 <li className="nav-item mb-3"> {/* mb-3 for vertical spacing */}
// //                   <Link href="/" className="nav-link text-muted hover-text-mauve-600 fw-medium transition-all duration-200 d-flex align-items-center gap-3 py-3" onClick={closeMobile}>
// //                     <Package size={20} />
// //                     Home
// //                   </Link>
// //                 </li>
// //                 <li className="nav-item mb-3">
// //                   <Link href="/products" className="nav-link text-muted hover-text-mauve-600 fw-medium transition-all duration-200 d-flex align-items-center gap-3 py-3" onClick={closeMobile}>
// //                     <Tag size={20} />
// //                     Products
// //                   </Link>
// //                 </li>
// //                 <li className="nav-item mb-3">
// //                   <Link href="/categories" className="nav-link text-muted hover-text-mauve-600 fw-medium transition-all duration-200 d-flex align-items-center gap-3 py-3" onClick={closeMobile}>
// //                     <LayoutDashboard size={20} />
// //                     Categories
// //                   </Link>
// //                 </li>

// //                 {/* Authenticated */}
// //                 {!isLoading && user ? (
// //                   <>
// //                     {user.isAdmin && (
// //                       <li className="nav-item mb-3">
// //                         <Link href="/admin" className="nav-link text-muted hover-text-mauve-600 fw-medium transition-all duration-200 d-flex align-items-center gap-3 py-3" onClick={closeMobile}>
// //                           <LayoutDashboard size={20} />
// //                           Admin
// //                         </Link>
// //                       </li>
// //                     )}
// //                     <li className="nav-item mb-3">
// //                       <Link href="/orders" className="nav-link text-muted hover-text-mauve-600 fw-medium transition-all duration-200 d-flex align-items-center gap-3 py-3" onClick={closeMobile}>
// //                         <ClipboardList size={20} />
// //                         Orders
// //                       </Link>
// //                     </li>
// //                     <li className="nav-item mb-3">
// //                       <Link href="/cart" className="nav-link text-muted hover-text-mauve-600 fw-medium transition-all duration-200 d-flex align-items-center gap-3 py-3" onClick={closeMobile}>
// //                         <ShoppingCart size={20} />
// //                         Cart
// //                         {cartCount > 0 && (
// //                           <span className="badge bg-mauve-500 text-white rounded-pill ms-2">
// //                             {cartCount}
// //                           </span>
// //                         )}
// //                       </Link>
// //                     </li>
// //                     <li className="dropdown-divider border-mauve-200 mt-4 mb-3"></li>
// //                     <li className="nav-item mb-3">
// //                       <Link href="/profile" className="nav-link text-muted hover-text-mauve-600 fw-medium transition-all duration-200 d-flex align-items-center gap-3 py-3" onClick={closeMobile}>
// //                         <User size={20} />
// //                         My Profile
// //                       </Link>
// //                     </li>
// //                     <li className="nav-item mb-3">
// //                       <Link href="/orders" className="nav-link text-muted hover-text-mauve-600 fw-medium transition-all duration-200 d-flex align-items-center gap-3 py-3" onClick={closeMobile}>
// //                         <ClipboardList size={20} />
// //                         My Orders
// //                       </Link>
// //                     </li>
// //                     <li className="nav-item">
// //                       <button
// //                         onClick={() => {
// //                           logout();
// //                           closeMobile();
// //                         }}
// //                         className="nav-link text-danger hover-text-red-700 fw-medium transition-all duration-200 d-flex align-items-center gap-3 py-3 w-100 text-start"
// //                       >
// //                         <LogOut size={20} />
// //                         Logout
// //                       </button>
// //                     </li>
// //                   </>
// //                 ) : (
// //                   !isLoading && (
// //                     <li className="nav-item mt-4 mb-0">
// //                       <Link
// //                         href="/login"
// //                         className="btn btn-outline-mauve rounded-pill w-100 fw-medium hover-bg-mauve-50 transition-all duration-300 d-flex align-items-center justify-content-center gap-2"
// //                         style={{ borderColor: '#E0BBE4', color: '#E0BBE4' }}
// //                         onClick={closeMobile}
// //                       >
// //                         <LogIn size={16} />
// //                         Login
// //                       </Link>
// //                     </li>
// //                   )
// //                 )}
// //               </ul>
// //             </div>
// //           </motion.div>
// //         )}
// //       </AnimatePresence>

// //       {/* Spacer */}
// //       <div className="h-20"></div>

// //       {/* Custom CSS – Unchanged */}
// //       <style jsx global>{`
// //         :root {
// //           --mauve-100: #F5F3FF;
// //           --mauve-200: #EDE9FE;
// //           --mauve-300: #E0BBE4;
// //           --mauve-500: #C4B5FD;
// //           --mauve-600: #A78BFA;
// //           --mauve-700: #8B5CF6;
// //         }
// //         .border-mauve-100 { border-color: var(--mauve-100) !important; }
// //         .border-mauve-200 { border-color: var(--mauve-200) !important; }
// //         .bg-mauve-50 { background-color: var(--mauve-100) !important; }
// //         .bg-mauve-100 { background-color: var(--mauve-200) !important; }
// //         .text-mauve-600 { color: var(--mauve-600) !important; }
// //         .text-mauve-700 { color: var(--mauve-700) !important; }
// //         .hover-text-mauve-600:hover { color: var(--mauve-600) !important; }
// //         .hover-bg-mauve-50:hover { background-color: var(--mauve-100) !important; }
// //         .group-hover-text-mauve-500:hover { color: var(--mauve-300) !important; }
// //         .group-hover-scale-110:hover { transform: scale(1.1) !important; }
// //         .group-hover-w-full:hover { width: 100% !important; }
// //         .fs-2xsmall { font-size: 0.625rem !important; }
// //         .font-serif { font-family: 'Playfair Display', serif !important; }
// //         .navbar-toggler-icon-custom {
// //           position: relative;
// //           width: 30px;
// //           height: 2px;
// //           background: #6c757d;
// //           border-radius: 1px;
// //         }
// //         .navbar-toggler-icon-custom::before, .navbar-toggler-icon-custom::after {
// //           content: '';
// //           position: absolute;
// //           width: 30px;
// //           height: 2px;
// //           background: #6c757d;
// //           border-radius: 1px;
// //           left: 0;
// //         }
// //         .navbar-toggler-icon-custom::before { top: -8px; }
// //         .navbar-toggler-icon-custom::after { bottom: -8px; }
// //         .btn-outline-mauve { border-color: var(--mauve-300) !important; color: var(--mauve-300) !important; }
// //         .btn-outline-mauve:hover { background-color: var(--mauve-100) !important; }
// //       `}</style>
// //     </>
// //   );
// // }



// 'use client';

// import React, { useState } from 'react';
// import Link from 'next/link'; // Import next/link
// import { useAuth } from '@/app/contexts/AuthContext'; // Import the auth hook
// import {
//   ShoppingCart,
//   User,
//   Menu,
//   X,
//   LogOut,
//   Package,
//   List,
//   Home,
//   LogIn, // Import LogIn icon
// } from 'lucide-react';

// // No props interface needed, as we'll use the context
// // interface NavbarProps { ... }

// export default function Navbar() {
//   // --- Logic from Working Navbar ---
//   const { user, logout, isLoading } = useAuth();
//   // ---

//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   // --- Derive state from auth context instead of props ---
//   const userType = user ? (user.isAdmin ? 'admin' : 'user') : null;

//   // TODO: Replace this with your actual cart logic (e.g., from a useCart context)
//   // Using '3' as a placeholder from your working navbar example.
//   const cartCount = 3;
//   // ---

//   // This logic block is from your Designed Navbar and now works with the auth state
//   const navLinks =
//     userType === 'admin'
//       ? [
//           { label: 'Products', href: '/products', icon: Package },
//           { label: 'Categories', href: '/categories', icon: List },
//           { label: 'Orders', href: '/orders', icon: Package },
//         ]
//       : userType === 'user'
//       ? [
//           { label: 'Products', href: '/products', icon: Package },
//           { label: 'Orders', href: '/orders', icon: Package },
//           {
//             label: 'Cart',
//             href: '/cart',
//             icon: ShoppingCart,
//             badge: cartCount,
//           },
//         ]
//       : []; // Logged-out users will see no links here, only the Login button

//   return (
//     <>
//       {/* Styles from Designed Navbar (unchanged) */}
//       <style jsx global>{`
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

//         * {
//           font-family: 'Inter', sans-serif;
//         }

//         .navbar-custom {
//           background-color: #ffffff;
//           box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//           transition: all 0.3s ease;
//         }

//         .nav-link-custom {
//           color: #1e293b !important;
//           font-weight: 500;
//           transition: all 0.3s ease;
//           position: relative;
//         }

//         .nav-link-custom:hover,
//         .nav-link-custom.active {
//           color: #e76f51 !important;
//         }

//         .nav-link-custom:hover::after {
//           content: '';
//           position: absolute;
//           bottom: 0;
//           left: 50%;
//           transform: translateX(-50%);
//           width: 60%;
//           height: 2px;
//           background-color: #e76f51;
//           transition: all 0.3s ease;
//         }

//         .btn-primary-custom {
//           background-color: #e76f51;
//           color: white;
//           border: none;
//           transition: all 0.3s ease;
//           font-weight: 500;
//         }

//         .btn-primary-custom:hover {
//           background-color: #d45a3f;
//           transform: translateY(-1px);
//         }

//         .dropdown-menu-custom {
//           border: none;
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//           border-radius: 8px;
//           padding: 0.5rem 0;
//           min-width: 180px;
//         }

//         .dropdown-item-custom {
//           color: #1e293b;
//           padding: 0.5rem 1rem;
//           transition: all 0.3s ease;
//           font-size: 0.9rem;
//         }

//         .dropdown-item-custom:hover {
//           background-color: #fdf6f0;
//           color: #e76f51;
//         }

//         .badge-custom {
//           background-color: #f7c6c7;
//           color: #1e293b;
//           font-size: 0.65rem;
//           font-weight: 600;
//           min-width: 18px;
//           height: 18px;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }

//         .logo-text {
//           color: #e76f51;
//           font-weight: 700;
//           font-size: 1.5rem;
//           text-decoration: none;
//           transition: all 0.3s ease;
//         }

//         .logo-text:hover {
//           color: #d45a3f;
//           transform: scale(1.05);
//         }

//         .user-icon-btn {
//           background-color: #fdf6f0;
//           border: 1px solid #fdf6f0;
//           width: 40px;
//           height: 40px;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           transition: all 0.3s ease;
//         }

//         .user-icon-btn:hover {
//           background-color: #f7c6c7;
//           transform: translateY(-1px);
//         }

//         .mobile-menu-bg {
//           background-color: rgba(255, 255, 255, 0.95);
//           backdrop-filter: blur(10px);
//         }
//       `}</style>

//       <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
//         <div className="container-fluid px-4">
//           {/* Logo - Replaced <a> with <Link> */}
//           <Link
//             className="navbar-brand d-flex align-items-center logo-text"
//             href="/"
//           >
//             👗 Hemasaree
//           </Link>

//           {/* Mobile toggle (unchanged) */}
//           <button
//             className="navbar-toggler border-0 p-2"
//             type="button"
//             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//             aria-label="Toggle navigation"
//           >
//             {isMobileMenuOpen ? (
//               <X size={24} color="#1e293b" />
//             ) : (
//               <Menu size={24} color="#1e293b" />
//             )}
//           </button>

//           {/* Desktop Navigation */}
//           <div className="collapse navbar-collapse" id="navbarNav">
//             <ul className="navbar-nav mx-auto">
//               {navLinks.map((link) => {
//                 const Icon = link.icon;
//                 return (
//                   <li key={link.label} className="nav-item mx-2">
//                     {/* Replaced <a> with <Link> */}
//                     <Link
//                       className="nav-link nav-link-custom d-flex align-items-center gap-1"
//                       href={link.href}
//                     >
//                       <Icon size={18} />
//                       {link.label}
//                       {link.badge !== undefined && link.badge > 0 && (
//                         <span className="badge-custom ms-1">{link.badge}</span>
//                       )}
//                     </Link>
//                   </li>
//                 );
//               })}
//             </ul>

//             {/* --- Auth Controls - Desktop (Replaced) --- */}
//             <div className="d-flex align-items-center">
//               {isLoading ? (
//                 // Loading spinner
//                 <div
//                   className="spinner-border text-muted"
//                   role="status"
//                   style={{
//                     width: '1.5rem',
//                     height: '1.5rem',
//                     borderWidth: '0.2em',
//                   }}
//                 >
//                   <span className="visually-hidden">Loading...</span>
//                 </div>
//               ) : user ? (
//                 // User is logged in: Show dropdown
//                 <div className="dropdown">
//                   <button
//                     className="user-icon-btn dropdown-toggle"
//                     type="button"
//                     onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                     aria-expanded={isDropdownOpen}
//                   >
//                     <User size={20} color="#e76f51" />
//                   </button>
//                   <ul
//                     className={`dropdown-menu dropdown-menu-end dropdown-menu-custom ${
//                       isDropdownOpen ? 'show' : ''
//                     }`}
//                     style={{
//                       position: 'absolute',
//                       top: '100%',
//                       right: 0,
//                       marginTop: '0.5rem',
//                       zIndex: 1041, // Ensure it's above the overlay
//                     }}
//                   >
//                     <li>
//                       {/* Replaced <a> with <Link> and onProfile with direct link */}
//                       <Link
//                         className="dropdown-item dropdown-item-custom d-flex align-items-center gap-2"
//                         href="/profile"
//                         onClick={() => setIsDropdownOpen(false)}
//                       >
//                         <User size={16} />
//                         Profile
//                       </Link>
//                     </li>
//                     <li>
//                       {/* Replaced onLogout with logout() from context */}
//                       <button
//                         className="dropdown-item dropdown-item-custom d-flex align-items-center gap-2 text-danger"
//                         onClick={(e) => {
//                           e.preventDefault();
//                           logout(); // Use logout from context
//                           setIsDropdownOpen(false);
//                         }}
//                         style={{
//                           background: 'none',
//                           border: 'none',
//                           width: '100%',
//                           textAlign: 'left',
//                         }}
//                       >
//                         <LogOut size={16} />
//                         Logout
//                       </button>
//                     </li>
//                   </ul>
//                 </div>
//               ) : (
//                 // User is not logged in: Show Login button
//                 <Link
//                   href="/login"
//                   className="btn btn-primary-custom d-flex align-items-center gap-2"
//                 >
//                   <LogIn size={18} />
//                   Login
//                 </Link>
//               )}
//             </div>
//             {/* --- End Auth Controls --- */}
//           </div>
//         </div>

//         {/* --- Mobile Menu (Updated Logic) --- */}
//         {isMobileMenuOpen && (
//           <div
//             className="mobile-menu-bg position-absolute top-100 start-0 end-0 border-top"
//             style={{ zIndex: 1000 }}
//           >
//             <div className="container-fluid px-4 py-3">
//               <ul className="navbar-nav">
//                 {navLinks.map((link) => {
//                   const Icon = link.icon;
//                   return (
//                     <li key={link.label} className="nav-item mb-2">
//                       {/* Replaced <a> with <Link> */}
//                       <Link
//                         className="nav-link nav-link-custom d-flex align-items-center gap-2 py-3"
//                         href={link.href}
//                         onClick={() => setIsMobileMenuOpen(false)}
//                       >
//                         <Icon size={20} />
//                         {link.label}
//                         {link.badge !== undefined && link.badge > 0 && (
//                           <span className="badge-custom ms-auto">
//                             {link.badge}
//                           </span>
//                         )}
//                       </Link>
//                     </li>
//                   );
//                 })}

//                 {/* --- Auth Controls - Mobile (Replaced) --- */}
//                 {isLoading ? (
//                   <li className="nav-item mt-3 pt-3 border-top">
//                     <span className="nav-link nav-link-custom d-flex align-items-center gap-2 py-3 text-muted">
//                       Loading...
//                     </span>
//                   </li>
//                 ) : user ? (
//                   // User is logged in: Show Profile & Logout
//                   <>
//                     <li className="nav-item mt-3 pt-3 border-top">
//                       {/* Replaced <a> with <Link> and onProfile with direct link */}
//                       <Link
//                         className="nav-link nav-link-custom d-flex align-items-center gap-2 py-3"
//                         href="/profile"
//                         onClick={() => setIsMobileMenuOpen(false)}
//                       >
//                         <User size={20} />
//                         Profile
//                       </Link>
//                     </li>
//                     <li className="nav-item">
//                       {/* Replaced onLogout with logout() from context */}
//                       <button
//                         className="nav-link nav-link-custom d-flex align-items-center gap-2 py-3 text-danger w-100 text-start"
//                         onClick={(e) => {
//                           e.preventDefault();
//                           logout(); // Use logout from context
//                           setIsMobileMenuOpen(false);
//                         }}
//                         style={{ background: 'none', border: 'none' }}
//                       >
//                         <LogOut size={20} />
//                         Logout
//                       </button>
//                     </li>
//                   </>
//                 ) : (
//                   // User is not logged in: Show Login link
//                   <li className="nav-item mt-3 pt-3 border-top">
//                     <Link
//                       className="nav-link nav-link-custom d-flex align-items-center gap-2 py-3 btn-primary-custom text-white"
//                       href="/login"
//                       onClick={() => setIsMobileMenuOpen(false)}
//                       style={{ borderRadius: '8px', justifyContent: 'center' }}
//                     >
//                       <LogIn size={20} />
//                       Login
//                     </Link>
//                   </li>
//                 )}
//                 {/* --- End Auth Controls --- */}
//               </ul>
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* Overlay for dropdown outside click (unchanged) */}
//       {isDropdownOpen && (
//         <div
//           className="position-fixed top-0 start-0 end-0 bottom-0"
//           style={{ zIndex: 1040 }}
//           onClick={() => setIsDropdownOpen(false)}
//         />
//       )}
//     </>
//   );
// }\\\\\\\\\\

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // ensure component only renders on client after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // prevent hydration errors

  const isAdmin = user?.isAdmin ?? false;
  const isUser = user && !user.isAdmin;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm py-3 px-4 sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold fs-4 text-uppercase text-primary" href="/">
          Hema Sarees
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            {isUser && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/products">Products</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/cart">Cart</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/orders">Orders</Link>
                </li>
              </>
            )}

            {isAdmin && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/admin/product">Products</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/admin/categories">Categories</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/admin/order">Orders</Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav ms-auto">
            {user ? (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle btn btn-link d-flex align-items-center"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <UserIcon size={20} className="me-1" />
                  {user.firstName}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-item" href="/profile">Profile</Link>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={logout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" href="/login">Login</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
