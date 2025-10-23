
import { Link, useNavigate } from 'react-router-dom'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen flex items-center justify-center bg-github-bg text-github-text font-github px-6 py-12">
      <section className="w-full max-w-4xl mx-auto text-center">
        <div className="mx-auto w-40 h-40 rounded-2xl flex items-center justify-center bg-github-surface/60 border border-github-border/50 shadow-sm mb-6">
          {/* friendly illustration */}
          <svg className="w-20 h-20 text-red-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.5 9.5L14.5 14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.5 9.5L9.5 14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-3">Oops — this page doesn&rsquo;t exist</h1>
        <p className="text-base sm:text-lg text-github-muted mb-6">The page you&rsquo;re looking for was moved, removed, or never existed.</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-github-green-500 hover:bg-github-green-600 text-white rounded-md shadow-md">
            Return home
          </Link>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-3 border border-github-border/60 rounded-md text-github-text bg-github-surface/60 hover:bg-github-surface/70"
          >
            Go back
          </button>
        </div>

        <p className="mt-8 text-sm text-github-muted">Tip: check the URL for typos or head back to the homepage.</p>
      </section>
    </main>
  )
}

export default NotFoundPage