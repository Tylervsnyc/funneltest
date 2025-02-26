import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeaderboardForm from '../LeaderboardForm';

// Mock react-confetti
jest.mock('react-confetti', () => {
  return function DummyConfetti() {
    return null;
  };
});

// Mock the sound effects
jest.mock('../../utils/sound', () => ({
  playSound: jest.fn()
}));

// Mock AllLeaderboards component
jest.mock('../AllLeaderboards', () => {
  return function DummyAllLeaderboards() {
    return null;
  };
});

// Mock Supabase client
const mockSupabaseInsert = jest.fn();
const mockSupabaseSelect = jest.fn();
const mockSupabaseSingle = jest.fn();

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert: (...args: any[]) => {
        mockSupabaseInsert(...args);
        return {
          select: () => {
            mockSupabaseSelect();
            return {
              single: () => mockSupabaseSingle()
            };
          }
        };
      }
    })
  }
}));

describe('LeaderboardForm', () => {
  const defaultProps = {
    score: 6,
    ageGroup: '8-9'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseSingle.mockResolvedValue({ data: {}, error: null });
  });

  test('renders form correctly', () => {
    render(<LeaderboardForm {...defaultProps} />);
    expect(screen.getByLabelText(/Your Initials/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Email/i)).toBeInTheDocument();
  });

  test('validates initials format', async () => {
    render(<LeaderboardForm {...defaultProps} />);
    
    const initialsInput = screen.getByLabelText(/Your Initials/i);
    const emailInput = screen.getByLabelText(/Your Email/i);
    const submitButton = screen.getByText(/Join the Leaderboard!/i);

    // Test invalid initials
    fireEvent.change(initialsInput, { target: { value: '12' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent(/Please enter exactly 3 letters/i);
  });

  test('validates email format', async () => {
    render(<LeaderboardForm {...defaultProps} />);
    
    const initialsInput = screen.getByLabelText(/Your Initials/i);
    const emailInput = screen.getByLabelText(/Your Email/i);
    
    // Test invalid email
    fireEvent.change(initialsInput, { target: { value: 'ABC' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    expect(emailInput).toBeInvalid();
  });

  test('handles successful submission', async () => {
    mockSupabaseSingle.mockResolvedValueOnce({ data: { id: 1 }, error: null });
    
    render(<LeaderboardForm {...defaultProps} />);
    
    const initialsInput = screen.getByLabelText(/Your Initials/i);
    const emailInput = screen.getByLabelText(/Your Email/i);
    const submitButton = screen.getByText(/Join the Leaderboard!/i);

    fireEvent.change(initialsInput, { target: { value: 'ABC' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSupabaseInsert).toHaveBeenCalledWith([{
        initials: 'ABC',
        email: 'test@example.com',
        score: 6,
        age_group: '8-9'
      }]);
    });
  });

  test('handles database error', async () => {
    mockSupabaseSingle.mockResolvedValueOnce({ 
      data: null, 
      error: { message: 'Database error', code: 'PGRST301' } 
    });

    render(<LeaderboardForm {...defaultProps} />);
    
    const initialsInput = screen.getByLabelText(/Your Initials/i);
    const emailInput = screen.getByLabelText(/Your Email/i);
    const submitButton = screen.getByText(/Join the Leaderboard!/i);

    fireEvent.change(initialsInput, { target: { value: 'ABC' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent(/Permission denied/i);
  });

  test('handles edge case emails', async () => {
    mockSupabaseSingle.mockResolvedValue({ data: { id: 1 }, error: null });

    const edgeCaseEmails = [
      'very.long.email.address.that.is.valid@really.long.domain.name.com',
      'email+with-special_chars@domain.com',
      'email@domain.co.uk',
      'first.last@subdomain.domain.com'
    ];

    for (const email of edgeCaseEmails) {
      render(<LeaderboardForm {...defaultProps} />);
      
      const initialsInput = screen.getByLabelText(/Your Initials/i);
      const emailInput = screen.getByLabelText(/Your Email/i);
      const submitButton = screen.getByText(/Join the Leaderboard!/i);

      fireEvent.change(initialsInput, { target: { value: 'ABC' } });
      fireEvent.change(emailInput, { target: { value: email } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSupabaseInsert).toHaveBeenCalledWith([{
          initials: 'ABC',
          email,
          score: 6,
          age_group: '8-9'
        }]);
      });
    }
  });

  test('handles special character initials', async () => {
    mockSupabaseSingle.mockResolvedValue({ data: { id: 1 }, error: null });

    const specialInitials = ['ABC', 'XYZ', 'MNO'];

    for (const initials of specialInitials) {
      render(<LeaderboardForm {...defaultProps} />);
      
      const initialsInput = screen.getByLabelText(/Your Initials/i);
      const emailInput = screen.getByLabelText(/Your Email/i);
      const submitButton = screen.getByText(/Join the Leaderboard!/i);

      fireEvent.change(initialsInput, { target: { value: initials } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSupabaseInsert).toHaveBeenCalledWith([{
          initials,
          email: 'test@example.com',
          score: 6,
          age_group: '8-9'
        }]);
      });
    }
  });

  test('handles empty error object', async () => {
    mockSupabaseSingle.mockResolvedValueOnce({ 
      data: null, 
      error: {} 
    });

    render(<LeaderboardForm {...defaultProps} />);
    
    const initialsInput = screen.getByLabelText(/Your Initials/i);
    const emailInput = screen.getByLabelText(/Your Email/i);
    const submitButton = screen.getByText(/Join the Leaderboard!/i);

    fireEvent.change(initialsInput, { target: { value: 'ABC' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent(/Connection error/i);
  });

  test('handles undefined error message', async () => {
    mockSupabaseSingle.mockResolvedValueOnce({ 
      data: null, 
      error: { code: 'UNKNOWN' } 
    });

    render(<LeaderboardForm {...defaultProps} />);
    
    const initialsInput = screen.getByLabelText(/Your Initials/i);
    const emailInput = screen.getByLabelText(/Your Email/i);
    const submitButton = screen.getByText(/Join the Leaderboard!/i);

    fireEvent.change(initialsInput, { target: { value: 'ABC' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent(/Unknown error occurred/i);
  });
}); 