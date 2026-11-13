import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../../src/App';

describe('App Component', () => {
  beforeEach(() => {
    // Mock the browser WebSocket
    vi.stubGlobal(
      'WebSocket',
      vi.fn(() => ({
        send: vi.fn(),
        close: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        binaryType: 'blob',
      }))
    );
  });

  it('starts in a connecting state', () => {
    render(<App />);
    const statusText = screen.getByText(/Connecting to the Void/i);
    expect(statusText).toBeInTheDocument();
  });
});
