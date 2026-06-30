import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RubricasList from './pages/RubricasList';
import RubricaForm from './pages/RubricaForm';
import Evaluacion from './pages/Evaluacion';
import Reportes from './pages/Reportes';
import AgregarProfesor from './pages/AgregarProfesor';
import AgregarAlumno from './pages/AgregarAlumno';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Root redirection rule */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes wrapped in Sidebar Layout */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={['administrador', 'docente', 'auxiliar']}>
            <Navbar>
              <Dashboard />
            </Navbar>
          </PrivateRoute>
        }
      />
      <Route
        path="/rubricas"
        element={
          <PrivateRoute allowedRoles={['administrador', 'docente', 'auxiliar']}>
            <Navbar>
              <RubricasList />
            </Navbar>
          </PrivateRoute>
        }
      />
      <Route
        path="/rubricas/nueva"
        element={
          <PrivateRoute allowedRoles={['administrador', 'docente']}>
            <Navbar>
              <RubricaForm />
            </Navbar>
          </PrivateRoute>
        }
      />
      <Route
        path="/rubricas/:id/editar"
        element={
          <PrivateRoute allowedRoles={['administrador', 'docente']}>
            <Navbar>
              <RubricaForm />
            </Navbar>
          </PrivateRoute>
        }
      />
      <Route
        path="/evaluaciones/nueva"
        element={
          <PrivateRoute allowedRoles={['administrador', 'docente']}>
            <Navbar>
              <Evaluacion />
            </Navbar>
          </PrivateRoute>
        }
      />
      <Route
        path="/evaluaciones/:id/editar"
        element={
          <PrivateRoute allowedRoles={['administrador', 'docente']}>
            <Navbar>
              <Evaluacion />
            </Navbar>
          </PrivateRoute>
        }
      />
      <Route
        path="/reportes"
        element={
          <PrivateRoute allowedRoles={['administrador', 'docente', 'auxiliar']}>
            <Navbar>
              <Reportes />
            </Navbar>
          </PrivateRoute>
        }
      />
      <Route
        path="/profesores/nuevo"
        element={
          <PrivateRoute allowedRoles={['administrador']}>
            <Navbar>
              <AgregarProfesor />
            </Navbar>
          </PrivateRoute>
        }
      />
      <Route
        path="/estudiantes/nuevo"
        element={
          <PrivateRoute allowedRoles={['administrador', 'docente']}>
            <Navbar>
              <AgregarAlumno />
            </Navbar>
          </PrivateRoute>
        }
      />

      {/* Fallback route redirection */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
