'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/app/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/ui/dialog"
import { Textarea } from "@/app/ui/textarea"
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import twemoji from 'twemoji'

type Habit = {
  name: string
  value: number
  emoji: string
  xpGain: number
}

type HabitCompletion = {
  name: string
  completedAt: string
  note?: string
  xpGained: number
}

const PixelBox: React.FC<{ emoji: string }> = ({ emoji }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      twemoji.parse(ref.current, {
        folder: 'svg',
        ext: '.svg'
      })
    }
  }, [emoji])

  return (
    <div 
      ref={ref}
      className="w-8 h-8 flex items-center justify-center bg-yellow-400 border-2 border-black text-2xl"
    >
      {emoji}
    </div>
  )
}

const LevelUpAnimation: React.FC<{ onClose: () => void, message: string }> = ({ onClose, message }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-black border-4 border-yellow-400 p-8 rounded-lg text-center">
        <div className="animate-bounce mb-4">
          <h2 className="text-4xl font-bold text-yellow-400 mb-4">LEVEL UP!</h2>
          <p className="text-white mb-4">{message}</p>
        </div>
        <Button onClick={onClose} className="bg-yellow-400 text-black hover:bg-yellow-500">
          OK
        </Button>
      </div>
    </div>
  )
}

const TimeMachine: React.FC<{
  completedHabits: HabitCompletion[]
  onClose: () => void
}> = ({ completedHabits, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [calendar, setCalendar] = useState<Date[]>([])

  useEffect(() => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    
    const days = []
    for (let d = new Date(firstDayOfMonth); d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d))
    }
    setCalendar(days)
  }, [currentMonth])

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    if (nextMonth <= new Date()) {
      setCurrentMonth(nextMonth)
    }
  }

  const habitsForSelectedDate = completedHabits.filter(
    habit => new Date(habit.completedAt).toDateString() === selectedDate.toDateString()
  )

  const totalXpForDay = habitsForSelectedDate.reduce((sum, habit) => sum + habit.xpGained, 0)

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-black border-4 border-yellow-400 p-8 rounded-lg text-white max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Habit Time Machine 🕰️</h2>
        <div className="flex justify-between items-center mb-4">
          <Button onClick={goToPreviousMonth} className="bg-gray-800 hover:bg-gray-700">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <span className="text-lg font-bold">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <Button 
            onClick={goToNextMonth} 
            disabled={new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1) > new Date()}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs text-gray-500">{day}</div>
          ))}
          {calendar.map((date, index) => (
            <Button
              key={index}
              onClick={() => setSelectedDate(date)}
              disabled={date > new Date()}
              className={`h-10 ${
                date.toDateString() === selectedDate.toDateString()
                  ? 'bg-yellow-400 text-black'
                  : date > new Date()
                  ? 'bg-gray-700 text-gray-500'
                  : 'bg-gray-800 text-white'
              }`}
            >
              {date.getDate()}
            </Button>
          ))}
        </div>
        <h3 className="text-xl font-bold mb-2">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </h3>
        {habitsForSelectedDate.length > 0 ? (
          <div className="space-y-4">
            {habitsForSelectedDate.map((habit, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">{habit.name}</span>
                  <span className="text-yellow-400">+{habit.xpGained} XP</span>
                </div>
                {habit.note && <p className="text-sm text-gray-400">{habit.note}</p>}
              </div>
            ))}
            <div className="text-right text-yellow-400 font-bold">
              Total XP: {totalXpForDay}
            </div>
          </div>
        ) : (
          <p>No habits completed on this day.</p>
        )}
        <Button onClick={onClose} className="mt-4 w-full bg-yellow-400 text-black hover:bg-yellow-500">
          Return to Present
        </Button>
      </div>
    </div>
  )
}

export function HabitRpg() {
  const [habits, setHabits] = useState<Habit[]>([
    { name: 'Workout', value: 1, emoji: '💪', xpGain: 15 },
    { name: 'Shower', value: 1, emoji: '🚿', xpGain: 10 },
    { name: 'Gratitude', value: 1, emoji: '🙏', xpGain: 15 },
    { name: 'Work', value: 1, emoji: '💼', xpGain: 20 },
    { name: 'Play Video Game', value: 1, emoji: '🎮', xpGain: 5 },
    { name: 'Tidy Up', value: 1, emoji: '🧹', xpGain: 15 },
    { name: 'Help Others', value: 1, emoji: '🤝', xpGain: 25 },
    { name: 'Wake up early', value: 1, emoji: '🌅', xpGain: 20 },
    { name: 'Go to bed at 11pm', value: 1, emoji: '🛌', xpGain: 20 },
    { name: 'Eat Fruit', value: 1, emoji: '🍎', xpGain: 10 },
    { name: 'No screen time before bed', value: 1, emoji: '📵', xpGain: 15 },
    { name: 'Take a walk', value: 1, emoji: '🚶', xpGain: 15 },
  ])

  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([])
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [currentHabit, setCurrentHabit] = useState<Habit | null>(null)
  const [note, setNote] = useState('')
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [levelUpMessage, setLevelUpMessage] = useState('')
  const [showTimeMachine, setShowTimeMachine] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const storedCompletions = localStorage.getItem('completedHabits')
    if (storedCompletions) {
      setCompletedHabits(JSON.parse(storedCompletions))
    }
    const storedXp = localStorage.getItem('xp')
    if (storedXp) {
      const parsedXp = parseInt(storedXp)
      setXp(parsedXp)
      setLevel(Math.floor(parsedXp / 100) + 1)
    }
    const storedHabits = localStorage.getItem('habits')
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits))
    }
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('completedHabits', JSON.stringify(completedHabits))
      localStorage.setItem('xp', xp.toString())
      localStorage.setItem('habits', JSON.stringify(habits))
    }
  }, [completedHabits, xp, habits, isInitialized])

  const checkLevelUp = (newXp: number, habitName: string) => {
    const newLevel = Math.floor(newXp / 100) + 1;
    
    // Check if the level has increased
    if (newLevel > level) {
      setLevel(newLevel);
      setLevelUpMessage(`You've improved your ${habitName} habits and reached level ${newLevel}!`);
      setShowLevelUp(true);
    }
  
    // Find the habit and check if it meets mastery conditions
    const habit = habits.find(h => h.name === habitName);
    if (habit && habit.value >= 50 && habit.value % 50 === 0) {
      setLevelUpMessage(`You've mastered ${habitName}! Keep up the great work!`);
      setShowLevelUp(true);
    }
  };
  

  const isHabitCompletedToday = (habitName: string) => {
    const today = new Date().toDateString()
    return completedHabits.some(h => h.name === habitName && new Date(h.completedAt).toDateString() === today)
  }

  const openNoteModal = (habit: Habit) => {
    setCurrentHabit(habit)
    setIsNoteModalOpen(true)
  }

  const completeHabit = () => {
    if (!currentHabit) return

    const newCompletion: HabitCompletion = {
      name: currentHabit.name,
      completedAt: new Date().toISOString(),
      note: note.trim() || undefined,
      xpGained: currentHabit.xpGain
    }

    setCompletedHabits(prev => [...prev, newCompletion])
    const newXp = xp + currentHabit.xpGain
    setXp(newXp)
    setHabits(prev => prev.map(habit => 
      habit.name === currentHabit.name ? { ...habit, value: habit.value + 1 } : habit
    ))
    checkLevelUp(newXp, currentHabit.name)

    setIsNoteModalOpen(false)
    setCurrentHabit(null)
    setNote('')
  }

  const clearProgress = () => {
    setXp(0)
    setLevel(1)
    setCompletedHabits([])
    setHabits(habits.map(habit => ({ ...habit, value: 1 })))
    localStorage.removeItem('completedHabits')
    localStorage.removeItem('xp')
    localStorage.removeItem('habits')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-500 text-white p-4 font-mono">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        body {
          font-family: 'Press Start 2P', cursive;
        }
        .emoji {
          height: 1em;
          width: 1em;
          margin: 0 .05em 0 .1em;
          vertical-align: -0.1em;
        }
      `}</style>
      <div className="max-w-2xl w-full bg-black border-4 border-white rounded-lg shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-yellow-400">Habit RPG</h1>
        <div className="flex justify-between items-center bg-gray-800 p-2 border-2 border-white">
          <div className="text-lg">Level {level}</div>
          <div className="flex items-center">
            <PixelBox emoji="⚔️" />
            <span className="ml-2">{xp} XP</span>
          </div>
        </div>
        <div className="w-full bg-gray-700 border-2 border-white">
          <div className="bg-green-500 h-4" style={{ width: `${(xp % 100)}%` }}></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {habits.map((habit) => {
            const isCompleted = isHabitCompletedToday(habit.name);
            const isMastered = habit.value >= 50;
            return (
              <Button
                key={habit.name}
                onClick={() => openNoteModal(habit)}
                disabled={isCompleted}
                className={`h-auto p-2 border-2 ${
                  isCompleted ? "bg-green-200 text-black border-green-400" : 
                  isMastered ? "bg-yellow-600 hover:bg-yellow-700 border-yellow-400" :
                  "bg-gray-800 hover:bg-gray-700 border-white"
                }`}
              >
                <div className="flex flex-col items-start w-full">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center">
                      <PixelBox emoji={habit.emoji} />
                      <span className="ml-2 text-xs">{habit.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">{habit.value}</span>
                      {isMastered && <Star className="w-4 h-4 text-yellow-400" />}
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 border border-white mt-2">
                    <div 
                      className={`h-2 ${isMastered ? 'bg-yellow-400' : 'bg-blue-500'}`} 
                      style={{ width: `${Math.min((habit.value / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
        <Button
          onClick={() => setShowTimeMachine(true)}
          className="w-full bg-purple-600 hover:bg-purple-700 border-2 border-white text-white"
        >
          Open Time Machine 🕰️
        </Button>
        <Button
          onClick={clearProgress}
          className="w-full bg-red-600 hover:bg-red-700 border-2 border-white text-white"
        >
          Clear Progress (Debug)
        </Button>
      </div>

      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent className="bg-black border-4 border-white text-white font-mono">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">{currentHabit?.name}</DialogTitle>
            <DialogDescription className="text-gray-400">Add an optional note for this habit completion.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Add your note here... (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-gray-800 border-2 border-white text-white"
          />
          <DialogFooter>
            <Button variant="destructive" onClick={() => setIsNoteModalOpen(false)} className="border-2 border-white">
              Cancel
            </Button>
            <Button onClick={completeHabit} className="bg-green-600 hover:bg-green-700 border-2 border-white">Complete Habit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showLevelUp && <LevelUpAnimation onClose={() => setShowLevelUp(false)} message={levelUpMessage} />}
      {showTimeMachine && <TimeMachine completedHabits={completedHabits} onClose={() => setShowTimeMachine(false)} />}
    </div>
  )
}