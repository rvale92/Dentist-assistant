import React, { useState } from 'react';
import { BookingDetails } from '../types';

interface BookingFormProps {
  details: BookingDetails;
  onConfirm: (email: string) => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ details, onConfirm, onCancel }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Simulate API call delay
    setTimeout(() => {
        onConfirm(email);
    }, 1500);
  };

  if (submitted) {
      return (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Booking Confirmed!</h3>
              <p className="text-slate-600">We've sent a confirmation email to {email}.</p>
              <button onClick={onCancel} className="mt-6 text-blue-600 hover:text-blue-800 font-medium">Close</button>
          </div>
      )
  }

  return (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">Confirm Appointment</h3>
        
        <div className="space-y-3 mb-6">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</span>
            <p className="text-slate-800 font-medium">{details.patientName}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reason</span>
            <p className="text-slate-800 font-medium">{details.reason}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preferred Time</span>
            <p className="text-slate-800 font-medium">{details.preferredDateTime}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-all"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;