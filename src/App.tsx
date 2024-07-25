// src/App.tsx
import React from 'react';
import { Refine } from '@refinedev/core';
import routerBindings, { NavigateToResource } from "@refinedev/react-router-v6";
import dataProvider from "@refinedev/simple-rest";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import CourseList from './components/CourseList';
import StudentDashboard from './components/StudentDashboard'; // Composant pour l'étudiant
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { authProvider } from './authProvider';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Refine
        dataProvider={dataProvider("http://localhost:3000/api")}
        routerProvider={routerBindings}
        authProvider={authProvider}
        resources={[
          {
            name: "courses",
            list: "/courses",
          },
          // Ajoutez ici d'autres ressources nécessaires
        ]}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CourseList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard" // Route pour l'interface étudiant
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <NavigateToResource resource="courses" />
              </ProtectedRoute>
            }
          />
          {/* Redirect all other routes to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer />
      </Refine>
    </BrowserRouter>
  );
};

export default App;
