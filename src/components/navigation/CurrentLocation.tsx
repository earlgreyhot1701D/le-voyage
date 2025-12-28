interface CurrentLocationProps {
  neighborhood: string;
}

export function CurrentLocation({ neighborhood }: CurrentLocationProps) {
  return (
    <div className="mt-auto p-5 rounded-[15px]" style={{ background: 'rgba(0,0,0,0.2)' }}>
      <p className="text-[11px] opacity-70 uppercase tracking-wider mb-1">
        Currently In
      </p>
      <p className="font-serif text-lg text-sidebar-primary">
        {neighborhood}
      </p>
    </div>
  );
}
