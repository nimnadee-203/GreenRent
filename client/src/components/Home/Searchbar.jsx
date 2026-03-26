import React from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="flex justify-center mt-8 px-4">
      <div className="flex items-center bg-white shadow-xl rounded-full px-6 py-3 w-full max-w-5xl border border-gray-200 hover:shadow-2xl transition-all duration-300">

        {/* Location */}
        <div className="flex-1 px-4">
          <p className="text-xs font-semibold">Where</p>
          <input
            type="text"
            placeholder="Search destinations"
            className="w-full outline-none text-sm text-gray-600"
          />
        </div>

        <div className="h-6 w-px bg-gray-300"></div>

        {/* Check In */}
        <div className="flex-1 px-4">
          <p className="text-xs font-semibold">Check in</p>
          <input
            type="text"
            placeholder="Add dates"
            className="w-full outline-none text-sm text-gray-600"
          />
        </div>

        <div className="h-6 w-px bg-gray-300"></div>

        {/* Check Out */}
        <div className="flex-1 px-4">
          <p className="text-xs font-semibold">Check out</p>
          <input
            type="text"
            placeholder="Add dates"
            className="w-full outline-none text-sm text-gray-600"
          />
        </div>

        <div className="h-6 w-px bg-gray-300"></div>

        {/* Guests */}
        <div className="flex-1 px-4">
          <p className="text-xs font-semibold">Who</p>
          <input
            type="text"
            placeholder="Add guests"
            className="w-full outline-none text-sm text-gray-600"
          />
        </div>

        {/* Search Button */}
        <button className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition ml-2">
          <Search size={18} />
        </button>

      </div>
    </div>
  );
}
