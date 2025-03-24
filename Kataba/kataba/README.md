# Kataba - Muslim AI Conversational Therapist

Kataba is an AI-powered conversational therapist designed specifically for Muslims seeking emotional support and guidance with Islamic principles in mind. Built with Next.js, React, TypeScript, and Tailwind CSS, this application provides a chat interface with high-quality text-to-speech powered by Cartesia.

## Features

- **Conversational AI**: Powered by OpenAI's GPT-4o for natural and empathetic conversations
- **Islamic Guidance**: Incorporates Islamic principles in a gentle, non-judgmental way
- **Voice Output**: Real-time text-to-speech using Cartesia's high-quality voice synthesis
- **Modern UI**: Clean, responsive design using Tailwind CSS and Shadcn UI components
- **Persistent Chat History**: Maintains conversation context throughout the session
- **Mutable Audio**: Toggle voice output on/off as needed

## Tech Stack

- **Frontend**: React, Next.js, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: Zustand
- **AI**: OpenAI GPT-4o for conversation
- **TTS**: Cartesia for voice output
- **API Routes**: Next.js API routes for secure API key handling

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key
- Cartesia API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hossfahad/Kataba-AI-Therapist-for-Muslims.git
   cd Kataba-AI-Therapist-for-Muslims
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env.local` file in the root directory and add your API keys:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   CARTESIA_API_KEY=your_cartesia_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

## Usage

1. Type your message in the text area at the bottom of the screen
2. Press Enter or click the Send button
3. Receive an AI response with voice output
4. Toggle the sound on/off using the mute button

## Configuration

### OpenAI Model

You can configure the OpenAI model and parameters in `/src/lib/openai.ts`.

### Cartesia Voice

You can adjust the Cartesia voice settings in `/src/app/api/tts/route.ts`:

- Change the voice ID
- Adjust the speed setting
- Modify the output format

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenAI for their powerful language model
- Cartesia for high-quality text-to-speech
- Shadcn UI for beautiful UI components
- Next.js team for the amazing framework

---

Created with ❤️ for the Muslim community
