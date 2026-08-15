import { getTasks } from '../../lib/db';
import TodayClient from './TodayClient';

export default async function TodayPage() {
  const tasks = getTasks();
  return <TodayClient initialTasks={tasks} />;
}
