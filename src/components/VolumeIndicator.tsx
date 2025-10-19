import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface VolumeIndicatorProps {
  ingredient: string;
  quantity: string;
  percentage: number;
}

const VolumeIndicator = ({ ingredient, quantity, percentage }: VolumeIndicatorProps) => {
  const getColorClass = (percent: number) => {
    if (percent > 70) return 'bg-green-500';
    if (percent > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium capitalize">{ingredient}</span>
        <Badge variant="outline" className="text-xs">
          {quantity}
        </Badge>
      </div>
      <div className="relative">
        <Progress value={percentage} className="h-2" />
        <div 
          className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getColorClass(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{percentage}% remaining</span>
        <span>{percentage < 20 ? 'Low stock' : percentage < 50 ? 'Medium' : 'Well stocked'}</span>
      </div>
    </div>
  );
};

export default VolumeIndicator;
