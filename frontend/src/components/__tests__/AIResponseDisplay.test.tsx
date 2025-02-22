import { render, screen } from '@testing-library/react';
import AIResponseDisplay from '../AIResponseDisplay';
import '@testing-library/jest-dom';

describe('AIResponseDisplay', () => {
  const mockResponse = {
    scenarios: [{
      reply: 'テスト返信',
      scenarioType: 'テストシナリオ',
      notes: 'テスト補足',
      sentiment: 'positive' as const
    }]
  };

  it('renders AI response when provided', () => {
    const mockResponse = {
      scenarios: [{
        reply: "Test reply",
        scenarioType: "Test type",
        notes: "Test notes",
        sentiment: "positive" as const
      }]
    };
    render(<AIResponseDisplay response={mockResponse} />);
    
    expect(screen.getByText('AI回答案')).toBeInTheDocument();
    expect(screen.getByText('テスト返信')).toBeInTheDocument();
    expect(screen.getByText('テストシナリオ')).toBeInTheDocument();
    expect(screen.getByText('テスト補足')).toBeInTheDocument();
  });

  it('renders nothing when response is null', () => {
    const { container } = render(<AIResponseDisplay response={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
