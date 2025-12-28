import { AppShell, MainContent, RightPanel } from '@/components/layout';

const mockDocuments = [
  {
    id: 'doc1',
    type: 'passport',
    title: 'US Passport',
    expiryDate: '2028-06-15',
    notes: 'Renewed in 2023',
  },
  {
    id: 'doc2',
    type: 'ticket',
    title: 'Flight to Paris',
    expiryDate: null,
    notes: 'Confirmation: ABC123',
  },
  {
    id: 'doc3',
    type: 'reservation',
    title: 'Hotel Le Marais',
    expiryDate: null,
    notes: 'Check-in: 3PM, Booking: HLM-789',
  },
];

const typeIcons: Record<string, string> = {
  passport: '⊞',
  visa: '⊠',
  ticket: '✈',
  reservation: '⌂',
  insurance: '☂',
  other: '✉',
};

function DocumentCard({ document }: { document: typeof mockDocuments[0] }) {
  return (
    <div className="content-card hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl text-primary">
          {typeIcons[document.type] || '✉'}
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {document.title}
          </h3>
          <p className="text-sm text-muted-foreground capitalize">{document.type}</p>
          {document.expiryDate && (
            <p className="text-sm text-muted-foreground mt-1">
              Expires: {new Date(document.expiryDate).toLocaleDateString()}
            </p>
          )}
          {document.notes && (
            <p className="text-sm text-muted-foreground mt-1">{document.notes}</p>
          )}
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
          ⋮
        </button>
      </div>
    </div>
  );
}

function DocumentsSummary() {
  return (
    <RightPanel title="Documents Summary">
      <div className="space-y-4">
        <div className="p-4 bg-primary/10 rounded-lg">
          <p className="text-sm font-medium text-primary">All documents valid</p>
          <p className="text-xs text-muted-foreground mt-1">No expiring documents in the next 6 months</p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">By Type</h4>
          <div className="space-y-2">
            {Object.entries(typeIcons).slice(0, 4).map(([type, icon]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span className="capitalize">{type}</span>
                </span>
                <span className="text-muted-foreground">
                  {mockDocuments.filter((d) => d.type === type).length}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="font-serif font-semibold mb-3">Quick Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Keep digital copies of all documents</li>
          <li>• Check passport validity (6+ months)</li>
          <li>• Save confirmation numbers offline</li>
        </ul>
      </div>
    </RightPanel>
  );
}

export default function DocumentsPage() {
  return (
    <AppShell rightPanel={<DocumentsSummary />}>
      <MainContent
        title="Travel Documents"
        subtitle="Store and manage your important travel documents"
      >
        <div className="space-y-4">
          {mockDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>

        <button className="mt-6 w-full p-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
          <span className="text-xl">+</span>
          <span>Upload Document</span>
        </button>
      </MainContent>
    </AppShell>
  );
}