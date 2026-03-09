import React from "react";
import { Link } from "react-router-dom";

export default function Banner() {
  return (
    <div className="relative w-full max-w-[1440px] mx-auto h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden rounded-3xl mt-4">

      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
        alt="Banner"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative text-center text-white px-6">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Discover Unique Experiences
        </h1>

        <p className="mt-4 text-lg md:text-xl text-gray-200">
          Find stays, chefs, and adventures around the world
        </p>

        <Link
          to="/properties"
          className="inline-block mt-6 bg-white text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition"
        >
          Explore Properties
        </Link>
      </div>

    </div>
  );
}
