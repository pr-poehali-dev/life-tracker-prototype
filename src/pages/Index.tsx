import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Category = 'health' | 'career' | 'relationships' | 'finance' | 'personal' | 'social' | 'environment' | 'spirituality';

interface Task {
  id: string;
  title: string;
  category: Category;
  completed: boolean;
  date: Date;
}

interface Habit {
  id: string;
  title: string;
  category: Category;
  streak: number;
  completedDates: string[];
  targetDays: number;
}

interface LifeSnapshot {
  date: string;
  scores: Record<Category, number>;
}

const categories = {
  health: { label: 'Здоровье', icon: 'Heart', color: 'emerald' },
  career: { label: 'Карьера', icon: 'Briefcase', color: 'blue' },
  relationships: { label: 'Отношения', icon: 'Users', color: 'pink' },
  finance: { label: 'Финансы', icon: 'DollarSign', color: 'green' },
  personal: { label: 'Рост', icon: 'TrendingUp', color: 'purple' },
  social: { label: 'Социум', icon: 'MessageCircle', color: 'orange' },
  environment: { label: 'Окружение', icon: 'Home', color: 'cyan' },
  spirituality: { label: 'Духовность', icon: 'Sparkles', color: 'violet' }
};

export default function Index() {
  const [isDark, setIsDark] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [history, setHistory] = useState<LifeSnapshot[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Category>('personal');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<Category>('health');
  const [newHabitDays, setNewHabitDays] = useState(30);
  const [isHabitDialogOpen, setIsHabitDialogOpen] = useState(false);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Date helpers
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return formatDate(date1) === formatDate(date2);
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
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

  const getMonthStart = () => {
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  };

  const getMonthDays = () => {
    const start = getMonthStart();
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < daysInMonth; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Task functions
  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      category: newTaskCategory,
      completed: false,
      date: selectedDate
    };
    setTasks([...tasks, task]);
    setNewTaskTitle('');
    setIsTaskDialogOpen(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(t => isSameDay(t.date, date));
  };

  // Habit functions
  const addHabit = () => {
    if (!newHabitTitle.trim()) return;
    const habit: Habit = {
      id: Date.now().toString(),
      title: newHabitTitle,
      category: newHabitCategory,
      streak: 0,
      completedDates: [],
      targetDays: newHabitDays
    };
    setHabits([...habits, habit]);
    setNewHabitTitle('');
    setIsHabitDialogOpen(false);
  };

  const toggleHabit = (id: string) => {
    const today = formatDate(new Date());
    setHabits(habits.map(h => {
      if (h.id === id) {
        const completed = h.completedDates.includes(today);
        const newDates = completed 
          ? h.completedDates.filter(d => d !== today)
          : [...h.completedDates, today];
        
        // Calculate streak
        let streak = 0;
        const sortedDates = [...newDates].sort().reverse();
        for (let i = 0; i < sortedDates.length; i++) {
          const checkDate = new Date();
          checkDate.setDate(checkDate.getDate() - i);
          if (sortedDates[i] === formatDate(checkDate)) {
            streak++;
          } else {
            break;
          }
        }
        
        return { ...h, completedDates: newDates, streak };
      }
      return h;
    }));
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const isHabitCompletedToday = (habit: Habit) => {
    return habit.completedDates.includes(formatDate(new Date()));
  };

  // Life wheel calculations
  const calculateCategoryScore = (category: Category): number => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Tasks completed this month
    const categoryTasks = tasks.filter(t => 
      t.category === category && 
      t.date >= monthStart
    );
    const tasksScore = categoryTasks.length === 0 ? 5 : 
      Math.round((categoryTasks.filter(t => t.completed).length / categoryTasks.length) * 10);
    
    // Habits in this category
    const categoryHabits = habits.filter(h => h.category === category);
    const habitsScore = categoryHabits.length === 0 ? 5 :
      Math.round((categoryHabits.reduce((sum, h) => sum + (h.completedDates.length / h.targetDays), 0) / categoryHabits.length) * 10);
    
    return Math.round((tasksScore + habitsScore) / 2);
  };

  const getAllScores = (): Record<Category, number> => {
    const scores: Record<Category, number> = {} as Record<Category, number>;
    (Object.keys(categories) as Category[]).forEach(cat => {
      scores[cat] = calculateCategoryScore(cat);
    });
    return scores;
  };

  const saveSnapshot = () => {
    const snapshot: LifeSnapshot = {
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
      scores: getAllScores()
    };
    setHistory([snapshot, ...history]);
  };

  const getAverageScore = () => {
    const scores = Object.values(getAllScores());
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  };

  const getColorClass = (score: number) => {
    if (score >= 8) return isDark ? 'text-emerald-400' : 'text-emerald-600';
    if (score >= 6) return isDark ? 'text-blue-400' : 'text-blue-600';
    if (score >= 4) return isDark ? 'text-amber-400' : 'text-amber-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  };

  const getBgClass = (score: number) => {
    if (score >= 8) return isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-100 border-emerald-300';
    if (score >= 6) return isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-100 border-blue-300';
    if (score >= 4) return isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-100 border-amber-300';
    return isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-100 border-red-300';
  };

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="container max-w-6xl mx-auto p-4 sm:p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Баланс жизни
            </h1>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
              Дела, привычки и аналитика
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Icon name="Sun" size={18} className={isDark ? 'text-slate-600' : 'text-amber-500'} />
            <Switch checked={isDark} onCheckedChange={setIsDark} />
            <Icon name="Moon" size={18} className={isDark ? 'text-blue-400' : 'text-slate-400'} />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList className={`grid w-full grid-cols-3 ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
            <TabsTrigger value="tasks" className={isDark ? 'data-[state=active]:bg-slate-800' : ''}>
              <Icon name="CheckSquare" size={16} className="mr-2" />
              Дела
            </TabsTrigger>
            <TabsTrigger value="habits" className={isDark ? 'data-[state=active]:bg-slate-800' : ''}>
              <Icon name="Target" size={16} className="mr-2" />
              Привычки
            </TabsTrigger>
            <TabsTrigger value="life" className={isDark ? 'data-[state=active]:bg-slate-800' : ''}>
              <Icon name="PieChart" size={16} className="mr-2" />
              Круг жизни
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Card className={`p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                    className={isDark && viewMode !== 'week' ? 'border-slate-700 text-slate-300' : ''}
                  >
                    Неделя
                  </Button>
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('month')}
                    className={isDark && viewMode !== 'month' ? 'border-slate-700 text-slate-300' : ''}
                  >
                    Месяц
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      if (viewMode === 'week') {
                        newDate.setDate(newDate.getDate() - 7);
                      } else {
                        newDate.setMonth(newDate.getMonth() - 1);
                      }
                      setSelectedDate(newDate);
                    }}
                    className={isDark ? 'border-slate-700 text-slate-300' : ''}
                  >
                    <Icon name="ChevronLeft" size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                    className={isDark ? 'border-slate-700 text-slate-300' : ''}
                  >
                    Сегодня
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      if (viewMode === 'week') {
                        newDate.setDate(newDate.getDate() + 7);
                      } else {
                        newDate.setMonth(newDate.getMonth() + 1);
                      }
                      setSelectedDate(newDate);
                    }}
                    className={isDark ? 'border-slate-700 text-slate-300' : ''}
                  >
                    <Icon name="ChevronRight" size={16} />
                  </Button>
                </div>
              </div>

              {/* Calendar View */}
              <div className={`grid gap-3 ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'}`}>
                {(viewMode === 'week' ? getWeekDays() : getMonthDays()).map((day, idx) => {
                  const dayTasks = getTasksForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDate);
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? isDark ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500 bg-blue-100'
                          : isDark ? 'border-slate-800 hover:border-slate-700' : 'border-slate-200 hover:border-slate-300'
                      } ${isToday ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}
                    >
                      <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
                      </div>
                      <div className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {day.getDate()}
                      </div>
                      {dayTasks.length > 0 && (
                        <div className="space-y-1">
                          {dayTasks.slice(0, 2).map(task => (
                            <div
                              key={task.id}
                              className={`text-xs truncate ${task.completed ? 'line-through opacity-50' : ''} ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                            >
                              {task.title}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                              +{dayTasks.length - 2}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Selected Date Tasks */}
            <Card className={`p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </h2>
                <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить
                    </Button>
                  </DialogTrigger>
                  <DialogContent className={isDark ? 'bg-slate-900 border-slate-800' : ''}>
                    <DialogHeader>
                      <DialogTitle className={isDark ? 'text-white' : ''}>Новое дело</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label className={isDark ? 'text-slate-300' : ''}>Название</Label>
                        <Input
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Что нужно сделать?"
                          className={isDark ? 'bg-slate-950 border-slate-800 text-white' : ''}
                          onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        />
                      </div>
                      <div>
                        <Label className={isDark ? 'text-slate-300' : ''}>Категория</Label>
                        <Select value={newTaskCategory} onValueChange={(v) => setNewTaskCategory(v as Category)}>
                          <SelectTrigger className={isDark ? 'bg-slate-950 border-slate-800 text-white' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={isDark ? 'bg-slate-900 border-slate-800' : ''}>
                            {(Object.entries(categories) as [Category, typeof categories[Category]][]).map(([key, cat]) => (
                              <SelectItem key={key} value={key} className={isDark ? 'text-white focus:bg-slate-800' : ''}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={addTask} className="w-full">
                        Создать
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {getTasksForDate(selectedDate).length === 0 ? (
                  <div className={`text-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Icon name="Calendar" size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Нет дел на этот день</p>
                  </div>
                ) : (
                  getTasksForDate(selectedDate).map(task => {
                    const cat = categories[task.category];
                    return (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTask(task.id)}
                        />
                        <div className="flex-1">
                          <div className={`font-medium ${task.completed ? 'line-through opacity-50' : ''} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {task.title}
                          </div>
                          <div className={`text-xs flex items-center gap-1 mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            <Icon name={cat.icon as any} size={12} />
                            {cat.label}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className={isDark ? 'text-slate-400 hover:text-red-400' : ''}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Habits Tab */}
          <TabsContent value="habits" className="space-y-4">
            <Card className={`p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Мои привычки
                </h2>
                <Dialog open={isHabitDialogOpen} onOpenChange={setIsHabitDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить
                    </Button>
                  </DialogTrigger>
                  <DialogContent className={isDark ? 'bg-slate-900 border-slate-800' : ''}>
                    <DialogHeader>
                      <DialogTitle className={isDark ? 'text-white' : ''}>Новая привычка</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label className={isDark ? 'text-slate-300' : ''}>Название</Label>
                        <Input
                          value={newHabitTitle}
                          onChange={(e) => setNewHabitTitle(e.target.value)}
                          placeholder="Название привычки"
                          className={isDark ? 'bg-slate-950 border-slate-800 text-white' : ''}
                        />
                      </div>
                      <div>
                        <Label className={isDark ? 'text-slate-300' : ''}>Категория</Label>
                        <Select value={newHabitCategory} onValueChange={(v) => setNewHabitCategory(v as Category)}>
                          <SelectTrigger className={isDark ? 'bg-slate-950 border-slate-800 text-white' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={isDark ? 'bg-slate-900 border-slate-800' : ''}>
                            {(Object.entries(categories) as [Category, typeof categories[Category]][]).map(([key, cat]) => (
                              <SelectItem key={key} value={key} className={isDark ? 'text-white focus:bg-slate-800' : ''}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className={isDark ? 'text-slate-300' : ''}>Целевое количество дней: {newHabitDays}</Label>
                        <Input
                          type="number"
                          value={newHabitDays}
                          onChange={(e) => setNewHabitDays(parseInt(e.target.value) || 30)}
                          min={1}
                          className={isDark ? 'bg-slate-950 border-slate-800 text-white' : ''}
                        />
                      </div>
                      <Button onClick={addHabit} className="w-full">
                        Создать
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {habits.length === 0 ? (
                  <div className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Icon name="Target" size={48} className="mx-auto mb-2 opacity-50" />
                    <p>Нет привычек</p>
                  </div>
                ) : (
                  habits.map(habit => {
                    const cat = categories[habit.category];
                    const progress = (habit.completedDates.length / habit.targetDays) * 100;
                    const isCompletedToday = isHabitCompletedToday(habit);
                    
                    return (
                      <Card
                        key={habit.id}
                        className={`p-4 border-2 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className={`font-semibold text-lg mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {habit.title}
                            </div>
                            <div className={`text-sm flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              <Icon name={cat.icon as any} size={14} />
                              {cat.label}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteHabit(habit.id)}
                            className={isDark ? 'text-slate-400 hover:text-red-400' : ''}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                              Прогресс: {habit.completedDates.length}/{habit.targetDays} дней
                            </span>
                            <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                              🔥 {habit.streak} дней подряд
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <Button
                            onClick={() => toggleHabit(habit.id)}
                            variant={isCompletedToday ? 'default' : 'outline'}
                            className={`w-full ${isCompletedToday ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                          >
                            <Icon name={isCompletedToday ? 'CheckCircle' : 'Circle'} size={16} className="mr-2" />
                            {isCompletedToday ? 'Выполнено сегодня' : 'Отметить выполнение'}
                          </Button>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Life Wheel Tab */}
          <TabsContent value="life" className="space-y-4">
            <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Баланс по сферам жизни
              </h2>
              <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                На основе выполненных дел и привычек за текущий месяц
              </p>

              <div className="text-center mb-6">
                <div className={`text-5xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {getAverageScore()}
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Средний балл
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {(Object.entries(categories) as [Category, typeof categories[Category]][]).map(([key, cat]) => {
                  const score = calculateCategoryScore(key);
                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border-2 ${getBgClass(score)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon name={cat.icon as any} size={20} className={getColorClass(score)} />
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {cat.label}
                          </span>
                        </div>
                        <span className={`text-2xl font-bold ${getColorClass(score)}`}>
                          {score}/10
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button onClick={saveSnapshot} className="flex-1">
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить снимок
                </Button>
                <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className={isDark ? 'border-slate-700 text-slate-300' : ''}>
                      <Icon name="History" size={16} className="mr-2" />
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
                          <Card key={idx} className={`p-4 ${isDark ? 'bg-slate-950 border-slate-800' : 'border-slate-200'}`}>
                            <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                              {snapshot.date}
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                              {(Object.entries(snapshot.scores) as [Category, number][]).map(([cat, score]) => {
                                const catData = categories[cat];
                                return (
                                  <div
                                    key={cat}
                                    className={`flex items-center justify-between p-2 rounded border ${getBgClass(score)}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Icon name={catData.icon as any} size={16} className={getColorClass(score)} />
                                      <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {catData.label}
                                      </span>
                                    </div>
                                    <span className={`font-bold ${getColorClass(score)}`}>
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
            </Card>

            {/* Statistics */}
            <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Статистика за текущий месяц
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-blue-50 border-blue-200'}`}>
                  <Icon name="CheckSquare" size={24} className={isDark ? 'text-blue-400 mb-2' : 'text-blue-600 mb-2'} />
                  <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {tasks.filter(t => t.completed).length}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Дел выполнено
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-emerald-50 border-emerald-200'}`}>
                  <Icon name="Target" size={24} className={isDark ? 'text-emerald-400 mb-2' : 'text-emerald-600 mb-2'} />
                  <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {habits.length}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Активных привычек
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-purple-50 border-purple-200'}`}>
                  <Icon name="Flame" size={24} className={isDark ? 'text-purple-400 mb-2' : 'text-purple-600 mb-2'} />
                  <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {Math.max(...habits.map(h => h.streak), 0)}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Лучшая серия
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
