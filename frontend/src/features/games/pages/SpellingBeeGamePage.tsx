import { useSearchParams } from 'react-router-dom';
import SpellingBeeGame from '../components/SpellingBeeGame';

export default function SpellingBeeGamePage() {
  const [searchParams] = useSearchParams();
  const difficulty = (searchParams.get('difficulty') as 'easy' | 'medium' | 'hard') || 'easy';

  return (
    <div className="min-h-screen bg-background">
      <SpellingBeeGame difficulty={difficulty} />
    </div>
  );
}