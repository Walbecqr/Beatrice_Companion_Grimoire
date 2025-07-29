import Link from 'next/link'
import { Moon, Sparkles, BookOpen, MessageCircle } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo/Title Section */}
        <div className="mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Moon className="w-20 h-20 text-purple-300 moon-icon" />
              <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-4">
            Beatrice&apos;s Sacred Companion
          </h1>
          <p className="text-xl text-gray-300">
            Your personal guide through the mystical journey of self-discovery
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card-mystical">
            <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Companion</h3>
            <p className="text-gray-400">
              Chat with Beatrice, your wise and understanding spiritual mentor
            </p>
          </div>
          
          <div className="card-mystical">
            <BookOpen className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sacred Journal</h3>
            <p className="text-gray-400">
              Document your spiritual journey with guided reflections
            </p>
          </div>
          
          <div className="card-mystical">
            <Moon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ritual Tracking</h3>
            <p className="text-gray-400">
              Log your rituals, spells, and divine connections
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup" className="btn-mystical">
            Begin Your Journey
          </Link>
          <Link 
            href="/auth/login" 
            className="bg-transparent border border-purple-500 text-purple-300 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-purple-500/10 hover:border-purple-400"
          >
            Sign In
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="mt-16 text-sm text-gray-500">
          <p>✨ Align with the cosmos • Track your spiritual growth • Find your path ✨</p>
        </div>
      </div>
    </main>
  )
}