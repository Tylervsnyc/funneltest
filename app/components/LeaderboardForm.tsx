'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../lib/supabase';
import Confetti from 'react-confetti';
import { playSound } from '../utils/sound';
import AllLeaderboards from './AllLeaderboards';

interface LeaderboardFormProps {
  score: number;
  ageGroup: string;
}

export default function LeaderboardForm({ score, ageGroup }: LeaderboardFormProps) {
  const [initials, setInitials] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(score > 5);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Play appropriate sound effect
    if (score > 5) {
      playSound('perfect');
    } else {
      playSound('applause');
    }

    // Update window size for confetti
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [score]);

  const validateInitials = (value: string) => {
    if (value && !value.match(/^[A-Za-z]{3}$/)) {
      setError('Please enter exactly 3 letters for your initials.');
    } else {
      setError('');
    }
  };

  const handleInitialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setInitials(value);
    validateInitials(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation for initials
    if (!initials.match(/^[A-Za-z]{3}$/)) {
      setError('Please enter exactly 3 letters for your initials.');
      return;
    }

    try {
      const { data, error: supabaseError } = await supabase
        .from('quiz_results')
        .insert([
          {
            initials: initials.toUpperCase(),
            email,
            score,
            age_group: ageGroup,
          },
        ])
        .select()
        .single();

      if (supabaseError) {
        console.error('Database error:', supabaseError);
        if (supabaseError.code === 'PGRST301') {
          setError('Permission denied. Please try again or contact support.');
        } else if (Object.keys(supabaseError).length === 0) {
          setError('Connection error. Please check your internet connection and try again.');
        } else {
          setError(`Database error: ${supabaseError.message || 'Unknown error occurred'}`);
        }
        return;
      }

      if (!data) {
        throw new Error('No data returned from insert operation');
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Error saving quiz result:', err);
      setError('Unable to save your score. Please try again or contact support if the issue persists.');
    }
  };

  if (submitted) {
    return (
      <Container>
        {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} />}
        <Title>You scored {score} points!</Title>
        <Message>
          {score > 5 ? (
            <>
              You made it to the leaderboard! 🎉
            </>
          ) : (
            <>
              Practice makes perfect!<br />
              <TryAgainButton onClick={() => window.location.reload()}>
                Try Again!
              </TryAgainButton>
            </>
          )}
        </Message>
        <AllLeaderboards 
          userScore={{
            initials: initials.toUpperCase(),
            score,
            age_group: ageGroup
          }}
        />
        <Subtitle>
          Want to improve your math skills?<br />
          <SubstackButton 
            href="https://learnthroughstories.substack.com/" 
            target="_blank"
            rel="noopener noreferrer"
          >
            Join our newsletter for daily math challenges!
          </SubstackButton>
        </Subtitle>
      </Container>
    );
  }

  return (
    <Container>
      <Title>You scored {score} points!</Title>
      <Score>Add your initials to the leaderboard!</Score>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="initials">Your Initials (3 letters):</Label>
          <Input
            id="initials"
            type="text"
            maxLength={3}
            value={initials}
            onChange={handleInitialsChange}
            pattern="[A-Za-z]{3}"
            required
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'error-message' : undefined}
          />
        </InputGroup>
        <InputGroup>
          <Label htmlFor="email">Your Email:</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </InputGroup>
        {error && (
          <ErrorMessage role="alert" id="error-message">
            {error}
          </ErrorMessage>
        )}
        <SubmitButton type="submit">
          Join the Leaderboard!
        </SubmitButton>
      </Form>
    </Container>
  );
}

const Container = styled.div`
  padding: 0.5rem;
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  font-size: 1.3rem;
  color: #2ecc71;
  margin: 0 0 0.5rem 0;
  font-family: 'Comic Sans MS', cursive;
`;

const Score = styled.div`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-family: 'Comic Sans MS', cursive;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-align: left;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #666;
  font-family: 'Comic Sans MS', cursive;
  width: 100px;
  flex-shrink: 0;
`;

const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  border: 2px solid #3498db;
  border-radius: 8px;
  outline: none;
  font-family: 'Comic Sans MS', cursive;
  flex-grow: 1;

  &:focus {
    border-color: #2980b9;
  }
`;

const SubmitButton = styled.button`
  padding: 0.7rem;
  font-size: 1.1rem;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s;
  font-family: 'Comic Sans MS', cursive;
  margin-top: 0.5rem;

  &:hover {
    transform: scale(1.02);
    background-color: #27ae60;
  }
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: #333;
  margin: 0.5rem 0;
  line-height: 1.3;
  font-family: 'Comic Sans MS', cursive;
`;

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0.5rem 0;
  line-height: 1.3;
  font-family: 'Comic Sans MS', cursive;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
  font-family: 'Comic Sans MS', cursive;
`;

const TryAgainButton = styled.button`
  margin: 0.5rem 0;
  padding: 0.7rem 1.2rem;
  font-size: 1.1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-family: 'Comic Sans MS', cursive;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const SubstackButton = styled.a`
  display: inline-block;
  margin: 0.5rem 0;
  padding: 0.7rem 1.2rem;
  font-size: 1.1rem;
  background-color: #FF6B6B;
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-family: 'Comic Sans MS', cursive;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.02);
  }
`;