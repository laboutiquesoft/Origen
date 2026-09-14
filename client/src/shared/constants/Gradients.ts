// src/shared/constants/gradients.ts
export const CARD_GRADIENTS = {

  purpleIndigo: 'var(--gradient-purple-indigo)',
  pinkRose: 'var(--gradient-pink-rose)',
  emeraldTeal: 'var(--gradient-emerald-teal)',
  skyBlue: 'var(--gradient-sky-blue)',

  amberOrange: 'var(--gradient-amber-orange)',
  deepBlueCyan: 'var(--gradient-deep-blue-cyan)',
  violetFuchsia: 'var(--gradient-violet-fuchsia)',
  coralSunset: 'var(--gradient-coral-sunset)',
  mintGreen: 'var(--gradient-mint-green)',
  oceanBlue: 'var(--gradient-ocean-blue)',
  sunsetRed: 'var(--gradient-sunset-red)',
  royalPurple: 'var(--gradient-royal-purple)',
  warmPeach: 'var(--gradient-warm-peach)',
  electricIndigo: 'var(--gradient-electric-indigo)',
  darkMidnight: 'var(--gradient-dark-midnight)',
  goldenYellow: 'var(--gradient-golden-yellow)',

  'indigo-purple': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', // 1: Índigo -> Púrpura
  'rose-pink': 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',     // 2: Rojo -> Rosa
  'teal-emerald': 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',  // 3: Verde/Teal -> Esmeralda
  'amber-yellow': 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',  // 4: Ámbar -> Amarillo
  'purple-violet': 'linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)', // 5: Púrpura -> Violeta
  'cyan-sky': 'linear-gradient(135deg, #06b6d4 0%, #67e8f9 100%)',      // 6: Cian -> Cielo

  'blue-indigo': 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',   // 7: Azul Real
  'emerald-green': 'linear-gradient(135deg, #059669 0%, #34d399 100%)', // 8: Esmeralda Brillante
  'orange-amber': 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',  // 9: Naranja Cálido
  'fuchsia-pink': 'linear-gradient(135deg, #c026d3 0%, #f472b6 100%)',  // 10: Fucsia Elegante
  'violet-fuchsia': 'linear-gradient(135deg, #7c3aed 0%, #e879f9 100%)',// 11: Violeta Neón
  'slate-gray': 'linear-gradient(135deg, #334155 0%, #64748b 100%)',    // 12: Gris Pizarra (Neutro / Inactivo)
  'blue-cyan': 'linear-gradient(135deg, #0284c7 0%, #22d3ee 100%)',     // 13: Azul Océano
  'lime-emerald': 'linear-gradient(135deg, #65a30d 0%, #10b981 100%)',  // 14: Lima / Orgánico
  'red-orange': 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)',    // 15: Rojo Fuego / Alertas
  'dark-slate': 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',    // 16: Oscuro Profundo
  'pink-rose': 'linear-gradient(135deg, #db2777 0%, #fda4af 100%)',     // 17: Rosa Pastel / Suave
  'teal-cyan': 'linear-gradient(135deg, #0f766e 0%, #06b6d4 100%)',     // 18: Turquesa Intenso
  'olive': 'linear-gradient(135deg, #454546 0%, #60b614 100%)' //Olive




} as const;

export type CardGradientKey = keyof typeof CARD_GRADIENTS;