export interface BookingDetails {
  patientName: string;
  reason: string;
  preferredDateTime: string;
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface LogMessage {
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
}