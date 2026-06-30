export const CAR_COLORS = {
  white: {
    name: "White",
    hex: "#FFFFFF",
  },
  pearlWhite: {
    name: "Pearl White",
    hex: "#F7F7F2",
  },
  silver: {
    name: "Silver",
    hex: "#C0C0C0",
  },
  metallicSilver: {
    name: "Metallic Silver",
    hex: "#A7ADB5",
  },
  gray: {
    name: "Gray",
    hex: "#808080",
  },
  gunmetalGray: {
    name: "Gunmetal Gray",
    hex: "#4B5058",
  },
  charcoal: {
    name: "Charcoal",
    hex: "#36454F",
  },
  black: {
    name: "Black",
    hex: "#000000",
  },
  jetBlack: {
    name: "Jet Black",
    hex: "#0D0D0D",
  },
  midnightBlack: {
    name: "Midnight Black",
    hex: "#1A1A24",
  },
  red: {
    name: "Red",
    hex: "#D32F2F",
  },
  racingRed: {
    name: "Racing Red",
    hex: "#C00000",
  },
  burgundy: {
    name: "Burgundy",
    hex: "#800020",
  },
  blue: {
    name: "Blue",
    hex: "#1976D2",
  },
  navyBlue: {
    name: "Navy Blue",
    hex: "#1A237E",
  },
  royalBlue: {
    name: "Royal Blue",
    hex: "#2962FF",
  },
  electricBlue: {
    name: "Electric Blue",
    hex: "#0096FF",
  },
  lightBlue: {
    name: "Light Blue",
    hex: "#64B5F6",
  },
  green: {
    name: "Green",
    hex: "#2E7D32",
  },
  britishRacingGreen: {
    name: "British Racing Green",
    hex: "#004225",
  },
  limeGreen: {
    name: "Lime Green",
    hex: "#7FFF00",
  },
  yellow: {
    name: "Yellow",
    hex: "#FFD600",
  },
  canaryYellow: {
    name: "Canary Yellow",
    hex: "#FFEF00",
  },
  orange: {
    name: "Orange",
    hex: "#F57C00",
  },
  burntOrange: {
    name: "Burnt Orange",
    hex: "#CC5500",
  },
  gold: {
    name: "Gold",
    hex: "#D4AF37",
  },
  bronze: {
    name: "Bronze",
    hex: "#B08D57",
  },
  brown: {
    name: "Brown",
    hex: "#6D4C41",
  },
  beige: {
    name: "Beige",
    hex: "#D6C4A1",
  },
  champagne: {
    name: "Champagne",
    hex: "#F7E7CE",
  },
  purple: {
    name: "Purple",
    hex: "#6A1B9A",
  },
  violet: {
    name: "Violet",
    hex: "#8A2BE2",
  },
  pink: {
    name: "Pink",
    hex: "#E91E63",
  },
  cyan: {
    name: "Cyan",
    hex: "#00BCD4",
  },
  teal: {
    name: "Teal",
    hex: "#00796B",
  },
  turquoise: {
    name: "Turquoise",
    hex: "#40E0D0",
  },
} as const

// Optional: array for dropdowns/selects
export const CAR_COLOR_OPTIONS = Object.entries(CAR_COLORS).map(
  ([value, color]) => ({
    value,
    label: color.name,
    hex: color.hex,
  })
)


export const COMMON_CAR_COLORS = {
  white: {
    name: "White",
    hex: "#FFFFFF",
  },
  black: {
    name: "Black",
    hex: "#000000",
  },
  gray: {
    name: "Gray",
    hex: "#808080",
  },
  silver: {
    name: "Silver",
    hex: "#C0C0C0",
  },
  blue: {
    name: "Blue",
    hex: "#1976D2",
  },
  red: {
    name: "Red",
    hex: "#D32F2F",
  },
  green: {
    name: "Green",
    hex: "#2E7D32",
  },
  brown: {
    name: "Brown",
    hex: "#6D4C41",
  },
  beige: {
    name: "Beige / Champagne",
    hex: "#D6C4A1",
  },
  yellow: {
    name: "Yellow / Gold",
    hex: "#FFD600",
  },
} as const;