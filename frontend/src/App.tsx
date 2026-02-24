import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import WorkspacePage from './pages/Workspace'
import { useAuthStore } from './store/auth'

export default function App() {
  const token = useAuthStore((s) => s.token)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/w/:workspaceId/*"
          element={token ? <WorkspacePage /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={token ? '/w/default' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  )
}
