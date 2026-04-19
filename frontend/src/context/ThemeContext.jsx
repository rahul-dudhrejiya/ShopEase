// WHAT: Dark/Light mode toggle
// WHY: Modern apps need dark mode — 
//      82% of users prefer dark mode
// HOW: Add/remove 'dark' class on <html> tag
//      Tailwind picks up 'dark' class and switches styles

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        // WHY arrow function in useState?
        // Lazy initialization — runs once on mount
        // Reads from localStorage to remember preference
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            // WHY documentElement? That's the <html> tag
            // Adding 'dark' class → Tailwind activates dark styles
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark((prev) => !prev);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);