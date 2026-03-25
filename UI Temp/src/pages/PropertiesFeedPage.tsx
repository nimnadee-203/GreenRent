import React, { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, X } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PropertyCard, Property } from '../components/PropertyCard';
// Mock data
const MOCK_PROPERTIES: Property[] = [
{
  id: '1',
  title: 'Modern Eco-Loft in Downtown',
  location: 'Portland, OR',
  price: 2400,
  beds: 2,
  baths: 2,
  imageUrl:
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ecoScore: 92,
  isFavorite: true
},
{
  id: '2',
  title: 'Sunny Passive House Apartment',
  location: 'Seattle, WA',
  price: 1850,
  beds: 1,
  baths: 1,
  imageUrl:
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ecoScore: 85
},
{
  id: '3',
  title: 'Renovated Historic Brownstone',
  location: 'Brooklyn, NY',
  price: 3200,
  beds: 3,
  baths: 2,
  imageUrl:
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ecoScore: 64
},
{
  id: '4',
  title: 'Solar-Powered Garden Unit',
  location: 'Austin, TX',
  price: 1600,
  beds: 1,
  baths: 1,
  imageUrl:
  'https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ecoScore: 98
},
{
  id: '5',
  title: 'Spacious Family Home with Heat Pump',
  location: 'Denver, CO',
  price: 2900,
  beds: 4,
  baths: 3,
  imageUrl:
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ecoScore: 78
},
{
  id: '6',
  title: 'Standard Studio Apartment',
  location: 'Chicago, IL',
  price: 1400,
  beds: 1,
  baths: 1,
  imageUrl:
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  ecoScore: 45
}];

export function PropertiesFeedPage() {
  const [activeFilters, setActiveFilters] = useState([
  'Eco Score 80+',
  '2+ Beds']
  );
  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter));
  };
  return (
    <main className="flex-1 bg-slate-50 min-h-screen pb-20">
      {/* Search & Filter Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Search by city, neighborhood, or zip..."
                leftIcon={<Search className="w-5 h-5" />}
                className="h-12 text-base" />
              
            </div>
            <Button
              variant="outline"
              className="h-12 px-6"
              leftIcon={<SlidersHorizontal className="w-5 h-5" />}>
              
              Filters
            </Button>
          </div>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 &&
          <div className="flex flex-wrap gap-2 mt-4">
              {activeFilters.map((filter) =>
            <span
              key={filter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-sm font-medium text-slate-700 border border-slate-200">
              
                  {filter}
                  <button
                onClick={() => removeFilter(filter)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none">
                
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
            )}
              <button
              onClick={() => setActiveFilters([])}
              className="text-sm text-emerald-600 font-medium hover:text-emerald-700 ml-2">
              
                Clear all
              </button>
            </div>
          }
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {MOCK_PROPERTIES.length} Properties found
          </h1>
          <select className="bg-transparent border-none text-sm font-medium text-slate-600 focus:ring-0 cursor-pointer">
            <option>Highest Eco Score</option>
            <option>Lowest Price</option>
            <option>Newest Listings</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PROPERTIES.map((property) =>
          <PropertyCard key={property.id} property={property} />
          )}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center gap-2">
            <Button variant="outline" disabled>
              Previous
            </Button>
            <Button variant="primary" className="w-10 px-0">
              1
            </Button>
            <Button variant="ghost" className="w-10 px-0">
              2
            </Button>
            <Button variant="ghost" className="w-10 px-0">
              3
            </Button>
            <span className="text-slate-400 px-2">...</span>
            <Button variant="outline">Next</Button>
          </nav>
        </div>
      </div>
    </main>);

}