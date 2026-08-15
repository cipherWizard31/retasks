import { getTasks } from '../lib/db';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const tasks = getTasks();
  return <DashboardClient tasks={tasks} />;
}
