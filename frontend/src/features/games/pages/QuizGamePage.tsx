import { useSearchParams } from 'react-router-dom';
import QuizGame from '../components/QuizGame';

export default function QuizGamePage() {
  const [searchParams] = useSearchParams();
  const difficulty = (searchParams.get('difficulty') as 'easy' | 'medium' | 'hard') || 'easy';

  return (
    <div className="min-h-screen bg-background">
      <QuizGame difficulty={difficulty} />
    </div>
  );
}