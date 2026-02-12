import React from "react";
import { Heart } from "lucide-react";
import { servicesData } from "../assets/assets";

export default function Card() {
  return (
    <div className="px-8 py-10">
      <h2 className="text-2xl font-bold mb-6">Chefs</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {servicesData.map((item) => (
          <div key={item._id} className="group cursor-pointer">

            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <div className="absolute top-3 right-3 p-2 bg-white/70 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200 shadow-md">
                <Heart
                  className="text-gray-600 hover:text-red-500"
                  size={20}
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <div className="flex items-center gap-1 text-sm">
                  <span>⭐</span>
                  <span className="font-medium">{item.rating}</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                From <span className="font-bold text-gray-900">{item.price}</span> / guest
              </p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
