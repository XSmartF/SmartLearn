import { useSearchParams } from 'react-router-dom';
import MatchingGame from '../components/MatchingGame';

export default function MatchingGamePage() {
  const [searchParams] = useSearchParams();
  const difficulty = (searchParams.get('difficulty') as 'easy' | 'medium' | 'hard') || 'easy';

  return (
    <div className="min-h-screen bg-background">
      <MatchingGame difficulty={difficulty} />
    </div>
  );
}