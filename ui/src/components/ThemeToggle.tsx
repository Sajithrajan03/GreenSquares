import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = (localStorage.getItem('theme') as Theme | null);
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Optional: react to system theme changes if user hasn't explicitly chosen
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    return (
        <button
            type="button"
            aria-label="Toggle theme"
            aria-pressed={theme === 'dark'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
            className="relative group p-3 rounded-xl glass-effect border border-github-border/20 hover:border-github-green-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
            {/* Background glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-github-green-600/10 to-github-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Icon container */}
            <div className="relative flex items-center justify-center w-6 h-6">
                {/* Sun icon (when in light mode, show sun) */}
                <svg
                    className={`absolute w-5 h-5 transition-all duration-500 ${
                        theme === 'light'
                            ? 'opacity-100 rotate-0 scale-100 text-github-green-600 drop-shadow-[0_0_4px_rgba(34,197,94,0.7)]'
                            : 'opacity-0 rotate-180 scale-75 text-github-green-400'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                </svg>

                {/* Moon icon (when in dark mode, show moon) */}
                <svg
                    className={`absolute w-5 h-5 transition-all duration-500 ${
                        theme === 'dark'
                            ? 'opacity-100 rotate-0 scale-100 text-github-green-400 drop-shadow-[0_0_6px_rgba(74,222,128,0.6)]'
                            : 'opacity-0 -rotate-180 scale-75 text-github-green-400'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                >
                    <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
                </svg>
            </div>

            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 rounded-xl bg-github-green-500/20 opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"></div>
        </button>
    );
}