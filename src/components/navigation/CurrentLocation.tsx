interface CurrentLocationProps {
  city: string;
  neighborhood: string;
}

export function CurrentLocation({ city, neighborhood }: CurrentLocationProps) {
  return (
    <div className="mx-4 mb-4 p-4 bg-sidebar-accent rounded-lg">
      <p className="text-xs font-sans font-semibold tracking-wider text-sidebar-foreground/60 uppercase mb-1">
        Currently Exploring
      </p>
      <p className="font-serif text-lg font-medium text-sidebar-foreground">
        {neighborhood}
      </p>
      <p className="text-sm text-sidebar-foreground/80">
        {city}
      </p>
    </div>
  );
}