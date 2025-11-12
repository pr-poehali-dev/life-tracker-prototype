import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';

interface LifeArea {
  id: string;
  label: string;
  value: number;
  icon: string;
  color: string;
}

export default function LifeWheel() {
  const [areas, setAreas] = useState<LifeArea[]>([
    { id: 'health', label: 'Здоровье', value: 5, icon: 'Heart', color: '#ef4444' },
    { id: 'career', label: 'Карьера', value: 5, icon: 'Briefcase', color: '#f59e0b' },
    { id: 'finance', label: 'Финансы', value: 5, icon: 'DollarSign', color: '#eab308' },
    { id: 'relationships', label: 'Отношения', value: 5, icon: 'Users', color: '#84cc16' },
    { id: 'family', label: 'Семья', value: 5, icon: 'Home', color: '#22c55e' },
    { id: 'personal', label: 'Личностный рост', value: 5, icon: 'TrendingUp', color: '#06b6d4' },
    { id: 'leisure', label: 'Отдых и хобби', value: 5, icon: 'Palette', color: '#3b82f6' },
    { id: 'environment', label: 'Окружение', value: 5, icon: 'Globe', color: '#8b5cf6' },
  ]);

  const updateArea = (id: string, value: number) => {
    setAreas(areas.map(area => area.id === id ? { ...area, value } : area));
  };

  const resetWheel = () => {
    setAreas(areas.map(area => ({ ...area, value: 5 })));
  };

  const getAverageScore = () => {
    const sum = areas.reduce((acc, area) => acc + area.value, 0);
    return (sum / areas.length).toFixed(1);
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const createWheelPath = () => {
    const centerX = 200;
    const centerY = 200;
    const maxRadius = 150;
    const angleStep = 360 / areas.length;

    let path = '';
    areas.forEach((area, index) => {
      const angle = angleStep * index;
      const radius = (area.value / 10) * maxRadius;
      const point = polarToCartesian(centerX, centerY, radius, angle);
      
      if (index === 0) {
        path += `M ${point.x} ${point.y}`;
      } else {
        path += ` L ${point.x} ${point.y}`;
      }
    });
    path += ' Z';
    
    return path;
  };

  const createGridCircles = () => {
    const circles = [];
    const centerX = 200;
    const centerY = 200;
    const maxRadius = 150;
    
    for (let i = 2; i <= 10; i += 2) {
      const radius = (i / 10) * maxRadius;
      circles.push(
        <circle
          key={i}
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth="1"
        />
      );
    }
    return circles;
  };

  const createGridLines = () => {
    const lines = [];
    const centerX = 200;
    const centerY = 200;
    const maxRadius = 150;
    const angleStep = 360 / areas.length;

    areas.forEach((_, index) => {
      const angle = angleStep * index;
      const endPoint = polarToCartesian(centerX, centerY, maxRadius, angle);
      
      lines.push(
        <line
          key={index}
          x1={centerX}
          y1={centerY}
          x2={endPoint.x}
          y2={endPoint.y}
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth="1"
        />
      );
    });
    
    return lines;
  };

  const createLabels = () => {
    const labels = [];
    const centerX = 200;
    const centerY = 200;
    const labelRadius = 170;
    const angleStep = 360 / areas.length;

    areas.forEach((area, index) => {
      const angle = angleStep * index;
      const point = polarToCartesian(centerX, centerY, labelRadius, angle);
      
      labels.push(
        <g key={area.id}>
          <text
            x={point.x}
            y={point.y}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="12"
            fontWeight="500"
          >
            {area.label}
          </text>
        </g>
      );
    });
    
    return labels;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-fade-in">
            Колесо жизненного баланса
          </h1>
          <p className="text-slate-400 text-lg">
            Оцените каждую сферу жизни от 1 до 10
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-8 bg-slate-800/40 backdrop-blur-sm border-slate-700">
            <div className="flex flex-col items-center">
              <svg width="400" height="400" viewBox="0 0 400 400" className="max-w-full">
                {createGridCircles()}
                {createGridLines()}
                
                <path
                  d={createWheelPath()}
                  fill="rgba(168, 85, 247, 0.3)"
                  stroke="rgba(168, 85, 247, 0.8)"
                  strokeWidth="2"
                />
                
                {createLabels()}
              </svg>
              
              <div className="mt-6 text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {getAverageScore()}
                </div>
                <div className="text-slate-400 mt-2">Средний балл</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-800/40 backdrop-blur-sm border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Оценка сфер</h2>
              <Button
                onClick={resetWheel}
                variant="outline"
                className="border-slate-600 hover:bg-slate-700"
              >
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Сбросить
              </Button>
            </div>

            <div className="space-y-6">
              {areas.map((area) => (
                <div key={area.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${area.color}20` }}
                      >
                        <Icon 
                          name={area.icon as any} 
                          size={20} 
                          style={{ color: area.color }}
                        />
                      </div>
                      <span className="font-medium">{area.label}</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: area.color }}>
                      {area.value}
                    </span>
                  </div>
                  <Slider
                    value={[area.value]}
                    onValueChange={(values) => updateArea(area.id, values[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <div className="flex items-start gap-3">
                <Icon name="Lightbulb" size={20} className="text-blue-400 mt-1" />
                <div className="text-sm text-slate-300">
                  <p className="font-semibold text-blue-400 mb-1">Совет</p>
                  <p>Сферы с низкой оценкой требуют внимания. Сосредоточьтесь на улучшении 1-2 областей за раз для достижения баланса.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
