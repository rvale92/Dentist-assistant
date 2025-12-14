import React, { useRef, useEffect } from 'react';
import { useLiveAPI } from '../hooks/useLiveAPI';
import { ConnectionState } from '../types';
import Visualizer from './Visualizer';
import BookingForm from './BookingForm';

const VoiceWidget: React.FC = () => {
  const { 
    connectionState, 
    connect, 
    disconnect, 
    isVolumeMuted, 
    toggleMute, 
    inputAudioContext,
    bookingProposal,
    resetBooking
  } = useLiveAPI();
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isConnecting = connectionState === ConnectionState.CONNECTING;

  return (
    <div className="relative w-full max-w-lg mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col h-[600px]">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
           </svg>
        </div>
        <h1 className="text-2xl font-bold relative z-10">Pearly Whites Dental</h1>
        <p className="text-blue-100 text-sm mt-1 relative z-10">Virtual Receptionist</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 relative">
        
        {bookingProposal && (
          <BookingForm 
            details={bookingProposal} 
            onConfirm={(email) => {
              console.log("Confirmed booking for", email);
              // Here you would typically send data to backend
              // Keeping the success state visible for a moment is handled inside BookingForm
            }}
            onCancel={resetBooking}
          />
        )}

        <div className="relative mb-8">
           {/* Avatar / Status Indicator */}
           <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isConnected ? 'bg-blue-50 shadow-blue-200' : 'bg-slate-100'} shadow-xl border-4 border-white`}>
              {isConnected ? (
                  <div className="relative">
                     <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
                     <span className="text-5xl animate-bounce">🦷</span>
                  </div>
              ) : (
                  <span className="text-5xl grayscale opacity-50">🦷</span>
              )}
           </div>
           {isConnected && <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>}
        </div>

        {/* Status Text */}
        <div className="text-center mb-8 h-8">
            {connectionState === ConnectionState.DISCONNECTED && (
                <p className="text-slate-500">Ready to assist you.</p>
            )}
            {connectionState === ConnectionState.CONNECTING && (
                <p className="text-blue-600 font-medium animate-pulse">Connecting to Pearl...</p>
            )}
            {connectionState === ConnectionState.CONNECTED && (
                <p className="text-green-600 font-medium">Listening...</p>
            )}
            {connectionState === ConnectionState.ERROR && (
                <p className="text-red-500 font-medium">Connection Failed. Please retry.</p>
            )}
        </div>

        {/* Visualizer */}
        <div className="w-full mb-8">
            <Visualizer audioContext={inputAudioContext} isActive={isConnected} />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 w-full">
            {!isConnected ? (
                 <button 
                 onClick={connect}
                 disabled={isConnecting}
                 className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 ${
                    isConnecting 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                 }`}
               >
                 {isConnecting ? 'Connecting...' : '📞 Call Reception'}
               </button>
            ) : (
                <div className="flex gap-3 w-full">
                     <button 
                        onClick={toggleMute}
                        className={`flex-1 py-4 rounded-xl font-bold text-lg shadow-md transition-all border ${
                            isVolumeMuted 
                            ? 'bg-red-50 border-red-200 text-red-600' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                     >
                        {isVolumeMuted ? 'Unmute' : 'Mute'}
                     </button>
                     <button 
                        onClick={disconnect}
                        className="flex-1 py-4 rounded-xl font-bold text-lg shadow-md transition-all bg-red-100 hover:bg-red-200 text-red-700 border border-red-200"
                     >
                        Hang Up
                     </button>
                </div>
            )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t border-slate-100 p-4 text-center">
         <p className="text-xs text-slate-400">Powered by Gemini 2.5 Live API</p>
      </div>
    </div>
  );
};

export default VoiceWidget;