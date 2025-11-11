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

type Category = 'family' | 'career' | 'growth' | 'leisure' | 'friends';

interface Task {
  id: string;
  title: string;
  category: Category;
  completed: boolean;
  isHabit: boolean;
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
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Позвонить родителям', category: 'family', completed: true, isHabit: false },
    { id: '2', title: 'Утренняя зарядка', category: 'growth', completed: true, isHabit: true, streak: 5, daysTotal: 30 },
    { id: '3', title: 'Закончить проект', category: 'career', completed: false, isHabit: false },
  ]);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('career');
  const [isHabit, setIsHabit] = useState(false);
  const [habitDays, setHabitDays] = useState(7);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      category: selectedCategory,
      completed: false,
      isHabit: isHabit,
      ...(isHabit && { streak: 0, daysTotal: habitDays })
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setIsDialogOpen(false);
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

  const getCategoryStats = () => {
    const stats: Record<Category, { total: number; completed: number }> = {
      family: { total: 0, completed: 0 },
      career: { total: 0, completed: 0 },
      growth: { total: 0, completed: 0 },
      leisure: { total: 0, completed: 0 },
      friends: { total: 0, completed: 0 },
    };

    tasks.forEach(task => {
      stats[task.category].total++;
      if (task.completed) {
        stats[task.category].completed++;
      }
    });

    return stats;
  };

  const stats = getCategoryStats();
  const habits = tasks.filter(t => t.isHabit);
  const regularTasks = tasks.filter(t => !t.isHabit);

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
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-800/50 backdrop-blur-sm">
            <TabsTrigger value="tasks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600">
              <Icon name="CheckSquare" size={18} className="mr-2" />
              Трекер дел
            </TabsTrigger>
            <TabsTrigger value="habits" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600">
              <Icon name="Repeat" size={18} className="mr-2" />
              Привычки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
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
                    <p>Нет задач. Добавьте первую!</p>
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

            <Card className="p-6 bg-slate-800/40 backdrop-blur-sm border-slate-700 animate-scale-in">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Баланс категорий
              </h2>
              <div className="space-y-6">
                {Object.entries(categories).map(([key, cat]) => {
                  const categoryKey = key as Category;
                  const stat = stats[categoryKey];
                  const percentage = stat.total > 0 ? (stat.completed / stat.total) * 100 : 0;
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon name={cat.icon as any} size={20} />
                          <span className="font-medium">{cat.label}</span>
                        </div>
                        <span className="text-sm text-slate-400">
                          {stat.completed}/{stat.total}
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-3 bg-slate-700`}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="habits" className="space-y-4">
            <Card className="p-6 bg-slate-800/40 backdrop-blur-sm border-slate-700 animate-scale-in">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                <Icon name="Target" size={28} />
                Мои привычки
              </h2>
              
              <div className="space-y-4">
                {habits.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Icon name="Calendar" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Нет привычек. Создайте первую в трекере дел!</p>
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
