
import { Button } from '@/components/ui/button';
import { ViewType } from '@/pages/Index';
import { Box, Move3D, Square, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface ViewSelectorProps {
  activeView: ViewType;
  onChange: (view: ViewType) => void;
}

export const ViewSelector = ({ activeView, onChange }: ViewSelectorProps) => {
  const views: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'immersive', label: '3D Immersyjny', icon: <Box className="w-4 h-4" /> },
    { id: 'front', label: 'Z przodu', icon: <Square className="w-4 h-4" /> },
    { id: 'back', label: 'Z tyłu', icon: <Square className="w-4 h-4" /> },
    { id: 'left', label: 'Z lewej', icon: <ArrowLeft className="w-4 h-4" /> },
    { id: 'right', label: 'Z prawej', icon: <ArrowRight className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-2">
      {views.map((view) => (
        <Button
          key={view.id}
          variant={activeView === view.id ? 'default' : 'outline'}
          className="w-full justify-start gap-2"
          onClick={() => onChange(view.id)}
        >
          {view.icon}
          {view.label}
        </Button>
      ))}
    </div>
  );
};
