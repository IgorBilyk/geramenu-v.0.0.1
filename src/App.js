import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/pages/Login/Login";
import AddMenu from "./components/pages/AddMenu/AddMenu";
import Settings from "./components/pages/settings/Settings";
import Home from "./components/pages/Home/Home";
import PreviewExternalPage from "./components/pages/PreviewExternalPage/PreviewExternalPage";
import QRPage from "./components/pages/QRPAge/QRPage";

import Test from "./components/test/Test";

import ProtectedRoute from './components/protectedRoute/ProtectedRoute'
import { AuthProvider } from "./utils/AuthContext";
import NotFound from "./components/pages/NotFound/NotFound";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/previewext/:userId" element={<PreviewExternalPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu"
          
            element={
              <ProtectedRoute>
                <AddMenu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qr"
            element={
              <ProtectedRoute>
                <QRPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test"
            element={
              <ProtectedRoute>
                <Test />
              </ProtectedRoute>
            }
          />
           <Route
            path="*"
            element={
             <NotFound/>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
