import { useSearchParams } from 'react-router-dom';
import SpeedGame from '../components/SpeedGame';

export default function SpeedGamePage() {
  const [searchParams] = useSearchParams();
  const difficulty = (searchParams.get('difficulty') as 'easy' | 'medium' | 'hard') || 'easy';

  return (
    <div className="min-h-screen bg-background">
      <SpeedGame difficulty={difficulty} />
    </div>
  );
}