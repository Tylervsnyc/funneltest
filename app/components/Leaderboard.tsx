'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../lib/supabase';

interface LeaderboardProps {
  ageGroup: string;
}

interface LeaderboardEntry {
  initials: string;
  score: number;
}

export default function Leaderboard({ ageGroup }: LeaderboardProps) {
  const [topScores, setTopScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopScores = async () => {
      try {
        const { data, error } = await supabase
          .from('quiz_results')
          .select('initials, score')
          .eq('age_group', ageGroup)
          .order('score', { ascending: false })
          .limit(5);

        if (error) throw error;
        setTopScores(data || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopScores();
  }, [ageGroup]);

  if (loading) {
    return <LoadingText>Loading leaderboard...</LoadingText>;
  }

  return (
    <LeaderboardContainer>
      <LeaderboardTitle>Top Scores - {ageGroup} years</LeaderboardTitle>
      {topScores.length > 0 ? (
        <ScoreList>
          {topScores.map((entry, index) => (
            <ScoreItem key={index}>
              <Medal>{index + 1}</Medal>
              <Initials>{entry.initials}</Initials>
              <Score>{entry.score} points</Score>
            </ScoreItem>
          ))}
        </ScoreList>
      ) : (
        <NoScores>No scores yet - be the first!</NoScores>
      )}
    </LeaderboardContainer>
  );
}

const LeaderboardContainer = styled.div`
  background: white;
  padding: 0.5rem;
  border-radius: 15px;
  border: 2px solid #FFD700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 0.5rem auto;
  max-width: 500px;
`;

const LeaderboardTitle = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 0.5rem 0;
  font-family: 'Comic Sans MS', cursive;
`;

const ScoreList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const ScoreItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.4rem;
  background: #f8f8f8;
  border-radius: 8px;
  gap: 0.5rem;
`;

const Medal = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #FFD700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 0.8rem;
`;

const Initials = styled.div`
  font-weight: bold;
  color: #333;
  font-family: 'Comic Sans MS', cursive;
  font-size: 0.9rem;
`;

const Score = styled.div`
  margin-left: auto;
  color: #2ecc71;
  font-weight: bold;
  font-family: 'Comic Sans MS', cursive;
  font-size: 0.9rem;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #666;
  font-family: 'Comic Sans MS', cursive;
  padding: 0.5rem;
  font-size: 0.9rem;
`;

const NoScores = styled.div`
  text-align: center;
  color: #666;
  font-family: 'Comic Sans MS', cursive;
  padding: 0.5rem;
  font-size: 0.9rem;
`; 