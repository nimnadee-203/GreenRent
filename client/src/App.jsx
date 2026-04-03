import { Route, Routes } from 'react-router-dom';
// Forced HMR update
import Home from './pages/home/Home';
import Dashboard from './pages/dashboard/Dashboard';
import PropertyListing from './pages/property/PropertyListing';
import PropertyDetails from './pages/property/PropertyDetails';
import PropertyMap from './pages/property/PropertyMap';
import Wishlist from './pages/property/Wishlist';
import BookingPage from './pages/booking/BookingPage';
import PaymentPage from './pages/booking/PaymentPage';
import AdminListings from './pages/admin/AdminListings';
import AdminReviews from './pages/admin/AdminReviews';
import ChatPage from './pages/chat/ChatPage';
import Login from './pages/auth/Login';
import AddApartment from './pages/eco-rating/AddApartment';
import MyListings from './pages/eco-rating/MyListings';
import Contact from './pages/company/Contact';
import AboutPage from './pages/company/About';
import Careers from './pages/company/Careers';
import Press from './pages/company/Press';
import EcoScoreExplained from './pages/renter/EcoScoreExplained';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/careers' element={<Careers />} />
        <Route path='/press' element={<Press />} />
        <Route path='/eco-score-explained' element={<EcoScoreExplained />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/properties' element={<PropertyListing />} />
        <Route path='/properties/map' element={<PropertyMap />} />
        <Route path='/properties/:id' element={<PropertyDetails />} />
        <Route path='/wishlist' element={<Wishlist />} />
         <Route path='/booking/:id' element={<BookingPage />} />
         <Route path='/payment/:id' element={<PaymentPage />} />
        <Route path='/admin/listings' element={<AdminListings />} />
        <Route path='/admin/reviews' element={<AdminReviews />} />
        <Route path='/chat' element={<ChatPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/add-apartment' element={<AddApartment />} />
        <Route path='/my-listings' element={<MyListings />} />
      </Routes>
    </div>
  );
}

export default App;
