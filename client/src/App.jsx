import { Route, Routes } from 'react-router-dom';
// Forced HMR update
import Home from './pages/home/Home';
import About from './pages/about/About';
import Dashboard from './pages/dashboard/Dashboard';
import PropertyListing from './pages/property/PropertyListing';
import PropertyDetails from './pages/property/PropertyDetails';
import PropertyMap from './pages/property/PropertyMap';
import Wishlist from './pages/property/Wishlist';
import BookingPage from './pages/property/BookingPage';
import PaymentPage from './pages/property/PaymentPage';
import Login from './pages/auth/Login';
import AddApartment from './pages/eco-rating/AddApartment';
import MyListings from './pages/eco-rating/MyListings';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/properties' element={<PropertyListing />} />
        <Route path='/properties/map' element={<PropertyMap />} />
        <Route path='/properties/:id' element={<PropertyDetails />} />
        <Route path='/wishlist' element={<Wishlist />} />
        <Route path='/booking/:id' element={<BookingPage />} />
        <Route path='/payment/:id' element={<PaymentPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/add-apartment' element={<AddApartment />} />
        <Route path='/my-listings' element={<MyListings />} />
      </Routes>
    </div>
  );
}

export default App;
