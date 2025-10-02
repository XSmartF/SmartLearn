import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, BookOpen, FileText, Calendar, Gamepad2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';

interface SpeedDialAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

export function SpeedDial() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const actions: SpeedDialAction[] = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: 'Tạo flashcard',
      onClick: () => {
        navigate(ROUTES.MY_LIBRARY);
        setIsOpen(false);
      },
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: 'Tạo ghi chép',
      onClick: () => {
        navigate(ROUTES.NOTES);
        setIsOpen(false);
      },
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Xem lịch học',
      onClick: () => {
        navigate(ROUTES.CALENDAR);
        setIsOpen(false);
      },
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      icon: <Gamepad2 className="h-5 w-5" />,
      label: 'Chơi game',
      onClick: () => {
        navigate(ROUTES.GAMES);
        setIsOpen(false);
      },
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Buttons */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 flex flex-col-reverse gap-3 mb-2">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in"
              style={{
                animationDelay: `${index * 50}ms`,
                animationDuration: '200ms',
                animationFillMode: 'backwards',
              }}
            >
              <span className="text-sm font-medium bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border whitespace-nowrap">
                {action.label}
              </span>
              <Button
                onClick={action.onClick}
                size="lg"
                className={`h-12 w-12 rounded-full shadow-lg hover:scale-110 transition-transform ${action.color} text-white`}
              >
                {action.icon}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={`h-16 w-16 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen ? 'rotate-45 scale-110' : 'hover:scale-110'
        }`}
      >
        {isOpen ? <X className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
      </Button>
    </div>
  );
}
