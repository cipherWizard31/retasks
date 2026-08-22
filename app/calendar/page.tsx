import { getTasks } from '../../lib/db';
import CalendarClient from './CalendarClient';

export default async function CalendarPage() {
  const tasks = getTasks();
  return <CalendarClient initialTasks={tasks} />;
}
