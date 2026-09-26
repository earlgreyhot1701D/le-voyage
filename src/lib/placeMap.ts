export function hasMapCoordinates(place: { latitude: number | null; longitude: number | null }): boolean {
  return place.latitude !== null && place.longitude !== null &&
    Number.isFinite(place.latitude) && Number.isFinite(place.longitude) &&
    Math.abs(place.latitude) <= 90 && Math.abs(place.longitude) <= 180;
}
