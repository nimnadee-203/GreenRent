import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Zap,
  Search,
  Home,
  Star } from
'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
export function LandingPage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 opacity-20 blur-[100px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium mb-8">
            <Leaf className="w-4 h-4" />
            <span>The new standard for eco-friendly living</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Find a home that cares about the{' '}
            <span className="text-emerald-600">planet.</span>
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            GreenRent connects eco-conscious tenants with sustainable
            properties. We verify eco-ratings so you know exactly what you're
            renting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/properties">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg px-8"
                rightIcon={<Search className="w-5 h-5" />}>
                
                Find a Rental
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-lg px-8 bg-white">
                
                List a Property
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why choose GreenRent?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We bring transparency to the rental market, rewarding sustainable
              landlords and helping tenants reduce their carbon footprint.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-none shadow-sm bg-slate-50 hover:bg-emerald-50/50 transition-colors">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Verified Eco Ratings
              </h3>
              <p className="text-slate-600">
                Every property receives a standardized 0-100 eco score based on
                energy, water, and insulation.
              </p>
            </Card>

            <Card className="text-center p-8 border-none shadow-sm bg-slate-50 hover:bg-emerald-50/50 transition-colors">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Lower Utility Bills
              </h3>
              <p className="text-slate-600">
                Highly rated properties are more efficient, saving you money on
                electricity and heating every month.
              </p>
            </Card>

            <Card className="text-center p-8 border-none shadow-sm bg-slate-50 hover:bg-emerald-50/50 transition-colors">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Real Renter Reviews
              </h3>
              <p className="text-slate-600">
                Read authentic reviews from previous tenants about the actual
                living experience and landlord responsiveness.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Eco Score Explanation */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                The GreenRent Eco Score
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                We force transparency. Landlords must complete our comprehensive
                eco-assessment to list their property. We evaluate 7 key areas
                to generate a simple, comparable score.
              </p>

              <ul className="space-y-4">
                {[
                'Energy Source (Solar, Heat Pumps vs Gas)',
                'Insulation & Windows Quality',
                'Water Saving Fixtures',
                'Natural Light & Ventilation'].
                map((item, i) =>
                <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-4 h-4" />
                    </div>
                    <span className="text-slate-300">{item}</span>
                  </li>
                )}
              </ul>

              <Button
                variant="primary"
                className="mt-10 bg-emerald-500 hover:bg-emerald-600">
                
                Learn how we calculate scores
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-3xl blur-2xl"></div>
              <Card className="relative bg-slate-800 border-slate-700 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-700">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-1">
                      Overall Eco Score
                    </h4>
                    <p className="text-slate-400 text-sm">
                      Based on 7 categories
                    </p>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-4 border-emerald-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-emerald-400">
                      86
                    </span>
                  </div>
                </div>

                <div className="space-y-5">
                  <ScoreBar label="Energy Efficiency" score={90} />
                  <ScoreBar label="Insulation" score={85} />
                  <ScoreBar label="Water Usage" score={70} />
                  <ScoreBar label="Materials" score={95} />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to find your sustainable home?
          </h2>
          <p className="text-emerald-100 text-lg mb-10">
            Join thousands of renters and landlords making a positive impact on
            the environment.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-slate-50">
              
              Browse Properties
            </Button>
            <Button
              size="lg"
              className="bg-emerald-700 text-white hover:bg-emerald-800 border-none">
              
              List Your Property
            </Button>
          </div>
        </div>
      </section>
    </main>);

}
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      
      <polyline points="20 6 9 17 4 12" />
    </svg>);

}
function ScoreBar({ label, score }: {label: string;score: number;}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-300">{label}</span>
        <span className="text-white font-medium">{score}/100</span>
      </div>
      <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full"
          style={{
            width: `${score}%`
          }}>
        </div>
      </div>
    </div>);

}