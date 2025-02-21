import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import InquiryForm from '../InquiryForm';
import '@testing-library/jest-dom';

describe('InquiryForm', () => {
  it('renders inquiry form', () => {
    const mockSubmit = jest.fn();
    render(<InquiryForm onSubmit={mockSubmit} />);
    
    expect(screen.getByPlaceholderText('ユーザーからの問い合わせ内容を入力してください')).toBeInTheDocument();
    expect(screen.getByText('AI回答を取得')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const mockSubmit = jest.fn();
    render(<InquiryForm onSubmit={mockSubmit} />);
    
    const textarea = screen.getByPlaceholderText('ユーザーからの問い合わせ内容を入力してください');
    const submitButton = screen.getByText('AI回答を取得');

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'テスト問い合わせ' } });
      fireEvent.click(submitButton);
    });

    expect(mockSubmit).toHaveBeenCalledWith('テスト問い合わせ');
  });
});
