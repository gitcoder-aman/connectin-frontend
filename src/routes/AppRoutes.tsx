import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { FeedPage } from '@/pages/FeedPage';
import { NetworkPage } from '@/pages/NetworkPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { DirectUploadPage } from '@/pages/DirectUploadPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Main Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/feed" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <FeedPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/network"
        element={
          <ProtectedRoute>
            <NetworkPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <DirectUploadPage />
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
