import React from 'react';
import { BookOpen, Droplet, Wind, Zap } from 'lucide-react';

const CATEGORIES = [
  {
    title: 'Energy Efficiency',
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    score: '35%',
    description: 'How well the property conserves energy, including insulation, LED lighting, and smart thermostats.',
  },
  {
    title: 'Water Management',
    icon: <Droplet className="w-6 h-6 text-blue-500" />,
    score: '25%',
    description: 'Efficient plumbing fixtures, rainwater harvesting, and greywater recycling systems.',
  },
  {
    title: 'Air Quality',
    icon: <Wind className="w-6 h-6 text-emerald-500" />,
    score: '20%',
    description: 'Ventilation systems, low-VOC materials, and proximity to green spaces.',
  },
  {
    title: 'Waste & Materials',
    icon: <BookOpen className="w-6 h-6 text-purple-500" />,
    score: '20%',
    description: 'Recycling accessibility, composting facilities, and use of sustainable building materials.',
  },
];

export default function EcoScoreCategories() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
      {CATEGORIES.map((cat) => (
        <div key={cat.title} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex gap-6 items-start">
          <div className="bg-slate-50 p-4 rounded-xl">{cat.icon}</div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-slate-900">{cat.title}</h3>
              <span className="text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full text-sm">
                {cat.score} weight
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">{cat.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
