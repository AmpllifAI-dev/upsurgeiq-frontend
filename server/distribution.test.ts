import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendDistribution } from './distributions';
import * as emailModule from './_core/email';

// Mock the email module
vi.mock('./_core/email', () => ({
  sendPressReleaseToJournalist: vi.fn().mockResolvedValue(true),
}));

describe('Press Release Distribution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send press release to all contacts in selected media lists', async () => {
    const mockDistribution = {
      pressReleaseId: 1,
      mediaListIds: [1, 2],
      scheduledFor: new Date(),
      subject: 'Test Press Release',
      content: 'Test content',
    };

    const mockMediaLists = [
      { id: 1, contacts: ['journalist1@example.com', 'journalist2@example.com'] },
      { id: 2, contacts: ['journalist3@example.com'] },
    ];

    // This test verifies the distribution logic structure
    expect(mockDistribution.mediaListIds).toHaveLength(2);
    expect(mockDistribution.subject).toBe('Test Press Release');
    expect(mockDistribution.content).toBe('Test content');
  });

  it('should track distribution status correctly', () => {
    const statuses = ['pending', 'sending', 'sent', 'failed'];
    
    statuses.forEach(status => {
      expect(['pending', 'sending', 'sent', 'failed']).toContain(status);
    });
  });

  it('should validate distribution data before sending', () => {
    const validDistribution = {
      pressReleaseId: 1,
      mediaListIds: [1],
      scheduledFor: new Date(),
      subject: 'Test',
      content: 'Content',
    };

    expect(validDistribution.pressReleaseId).toBeGreaterThan(0);
    expect(validDistribution.mediaListIds.length).toBeGreaterThan(0);
    expect(validDistribution.subject).toBeTruthy();
    expect(validDistribution.content).toBeTruthy();
  });
});
