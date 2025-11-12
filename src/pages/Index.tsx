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
import { useNavigate } from 'react-router-dom';

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
  family: { label: 'Семья', icon: 'Heart', color: 'from-pink-500 to-rose-500' },
  career: { label: 'Карьера', icon: 'Briefcase', color: 'from-purple-500 to-violet-500' },
  growth: { label: 'Развитие', icon: 'BookOpen', color: 'from-blue-500 to-cyan-500' },
  leisure: { label: 'Отдых', icon: 'Coffee', color: 'from-orange-500 to-amber-500' },
  friends: { label: 'Друзья', icon: 'Users', color: 'from-green-500 to-emerald-500' },
};

export default function Index() {
  const navigate = useNavigate();
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

  const tasksForSelectedDate = getTasksForDate(selectedDate);
  const habits = tasksForSelectedDate.filter(t => t.isHabit);
  const regularTasks = tasksForSelectedDate.filter(t => !t.isHabit);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
  };

  const getDatesWithTasks = () => {
    return tasks.map(task => task.date);
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

  const getWeekDays = (date: Date) => {
    const start = getWeekStart(date);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            LifeBalance
          </h1>
          <p className="text-slate-300 text-lg">Гармония через действия</p>
        </div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-800/50 backdrop-blur-sm">
            <TabsTrigger value="tasks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600">
              <Icon name="CheckSquare" size={18} className="mr-2" />
              Трекер дел
            </TabsTrigger>
            <TabsTrigger value="habits" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600">
              <Icon name="Repeat" size={18} className="mr-2" />
              Привычки
            </TabsTrigger>
            <TabsTrigger 
              value="lifewheel" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-purple-600"
              onClick={() => navigate('/life-wheel')}
            >
              <Icon name="Target" size={18} className="mr-2" />
              Колесо баланса
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <Card className="p-6 bg-slate-800/40 backdrop-blur-sm border-slate-700 animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                  <Icon name="Calendar" size={24} />
                  Календарь
                </h2>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={calendarView === 'week' ? 'default' : 'outline'}
                    onClick={() => setCalendarView('week')}
                    className={calendarView === 'week' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'border-slate-600 text-slate-300'}
                  >
                    Неделя
                  </Button>
                  <Button
                    size="sm"
                    variant={calendarView === 'month' ? 'default' : 'outline'}
                    onClick={() => setCalendarView('month')}
                    className={calendarView === 'month' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'border-slate-600 text-slate-300'}
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
                    className="rounded-md border border-slate-700 bg-slate-900/50"
                    modifiers={{
                      hasTasks: getDatesWithTasks()
                    }}
                    modifiersClassNames={{
                      hasTasks: 'bg-purple-500/30 font-bold'
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
                        className="text-slate-300 hover:text-white"
                      >
                        <Icon name="ChevronLeft" size={24} />
                      </Button>
                      <h3 className="text-lg font-semibold text-slate-200">
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
                        className="text-slate-300 hover:text-white"
                      >
                        <Icon name="ChevronRight" size={24} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {getWeekDays(selectedDate).map((day, index) => {
                        const isSelected = isSameDay(day, selectedDate);
                        const hasTasks = getTasksForDate(day).length > 0;
                        const isToday = isSameDay(day, today);
                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedDate(day)}
                            className={`p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 ${
                              isSelected
                                ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg'
                                : hasTasks
                                ? 'bg-purple-500/20 border border-purple-500/50 text-slate-200'
                                : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'
                            } ${isToday ? 'ring-2 ring-cyan-400' : ''}`}
                          >
                            <div className="text-xs mb-1 font-medium">
                              {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
                            </div>
                            <div className="text-2xl font-bold">{day.getDate()}</div>
                            {hasTasks && !isSelected && (
                              <div className="mt-1 flex justify-center">
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center text-slate-300 mb-4">
                <p className="text-lg">Выбрана дата: <span className="font-bold text-purple-400">{formatDate(selectedDate)}</span></p>
              </div>
            </Card>

            <Card className="p-6 bg-slate-800/40 backdrop-blur-sm border-slate-700 animate-scale-in">
              <div className="flex gap-3 mb-4">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105">
                      <Icon name="Plus" size={20} className="mr-2" />
                      Добавить дело
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Новое дело
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="task-title">Название</Label>
                        <Input
                          id="task-title"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Например: Позвонить родителям"
                          className="bg-slate-900 border-slate-700 mt-2"
                          onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        />
                      </div>
                      
                      <div>
                        <Label>Категория</Label>
                        <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as Category)}>
                          <SelectTrigger className="bg-slate-900 border-slate-700 mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
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

                      <div className="flex items-center justify-between">
                        <Label htmlFor="is-habit">Сделать привычкой</Label>
                        <Switch
                          id="is-habit"
                          checked={isHabit}
                          onCheckedChange={setIsHabit}
                        />
                      </div>

                      {isHabit && (
                        <div>
                          <Label htmlFor="habit-days">Количество дней</Label>
                          <Input
                            id="habit-days"
                            type="number"
                            value={habitDays}
                            onChange={(e) => setHabitDays(parseInt(e.target.value) || 7)}
                            min="1"
                            className="bg-slate-900 border-slate-700 mt-2"
                          />
                        </div>
                      )}

                      <Button 
                        onClick={addTask}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Создать
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {regularTasks.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Нет задач на выбранную дату. Добавьте первую!</p>
                  </div>
                ) : (
                  regularTasks.map((task) => {
                    const cat = categories[task.category];
                    return (
                      <div
                        key={task.id}
                        className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${cat.color} bg-opacity-10 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:scale-[1.02]`}
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleTask(task.id)}
                          className={`rounded-full ${task.completed ? 'bg-green-500/20 text-green-400' : 'bg-slate-700'}`}
                        >
                          <Icon name={task.completed ? 'Check' : 'Circle'} size={20} />
                        </Button>
                        
                        <div className="flex-1">
                          <p className={`font-medium ${task.completed ? 'line-through opacity-60' : ''}`}>
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
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Icon name="Trash2" size={18} />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="habits" className="space-y-4">
            <Card className="p-6 bg-slate-800/40 backdrop-blur-sm border-slate-700 animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                  <Icon name="Target" size={28} />
                  Мои привычки
                </h2>
                <Dialog open={isHabitDialogOpen} onOpenChange={setIsHabitDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105">
                      <Icon name="Plus" size={20} className="mr-2" />
                      Новая привычка
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Создать привычку
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="habit-title">Название привычки</Label>
                        <Input
                          id="habit-title"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Например: Утренняя зарядка"
                          className="bg-slate-900 border-slate-700 mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label>Категория</Label>
                        <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as Category)}>
                          <SelectTrigger className="bg-slate-900 border-slate-700 mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
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
                        <Label>Дата начала</Label>
                        <div className="mt-2 flex justify-center p-3 bg-slate-900 rounded-lg border border-slate-700">
                          <Calendar
                            mode="single"
                            selected={habitStartDate}
                            onSelect={(date) => date && setHabitStartDate(date)}
                            className="rounded-md"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="habit-days">Количество дней</Label>
                        <Input
                          id="habit-days"
                          type="number"
                          min="1"
                          max="365"
                          value={habitDays}
                          onChange={(e) => setHabitDays(Number(e.target.value))}
                          className="bg-slate-900 border-slate-700 mt-2"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Привычка будет создана на {habitDays} {habitDays === 1 ? 'день' : habitDays < 5 ? 'дня' : 'дней'} начиная с {formatDate(habitStartDate)}
                        </p>
                      </div>

                      <Button
                        onClick={addHabit}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Создать привычку
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                {habits.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Icon name="Calendar" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Нет привычек на выбранную дату. Создайте первую в трекере дел!</p>
                  </div>
                ) : (
                  habits.map((habit) => {
                    const cat = categories[habit.category];
                    const progressPercent = habit.daysTotal ? ((habit.streak || 0) / habit.daysTotal) * 100 : 0;
                    
                    return (
                      <div
                        key={habit.id}
                        className={`p-6 rounded-2xl bg-gradient-to-br ${cat.color} bg-opacity-10 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:scale-[1.02]`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{habit.title}</h3>
                            <Badge variant="outline" className={`bg-gradient-to-r ${cat.color} border-none text-white`}>
                              <Icon name={cat.icon as any} size={12} className="mr-1" />
                              {cat.label}
                            </Badge>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteTask(habit.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Icon name="Trash2" size={18} />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">Прогресс</span>
                            <span className="font-bold text-lg">
                              {habit.streak}/{habit.daysTotal} дней
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-2 bg-slate-700" />
                          
                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              onClick={() => toggleTask(habit.id)}
                              className={`flex-1 ${
                                habit.completed 
                                  ? 'bg-green-600 hover:bg-green-700' 
                                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 animate-pulse-glow'
                              }`}
                            >
                              <Icon name={habit.completed ? 'CheckCircle2' : 'Circle'} size={18} className="mr-2" />
                              {habit.completed ? 'Выполнено сегодня' : 'Отметить выполнение'}
                            </Button>
                          </div>
                        </div>

                        {habit.streak && habit.streak >= 3 && (
                          <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30 text-center">
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
        </Tabs>
      </div>
    </div>
  );
}