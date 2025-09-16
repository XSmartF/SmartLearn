import { useSearchParams } from 'react-router-dom';
import WordScrambleGame from '../components/WordScrambleGame';

export default function WordScrambleGamePage() {
  const [searchParams] = useSearchParams();
  const difficulty = (searchParams.get('difficulty') as 'easy' | 'medium' | 'hard') || 'easy';

  return (
    <div className="min-h-screen bg-background">
      <WordScrambleGame difficulty={difficulty} />
    </div>
  );
}