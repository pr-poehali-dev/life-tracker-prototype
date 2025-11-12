import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type Category = 'health' | 'career' | 'relationships' | 'finance' | 'personal' | 'social' | 'environment' | 'spirituality';

interface Snapshot {
  date: string;
  scores: Record<Category, number>;
}

const categories = {
  health: { label: 'Здоровье', icon: 'Heart' },
  career: { label: 'Карьера', icon: 'Briefcase' },
  relationships: { label: 'Отношения', icon: 'Users' },
  finance: { label: 'Финансы', icon: 'DollarSign' },
  personal: { label: 'Личностный рост', icon: 'TrendingUp' },
  social: { label: 'Социальная жизнь', icon: 'MessageCircle' },
  environment: { label: 'Окружение', icon: 'Home' },
  spirituality: { label: 'Духовность', icon: 'Sparkles' }
};

export default function Index() {
  const [isDark, setIsDark] = useState(false);
  const [scores, setScores] = useState<Record<Category, number>>({
    health: 7,
    career: 5,
    relationships: 8,
    finance: 6,
    personal: 7,
    social: 5,
    environment: 8,
    spirituality: 6
  });
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const updateScore = (category: Category, value: number) => {
    setScores({ ...scores, [category]: value });
  };

  const getAverage = () => {
    const values = Object.values(scores);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const saveSnapshot = () => {
    const snapshot: Snapshot = {
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
      scores: { ...scores }
    };
    setHistory([snapshot, ...history]);
  };

  const getRecommendations = () => {
    return (Object.entries(scores) as [Category, number][])
      .filter(([_, score]) => score <= 4)
      .map(([cat, score]) => ({
        category: cat,
        score,
        advice: getAdvice(cat)
      }))
      .sort((a, b) => a.score - b.score);
  };

  const getAdvice = (category: Category): string => {
    const advices: Record<Category, string> = {
      health: 'Начните с малого: 15 минут прогулки каждый день',
      career: 'Определите 3 главные цели на месяц и разбейте на шаги',
      relationships: 'Уделите время близким — позвоните или встретьтесь',
      finance: 'Проанализируйте расходы за неделю и составьте бюджет',
      personal: 'Выделите 30 минут на обучение или чтение',
      social: 'Напишите старому другу или запланируйте встречу',
      environment: 'Измените одну вещь в доме, которая вас раздражает',
      spirituality: 'Попробуйте 5 минут медитации или благодарности'
    };
    return advices[category];
  };

  const getColorClass = (score: number, type: 'bg' | 'text' | 'border' = 'bg') => {
    const isDarkMode = isDark;
    
    if (score >= 8) {
      if (type === 'bg') return isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100';
      if (type === 'text') return isDarkMode ? 'text-emerald-400' : 'text-emerald-700';
      if (type === 'border') return isDarkMode ? 'border-emerald-500/30' : 'border-emerald-300';
    }
    if (score >= 6) {
      if (type === 'bg') return isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100';
      if (type === 'text') return isDarkMode ? 'text-blue-400' : 'text-blue-700';
      if (type === 'border') return isDarkMode ? 'border-blue-500/30' : 'border-blue-300';
    }
    if (score >= 4) {
      if (type === 'bg') return isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100';
      if (type === 'text') return isDarkMode ? 'text-amber-400' : 'text-amber-700';
      if (type === 'border') return isDarkMode ? 'border-amber-500/30' : 'border-amber-300';
    }
    if (type === 'bg') return isDarkMode ? 'bg-red-500/20' : 'bg-red-100';
    if (type === 'text') return isDarkMode ? 'text-red-400' : 'text-red-700';
    if (type === 'border') return isDarkMode ? 'border-red-500/30' : 'border-red-300';
  };

  const recommendations = getRecommendations();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-violet-50 via-white to-indigo-50'}`}>
      <div className="container max-w-5xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Колесо жизни
            </h1>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              Оцените разные сферы своей жизни
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon name="Sun" size={20} className={isDark ? 'text-slate-600' : 'text-amber-500'} />
              <Switch checked={isDark} onCheckedChange={setIsDark} />
              <Icon name="Moon" size={20} className={isDark ? 'text-indigo-400' : 'text-slate-400'} />
            </div>
          </div>
        </div>

        {/* Average Score */}
        <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
              {getAverage()}
            </div>
            <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Средний балл по всем сферам
            </p>
          </div>
        </Card>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {(Object.entries(categories) as [Category, typeof categories[Category]][]).map(([key, cat]) => (
            <Card 
              key={key}
              className={`p-5 border-2 transition-all ${isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${getColorClass(scores[key], 'bg')} border ${getColorClass(scores[key], 'border')}`}>
                  <Icon name={cat.icon as any} size={24} className={getColorClass(scores[key], 'text')} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {cat.label}
                    </h3>
                    <span className={`text-2xl font-bold ${getColorClass(scores[key], 'text')}`}>
                      {scores[key]}/10
                    </span>
                  </div>
                </div>
              </div>
              <Slider
                value={[scores[key]]}
                onValueChange={(val) => updateScore(key, val[0])}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
            </Card>
          ))}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card className={`p-6 ${isDark ? 'bg-amber-950/30 border-amber-900/50' : 'bg-amber-50 border-amber-200'}`}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-amber-400' : 'text-amber-900'}`}>
              <Icon name="Lightbulb" size={24} />
              Рекомендации
            </h2>
            <div className="space-y-3">
              {recommendations.map((rec) => {
                const catData = categories[rec.category];
                return (
                  <div 
                    key={rec.category}
                    className={`p-4 rounded-lg border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon name={catData.icon as any} size={20} className={getColorClass(rec.score, 'text')} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {catData.label}
                          </span>
                          <span className={`font-bold ${getColorClass(rec.score, 'text')}`}>
                            {rec.score}/10
                          </span>
                        </div>
                        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                          {rec.advice}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={saveSnapshot}
            className={`flex-1 ${isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            <Icon name="Save" size={18} className="mr-2" />
            Сохранить снимок
          </Button>
          
          <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className={isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                <Icon name="History" size={18} className="mr-2" />
                История ({history.length})
              </Button>
            </DialogTrigger>
            <DialogContent className={`max-w-4xl max-h-[80vh] overflow-y-auto ${isDark ? 'bg-slate-900 border-slate-800' : ''}`}>
              <DialogHeader>
                <DialogTitle className={isDark ? 'text-white' : ''}>История снимков</DialogTitle>
              </DialogHeader>
              
              {history.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Icon name="Calendar" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Нет сохранённых снимков</p>
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {history.map((snapshot, idx) => (
                    <Card key={idx} className={`p-5 ${isDark ? 'bg-slate-950 border-slate-800' : 'border-slate-200'}`}>
                      <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {snapshot.date}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {(Object.entries(snapshot.scores) as [Category, number][]).map(([cat, score]) => {
                          const catData = categories[cat];
                          return (
                            <div 
                              key={cat}
                              className={`flex items-center justify-between p-3 rounded-lg border ${getColorClass(score, 'bg')} ${getColorClass(score, 'border')}`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon name={catData.icon as any} size={18} className={getColorClass(score, 'text')} />
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {catData.label}
                                </span>
                              </div>
                              <span className={`text-lg font-bold ${getColorClass(score, 'text')}`}>
                                {score}/10
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

      </div>
    </div>
  );
}
