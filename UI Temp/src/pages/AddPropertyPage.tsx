import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ArrowLeft, Upload, Info } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
export function AddPropertyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  return (
    <div className="flex-1 bg-slate-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Stepper */}
        <div className="mb-8">
          <button
            onClick={() => step === 2 ? setStep(1) : navigate('/dashboard')}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors">
            
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>

          <h1 className="text-2xl font-bold text-slate-900 mb-6">
            Add New Property
          </h1>

          <div className="flex items-center">
            <div className="flex items-center text-emerald-600">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-sm border-2 border-emerald-600">
                1
              </div>
              <span className="ml-3 font-medium">Basic Details</span>
            </div>
            <div
              className={`flex-1 h-0.5 mx-4 ${step === 2 ? 'bg-emerald-600' : 'bg-slate-200'}`}>
            </div>
            <div
              className={`flex items-center ${step === 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
              
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step === 2 ? 'bg-emerald-100 border-emerald-600' : 'bg-white border-slate-300'}`}>
                
                2
              </div>
              <span className="ml-3 font-medium">Eco Rating</span>
            </div>
          </div>
        </div>

        {/* Step 1: Basic Details */}
        {step === 1 &&
        <Card className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Property Information
              </h2>
              <div className="space-y-4">
                <Input
                label="Property Title"
                placeholder="e.g. Sunny Passive House Apartment" />
              
                <div className="grid grid-cols-2 gap-4">
                  <Input
                  label="Monthly Rent ($)"
                  type="number"
                  placeholder="2000" />
                
                  <Input
                  label="Security Deposit ($)"
                  type="number"
                  placeholder="2000" />
                
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Bedrooms" type="number" placeholder="2" />
                  <Input label="Bathrooms" type="number" placeholder="1" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Location
              </h2>
              <div className="space-y-4">
                <Input label="Street Address" placeholder="123 Main St" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <Input label="City" placeholder="City" />
                  </div>
                  <div className="col-span-1">
                    <Input label="State" placeholder="State" />
                  </div>
                  <div className="col-span-1">
                    <Input label="Zip Code" placeholder="Zip" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Photos
              </h2>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-900">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  SVG, PNG, JPG or GIF (max. 5MB)
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end">
              <Button
              onClick={() => setStep(2)}
              rightIcon={<ChevronRight className="w-4 h-4" />}>
              
                Continue to Eco Rating
              </Button>
            </div>
          </Card>
        }

        {/* Step 2: Eco Rating */}
        {step === 2 &&
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900">
                  Why complete this now?
                </h4>
                <p className="text-sm text-blue-800 mt-1">
                  Properties with completed eco ratings get 3x more views. If
                  you skip this, your listing will be marked as "Provisional"
                  and hidden after 48 hours.
                </p>
              </div>
            </div>

            <Card className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Energy & Heating
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Primary Heating Source
                    </label>
                    <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option>Select heating type...</option>
                      <option>Electric Heat Pump (High Eco Score)</option>
                      <option>Solar Thermal</option>
                      <option>Natural Gas</option>
                      <option>Electric Baseboard</option>
                      <option>Oil/Propane (Low Eco Score)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">
                        Solar Panels Installed
                      </p>
                      <p className="text-sm text-slate-500">
                        Property generates its own renewable energy
                      </p>
                    </div>
                    <input
                    type="checkbox"
                    className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                  
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Insulation & Windows
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Window Type
                    </label>
                    <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option>Select window type...</option>
                      <option>Triple Pane (High Eco Score)</option>
                      <option>Double Pane</option>
                      <option>Single Pane (Low Eco Score)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-slate-500">
                
                  Skip for now
                </Button>
                <Button
                onClick={() => navigate('/dashboard')}
                className="bg-emerald-600 hover:bg-emerald-700">
                
                  Publish Listing
                </Button>
              </div>
            </Card>
          </div>
        }
      </div>
    </div>);

}