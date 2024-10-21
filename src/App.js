// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Menu from './components/Menu/Menu';
import ItemsList from './components/ItemList/ItemList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/items" element={<ItemsList />} />
      </Routes>
    </Router>
  );
}

export default App;
