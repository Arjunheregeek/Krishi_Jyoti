import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  buttonText: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  className?: string;
}

const DashboardCard = ({
  title,
  description,
  icon: Icon,
  buttonText,
  onClick,
  variant = 'default',
  className
}: DashboardCardProps) => {
  const gradientMap = {
    default: 'from-card to-muted/20',
    primary: 'from-primary/10 to-primary-glow/20',
    secondary: 'from-secondary/10 to-warning/20',
    accent: 'from-accent/10 to-primary/20'
  };

  return (
    <Card className={cn(
      'group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br',
      gradientMap[variant],
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-3 rounded-lg transition-colors',
            variant === 'primary' && 'bg-primary text-primary-foreground group-hover:bg-primary-glow',
            variant === 'secondary' && 'bg-secondary text-secondary-foreground group-hover:bg-warning',
            variant === 'accent' && 'bg-accent text-accent-foreground group-hover:bg-primary',
            variant === 'default' && 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground'
          )}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </div>
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={onClick}
          variant={variant === 'default' ? 'default' : 'outline'}
          className="w-full"
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;