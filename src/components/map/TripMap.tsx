import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Tables } from '@/integrations/supabase/types';

type Place = Tables<'places'>;

interface TripMapProps {
  places: Place[];
  center?: { lat: number; lng: number };
  className?: string;
  onMarkerClick?: (place: Place) => void;
}

// Category to color mapping
const categoryColors: Record<string, string> = {
  'Food and Drink': '#D4AF37',  // amber-glass
  'Museum': '#77969A',           // seine-blue
  'Attraction': '#F4E295',       // amber-glow
  'Shopping': '#8B4513',         // iron-rust
  'Experience': '#1A3A32',       // metro-green
  'Transit': '#6B7280',
  'Lodging': '#4B5563',
  'Day Trip': '#374151',
  'Other': '#9CA3AF',
};

export function TripMap({ places, center, className, onMarkerClick }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Fetch token from Supabase secrets (stored as env var in edge function context)
  // For client-side, we'll check for the token in the window or use a placeholder
  useEffect(() => {
    // The token should be available from Supabase Edge Function secrets
    // For now, check localStorage or prompt user
    const storedToken = localStorage.getItem('MAPBOX_PUBLIC_TOKEN');
    if (storedToken) {
      setMapboxToken(storedToken);
    } else {
      // Try to get it from a meta tag or global (set by backend)
      const metaToken = document.querySelector('meta[name="mapbox-token"]')?.getAttribute('content');
      if (metaToken) {
        setMapboxToken(metaToken);
      }
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      // Default to Paris center if no center provided
      const mapCenter = center || { lat: 48.8566, lng: 2.3522 };

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [mapCenter.lng, mapCenter.lat],
        zoom: 12,
        pitch: 20,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );

      // Add places as markers
      map.current.on('load', () => {
        updateMarkers();
      });
    } catch (error) {
      console.error('Mapbox initialization error:', error);
      setTokenError('Failed to initialize map. Please check your Mapbox token.');
    }

    return () => {
      markers.current.forEach(m => m.remove());
      map.current?.remove();
    };
  }, [mapboxToken, center]);

  // Update markers when places change
  useEffect(() => {
    if (map.current && mapboxToken) {
      updateMarkers();
    }
  }, [places, mapboxToken]);

  const updateMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(m => m.remove());
    markers.current = [];

    // Add new markers for places with coordinates
    const placesWithCoords = places.filter(p => p.latitude && p.longitude);
    
    placesWithCoords.forEach(place => {
      if (!place.latitude || !place.longitude) return;

      const color = categoryColors[place.category] || categoryColors['Other'];
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.style.cssText = `
        width: 24px;
        height: 24px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      `;
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Create popup content with DOM methods to prevent XSS
      const popupDiv = document.createElement('div');
      popupDiv.style.cssText = 'font-family: system-ui; padding: 4px;';
      
      const nameEl = document.createElement('strong');
      nameEl.style.fontSize = '14px';
      nameEl.textContent = place.name; // textContent auto-escapes HTML
      popupDiv.appendChild(nameEl);
      
      const categoryEl = document.createElement('p');
      categoryEl.style.cssText = 'font-size: 12px; color: #666; margin: 4px 0 0 0;';
      categoryEl.textContent = place.category;
      popupDiv.appendChild(categoryEl);
      
      if (place.rating) {
        const ratingEl = document.createElement('p');
        ratingEl.style.cssText = 'font-size: 11px; color: #D4AF37; margin: 4px 0 0 0;';
        ratingEl.textContent = `★ ${place.rating}`;
        popupDiv.appendChild(ratingEl);
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat([Number(place.longitude), Number(place.latitude)])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupDiv)
        )
        .addTo(map.current!);

      if (onMarkerClick) {
        el.addEventListener('click', () => onMarkerClick(place));
      }

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (placesWithCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      placesWithCoords.forEach(p => {
        if (p.latitude && p.longitude) {
          bounds.extend([Number(p.longitude), Number(p.latitude)]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  };

  // Token input for when token is not set
  if (!mapboxToken) {
    return (
      <div className={`relative rounded-2xl overflow-hidden bg-muted ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">Enter your Mapbox public token to enable the map</p>
          <input
            type="text"
            placeholder="pk.eyJ1..."
            className="w-full max-w-xs p-2 rounded-lg border border-border text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const token = (e.target as HTMLInputElement).value.trim();
                if (token.startsWith('pk.')) {
                  localStorage.setItem('MAPBOX_PUBLIC_TOKEN', token);
                  setMapboxToken(token);
                }
              }
            }}
          />
          <p className="text-xs text-muted-foreground mt-2">Press Enter to save</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className={`relative rounded-2xl overflow-hidden bg-muted ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <p className="text-sm text-destructive">{tokenError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}>
      <div ref={mapContainer} className="absolute inset-0" />
      <div 
        className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-medium"
        style={{ 
          background: 'hsl(var(--metro-green))', 
          color: 'hsl(var(--amber-glass))' 
        }}
      >
        {places.filter(p => p.latitude && p.longitude).length} places mapped
      </div>
    </div>
  );
}

export default TripMap;
