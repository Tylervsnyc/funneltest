'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { playSound, toggleMute, getMuteStatus } from '../utils/sound';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface QuizProps {
  ageGroup: string;
  onComplete: (score: number) => void;
}

interface Question {
  question: string;
  answer: number;
  choices: number[];
}

interface QuizResult {
  user_email: string | null;
  score: number;
  answers: any[];
}

const supabase = createClientComponentClient();

const generateQuestion = (ageGroup: string): Question => {
  let num1: number, num2: number;
  
  switch (ageGroup) {
    case '4-5':
      num1 = Math.floor(Math.random() * 5) + 1;
      num2 = Math.floor(Math.random() * 5) + 1;
      break;
    case '6-7':
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      break;
    case '8-9':
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      break;
    default: // adult
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
  }

  const answer = num1 * num2;
  const choices = [answer];
  
  while (choices.length < 4) {
    const wrongAnswer = Math.max(1, answer + (Math.floor(Math.random() * 10) - 5));
    if (!choices.includes(wrongAnswer)) {
      choices.push(wrongAnswer);
    }
  }

  return {
    question: `${num1} × ${num2} = ? 😺`,
    answer,
    choices: choices.sort(() => Math.random() - 0.5)
  };
};

export default function Quiz({ ageGroup, onComplete }: QuizProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(generateQuestion(ageGroup));
  const [isMuted, setIsMuted] = useState(getMuteStatus());
  const [isComplete, setIsComplete] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);

  const handleAnswer = async (choice: number) => {
    const isCorrect = choice === currentQuestion.answer;
    playSound(isCorrect);
    
    setAnswers(prev => [...prev, {
      question: currentQuestion.question,
      userAnswer: choice,
      correctAnswer: currentQuestion.answer,
      isCorrect
    }]);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setCurrentQuestion(generateQuestion(ageGroup));
  };

  const handleMuteToggle = () => {
    const newMuteStatus = toggleMute();
    setIsMuted(newMuteStatus);
  };

  useEffect(() => {
    if (isComplete) {
      const saveQuizResult = async () => {
        try {
          const result: QuizResult = {
            user_email: null,
            score,
            answers
          };

          const { error } = await supabase
            .from('quiz_results')
            .insert([result]);

          if (error) {
            console.error('Error saving quiz result:', error);
            throw error;
          }

          onComplete(score);
        } catch (error) {
          console.error('Failed to save quiz result:', error);
        }
      };

      saveQuizResult();
    }
  }, [isComplete, score, answers, onComplete]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (timeLeft === 0) {
    return null;
  }

  return (
    <Container>
      <TimerAndScore>
        <Timer>{timeLeft} seconds left!</Timer>
        <Score>Score: {score}</Score>
        <MuteButton onClick={handleMuteToggle}>
          {isMuted ? '🔇' : '🔊'}
        </MuteButton>
      </TimerAndScore>
      
      <QuestionCard>
        <QuestionText>{currentQuestion.question}</QuestionText>
      </QuestionCard>
      
      <ChoicesGrid>
        {currentQuestion.choices.map((choice, index) => (
          <ChoiceButton
            key={index}
            onClick={() => handleAnswer(choice)}
            color={BUTTON_COLORS[index]}
          >
            {choice}
          </ChoiceButton>
        ))}
      </ChoicesGrid>
    </Container>
  );
}

const BUTTON_COLORS: Record<number, string> = {
  0: '#9DE766', // Light green
  1: '#B088F9', // Purple
  2: '#4CB5F5', // Blue
  3: '#FFB946', // Orange
};

const Container = styled.div`
  padding: 0.5rem;
  background-color: ivory;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const TimerAndScore = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding: 0 0.5rem;
`;

const Timer = styled.div`
  font-size: 1.2rem;
  color: #e74c3c;
  font-weight: bold;
  font-family: 'Comic Sans MS', cursive;
`;

const Score = styled.div`
  font-size: 1.2rem;
  color: #2ecc71;
  font-family: 'Comic Sans MS', cursive;
`;

const QuestionCard = styled.div`
  background: white;
  padding: 0.8rem;
  border-radius: 15px;
  margin-bottom: 0.5rem;
  border: 2px solid #FFD700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const QuestionText = styled.div`
  font-size: 1.5rem;
  color: #333;
  text-align: center;
  font-family: 'Comic Sans MS', cursive;
`;

const ChoicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  padding: 0 0.5rem;
`;

interface ChoiceButtonProps {
  color: string;
}

const ChoiceButton = styled.button<ChoiceButtonProps>`
  padding: 0.7rem;
  font-size: 1.2rem;
  background-color: ${props => props.color};
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s;
  font-family: 'Comic Sans MS', cursive;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const MuteButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.3rem;
`; 