/* eslint-disable */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Usuario } from '../types';
import { Eye, EyeOff, Lock, Mail, Users, GraduationCap, Award, HelpCircle } from 'lucide-react';
import { loginUser } from '../api/usuarios';

export const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const identifier = usernameOrEmail.trim();

    try {
      // Attempt backend authentication
      const result = await loginUser({
        email: identifier,
        password: password,
      });

      // Successful backend login
      login(result.token, result.user);
      setIsLoading(false);
      navigate('/dashboard');
    } catch (err: any) {
      // If it's a validation error or incorrect credentials from active backend, display it
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
        setIsLoading(false);
        return;
      }

      // If backend is offline or network error, fall back to offline mock mode
      console.warn('Backend authentication failed or server offline. Using offline localStorage fallback.', err);

      try {
        setTimeout(() => {
          const lowerIdentifier = identifier.toLowerCase();
          let mockUser: Usuario = {
            id: 'mock-docente-uuid-1',
            nombre: 'Abraham Alva (Docente)',
            email: 'abraham.alva@urp.edu.pe',
            rol: 'docente',
          };

          if (lowerIdentifier === 'admin' || lowerIdentifier === 'admin@urp.edu.pe') {
            mockUser = {
              id: 'mock-admin-uuid-1',
              nombre: 'Administrador General',
              email: 'admin@urp.edu.pe',
              rol: 'administrador' as const,
            };
          } else if (lowerIdentifier === 'auxiliar' || lowerIdentifier === 'auxiliar@urp.edu.pe') {
            mockUser = {
              id: 'mock-aux-uuid-1',
              nombre: 'Coordinador de Escuela (Auxiliar)',
              email: 'auxiliar@urp.edu.pe',
              rol: 'auxiliar' as const,
            };
          } else {
            mockUser = {
              id: 'mock-docente-uuid-1',
              nombre: lowerIdentifier.includes('docente') ? 'Docente de Turno' : 'Abraham Alva (Docente)',
              email: lowerIdentifier.includes('@') ? lowerIdentifier : `${lowerIdentifier}@urp.edu.pe`,
              rol: 'docente' as const,
            };
          }

          const mockToken = 'mock-jwt-token-string-xyz-12345';
          login(mockToken, mockUser);
          setIsLoading(false);
          navigate('/dashboard');
        }, 600);
      } catch (innerErr) {
        setError('Error al iniciar sesión localmente.');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-[#F7F9FC] select-none font-sans">
      
      {/* Left Column: Widescreen Branding Panel */}
      <div className="hidden md:flex md:w-1/2 bg-primary text-white p-12 flex-col justify-between items-center text-center relative overflow-hidden">
        {/* Subtle white geometric pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center overflow-hidden">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                <circle cx="40" cy="40" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Top Brand SRAE Logo */}
        <div className="flex flex-col items-center gap-2 mt-4 z-10">
          <span className="text-4xl bg-white/10 p-3 rounded-xl select-none">🎓</span>
          <h1 className="text-3xl font-black tracking-wider mt-1 font-sans">SRAE</h1>
          <p className="text-[10px] text-blue-200 uppercase tracking-widest font-mono">Evaluación Académica</p>
        </div>

        {/* Central Title */}
        <div className="space-y-4 max-w-md z-10 my-auto">
          <h2 className="text-3xl font-bold leading-tight font-sans">
            Sistema de Rúbricas Analíticas para Evaluación Académica
          </h2>
          <div className="h-1 w-20 bg-accent rounded mx-auto" />
          <p className="text-base text-blue-150 leading-relaxed font-sans pt-2">
            Una plataforma integrada para docentes universitarios. Diseña rúbricas institucionales, evalúa estudiantes en tiempo real y analiza resultados de manera consistente y transparente.
          </p>
        </div>

        {/* Bottom Statistics */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-lg border-t border-white/10 pt-6 mt-4 z-10">
          <div className="flex flex-col items-center gap-1.5">
            <Users size={20} className="text-accent" />
            <span className="text-sm font-bold text-white leading-none">12+</span>
            <span className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Docentes activos</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 border-x border-white/10 px-2">
            <GraduationCap size={20} className="text-accent" />
            <span className="text-sm font-bold text-white leading-none">200+</span>
            <span className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Evaluaciones</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Award size={20} className="text-accent" />
            <span className="text-sm font-bold text-white leading-none">2026</span>
            <span className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">URP 2026</span>
          </div>
        </div>
      </div>

      {/* Right Column: Authentication Panel */}
      <div className="w-full md:w-1/2 bg-[#F7F9FC] flex flex-col justify-between items-center p-8 sm:p-12 relative overflow-y-auto">
        
        {/* Top welcome logo */}
        <div className="flex flex-col items-center gap-1.5 mt-4 select-none">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎓</span>
            <span className="text-xl font-black text-secondary tracking-wide">SRAE</span>
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Bienvenido de vuelta</p>
        </div>

        {/* Login Form Card */}
        <div className="max-w-md w-full bg-surface rounded-lg shadow-xl border border-borderLight p-10 select-none my-auto">
          
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-secondary font-sans tracking-tight">Iniciar Sesión</h2>
            <p className="text-xs text-slate-400 mt-1">Ingresa tus credenciales para acceder al panel de control.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username or Email Field */}
            <div>
              <label htmlFor="identifier" className="block text-xs font-bold text-secondary/70 uppercase tracking-wider mb-2">
                Usuario o Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  id="identifier"
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="docente o ejemplo@urp.edu.pe"
                  className="w-full pl-10 pr-4 h-12 border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 bg-white border-2 font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-secondary/70 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 h-12 border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 bg-white border-2 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-250 text-danger rounded-sm text-xs font-medium animate-fade-in flex items-center gap-1">
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button with Gradient */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-md shadow-sm transition-all duration-150 flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-4 uppercase tracking-wider cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-block animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          {/* Help notice below form */}
          <div className="text-center mt-5">
            <p className="text-xs text-slate-400 font-semibold flex items-center justify-center gap-1 hover:text-primary transition-colors cursor-pointer select-none">
              <HelpCircle size={14} />
              ¿Problemas para acceder? Contacta al administrador
            </p>
          </div>

        </div>

        {/* Copyright at the bottom of the panel */}
        <div className="pb-4 mt-6 text-center select-none">
          <p className="text-[10px] text-slate-450 font-semibold tracking-widest uppercase">
            © 2026 SRAE URP. Todos los derechos reservados.
          </p>
        </div>

      </div>

    </div>
  );
};

export default Login;
