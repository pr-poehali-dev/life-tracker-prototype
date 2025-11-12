import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';

type Category = 'family' | 'career' | 'growth' | 'leisure' | 'friends';

interface Task {
  id: string;
  title: string;
  category: Category;
  completed: boolean;
  isHabit: boolean;
  date: Date;
  streak?: number;
  daysTotal?: number;
}

const categories = {
  family: { label: 'Семья', icon: 'Heart', color: 'from-pink-400 to-rose-400', bg: 'bg-pink-950/30', border: 'border-pink-800/50', text: 'text-pink-300' },
  career: { label: 'Карьера', icon: 'Briefcase', color: 'from-purple-400 to-violet-400', bg: 'bg-purple-950/30', border: 'border-purple-800/50', text: 'text-purple-300' },
  growth: { label: 'Развитие', icon: 'BookOpen', color: 'from-blue-400 to-cyan-400', bg: 'bg-blue-950/30', border: 'border-blue-800/50', text: 'text-blue-300' },
  leisure: { label: 'Отдых', icon: 'Coffee', color: 'from-orange-400 to-amber-400', bg: 'bg-orange-950/30', border: 'border-orange-800/50', text: 'text-orange-300' },
  friends: { label: 'Друзья', icon: 'Users', color: 'from-green-400 to-emerald-400', bg: 'bg-green-950/30', border: 'border-green-800/50', text: 'text-green-300' },
};

interface MonthlySnapshot {
  month: string;
  areas: Record<Category, number>;
}

export default function Index() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('month');
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Позвонить родителям', category: 'family', completed: true, isHabit: false, date: today },
    { id: '2', title: 'Утренняя зарядка', category: 'growth', completed: true, isHabit: true, streak: 5, daysTotal: 30, date: today },
    { id: '3', title: 'Закончить проект', category: 'career', completed: false, isHabit: false, date: today },
  ]);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('career');
  const [isHabit, setIsHabit] = useState(false);
  const [habitDays, setHabitDays] = useState(7);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  const [habitStartDate, setHabitStartDate] = useState<Date>(today);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlySnapshot[]>([]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      category: selectedCategory,
      completed: false,
      isHabit: isHabit,
      date: selectedDate,
      ...(isHabit && { streak: 0, daysTotal: habitDays })
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setIsDialogOpen(false);
  };

  const calculateCategoryScore = (category: Category, monthOffset: number = 0): number => {
    const targetDate = new Date(today);
    targetDate.setMonth(targetDate.getMonth() - monthOffset);
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
    
    const categoryTasks = tasks.filter(t => 
      t.category === category && 
      t.date >= startOfMonth && 
      t.date <= endOfMonth
    );
    
    if (categoryTasks.length === 0) return 5;
    
    const completedCount = categoryTasks.filter(t => t.completed).length;
    const completionRate = completedCount / categoryTasks.length;
    
    return Math.round(1 + (completionRate * 9));
  };

  const getCategoryScores = (monthOffset: number = 0) => {
    const scores: Record<Category, number> = {} as Record<Category, number>;
    (Object.keys(categories) as Category[]).forEach(cat => {
      scores[cat] = calculateCategoryScore(cat, monthOffset);
    });
    return scores;
  };

  const saveMonthlySnapshot = () => {
    const currentMonth = today.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' });
    const existingIndex = monthlyHistory.findIndex(s => s.month === currentMonth);
    const snapshot: MonthlySnapshot = {
      month: currentMonth,
      areas: getCategoryScores()
    };
    
    if (existingIndex >= 0) {
      const updated = [...monthlyHistory];
      updated[existingIndex] = snapshot;
      setMonthlyHistory(updated);
    } else {
      setMonthlyHistory([snapshot, ...monthlyHistory]);
    }
  };

  const getRecommendations = () => {
    const scores = getCategoryScores();
    const recommendations: { category: Category; score: number; advice: string }[] = [];
    
    (Object.entries(scores) as [Category, number][]).forEach(([cat, score]) => {
      if (score <= 4) {
        const advice = {
          family: 'Запланируйте встречу с близкими или звонок родным',
          career: 'Составьте список приоритетных рабочих задач на неделю',
          growth: 'Уделите 30 минут чтению или обучению нового навыка',
          leisure: 'Найдите время для хобби или отдыха, который вас радует',
          friends: 'Напишите другу или договоритесь о встрече'
        }[cat];
        recommendations.push({ category: cat, score, advice: advice || '' });
      }
    });
    
    return recommendations.sort((a, b) => a.score - b.score);
  };

  const addHabit = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTasks: Task[] = [];
    const startDate = new Date(habitStartDate);
    
    for (let i = 0; i < habitDays; i++) {
      const taskDate = new Date(startDate);
      taskDate.setDate(startDate.getDate() + i);
      
      newTasks.push({
        id: `${Date.now()}-${i}`,
        title: newTaskTitle,
        category: selectedCategory,
        completed: false,
        isHabit: true,
        date: taskDate,
        streak: 0,
        daysTotal: habitDays
      });
    }
    
    setTasks([...tasks, ...newTasks]);
    setNewTaskTitle('');
    setIsHabitDialogOpen(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, completed: !task.completed, ...(task.isHabit && !task.completed && { streak: (task.streak || 0) + 1 }) }
        : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => isSameDay(task.date, date));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getWeekEnd = (date: Date) => {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  };

  const getDatesWithTasks = () => {
    return tasks.map(task => task.date);
  };

  const getWeekDays = () => {
    const start = getWeekStart(selectedDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const todayTasks = getTasksForDate(selectedDate);
  const habits = todayTasks.filter(t => t.isHabit);
  const regularTasks = todayTasks.filter(t => !t.isHabit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 md:p-8 relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzg4OCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=)'}}></div>
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block relative">
            <h1 className="text-6xl md:text-8xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400" style={{fontFamily: 'Caveat, cursive'}}>
              Мой дневник ✨
            </h1>
            <div className="absolute -top-8 -right-4 text-5xl animate-bounce">🦋</div>
          </div>
          <p className="text-purple-400 text-lg mt-2" style={{fontFamily: 'Patrick Hand, cursive'}}>где сбываются мечты</p>
        </div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-900/80 backdrop-blur-sm border-2 border-purple-800/50 shadow-lg">
            <TabsTrigger value="tasks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-900/50 data-[state=active]:to-purple-900/50 data-[state=active]:text-pink-300 text-purple-400">
              <Icon name="CheckSquare" size={18} className="mr-2" />
              Трекер дел
            </TabsTrigger>
            <TabsTrigger value="habits" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-900/50 data-[state=active]:to-cyan-900/50 data-[state=active]:text-blue-300 text-blue-400">
              <Icon name="Repeat" size={18} className="mr-2" />
              Привычки
            </TabsTrigger>
            <TabsTrigger 
              value="lifewheel" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-900/50 data-[state=active]:to-pink-900/50 data-[state=active]:text-purple-300 text-pink-400"
            >
              <Icon name="Target" size={18} className="mr-2" />
              Колесо баланса
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <Card className="p-6 bg-slate-900/90 backdrop-blur-sm border-2 border-purple-800/50 shadow-xl animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold text-purple-400 flex items-center gap-2" style={{fontFamily: 'Patrick Hand, cursive'}}>
                  <Icon name="Calendar" size={28} />
                  Календарь
                </h2>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={calendarView === 'week' ? 'default' : 'outline'}
                    onClick={() => setCalendarView('week')}
                    className={calendarView === 'week' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-purple-100 hover:from-pink-400 hover:to-purple-400' : 'border-purple-500/50 text-purple-400 hover:bg-purple-900/30'}
                  >
                    Неделя
                  </Button>
                  <Button
                    size="sm"
                    variant={calendarView === 'month' ? 'default' : 'outline'}
                    onClick={() => setCalendarView('month')}
                    className={calendarView === 'month' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-purple-100 hover:from-pink-400 hover:to-purple-400' : 'border-purple-500/50 text-purple-400 hover:bg-purple-900/30'}
                  >
                    Месяц
                  </Button>
                </div>
              </div>
              <div className="flex justify-center mb-4">
                {calendarView === 'month' ? (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-xl border-2 border-purple-800/50 bg-slate-900/50 p-3"
                    modifiers={{
                      hasTasks: getDatesWithTasks()
                    }}
                    modifiersClassNames={{
                      hasTasks: 'bg-purple-900/40 font-bold text-purple-300'
                    }}
                  />
                ) : (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setDate(newDate.getDate() - 7);
                          setSelectedDate(newDate);
                        }}
                        className="text-purple-400 hover:text-purple-200 hover:bg-purple-900/30"
                      >
                        <Icon name="ChevronLeft" size={24} />
                      </Button>
                      <h3 className="text-lg font-semibold text-purple-300">
                        {formatDate(getWeekStart(selectedDate))} — {formatDate(getWeekEnd(selectedDate))}
                      </h3>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setDate(newDate.getDate() + 7);
                          setSelectedDate(newDate);
                        }}
                        className="text-purple-400 hover:text-purple-200 hover:bg-purple-900/30"
                      >
                        <Icon name="ChevronRight" size={24} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {getWeekDays().map((day, idx) => {
                        const dayTasks = getTasksForDate(day);
                        const isToday = isSameDay(day, today);
                        const isSelected = isSameDay(day, selectedDate);
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedDate(day)}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              isSelected 
                                ? 'border-purple-400 bg-gradient-to-br from-pink-900/50 to-purple-900/50 shadow-lg' 
                                : isToday
                                ? 'border-purple-400 bg-purple-950/30'
                                : 'border-purple-800/50 bg-slate-900 hover:border-purple-400 hover:bg-purple-950/30'
                            }`}
                          >
                            <div className="text-xs text-purple-400 font-medium">
                              {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
                            </div>
                            <div className={`text-xl font-bold ${isSelected ? 'text-purple-300' : 'text-purple-400'}`}>
                              {day.getDate()}
                            </div>
                            {dayTasks.length > 0 && (
                              <div className="flex gap-1 mt-1 justify-center">
                                {dayTasks.slice(0, 3).map((_, i) => (
                                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-slate-900/90 backdrop-blur-sm border-2 border-pink-800/50 shadow-xl animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold text-pink-400 flex items-center gap-2" style={{fontFamily: 'Patrick Hand, cursive'}}>
                  <Icon name="CheckSquare" size={28} />
                  Дела на {formatDate(selectedDate)}
                </h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-pink-100 shadow-md">
                      <Icon name="Plus" size={20} className="mr-2" />
                      Добавить
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-2 border-pink-800/50 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-3xl text-pink-400" style={{fontFamily: 'Patrick Hand, cursive'}}>Новое дело</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="task-title" className="text-purple-300">Что нужно сделать?</Label>
                        <Input
                          id="task-title"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Например: Купить цветы 🌸"
                          className="bg-purple-950/30 border-2 border-purple-800/50 mt-2 focus:border-purple-400"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-purple-300">Категория</Label>
                        <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as Category)}>
                          <SelectTrigger className="bg-purple-950/30 border-2 border-purple-800/50 mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-2 border-purple-800/50">
                            {Object.entries(categories).map(([key, cat]) => (
                              <SelectItem key={key} value={key} className="hover:bg-purple-950/30">
                                <div className="flex items-center gap-2">
                                  <Icon name={cat.icon as any} size={16} />
                                  {cat.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-950/30 rounded-lg border-2 border-purple-800/50">
                        <Label htmlFor="habit-switch" className="text-purple-300">Это привычка?</Label>
                        <Switch
                          id="habit-switch"
                          checked={isHabit}
                          onCheckedChange={setIsHabit}
                        />
                      </div>

                      {isHabit && (
                        <div>
                          <Label htmlFor="habit-days" className="text-purple-300">Количество дней</Label>
                          <Input
                            id="habit-days"
                            type="number"
                            min="1"
                            max="365"
                            value={habitDays}
                            onChange={(e) => setHabitDays(Number(e.target.value))}
                            className="bg-purple-950/30 border-2 border-purple-800/50 mt-2"
                          />
                        </div>
                      )}

                      <Button
                        onClick={addTask}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-purple-200 font-bold text-lg shadow-md"
                      >
                        ✨ Создать
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {regularTasks.length === 0 ? (
                  <div className="text-center py-12 text-purple-400">
                    <Icon name="Sparkles" size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg" style={{fontFamily: 'Patrick Hand, cursive'}}>Пока нет дел. Добавь первое! 🌟</p>
                  </div>
                ) : (
                  regularTasks.map((task) => {
                    const cat = categories[task.category];
                    
                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-xl border-2 ${cat.border} ${cat.bg} hover:shadow-lg transition-all duration-300`}
                      >
                        <div className="flex items-center gap-3">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleTask(task.id)}
                            className={`rounded-full ${task.completed ? 'bg-green-900/40 text-green-300' : 'bg-slate-900 border-2 border-purple-300'}`}
                          >
                            <Icon name={task.completed ? 'Check' : 'Circle'} size={20} />
                          </Button>
                          
                          <div className="flex-1">
                            <p className={`font-medium ${cat.text} ${task.completed ? 'line-through opacity-60' : ''}`}>
                              {task.title}
                            </p>
                            <Badge variant="outline" className={`mt-1 bg-gradient-to-r ${cat.color} border-none text-white`}>
                              <Icon name={cat.icon as any} size={12} className="mr-1" />
                              {cat.label}
                            </Badge>
                          </div>
                          
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteTask(task.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-900/30"
                          >
                            <Icon name="Trash2" size={18} />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="habits" className="space-y-4">
            <Card className="p-6 bg-slate-900/90 backdrop-blur-sm border-2 border-blue-800/50 shadow-xl animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-blue-400 flex items-center gap-2" style={{fontFamily: 'Patrick Hand, cursive'}}>
                  <Icon name="Target" size={28} />
                  Мои привычки
                </h2>
                <Dialog open={isHabitDialogOpen} onOpenChange={setIsHabitDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-blue-200 shadow-md">
                      <Icon name="Plus" size={20} className="mr-2" />
                      Новая привычка
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-2 border-blue-800/50 shadow-2xl max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-3xl text-blue-400" style={{fontFamily: 'Patrick Hand, cursive'}}>
                        Создать привычку
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="habit-title" className="text-purple-300">Название привычки</Label>
                        <Input
                          id="habit-title"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Например: Утренняя зарядка 💪"
                          className="bg-blue-950/30 border-2 border-blue-800/50 mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-purple-300">Категория</Label>
                        <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as Category)}>
                          <SelectTrigger className="bg-blue-950/30 border-2 border-blue-800/50 mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-2 border-blue-800/50">
                            {Object.entries(categories).map(([key, cat]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <Icon name={cat.icon as any} size={16} />
                                  {cat.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-purple-300">Дата начала</Label>
                        <div className="mt-2 flex justify-center p-3 bg-blue-950/30 rounded-lg border-2 border-blue-800/50">
                          <Calendar
                            mode="single"
                            selected={habitStartDate}
                            onSelect={(date) => date && setHabitStartDate(date)}
                            className="rounded-md"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="habit-days" className="text-purple-300">Количество дней</Label>
                        <Input
                          id="habit-days"
                          type="number"
                          min="1"
                          max="365"
                          value={habitDays}
                          onChange={(e) => setHabitDays(Number(e.target.value))}
                          className="bg-blue-950/30 border-2 border-blue-800/50 mt-2"
                        />
                        <p className="text-xs text-purple-400 mt-1">
                          Привычка будет создана на {habitDays} {habitDays === 1 ? 'день' : habitDays < 5 ? 'дня' : 'дней'} начиная с {formatDate(habitStartDate)}
                        </p>
                      </div>

                      <Button
                        onClick={addHabit}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-blue-200 font-bold text-lg shadow-md"
                      >
                        ✨ Создать привычку
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                {habits.length === 0 ? (
                  <div className="text-center py-12 text-blue-400">
                    <Icon name="Calendar" size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg" style={{fontFamily: 'Patrick Hand, cursive'}}>Нет привычек на выбранную дату 📅</p>
                  </div>
                ) : (
                  habits.map((habit) => {
                    const cat = categories[habit.category];
                    const progressPercent = habit.daysTotal ? ((habit.streak || 0) / habit.daysTotal) * 100 : 0;
                    
                    return (
                      <div
                        key={habit.id}
                        className={`p-6 rounded-2xl border-2 ${cat.border} ${cat.bg} hover:shadow-xl transition-all duration-300`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className={`text-xl font-semibold mb-2 ${cat.text}`}>{habit.title}</h3>
                            <Badge variant="outline" className={`bg-gradient-to-r ${cat.color} border-none text-white`}>
                              <Icon name={cat.icon as any} size={12} className="mr-1" />
                              {cat.label}
                            </Badge>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteTask(habit.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-900/30"
                          >
                            <Icon name="Trash2" size={18} />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-purple-400 font-medium">Прогресс</span>
                            <span className="font-bold text-lg text-purple-300">
                              {habit.streak}/{habit.daysTotal} дней
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-2 bg-purple-900/40" />
                          
                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              onClick={() => toggleTask(habit.id)}
                              className={`flex-1 ${
                                habit.completed 
                                  ? 'bg-green-300 hover:bg-green-400 text-green-200' 
                                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-blue-200 shadow-md'
                              }`}
                            >
                              <Icon name={habit.completed ? 'CheckCircle2' : 'Circle'} size={18} className="mr-2" />
                              {habit.completed ? 'Выполнено сегодня ✓' : 'Отметить выполнение'}
                            </Button>
                          </div>
                        </div>

                        {habit.streak && habit.streak >= 3 && (
                          <div className="mt-4 p-3 bg-yellow-950/30 rounded-lg border-2 border-yellow-800/50 text-center">
                            <p className="text-yellow-300 font-medium">
                              🔥 Серия: {habit.streak} {habit.streak === 1 ? 'день' : habit.streak < 5 ? 'дня' : 'дней'}!
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="lifewheel" className="space-y-4">
            <Card className="p-6 bg-slate-900/90 backdrop-blur-sm border-2 border-purple-800/50 shadow-xl animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-purple-400 flex items-center gap-2" style={{fontFamily: 'Patrick Hand, cursive'}}>
                  <Icon name="Target" size={28} />
                  Колесо жизненного баланса 🌈
                </h2>
                <div className="flex gap-2">
                  <Button
                    onClick={saveMonthlySnapshot}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-green-200 shadow-md"
                  >
                    <Icon name="Save" size={18} className="mr-2" />
                    Сохранить
                  </Button>
                  <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-2 border-purple-500/50 text-purple-400 hover:bg-purple-900/30"
                      >
                        <Icon name="History" size={18} className="mr-2" />
                        История
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-2 border-purple-800/50 shadow-2xl max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-3xl text-purple-400" style={{fontFamily: 'Patrick Hand, cursive'}}>
                          История колеса баланса 📖
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 mt-4">
                        {monthlyHistory.length === 0 ? (
                          <div className="text-center py-8 text-purple-400">
                            <Icon name="Calendar" size={48} className="mx-auto mb-4 opacity-50" />
                            <p style={{fontFamily: 'Patrick Hand, cursive'}}>Нет сохранённых снимков 📅</p>
                          </div>
                        ) : (
                          monthlyHistory.map((snapshot, idx) => (
                            <Card key={idx} className="p-4 bg-purple-950/30 border-2 border-purple-800/50">
                              <h3 className="text-2xl font-bold mb-4 text-purple-400" style={{fontFamily: 'Patrick Hand, cursive'}}>{snapshot.month}</h3>
                              <div className="grid grid-cols-2 gap-3">
                                {(Object.entries(snapshot.areas) as [Category, number][]).map(([cat, score]) => {
                                  const catData = categories[cat];
                                  return (
                                    <div key={cat} className={`flex items-center justify-between p-3 ${catData.bg} rounded-lg border-2 ${catData.border}`}>
                                      <div className="flex items-center gap-2">
                                        <Icon name={catData.icon as any} size={18} className={catData.text} />
                                        <span className={`text-sm ${catData.text}`}>{catData.label}</span>
                                      </div>
                                      <span className={`text-xl font-bold ${catData.text}`}>{score}/10</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="flex flex-col items-center bg-gradient-to-br from-purple-950/30 to-pink-950/30 p-6 rounded-2xl border-2 border-purple-800/50">
                  <svg width="400" height="400" viewBox="0 0 400 400" className="max-w-full">
                    {(() => {
                      const centerX = 200;
                      const centerY = 200;
                      const maxRadius = 150;
                      const scores = getCategoryScores();
                      const categoryList = Object.keys(categories) as Category[];
                      const angleStep = 360 / categoryList.length;

                      const gridCircles = [];
                      for (let i = 2; i <= 10; i += 2) {
                        const radius = (i / 10) * maxRadius;
                        gridCircles.push(
                          <circle
                            key={`circle-${i}`}
                            cx={centerX}
                            cy={centerY}
                            r={radius}
                            fill="none"
                            stroke="rgba(139, 92, 246, 0.2)"
                            strokeWidth="2"
                          />
                        );
                      }

                      const gridLines = categoryList.map((_, index) => {
                        const angle = angleStep * index;
                        const angleRad = ((angle - 90) * Math.PI) / 180.0;
                        const endX = centerX + maxRadius * Math.cos(angleRad);
                        const endY = centerY + maxRadius * Math.sin(angleRad);
                        return (
                          <line
                            key={`line-${index}`}
                            x1={centerX}
                            y1={centerY}
                            x2={endX}
                            y2={endY}
                            stroke="rgba(139, 92, 246, 0.2)"
                            strokeWidth="2"
                          />
                        );
                      });

                      let pathData = '';
                      categoryList.forEach((cat, index) => {
                        const angle = angleStep * index;
                        const angleRad = ((angle - 90) * Math.PI) / 180.0;
                        const score = scores[cat];
                        const radius = (score / 10) * maxRadius;
                        const x = centerX + radius * Math.cos(angleRad);
                        const y = centerY + radius * Math.sin(angleRad);
                        
                        if (index === 0) {
                          pathData += `M ${x} ${y}`;
                        } else {
                          pathData += ` L ${x} ${y}`;
                        }
                      });
                      pathData += ' Z';

                      const labels = categoryList.map((cat, index) => {
                        const angle = angleStep * index;
                        const angleRad = ((angle - 90) * Math.PI) / 180.0;
                        const labelRadius = 170;
                        const x = centerX + labelRadius * Math.cos(angleRad);
                        const y = centerY + labelRadius * Math.sin(angleRad);
                        
                        return (
                          <text
                            key={`label-${cat}`}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            fill="#c084fc"
                            fontSize="14"
                            fontWeight="600"
                            fontFamily="Patrick Hand, cursive"
                          >
                            {categories[cat].label}
                          </text>
                        );
                      });

                      return (
                        <>
                          {gridCircles}
                          {gridLines}
                          <path
                            d={pathData}
                            fill="rgba(216, 180, 254, 0.4)"
                            stroke="rgba(168, 85, 247, 0.8)"
                            strokeWidth="3"
                          />
                          {labels}
                        </>
                      );
                    })()}
                  </svg>
                  
                  <div className="mt-6 text-center">
                    <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500" style={{fontFamily: 'Caveat, cursive'}}>
                      {(() => {
                        const scores = getCategoryScores();
                        const avg = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
                        return avg.toFixed(1);
                      })()}
                    </div>
                    <div className="text-purple-400 mt-2 text-lg" style={{fontFamily: 'Patrick Hand, cursive'}}>Средний балл ⭐</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-950/30 to-purple-950/30 p-6 rounded-2xl border-2 border-blue-800/50">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-400" style={{fontFamily: 'Patrick Hand, cursive'}}>
                      <Icon name="BarChart3" size={24} />
                      Оценка по категориям
                    </h3>
                    <div className="space-y-3">
                      {(Object.entries(getCategoryScores()) as [Category, number][]).map(([cat, score]) => {
                        const catData = categories[cat];
                        return (
                          <div key={cat} className={`flex items-center justify-between p-4 ${catData.bg} rounded-xl border-2 ${catData.border}`}>
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${catData.color}`}>
                                <Icon name={catData.icon as any} size={20} className="text-white" />
                              </div>
                              <span className={`font-medium ${catData.text}`}>{catData.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={score * 10} className="w-24 h-2" />
                              <span className={`text-2xl font-bold w-12 text-right ${catData.text}`}>{score}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-950/30 to-red-950/30 rounded-2xl border-2 border-orange-800/50 p-6">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-400" style={{fontFamily: 'Patrick Hand, cursive'}}>
                      <Icon name="AlertTriangle" size={24} />
                      Рекомендации 💡
                    </h3>
                    <div className="space-y-3">
                      {getRecommendations().length === 0 ? (
                        <div className="text-center py-4 text-green-300">
                          <Icon name="CheckCircle" size={32} className="mx-auto mb-2 text-green-500" />
                          <p className="font-medium text-lg" style={{fontFamily: 'Patrick Hand, cursive'}}>Отличный баланс! 🎉</p>
                          <p className="text-sm text-green-400 mt-1">Все сферы жизни в гармонии</p>
                        </div>
                      ) : (
                        getRecommendations().map((rec) => {
                          const catData = categories[rec.category];
                          return (
                            <div key={rec.category} className={`p-3 ${catData.bg} rounded-xl border-2 ${catData.border}`}>
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg bg-gradient-to-r ${catData.color} mt-1`}>
                                  <Icon name={catData.icon as any} size={18} className="text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`font-semibold ${catData.text}`}>{catData.label}</span>
                                    <span className="text-orange-400 font-bold">{rec.score}/10</span>
                                  </div>
                                  <p className="text-sm text-purple-300">{rec.advice}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}