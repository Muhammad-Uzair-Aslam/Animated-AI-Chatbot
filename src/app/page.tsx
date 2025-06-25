import ChatBot from '../components/ChatBot';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            AI Chat Assistant
          </h1>
          <p className="text-lg text-gray-400">
            Your intelligent companion for meaningful conversations
          </p>
        </div>
        <ChatBot />
      </div>
    </main>
  );
}
