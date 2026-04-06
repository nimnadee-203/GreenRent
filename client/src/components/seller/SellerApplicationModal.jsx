import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Building2, Loader2, Phone, User, XCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const INITIAL_FORM = {
  sellerName: '',
  businessName: '',
  contactNumber: '',
  sellingPlan: 'personal_property',
};

export default function SellerApplicationModal({ isOpen, onClose, onSubmitted }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setForm(INITIAL_FORM);
      setIsSubmitting(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onFieldChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/request-seller`,
        {
          sellerName: form.sellerName.trim(),
          businessName: form.businessName.trim(),
          contactNumber: form.contactNumber.trim(),
          sellingPlan: form.sellingPlan,
        },
        { withCredentials: true }
      );

      await onSubmitted?.();
      onClose?.();
    } catch (submitError) {
      const serverErrors = submitError?.response?.data?.errors;
      const message = submitError?.response?.data?.message || 'Could not submit your seller application.';
      setError(Array.isArray(serverErrors) && serverErrors.length ? serverErrors.join(' | ') : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-60"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Seller Application</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Become a Seller</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-60"
            aria-label="Close seller application"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-slate-700">
            Submit your seller details below. Seller Name, Contact Number, and your selling plan are required. Business Name is optional.
          </div>

          <div className="grid grid-cols-1 gap-5">
            <FormField
              icon={User}
              label="Seller Name"
              value={form.sellerName}
              onChange={onFieldChange('sellerName')}
              placeholder="Your full name"
              required
            />

            <FormField
              icon={Building2}
              label="Business Name"
              value={form.businessName}
              onChange={onFieldChange('businessName')}
              placeholder="GreenRent Properties"
            />

            <FormField
              icon={Phone}
              label="Contact Number"
              value={form.contactNumber}
              onChange={onFieldChange('contactNumber')}
              placeholder="+94 77 123 4567"
              required
            />

            <div className="flex flex-col">
              <label className="mb-2 text-sm font-semibold text-slate-700">You plan on selling</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${form.sellingPlan === 'personal_property' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                  <input
                    type="radio"
                    name="selling-plan"
                    value="personal_property"
                    checked={form.sellingPlan === 'personal_property'}
                    onChange={onFieldChange('sellingPlan')}
                    className="h-4 w-4 text-emerald-600"
                  />
                  Personal Property
                </label>
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${form.sellingPlan === 'business_property' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                  <input
                    type="radio"
                    name="selling-plan"
                    value="business_property"
                    checked={form.sellingPlan === 'business_property'}
                    onChange={onFieldChange('sellingPlan')}
                    className="h-4 w-4 text-emerald-600"
                  />
                  Business Property
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Seller Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ icon: Icon, label, ...props }) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 flex items-center text-sm font-semibold text-slate-700">
        <Icon className="mr-2 h-4 w-4 text-slate-400" />
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
      />
    </div>
  );
}
