import { useSearchParams } from 'react-router-dom';
import MemoryGame from '../components/MemoryGame';

export default function MemoryGamePage() {
  const [searchParams] = useSearchParams();
  const difficulty = (searchParams.get('difficulty') as 'easy' | 'medium' | 'hard') || 'easy';

  return (
    <div className="min-h-screen bg-background">
      <MemoryGame difficulty={difficulty} />
    </div>
  );
}