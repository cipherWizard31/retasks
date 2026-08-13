import { getTasks, seedTasks } from '../lib/db';
import { TASKS } from '../lib/data';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  let tasks = getTasks();

  if (tasks.length === 0) {
    seedTasks(TASKS);
    tasks = getTasks();
  }

  return <DashboardClient tasks={tasks} />;
}
