import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeType = 'cyberpunk' | 'toxic' | 'synthwave' | 'nebula' | 'gold';

interface ThemeConfig {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
    cyberpunk: {
        background: '224 71% 4%',
        foreground: '213 31% 91%',
        primary: '190 100% 50%', // Cyan
        secondary: '262 80% 50%', // Purple
        accent: '320 100% 55%', // Magenta
    },
    toxic: {
        background: '142 80% 3%',
        foreground: '142 70% 90%',
        primary: '142 100% 50%', // Neon Green
        secondary: '60 100% 50%', // Yellow
        accent: '180 100% 50%', // Teal
    },
    synthwave: {
        background: '280 60% 5%',
        foreground: '280 40% 95%',
        primary: '320 100% 60%', // Hot Pink
        secondary: '200 100% 50%', // Blue
        accent: '45 100% 50%', // Orange
    },
    nebula: {
        background: '230 60% 4%',
        foreground: '230 30% 92%',
        primary: '260 100% 70%', // Light Purple
        secondary: '340 100% 60%', // Crimson
        accent: '200 100% 60%', // Sky Blue
    },
    gold: {
        background: '35 30% 4%',
        foreground: '45 30% 90%',
        primary: '45 100% 50%', // Gold
        secondary: '20 100% 50%', // Copper
        accent: '160 100% 50%', // Emerald
    }
};

interface ThemeState {
    currentTheme: ThemeType;
    setTheme: (theme: ThemeType) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            currentTheme: 'cyberpunk',
            setTheme: (theme: ThemeType) => set({ currentTheme: theme }),
        }),
        {
            name: 'one-stroke-theme',
        }
    )
);
