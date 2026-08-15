'use server'

import { getDailyLogs, upsertDailyLog, DailyLog } from '@/lib/db'

/**
 * Rules:
 * - Daily Goal: Require at least one finished task per day.
 * - Percentage Goal: Require finishing 80% of tasks due on that day.
 * - Grace Period: Let users miss one day per week without losing the streak.
 * - Time Zone Lock: Use local device time so streaks do not reset early.
 */

// We get the local date string "YYYY-MM-DD" from the client to respect Time Zone Lock.
export async function syncAndGetStreak(clientDateStr: string, tasksCompletedToday: number, tasksDueToday: number) {
  // Determine if the goal is met today:
  // "Require at least one finished task per day. OR finishing 80% of tasks due"
  // Re-reading rules:
  // "Daily Goal: Require at least one finished task per day."
  // "Percentage Goal: Require finishing 80% of tasks due on that day."
  // These sound like two conditions that both need to be true, or maybe one is sufficient?
  // Let's assume they must complete at least 1 task AND (if there are tasks due) complete 80%.
  // Wait, if no tasks are due, but they do one? Then tasksDue=0, they complete 1, 1/0 is Infinity, which is > 0.8.
  // Actually, let's implement: metGoal = tasksCompleted >= 1 && (tasksDue === 0 || (tasksCompleted / tasksDue) >= 0.8)
  
  const metGoal = tasksCompletedToday >= 1 && (tasksDueToday === 0 || (tasksCompletedToday / tasksDueToday) >= 0.8)
  
  // Save today's log
  upsertDailyLog(clientDateStr, tasksCompletedToday, tasksDueToday, metGoal)
  
  const logs = getDailyLogs()
  
  // Calculate Streak
  let streak = 0
  
  // If the user hasn't logged anything today (which shouldn't happen because we just upserted)
  // or maybe the logs are from previous days.
  
  // We need to iterate backwards from today.
  // We can use a loop over dates starting from `clientDateStr` and going backwards.
  // We keep track of weeks for the grace period. We define a week as Monday-Sunday or rolling 7 days.
  // The rule: "miss one day per week". Let's use ISO week (Monday-Sunday) to be consistent.
  // Or rolling 7 days? Usually "per week" means a calendar week.
  
  // Let's create a date iterator:
  let currentDate = new Date(clientDateStr)
  let graceUsedThisWeek = false
  let currentWeekNum = getWeekNumber(currentDate)
  
  const logsByDate = new Map(logs.map(log => [log.date, log]))
  
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const log = logsByDate.get(dateStr)
    const weekNum = getWeekNumber(currentDate)
    
    // Reset grace period tracker if we entered a new week going backwards
    if (weekNum !== currentWeekNum) {
      currentWeekNum = weekNum
      graceUsedThisWeek = false
    }
    
    if (log && log.met_goal === 1) {
      streak++
    } else {
      // Missed the goal (either no log or met_goal=0)
      
      // If it's today and they haven't met the goal yet, we don't break the streak immediately
      // unless they also missed yesterday without grace.
      // Actually, if it's today and they missed the goal, it just means today isn't counting towards the streak yet.
      // But if we use a grace day, the streak is maintained.
      if (dateStr === clientDateStr && (!log || log.met_goal === 0)) {
         // Today hasn't met the goal yet. We just skip counting today, but we don't break the streak.
         // Wait, if we use a grace day for today, does today count as 1 in the streak? Usually no, a grace day preserves the streak but doesn't increment it.
      } else {
         if (!graceUsedThisWeek) {
           graceUsedThisWeek = true
         } else {
           break // Streak broken
         }
      }
    }
    
    // Move to previous day
    currentDate.setDate(currentDate.getDate() - 1)
  }
  
  return streak
}

// ISO week number
function getWeekNumber(d: Date) {
  const date = new Date(d.getTime())
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  const week1 = new Date(date.getFullYear(), 0, 4)
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}
