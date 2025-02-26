'use client';

import styled from 'styled-components';

interface AgeSelectionProps {
  onAgeSelect: (age: string) => void;
}

const ageGroups = [
  { id: '4-5', label: '4-5 years old' },
  { id: '6-7', label: '6-7 years old' },
  { id: '8-9', label: '8-9 years old' },
  { id: 'adult', label: 'I am an adult' },
];

const BUTTON_COLORS: Record<number, string> = {
  0: '#9DE766', // Light green
  1: '#B088F9', // Purple
  2: '#4CB5F5', // Blue
  3: '#FFB946', // Orange
};

export default function AgeSelection({ onAgeSelect }: AgeSelectionProps) {
  return (
    <Container>
      <QuestionCard>
        <Title>🐱 What is your age group? 🐱</Title>
      </QuestionCard>
      <ButtonGrid>
        {ageGroups.map((group, index) => (
          <AgeButton
            key={group.id}
            onClick={() => onAgeSelect(group.id)}
            color={BUTTON_COLORS[index]}
          >
            {group.label}
          </AgeButton>
        ))}
      </ButtonGrid>
    </Container>
  );
}

const Container = styled.div`
  margin: 0.5rem 0;
`;

const QuestionCard = styled.div`
  background: white;
  padding: 0.8rem;
  border-radius: 15px;
  margin-bottom: 1rem;
  border: 3px solid #FFD700;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin: 0;
  text-align: center;
  font-family: 'Comic Sans MS', cursive;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 0.5rem;
`;

interface AgeButtonProps {
  color: string;
}

const AgeButton = styled.button<AgeButtonProps>`
  padding: 0.7rem;
  font-size: 1.1rem;
  background-color: ${props => props.color};
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s;
  font-family: 'Comic Sans MS', cursive;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 -2px 2px rgba(0, 0, 0, 0.1),
    inset 0 2px 2px rgba(255, 255, 255, 0.2);

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(1px);
  }
`; 