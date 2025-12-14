import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { pcmToGeminiBlob, base64ToBytes, decodeAudioData } from '../utils/audio';
import { ConnectionState, BookingDetails, LogMessage } from '../types';

const SYSTEM_INSTRUCTION = `
You are the voice receptionist for "Pearly Whites Dental". Your name is Pearl.
TONE: Warm, professional, reassuring. Speak at a measured, slightly slower pace suitable for phone/voice interaction.
GREETING: "Hello! Thank you for calling Pearly Whites Dental. I'm your virtual assistant. How can I help you today?"

YOUR TASKS:
1. Book Appointments: Collect the following 3 pieces of information. Ask for them one by one comfortably:
   - Patient's Full Name
   - Reason for visit (Cleaning, Checkup, or Emergency)
   - Preferred Date and general time (e.g., "next Tuesday morning")
2. FAQ Handling:
   - Hours: "Monday to Friday, 8 AM to 5 PM."
   - Insurance: "We accept most major PPO plans. Please provide your insurance carrier name for the human staff to confirm."
   - Address: "123 Main Street, Suite 400."
3. EMERGENCY GUARDRAIL:
   - If the user mentions severe pain, trauma, heavy bleeding, or a life-threatening condition:
   - STOP booking immediately.
   - SAY: "I understand this is an emergency. Please hang up and call us back immediately at our dedicated emergency line, (555) 555-1234, or call 911 if it is life-threatening."

CRITICAL TOOL USAGE:
- Once you have the Patient Name, Reason, and Date/Time, DO NOT ask for their email verbally.
- Instead, immediately call the "proposeBooking" function with the gathered details.
- Tell the user: "I have those details. Please confirm them on the screen and enter your email to finalize."
`;

const proposeBookingTool: FunctionDeclaration = {
  name: 'proposeBooking',
  parameters: {
    type: Type.OBJECT,
    description: 'Propose a booking when name, reason, and time are collected.',
    properties: {
      patientName: { type: Type.STRING, description: 'Full name of the patient' },
      reason: { type: Type.STRING, description: 'Reason for visit (Cleaning, Checkup, Emergency)' },
      preferredDateTime: { type: Type.STRING, description: 'Preferred date and time of appointment' },
    },
    required: ['patientName', 'reason', 'preferredDateTime'],
  },
};

export const useLiveAPI = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [isVolumeMuted, setIsVolumeMuted] = useState(false);
  const [bookingProposal, setBookingProposal] = useState<BookingDetails | null>(null);
  const [logs, setLogs] = useState<LogMessage[]>([]);

  // Refs for audio handling
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const audioQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null); // To hold the live session object

  const addLog = (role: LogMessage['role'], text: string) => {
    setLogs((prev) => [...prev, { role, text, timestamp: new Date() }]);
  };

  const disconnect = useCallback(() => {
    // Close session
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }

    // Stop all playing audio
    audioQueueRef.current.forEach(source => source.stop());
    audioQueueRef.current.clear();

    // Close Audio Contexts
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    // Stop tracks
    if (inputSourceRef.current?.mediaStream) {
        inputSourceRef.current.mediaStream.getTracks().forEach(track => track.stop());
    }

    setConnectionState(ConnectionState.DISCONNECTED);
    setBookingProposal(null);
    nextStartTimeRef.current = 0;
  }, []);

  const connect = useCallback(async () => {
    if (!process.env.API_KEY) {
      alert("API Key not found in environment.");
      return;
    }

    setConnectionState(ConnectionState.CONNECTING);
    setLogs([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initialize Audio Contexts
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const outputGain = outputCtx.createGain();
      outputNodeRef.current = outputGain;
      outputGain.connect(outputCtx.destination);

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          tools: [{ functionDeclarations: [proposeBookingTool] }],
        },
        callbacks: {
          onopen: () => {
            setConnectionState(ConnectionState.CONNECTED);
            addLog('system', 'Connected to Pearly Whites Dental AI.');

            // Setup Input Stream Processing
            const source = inputCtx.createMediaStreamSource(stream);
            inputSourceRef.current = source;
            
            // Note: ScriptProcessor is deprecated but used here specifically per Gemini Live API guides for simplicity
            // in processing raw PCM data chunks for streaming.
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const blob = pcmToGeminiBlob(inputData, 16000);
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: blob });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Tool Calls (Booking Proposal)
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                if (fc.name === 'proposeBooking') {
                   const args = fc.args as unknown as BookingDetails;
                   setBookingProposal(args);
                   addLog('assistant', `Booking Proposed: ${args.patientName} for ${args.reason}`);
                   
                   // Respond to the tool call
                   sessionPromise.then(session => {
                       session.sendToolResponse({
                           functionResponses: {
                               id: fc.id,
                               name: fc.name,
                               response: { result: "Booking form displayed to user." }
                           }
                       });
                   });
                }
              }
            }

            // Handle Audio Output
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outputAudioContextRef.current;
              if (ctx) {
                // Ensure context is running (sometimes pauses on browser policy)
                if (ctx.state === 'suspended') {
                    await ctx.resume();
                }

                const buffer = await decodeAudioData(base64ToBytes(audioData), ctx);
                
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(outputNodeRef.current!);
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                
                audioQueueRef.current.add(source);
                source.onended = () => audioQueueRef.current.delete(source);
              }
            }
            
            // Handle Transcript (Optional debugging)
            if (msg.serverContent?.modelTurn?.parts?.[0]?.text) {
                // Usually Live API with audio modality doesn't send text parts unless requested or tools involved
                // But good to have if mixed.
            }
          },
          onclose: () => {
            addLog('system', 'Session closed.');
            setConnectionState(ConnectionState.DISCONNECTED);
          },
          onerror: (err) => {
            console.error(err);
            addLog('system', 'Error occurred.');
            setConnectionState(ConnectionState.ERROR);
          }
        }
      });
      
      sessionRef.current = await sessionPromise;

    } catch (e) {
      console.error(e);
      setConnectionState(ConnectionState.ERROR);
    }
  }, []);

  const toggleMute = () => {
    if (outputNodeRef.current) {
      if (isVolumeMuted) {
        outputNodeRef.current.gain.value = 1;
        setIsVolumeMuted(false);
      } else {
        outputNodeRef.current.gain.value = 0;
        setIsVolumeMuted(true);
      }
    }
  };
  
  const resetBooking = () => {
      setBookingProposal(null);
      // Ideally, we might want to tell the model we reset, but for this simple flow, we just clear UI.
  };

  return {
    connectionState,
    connect,
    disconnect,
    isVolumeMuted,
    toggleMute,
    bookingProposal,
    resetBooking,
    logs,
    inputAudioContext: inputAudioContextRef.current // Exposed for visualizer
  };
};