import React from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Home,
  Clock,
  AlertTriangle,
  ChevronRight,
  MoreVertical } from
'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge, ListingStatus } from '../components/StatusBadge';
import { EcoScoreBadge } from '../components/EcoScoreBadge';
// Mock listings
const MY_LISTINGS = [
{
  id: '1',
  title: 'Modern Eco-Loft in Downtown',
  address: '123 Green St, Portland',
  rent: 2400,
  status: 'Active' as ListingStatus,
  ecoScore: 92,
  views: 145
},
{
  id: '2',
  title: 'Sunny Passive House Apartment',
  address: '456 Solar Ave, Seattle',
  rent: 1850,
  status: 'Provisional' as ListingStatus,
  ecoScore: 0,
  views: 12,
  deadlineHours: 24
},
{
  id: '3',
  title: 'Renovated Historic Brownstone',
  address: '789 Old Rd, Brooklyn',
  rent: 3200,
  status: 'Hidden' as ListingStatus,
  ecoScore: 0,
  views: 0
}];

export function DashboardPage() {
  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Landlord Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your properties and eco ratings.
            </p>
          </div>
          <Link to="/dashboard/add-property">
            <Button leftIcon={<Plus className="w-4 h-4" />}>
              Add Property
            </Button>
          </Link>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card padding="md" className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Listings
              </p>
              <p className="text-2xl font-bold text-slate-900">3</p>
            </div>
          </Card>

          <Card padding="md" className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active</p>
              <p className="text-2xl font-bold text-slate-900">1</p>
            </div>
          </Card>

          <Card
            padding="md"
            className="flex items-center gap-4 border-amber-200 bg-amber-50/30">
            
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Provisional</p>
              <p className="text-2xl font-bold text-slate-900">1</p>
            </div>
          </Card>

          <Card
            padding="md"
            className="flex items-center gap-4 border-red-200 bg-red-50/30">
            
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Action Needed
              </p>
              <p className="text-2xl font-bold text-slate-900">1</p>
            </div>
          </Card>
        </div>

        {/* Action Alerts */}
        <div className="mb-8 space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-800">
                Complete Eco Rating (24h remaining)
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                "Sunny Passive House Apartment" will be hidden from public
                search if the eco rating is not completed.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white border-none shrink-0">
              
              Complete Now
            </Button>
          </div>
        </div>

        {/* Listings Table */}
        <Card padding="none" className="overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">
              Your Properties
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Property</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Eco Score</th>
                  <th className="px-6 py-4 font-medium">Rent</th>
                  <th className="px-6 py-4 font-medium">Views</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {MY_LISTINGS.map((listing) =>
                <tr
                  key={listing.id}
                  className="hover:bg-slate-50/50 transition-colors">
                  
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {listing.title}
                      </div>
                      <div className="text-slate-500 text-xs mt-1">
                        {listing.address}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={listing.status} />
                      {listing.deadlineHours &&
                    <div className="text-xs text-amber-600 mt-1 font-medium">
                          {listing.deadlineHours}h left
                        </div>
                    }
                    </td>
                    <td className="px-6 py-4">
                      <EcoScoreBadge score={listing.ecoScore} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">
                      ${listing.rent}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {listing.views}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>);

}