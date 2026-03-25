import React from 'react';
import { MapPin, Bed, Bath, Heart } from 'lucide-react';
import { Card } from './ui/Card';
import { EcoScoreBadge } from './EcoScoreBadge';
import { Link } from 'react-router-dom';
export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  imageUrl: string;
  ecoScore: number;
  isFavorite?: boolean;
}
interface PropertyCardProps {
  property: Property;
}
export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link to={`/properties/${property.id}`} className="block group">
      <Card
        padding="none"
        className="h-full transition-all duration-200 hover:shadow-md hover:border-emerald-200">
        
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={property.imageUrl}
            alt={property.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
          
          <button
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors text-slate-400 hover:text-red-500"
            onClick={(e) => {
              e.preventDefault();
              // Toggle favorite logic
            }}>
            
            <Heart
              className={`w-5 h-5 ${property.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            
          </button>
          <div className="absolute bottom-3 left-3">
            <EcoScoreBadge score={property.ecoScore} />
          </div>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">
                {property.title}
              </h3>
              <div className="flex items-center text-slate-500 text-sm mt-1">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{property.location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-slate-600">
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1.5 text-slate-400" />
              <span>{property.beds} Beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1.5 text-slate-400" />
              <span>{property.baths} Baths</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-baseline">
            <span className="text-2xl font-bold text-slate-900">
              ${property.price}
            </span>
            <span className="text-slate-500 text-sm ml-1">/month</span>
          </div>
        </div>
      </Card>
    </Link>);

}