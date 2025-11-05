import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemeColor = "default" | "blue" | "green" | "orange" | "purple" | "red";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultColor?: ThemeColor;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  themeColor: ThemeColor;
  setTheme: (theme: Theme) => void;
  setThemeColor: (color: ThemeColor) => void;
};

const initialState: ThemeProviderState = {
  theme: "dark",
  themeColor: "default",
  setTheme: () => null,
  setThemeColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  defaultColor = "default",
  storageKey = "evalscol-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  const [themeColor, setThemeColor] = useState<ThemeColor>(
    () => (localStorage.getItem(`${storageKey}-color`) as ThemeColor) || defaultColor
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.remove("theme-blue", "theme-green", "theme-orange", "theme-purple", "theme-red");

    root.classList.add(theme);
    if (themeColor !== "default") {
      root.classList.add(`theme-${themeColor}`);
    }
  }, [theme, themeColor]);

  const value = {
    theme,
    themeColor,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    setThemeColor: (color: ThemeColor) => {
      localStorage.setItem(`${storageKey}-color`, color);
      setThemeColor(color);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};