/// <reference types="@testing-library/jest-dom" />
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import AIResponseDisplay from '../AIResponseDisplay';
import { AIResponse } from '../../types/types';
import '@testing-library/jest-dom/extend-expect';

describe('AIResponseDisplay', () => {
  const mockResponse: AIResponse = {
    scenarios: [{
      reply: 'テスト返信',
      scenarioType: 'テストシナリオ',
      notes: 'テスト補足',
      sentiment: 'positive'
    }]
  };

  it('renders AI response when provided', () => {
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
