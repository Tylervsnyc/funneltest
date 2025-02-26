'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
  initials: string;
  score: number;
  age_group: string;
}

interface UserScore {
  initials: string;
  score: number;
  age_group: string;
}

interface AllLeaderboardsProps {
  userScore?: UserScore;
}

const AGE_GROUPS = ['4-5', '6-7', '8-9', 'adult'];

export default function AllLeaderboards({ userScore }: AllLeaderboardsProps) {
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllLeaderboards = async () => {
      try {
        const { data, error } = await supabase
          .from('quiz_results')
          .select('initials, score, age_group')
          .order('score', { ascending: false });

        if (error) throw error;

        // Group scores by age_group
        const groupedScores = AGE_GROUPS.reduce((acc, group) => {
          acc[group] = (data || [])
            .filter(entry => entry.age_group === group)
            .slice(0, 3); // Top 3 scores
          return acc;
        }, {} as Record<string, LeaderboardEntry[]>);

        setLeaderboards(groupedScores);
      } catch (err) {
        console.error('Error fetching leaderboards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllLeaderboards();
  }, []);

  if (loading) {
    return <LoadingText>Loading leaderboards...</LoadingText>;
  }

  return (
    <Container>
      <Title>🏆 Hall of Fame 🏆</Title>
      <LeaderboardGrid>
        {AGE_GROUPS.map(group => (
          <LeaderboardCard key={group}>
            <GroupTitle>{group === 'adult' ? 'Adults' : `${group} years`}</GroupTitle>
            {leaderboards[group]?.length > 0 ? (
              <ScoreList>
                {leaderboards[group].map((entry, index) => (
                  <ScoreItem key={index} isUser={userScore?.initials === entry.initials}>
                    <Medal>{getMedalEmoji(index)}</Medal>
                    <Initials>{entry.initials}</Initials>
                    <Score>{entry.score} points</Score>
                  </ScoreItem>
                ))}
              </ScoreList>
            ) : (
              <NoScores>No scores yet</NoScores>
            )}
            {userScore?.age_group === group && !leaderboards[group]?.some(entry => entry.initials === userScore.initials) && (
              <UserScoreItem>
                <Divider />
                <ScoreItem isUser>
                  <Position>#{getPosition(leaderboards[group], userScore.score)}</Position>
                  <Initials>{userScore.initials}</Initials>
                  <Score>{userScore.score} points</Score>
                </ScoreItem>
              </UserScoreItem>
            )}
          </LeaderboardCard>
        ))}
      </LeaderboardGrid>
    </Container>
  );
}

const getMedalEmoji = (position: number) => {
  switch (position) {
    case 0: return '🥇';
    case 1: return '🥈';
    case 2: return '🥉';
    default: return position + 1;
  }
};

const getPosition = (scores: LeaderboardEntry[], userScore: number) => {
  return scores.filter(entry => entry.score > userScore).length + 1;
};

const Container = styled.div`
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
  font-family: 'Comic Sans MS', cursive;
`;

const LeaderboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 0 1rem;
`;

const LeaderboardCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 15px;
  border: 2px solid #FFD700;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const GroupTitle = styled.h2`
  font-size: 1.2rem;
  color: #333;
  text-align: center;
  margin-bottom: 1rem;
  font-family: 'Comic Sans MS', cursive;
`;

const ScoreList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

interface ScoreItemProps {
  isUser?: boolean;
}

const ScoreItem = styled.div<ScoreItemProps>`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: ${props => props.isUser ? '#fff3cd' : '#f8f9fa'};
  border-radius: 8px;
  gap: 0.5rem;
`;

const Medal = styled.div`
  font-size: 1.2rem;
  width: 24px;
`;

const Position = styled.div`
  width: 24px;
  text-align: center;
  font-weight: bold;
  color: #666;
`;

const Initials = styled.div`
  font-weight: bold;
  color: #333;
  font-family: 'Comic Sans MS', cursive;
`;

const Score = styled.div`
  margin-left: auto;
  color: #2ecc71;
  font-weight: bold;
  font-family: 'Comic Sans MS', cursive;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #666;
  font-family: 'Comic Sans MS', cursive;
  padding: 2rem;
  font-size: 1.2rem;
`;

const NoScores = styled.div`
  text-align: center;
  color: #666;
  font-family: 'Comic Sans MS', cursive;
  padding: 1rem;
`;

const UserScoreItem = styled.div`
  margin-top: 0.5rem;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px dashed #ccc;
  margin: 0.5rem 0;
`; 