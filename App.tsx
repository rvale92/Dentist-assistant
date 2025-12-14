import React from 'react';
import VoiceWidget from './components/VoiceWidget';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 items-center justify-center">
        
        {/* Left Side: Branding/Context (simulating the dental website) */}
        <div className="hidden lg:block w-full max-w-md space-y-6">
           <div>
              <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                Pearly Whites <span className="text-blue-600">Dental</span>
              </h2>
              <p className="text-xl text-slate-600 mt-4 leading-relaxed">
                Experience the future of dental care. Schedule your cleaning, checkup, or emergency visit with our AI-powered receptionist, Pearl.
              </p>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                      <h3 className="font-bold text-slate-800">Smart Scheduling</h3>
                      <p className="text-sm text-slate-500">Book in seconds just by speaking naturally.</p>
                  </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4">
                  <div className="bg-red-100 p-2 rounded-lg text-red-600">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div>
                      <h3 className="font-bold text-slate-800">Emergency Triage</h3>
                      <p className="text-sm text-slate-500">Immediate guidance for urgent dental situations.</p>
                  </div>
              </div>
           </div>
        </div>

        {/* Right Side: The Voice Widget */}
        <VoiceWidget />

      </div>
    </div>
  );
};

export default App;