/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bg-primary': '#060B18',
                'bg-card': '#0D1526',
                'bg-elevated': '#131F35',
                'border-subtle': '#1C2D4A',
                'border-accent': '#1E3A5F',
                'cyan': '#00E5FF',
                'gold': '#F0B429',
                'green': '#00D68F',
                'amber': '#FFAA00',
                'red': '#F7645A',
                'violet': '#8B5CF6',
                'text-primary': '#F0F4FF',
                'text-secondary': '#8899BB',
                'text-muted': '#4A5E7A',
            },
            fontFamily: {
                'display': ['"Bebas Neue"', 'sans-serif'],
                'body': ['"DM Sans"', 'sans-serif'],
                'mono': ['"JetBrains Mono"', 'monospace'],
            },
        },
    },
    plugins: [],
}
