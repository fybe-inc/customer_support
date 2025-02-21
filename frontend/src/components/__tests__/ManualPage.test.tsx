import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import ManualPage from '../../app/manual/page';
import '@testing-library/jest-dom';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('ManualPage', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify([]));
  });

  it('renders manual management page', () => {
    render(<ManualPage />);
    expect(screen.getByText('マニュアル管理')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/マニュアル内容を入力してください/)).toBeInTheDocument();
    expect(screen.getByText('保存')).toBeInTheDocument();
  });

  it('handles manual entry submission', async () => {
    render(<ManualPage />);
    
    const textarea = screen.getByPlaceholderText(/マニュアル内容を入力してください/);
    const submitButton = screen.getByText('保存');

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'テストマニュアル' } });
      fireEvent.click(submitButton);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    expect(textarea).toHaveValue('');
  });
});
