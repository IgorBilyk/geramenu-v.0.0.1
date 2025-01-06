import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import '@stripe/stripe-js'
import "./index.css"
import Login from "./components/pages/Login/Login";
import Settings from "./components/pages/settings/Settings";
import Home from "./components/pages/Home/Home";
import PreviewExternalPage from "./components/pages/PreviewExternalPage/PreviewExternalPage";
import QRPage from "./components/pages/QRPAge/QRPage";

import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import { AuthProvider } from "./utils/AuthContext";

import NotFound from "./components/pages/NotFound/NotFound";
import SubscriptionPage from "./components/checkout/SubscriptionForm ";

import Success from "./components/checkout/success/Success";
import Failed from "./components/checkout/failed/Failed";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/previewext/:userId" element={<PreviewExternalPage />} />
          <Route path="/checkout" element={<SubscriptionPage />} />

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
            path="/success"
            element={
              <ProtectedRoute>
                <Success />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
