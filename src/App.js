// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/pages/Login/Login";
import AddMenu from "./components/pages/AddMenu/AddMenu";
import Settings from "./components/pages/settings/Settings";
import PreviewInternalPage from "./components/pages/PreviewInternalPage/PreviewInternalPage";
import PreviewExternalPage from "./components/pages/PreviewExternalPage/PreviewExternalPage";
import QRPage from "./components/pages/QRPAge/QRPage";
import Test from "./components/test/Test";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/previewint/:userId" element={<PreviewInternalPage />} />
        <Route path="/previewext/:userId" element={<PreviewExternalPage />} />
        <Route path="/menu" element={<AddMenu />} />
        <Route path="/items" element={<QRPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/test" element={<Test/>} />
      </Routes>
    </Router>
  );
}

export default App;
