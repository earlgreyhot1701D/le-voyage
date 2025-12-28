import type { Trip, TripDay } from '@/types/trip';
import type { Place } from '@/types/place';
import type { ItineraryItem } from '@/types/itinerary';
import type { Insight } from '@/types/insight';

// === TRIP ===
export const fixtureTrip: Trip = {
  id: 'trip-paris-spring-2025',
  user_id: 'fixture-user-1',
  title: 'Paris · Spring 2025',
  destination: 'Paris, France',
  start_date: '2025-04-12',
  end_date: '2025-04-18',
  status: 'planning',
  cover_image_url: null,
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
};

// === AREAS (untyped fixture-only) ===
export const fixtureAreas = [
  { id: 'area-paris', name: 'Paris' },
  { id: 'area-champagne', name: 'Champagne Day Trip' },
  { id: 'area-versailles', name: 'Versailles' },
];

// === PLACES ===
export const fixturePlaces: Place[] = [
  {
    id: 'place-cafe-flore',
    name: 'Café de Flore',
    arrondissement: '6th',
    neighborhood_name: 'Saint-Germain-des-Prés',
    category: 'Food and Drink',
    rating: 4.5,
    badge: 'Iconic',
    area_id: 'area-paris',
  },
  {
    id: 'place-orsay',
    name: "Musée d'Orsay",
    arrondissement: '7th',
    neighborhood_name: 'Saint-Germain-des-Prés',
    category: 'Museum',
    rating: 4.8,
    badge: null,
    area_id: 'area-paris',
  },
  {
    id: 'place-train-bleu',
    name: 'Le Train Bleu',
    arrondissement: '12th',
    neighborhood_name: 'Gare de Lyon',
    category: 'Food and Drink',
    rating: 4.3,
    badge: 'Art Nouveau',
    area_id: 'area-paris',
  },
  {
    id: 'place-pompidou',
    name: 'Centre Pompidou',
    arrondissement: '4th',
    neighborhood_name: 'Le Marais',
    category: 'Museum',
    rating: 4.6,
    badge: null,
    area_id: 'area-paris',
  },
  {
    id: 'place-sacre-coeur',
    name: 'Sacré-Cœur',
    arrondissement: '18th',
    neighborhood_name: 'Montmartre',
    category: 'Attraction',
    rating: 4.7,
    badge: 'Must See',
    area_id: 'area-paris',
  },
  {
    id: 'place-moet',
    name: 'Moët & Chandon',
    arrondissement: null,
    neighborhood_name: 'Épernay',
    category: 'Experience',
    rating: 4.5,
    badge: 'Premium',
    area_id: 'area-champagne',
  },
  {
    id: 'place-versailles-palace',
    name: 'Palace of Versailles',
    arrondissement: null,
    neighborhood_name: 'Versailles',
    category: 'Attraction',
    rating: 4.9,
    badge: 'UNESCO',
    area_id: 'area-versailles',
  },
];

// === TRIP DAYS ===
export const fixtureTripDays: TripDay[] = [
  { id: 'd1', trip_id: 'trip-paris-spring-2025', date: '2025-04-12', day_number: 1, label: 'Mon 12', title: 'Monday in the 6th', neighborhood_focus: '6th Arrondissement' },
  { id: 'd2', trip_id: 'trip-paris-spring-2025', date: '2025-04-13', day_number: 2, label: 'Tue 13', title: 'Tuesday in Le Marais', neighborhood_focus: 'Le Marais' },
  { id: 'd3', trip_id: 'trip-paris-spring-2025', date: '2025-04-14', day_number: 3, label: 'Wed 14', title: 'Wednesday in Montmartre', neighborhood_focus: 'Montmartre' },
  { id: 'd4', trip_id: 'trip-paris-spring-2025', date: '2025-04-15', day_number: 4, label: 'Thu 15', title: 'Champagne Day Trip', neighborhood_focus: 'Champagne Region' },
  { id: 'd5', trip_id: 'trip-paris-spring-2025', date: '2025-04-16', day_number: 5, label: 'Fri 16', title: 'Friday at Versailles', neighborhood_focus: 'Versailles' },
];

// === ITINERARY ITEMS ===
export const fixtureItineraryItems: ItineraryItem[] = [
  // Day 1 - 6th
  {
    id: 'item-1',
    trip_day_id: 'd1',
    place_id: 'place-cafe-flore',
    time: '09:30',
    title: 'Petit Déjeuner at Café de Flore',
    description: 'Historical landmark. Try the "Chocolat Spécial Flore".',
    notes: null,
    added_by_display_name: 'Marie L.',
    ticket: null,
  },
  {
    id: 'item-2',
    trip_day_id: 'd1',
    place_id: 'place-orsay',
    time: '11:00',
    title: "Musée d'Orsay",
    description: 'Guided tour of the Impressionist level. Entrance via Door C.',
    notes: 'Book tickets in advance',
    added_by_display_name: 'Jean P.',
    ticket: { id: 'LV-99201', pdf_url: '#' },
  },
  {
    id: 'item-3',
    trip_day_id: 'd1',
    place_id: 'place-train-bleu',
    time: '13:30',
    title: 'Le Train Bleu',
    description: 'Lunch reservation for 2. Art Nouveau interiors.',
    notes: null,
    added_by_display_name: 'Marie L.',
    ticket: null,
  },
  // Day 2 - Le Marais
  {
    id: 'item-4',
    trip_day_id: 'd2',
    place_id: 'place-pompidou',
    time: '10:00',
    title: 'Centre Pompidou',
    description: 'Modern art collection. Rooftop terrace has amazing views.',
    notes: null,
    added_by_display_name: 'Jean P.',
    ticket: { id: 'LV-99202', pdf_url: '#' },
  },
  // Day 3 - Montmartre
  {
    id: 'item-5',
    trip_day_id: 'd3',
    place_id: 'place-sacre-coeur',
    time: '09:00',
    title: 'Sacré-Cœur Basilica',
    description: 'Morning visit before crowds. Climb to the dome for panoramic views.',
    notes: 'Wear comfortable shoes',
    added_by_display_name: 'Marie L.',
    ticket: null,
  },
  // Day 4 - Champagne
  {
    id: 'item-6',
    trip_day_id: 'd4',
    place_id: 'place-moet',
    time: '11:00',
    title: 'Moët & Chandon Tour',
    description: 'Private cellar tour and tasting. Imperial Brut included.',
    notes: 'Driver arranged',
    added_by_display_name: 'Jean P.',
    ticket: { id: 'LV-99203', pdf_url: '#' },
  },
  // Day 5 - Versailles
  {
    id: 'item-7',
    trip_day_id: 'd5',
    place_id: 'place-versailles-palace',
    time: '09:30',
    title: 'Palace of Versailles',
    description: 'Full day exploring the palace, gardens, and Trianon estates.',
    notes: 'Bring water and snacks',
    added_by_display_name: 'Marie L.',
    ticket: { id: 'LV-99204', pdf_url: '#' },
  },
];

// === INTELLIGENCE INSIGHTS ===
export const fixtureInsights: Insight[] = [
  {
    id: 'insight-6th',
    neighborhood_focus: '6th Arrondissement',
    title: 'Intelligence: Saint-Germain',
    content: "The archives suggest the Luxembourg Gardens are particularly beautiful at this hour. It's a 5-minute walk from Café de Flore.",
    action_label: 'View Route',
  },
  {
    id: 'insight-marais',
    neighborhood_focus: 'Le Marais',
    title: 'Intelligence: Le Marais',
    content: "The archives suggest the Passage des Panoramas is less crowded at this hour. It's a 12-minute walk from your current location.",
    action_label: 'Reroute Journey',
  },
  {
    id: 'insight-montmartre',
    neighborhood_focus: 'Montmartre',
    title: 'Intelligence: Montmartre',
    content: 'The artists at Place du Tertre set up around 10am. Arrive early for the best portraits and avoid the lunch rush.',
    action_label: 'See Schedule',
  },
  {
    id: 'insight-champagne',
    neighborhood_focus: 'Champagne Region',
    title: 'Intelligence: Épernay',
    content: 'The Avenue de Champagne cellars are interconnected. Consider walking between houses rather than driving.',
    action_label: 'Walking Route',
  },
  {
    id: 'insight-versailles',
    neighborhood_focus: 'Versailles',
    title: 'Intelligence: Versailles',
    content: "The Petit Trianon is often overlooked by visitors. Marie Antoinette's hamlet is best visited in late afternoon light.",
    action_label: 'Add to Plan',
  },
];
