import { Route, Routes } from 'react-router-dom';
// Forced HMR update
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import PropertyListing from './pages/PropertyListing';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/Login';
import AddApartment from './pages/AddApartment';
import MyListings from './pages/MyListings';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/properties' element={<PropertyListing />} />
        <Route path='/properties/:id' element={<PropertyDetails />} />
        <Route path='/login' element={<Login />} />
        <Route path='/add-apartment' element={<AddApartment />} />
        <Route path='/my-listings' element={<MyListings />} />
      </Routes>
    </div>
  );
}

export default App;
