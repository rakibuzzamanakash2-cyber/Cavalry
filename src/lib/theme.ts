export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "cavalry-theme";

/**
 * Runs in <head> before first paint: applies the saved theme, or the system
 * preference when the visitor has not chosen one. Prevents a flash of the
 * wrong theme. Keep it tiny and dependency-free.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
