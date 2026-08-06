export type View = 'landing' | 'dashboard'

export type DashboardSection =
  | 'home'
  | 'assistant'
  | 'map'
  | 'budget'
  | 'weather'
  | 'translator'
  | 'emergency'
  | 'food'
  | 'ocr'
  | 'saved'
  | 'profile'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface SavedPlace {
  id: string
  name: string
  category: string
  address?: string | null
  rating?: number | null
  price?: string | null
  distance?: string | null
  notes?: string | null
  visited: boolean
  createdAt: string
}

export interface BudgetData {
  salary: number
  rent: number
  food: number
  transport: number
  utilities: number
  entertainment: number
  shopping: number
}

export interface UserProfile {
  id?: string
  name: string
  email: string
  avatar?: string | null
  occupation?: string | null
  language: string
  budget: number
  foodPref: string
  transport: string
  city?: string | null
  createdAt?: string
}

export interface WeatherDay {
  day: string
  temp: number
  condition: string
  icon: string
  humidity: number
  wind: number
  uv: number
}

export interface MapPlace {
  id: string
  name: string
  category: string
  rating: number
  price: string
  distance: string
  open: boolean
  address: string
  x: number // percentage position on the map canvas
  y: number
}

export const PLACE_CATEGORIES = [
  { id: 'restaurant', label: 'Restaurants', icon: 'Utensils' },
  { id: 'hotel', label: 'Hotels', icon: 'BedDouble' },
  { id: 'hostel', label: 'Hostels', icon: 'BedSingle' },
  { id: 'hospital', label: 'Hospitals', icon: 'PlusSquare' },
  { id: 'police', label: 'Police', icon: 'Shield' },
  { id: 'metro', label: 'Metro', icon: 'Train' },
  { id: 'bus', label: 'Bus Stops', icon: 'Bus' },
  { id: 'bank', label: 'Banks', icon: 'Landmark' },
  { id: 'atm', label: 'ATMs', icon: 'CreditCard' },
  { id: 'coworking', label: 'Coworking', icon: 'Briefcase' },
  { id: 'shopping', label: 'Shopping', icon: 'ShoppingBag' },
  { id: 'pharmacy', label: 'Pharmacy', icon: 'Pill' },
  { id: 'fuel', label: 'Fuel', icon: 'Fuel' },
  { id: 'tourist', label: 'Tourist', icon: 'Camera' },
] as const

export const LANGUAGES = [
  'English', 'Hindi', 'Telugu', 'Tamil', 'Kannada',
  'Malayalam', 'Marathi', 'Bengali', 'Punjabi', 'Gujarati',
  'Urdu', 'Odia',
]

export const PHRASE_BOOK = [
  { en: 'Hello', category: 'Greetings' },
  { en: 'Thank you', category: 'Greetings' },
  { en: 'How are you?', category: 'Greetings' },
  { en: 'Where is the nearest hospital?', category: 'Emergency' },
  { en: 'How much does this cost?', category: 'Shopping' },
  { en: 'Where is the bus stop?', category: 'Transport' },
  { en: 'I need help', category: 'Emergency' },
  { en: 'Can you help me?', category: 'General' },
  { en: 'I am vegetarian', category: 'Food' },
  { en: 'What is your name?', category: 'Greetings' },
]
