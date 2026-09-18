# Gemini Live Dental Voice Assistant Prototype

A React + TypeScript prototype that explores a real-time AI voice receptionist for a fictional dental office.

The application uses the Google Gemini Live API to stream microphone audio, receive generated audio responses, and trigger a structured booking workflow.

## What this project demonstrates

- Real-time audio capture with the Web Audio API
- Gemini Live API integration through `@google/genai`
- Streaming audio input and output
- Function/tool calling for structured appointment data
- React state management for connection and booking states
- Safety-oriented prompt design for emergency scenarios
- Converting an AI conversation into a UI workflow

## Example workflow

```text
Browser microphone
      |
      v
Web Audio API
      |
      v
Gemini Live session
      |
      +--> Spoken AI response
      |
      +--> proposeBooking tool call
                 |
                 v
          Booking confirmation UI
```

The assistant is prompted to collect a patient name, visit reason, and preferred date/time. Once those fields are available, Gemini can call `proposeBooking`, which displays the structured booking form in the interface.

## Tech stack

- React
- TypeScript
- Vite
- Google Gemini Live API
- `@google/genai`
- Web Audio API

## Run locally

```bash
git clone https://github.com/rvale92/Dentist-assistant.git
cd Dentist-assistant
npm install
```

Create a local environment file and provide a Gemini API key using the variable expected by the project, then run:

```bash
npm run dev
```

Never commit API keys to the repository.

## Important scope note

This is a personal prototype for learning real-time AI integration and conversational workflows. It is not connected to a real dental practice or production appointment system.

## Template attribution

This repository began from a Google AI Studio repository template and was customized to explore the dental-receptionist use case, voice interaction, booking flow, visual state, and tool-calling behavior.
