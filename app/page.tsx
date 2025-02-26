'use client';

import { useState } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';

// Components will be created next
const AgeSelection = dynamic(() => import('./components/AgeSelection'));
const Quiz = dynamic(() => import('./components/Quiz'));
const LeaderboardForm = dynamic(() => import('./components/LeaderboardForm'));

export default function QuizPage() {
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [score, setScore] = useState(0);

  const handleAgeSelect = (age: string) => {
    setSelectedAge(age);
    setShowQuiz(true);
  };

  const handleQuizComplete = (finalScore: number) => {
    setScore(finalScore);
    setShowLeaderboard(true);
  };

  return (
    <QuizContainer>
      <SubstackLink 
        href="https://learnthroughstories.substack.com/" 
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src="/substack.jpg" alt="Subscribe on Substack" />
      </SubstackLink>

      <MrFluffContainer>
        <MrFluffImage src="/mrfb.jpg" alt="Mr. Fluffbutt the Cat" />
        <WelcomeText>
          Hi! I'm Mr. Fluffbutt, the smartest cat in the land! Bet you can't beat me in my math quiz! 😺
        </WelcomeText>
      </MrFluffContainer>

      {!selectedAge && <AgeSelection onAgeSelect={handleAgeSelect} />}
      
      {showQuiz && !showLeaderboard && selectedAge && (
        <Quiz 
          ageGroup={selectedAge}
          onComplete={handleQuizComplete}
        />
      )}

      {showLeaderboard && selectedAge && (
        <LeaderboardForm 
          score={score} 
          ageGroup={selectedAge}
        />
      )}
    </QuizContainer>
  );
}

const QuizContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
  height: 100vh;
  background-color: ivory;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const MrFluffContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
  flex-shrink: 0;
`;

const MrFluffImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-bottom: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 3px solid #FFD700;

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

const WelcomeText = styled.h1`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1rem;
  font-family: 'Comic Sans MS', cursive;
  background: white;
  padding: 0.8rem;
  border-radius: 15px;
  border: 3px solid #FFD700;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 90%;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 0.5rem;
  }
`;

const SubstackLink = styled.a`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    width: 30px;
    height: 30px;
  }
`;