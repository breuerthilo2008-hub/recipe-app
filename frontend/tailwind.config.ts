import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: '#F8F3EC', // Heirloom Warm Beige
  			foreground: '#3D3128', // Heirloom Warm Brown
  			primary: {
  				DEFAULT: '#7D8C7C', // Heirloom Sage Green
  				foreground: '#F8F3EC'
  			},
  			secondary: {
  				DEFAULT: '#D9C5B2', // Warm Sand
  				foreground: '#3D3128'
  			},
  			accent: {
  				DEFAULT: '#A67C52', // Toasted Almond
  				foreground: '#F8F3EC'
  			},
  			card: {
  				DEFAULT: '#FFFFFF',
  				foreground: '#3D3128'
  			},
  			border: '#E2E8F0'
  		},
  		borderRadius: {
  			'2xl': '1rem'
  		},
  		fontFamily: {
  			sans: ['Plus Jakarta Sans', 'sans-serif']
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
