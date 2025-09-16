import { useSearchParams } from 'react-router-dom';
import TrueFalseGame from '../components/TrueFalseGame';

export default function TrueFalseGamePage() {
  const [searchParams] = useSearchParams();
  const difficulty = (searchParams.get('difficulty') as 'easy' | 'medium' | 'hard') || 'easy';

  return (
    <div className="min-h-screen bg-background">
      <TrueFalseGame difficulty={difficulty} />
    </div>
  );
}