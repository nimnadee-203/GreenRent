import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home';
import PropertyListing from './pages/PropertyListing';
import Login from './pages/Login';
import AddApartment from './pages/AddApartment';
import MyListings from './pages/MyListings';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/properties' element={<PropertyListing />} />
        <Route path='/login' element={<Login />} />
        <Route path='/add-apartment' element={<AddApartment />} />
        <Route path='/my-listings' element={<MyListings />} />
      </Routes>

    </div>
  );
}

export default App;
