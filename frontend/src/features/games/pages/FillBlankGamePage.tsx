import { useSearchParams } from 'react-router-dom';
import FillBlankGame from '../components/FillBlankGame';

export default function FillBlankGamePage() {
  const [searchParams] = useSearchParams();
  const difficulty = (searchParams.get('difficulty') as 'easy' | 'medium' | 'hard') || 'easy';

  return (
    <div className="min-h-screen bg-background">
      <FillBlankGame difficulty={difficulty} />
    </div>
  );
}