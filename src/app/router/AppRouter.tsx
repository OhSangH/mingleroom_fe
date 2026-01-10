import { Route, Routes } from 'react-router-dom';

import { ProtectedRoute, PublicOnlyRoute } from '@/app/router/route-guards';
import DashboardPage from '@/pages/Room/DashboardPage';
import HomePage from '@/pages/Home/HomePage';
import LobbyPage from '@/pages/Room/LobbyPage';
import LoginPage from '@/pages/Login/LoginPage';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import RoomDetailPage from '@/pages/Room/RoomDetailPage';
import SignupPage from '@/pages/Login/SignupPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <PublicOnlyRoute redirectTo='/dashboard'>
            <HomePage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path='/login'
        element={
          <PublicOnlyRoute redirectTo='/dashboard'>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path='/signup'
        element={
          <PublicOnlyRoute redirectTo='/dashboard'>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/lobby/:roomId'
        element={
          <ProtectedRoute>
            <LobbyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path='/room/:roomId'
        element={
          <ProtectedRoute>
            <RoomDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  );
}
