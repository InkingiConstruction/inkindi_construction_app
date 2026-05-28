/**
 * FILE NAME   : colors.ts
 * WHAT IT DOES: Returns theme-aware Tailwind className strings for the Client dashboard.
 *               Import this in every tab/modal that needs light/dark mode support.
 */
export function getColors(isDark: boolean) {
  return {
    bg:       isDark ? 'bg-slate-900'               : 'bg-slate-50',
    card:     isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm',
    text:     isDark ? 'text-white'                 : 'text-slate-900',
    textMuted:isDark ? 'text-slate-400'             : 'text-slate-500',
    tabBar:   isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200',
    inputBg:  isDark ? 'bg-slate-950 border-slate-800'    : 'bg-slate-100 border-slate-200',
  };
}

export type DashColors = ReturnType<typeof getColors>;
