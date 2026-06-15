/* eslint-disable */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ClipboardList, 
  GraduationCap, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  User,
  UserPlus,
  Users
} from 'lucide-react';

export const Navbar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['administrador', 'docente', 'auxiliar'] },
    { name: 'Rúbricas', path: '/rubricas', icon: ClipboardList, roles: ['administrador', 'docente', 'auxiliar'] },
    { name: 'Evaluar Estudiante', path: '/evaluaciones/nueva', icon: GraduationCap, roles: ['administrador', 'docente'] },
    { name: 'Reportes Grupales', path: '/reportes', icon: BarChart3, roles: ['administrador', 'docente', 'auxiliar'] },
    { name: 'Agregar Profesor', path: '/profesores/nuevo', icon: UserPlus, roles: ['administrador'] },
    { name: 'Agregar Alumno', path: '/estudiantes/nuevo', icon: Users, roles: ['administrador', 'docente'] },
  ];

  const userRole = user?.rol || 'docente';
  const visibleMenuItems = menuItems.filter((item) => item.roles.includes(userRole));

  const getActivePageName = () => {
    const matched = visibleMenuItems.find(
      (item) => location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
    );
    return matched ? matched.name : 'Dashboard';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between select-none">
      <div>
        {/* Logo & Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2 text-white font-sans tracking-wide">
            <span className="text-xl text-primary font-black">🎓</span>
            <span className="sm:hidden lg:inline">SRAE</span>
          </h1>
          <button 
            onClick={() => setIsMobileOpen(false)} 
            className="sm:hidden text-slate-400 hover:text-white"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 px-3 space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-150 nav-link-transition ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold nav-link-active'
                    : 'text-slate-450 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="sm:hidden lg:inline">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile / Logout at the bottom */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-650 hover:text-white text-red-500 text-xs font-semibold rounded-md transition-colors duration-150"
          title="Cerrar Sesión"
        >
          <LogOut size={14} />
          <span className="sm:hidden lg:inline">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-bgLight overflow-hidden font-sans">
      
      {/* 1. Left Sidebar - Desktop/Tablet */}
      <aside className="hidden sm:flex flex-col bg-secondary text-white shrink-0 sm:w-16 lg:w-[240px] border-r border-slate-800">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 flex sm:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer content */}
          <aside className="relative z-50 flex flex-col w-[240px] bg-secondary text-white shadow-xl h-full animate-fade-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* 2. Right Content Panel with Header and Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-bgLight">
        
        {/* Header - (Breadcrumb + User) */}
        <header className="bg-white border-b border-borderLight h-16 px-6 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-3">
            {/* Mobile hamburger menu button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="sm:hidden p-1.5 rounded-md hover:bg-slate-100 text-slate-650"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumbs */}
            <nav className="text-xs font-semibold uppercase tracking-wider text-slate-400 select-none">
              <span>SRAE</span>
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-secondary font-bold">{getActivePageName()}</span>
            </nav>
          </div>

          {/* User profile info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block select-none">
              <p className="text-xs font-bold text-slate-800">{user?.nombre || 'Docente de Prueba'}</p>
              <p className="text-[10px] text-slate-450 font-mono tracking-widest uppercase">{user?.rol || 'docente'}</p>
            </div>
            
            {/* User Avatar */}
            <div className="w-9 h-9 rounded-full bg-slate-100 text-primary font-bold flex items-center justify-center text-sm border border-borderLight shadow-sm select-none">
              {user?.nombre ? (
                user.nombre.charAt(0).toUpperCase()
              ) : (
                <User size={16} />
              )}
            </div>
          </div>
        </header>

        {/* Main Content Workspace */}
        <div className="flex-1 overflow-auto p-8">
          <div className="w-full animate-fade-in space-y-8 text-base">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Navbar;
