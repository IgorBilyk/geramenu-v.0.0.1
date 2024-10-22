// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/pages/Login/Login';
import Menu from './components/pages/Menu/Menu';
import ItemsList from './components/pages/ItemList/ItemList';
import Settings from './components/pages/settings/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/items" element={<ItemsList />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
