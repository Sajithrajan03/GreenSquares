
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

function NotFoundPage() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [glitchText, setGlitchText] = useState('404')

  // Mount animation
  useEffect(() => {
    setMounted(true)
    
    // Glitch text animation
    const glitchChars = ['4', '0', '4', '?', '!', '#', '@', '%', '&', '*']
    let glitchInterval: number
    
    const startGlitch = () => {
      let iterations = 0
      glitchInterval = setInterval(() => {
        setGlitchText((prev) => {
          if (iterations >= 15) {
            clearInterval(glitchInterval)
            return '404'
          }
          
          return prev
            .split('')
            .map((char) => {
              if (Math.random() < 0.3) {
                return glitchChars[Math.floor(Math.random() * glitchChars.length)]
              }
              return char
            })
            .join('')
        })
        iterations++
      }, 100)
    }

    // Start glitch after initial mount
    const timeout = setTimeout(startGlitch, 1000)
    
    // Repeat glitch effect every 5 seconds
    const repeatInterval = setInterval(startGlitch, 5000)

    return () => {
      clearTimeout(timeout)
      clearInterval(repeatInterval)
      clearInterval(glitchInterval)
    }
  }, [])

  return (
    <div className="min-h-screen hero-gradient text-github-text font-github overflow-hidden relative">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-github-green-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <main className={`min-h-screen flex items-center justify-center px-6 py-12 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <section className="w-full max-w-6xl mx-auto text-center relative">
          
          {/* Animated 404 with contribution grid */}
          <div className="relative mb-12">
            {/* Main 404 display */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-github-green-500/20 to-github-green-400/20 rounded-3xl blur-2xl animate-pulse"></div>
              <div className="relative bg-github-surface/40 backdrop-blur-sm border border-github-border/50 rounded-3xl p-12 mb-8 hover:border-github-green-500/50 transition-all duration-500 hover:scale-105">
                
                {/* GitHub-style contribution grid forming "404" */}
                <div className="flex justify-center items-center gap-8 mb-8">
                  {/* "4" */}
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      1, 0, 0, 1,
                      1, 0, 0, 1,
                      1, 1, 1, 1,
                      0, 0, 0, 1,
                      0, 0, 0, 1,
                    ].map((filled, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-sm transition-all duration-300 ${
                          filled 
                            ? 'bg-github-green-500 shadow-lg hover:bg-github-green-400' 
                            : 'bg-github-surface border border-github-border'
                        }`}
                        style={{
                          animationDelay: `${i * 50}ms`,
                          animation: filled ? 'glow 2s ease-in-out infinite alternate' : 'none'
                        }}
                      />
                    ))}
                  </div>

                  {/* "0" */}
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      0, 1, 1, 0,
                      1, 0, 0, 1,
                      1, 0, 0, 1,
                      1, 0, 0, 1,
                      0, 1, 1, 0,
                    ].map((filled, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-sm transition-all duration-300 ${
                          filled 
                            ? 'bg-github-green-500 shadow-lg hover:bg-github-green-400' 
                            : 'bg-github-surface border border-github-border'
                        }`}
                        style={{
                          animationDelay: `${(i + 20) * 50}ms`,
                          animation: filled ? 'glow 2s ease-in-out infinite alternate' : 'none'
                        }}
                      />
                    ))}
                  </div>

                  {/* "4" */}
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      1, 0, 0, 1,
                      1, 0, 0, 1,
                      1, 1, 1, 1,
                      0, 0, 0, 1,
                      0, 0, 0, 1,
                    ].map((filled, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-sm transition-all duration-300 ${
                          filled 
                            ? 'bg-github-green-500 shadow-lg hover:bg-github-green-400' 
                            : 'bg-github-surface border border-github-border'
                        }`}
                        style={{
                          animationDelay: `${(i + 40) * 50}ms`,
                          animation: filled ? 'glow 2s ease-in-out infinite alternate' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Glitch text effect */}
                <div className="text-8xl md:text-9xl font-bold text-gradient mb-4 font-mono tracking-wider min-h-[120px] md:min-h-[140px] flex items-center justify-center px-8">
                  <span className="inline-block min-w-[300px] md:min-w-[400px] text-center">
                    {glitchText}
                  </span>
                </div>
              </div>
            </div>

            {/* Floating broken squares */}
            <div className="absolute -top-10 -left-10 w-8 h-8 bg-github-green-400/30 rounded-sm animate-float rotate-12"></div>
            <div className="absolute -top-6 -right-8 w-6 h-6 bg-github-green-500/40 rounded-sm animate-bounce-slow rotate-45"></div>
            <div className="absolute -bottom-8 -left-6 w-5 h-5 bg-github-green-600/30 rounded-sm animate-pulse rotate-12"></div>
            <div className="absolute -bottom-10 -right-10 w-7 h-7 bg-github-green-400/20 rounded-sm animate-float rotate-45"></div>
          </div>

          {/* Content */}
          <div className="space-y-6 mb-12">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-github-text to-github-muted bg-clip-text text-transparent">
                This page took a
              </span>
              <br />
              <span className="relative">
                <span className="text-gradient animate-gradient bg-[length:200%_200%] bg-gradient-to-r from-github-green-400 via-github-green-500 to-github-green-600">
                  Coding Break
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-github-green-400 to-github-green-600 rounded-full opacity-50 animate-pulse"></div>
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl xl:text-2xl text-github-muted leading-relaxed max-w-3xl mx-auto">
              Looks like this page went on a permanent vacation! 🏖️ But don't worry, your 
              <span className="text-github-green-400 font-semibold"> contribution streak</span> is still safe.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <Link
              to="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-github-green-600 to-github-green-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:from-github-green-500 hover:to-github-green-400 hover:text-white focus:text-white active:text-white visited:text-white no-underline text-lg group"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return to Home Base
            </Link>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary text-lg group"
            >
              <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back in History
            </button>
          </div>

        </section>
      </main>
    </div>
  )
}

export default NotFoundPage