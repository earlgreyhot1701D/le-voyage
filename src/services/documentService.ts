import { TravelDocument } from '@/types';

const mockDocuments: TravelDocument[] = [
  {
    id: 'doc1',
    user_id: 'mock-user-1',
    trip_id: '1',
    document_type: 'passport',
    title: 'US Passport',
    file_url: null,
    expiry_date: '2028-06-15',
    notes: 'Renewed in 2023',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'doc2',
    user_id: 'mock-user-1',
    trip_id: '1',
    document_type: 'ticket',
    title: 'Flight to Paris',
    file_url: null,
    expiry_date: null,
    notes: 'Confirmation: ABC123',
    created_at: '2025-01-02T00:00:00Z',
  },
];

export const documentService = {
  async getDocuments(userId: string, tripId?: string): Promise<TravelDocument[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    let docs = mockDocuments.filter(d => d.user_id === userId);
    if (tripId) {
      docs = docs.filter(d => d.trip_id === tripId);
    }
    return docs;
  },

  async getDocumentById(id: string): Promise<TravelDocument | null> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return mockDocuments.find(d => d.id === id) || null;
  },

  async uploadDocument(doc: Omit<TravelDocument, 'id' | 'created_at'>): Promise<TravelDocument> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newDoc: TravelDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    mockDocuments.push(newDoc);
    return newDoc;
  },

  async deleteDocument(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 150));
    const index = mockDocuments.findIndex(d => d.id === id);
    if (index === -1) return false;
    mockDocuments.splice(index, 1);
    return true;
  },
};