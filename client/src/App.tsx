import { ChatWidget } from './components/ChatWidget';

function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center py-10 px-4">
            <div className="mb-8 text-center text-white">
                <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-md">Spur AI Chat</h1>
            </div>
            <ChatWidget />
        </div>
    )
}

export default App
