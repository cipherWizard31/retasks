import type { Task } from './data';

export type AppBackup = {
  version: string;
  timestamp: string;
  tasks: Task[];
  categories?: any[];
  history?: any[];
  preferences?: Record<string, any>;
};

/**
 * Generates and downloads a JSON file in the browser.
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports tasks list to formatted JSON.
 */
export function exportTasksToJSON(tasks: Task[]) {
  const jsonStr = JSON.stringify(tasks, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(jsonStr, `retasks_export_${dateStr}.json`, 'application/json');
}

/**
 * Exports tasks list to CSV format.
 */
export function exportTasksToCSV(tasks: Task[]) {
  const headers = ['id', 'title', 'description', 'category', 'priority', 'status', 'repeatType', 'repeatInterval', 'reminderTime', 'startDate', 'completionRate', 'streak', 'totalCompleted', 'totalMissed'];
  
  const rows = tasks.map(t => [
    t.id,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.category,
    t.priority,
    t.status,
    t.repeatType,
    t.repeatInterval || 1,
    t.reminderTime || '',
    t.startDate,
    t.completionRate,
    t.streak,
    t.totalCompleted,
    t.totalMissed,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `retasks_export_${dateStr}.csv`, 'text/csv');
}

/**
 * Creates a full system backup JSON download.
 */
export function exportFullBackup(tasks: Task[], categories: any[] = [], history: any[] = []) {
  const backup: AppBackup = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    tasks,
    categories,
    history,
  };
  const jsonStr = JSON.stringify(backup, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(jsonStr, `retasks_backup_${dateStr}.json`, 'application/json');
}

/**
 * Parses uploaded JSON or CSV file into Task array.
 */
export function parseImportTasks(fileContent: string, isCsv: boolean = false): Task[] {
  if (isCsv) {
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return [];
    
    // Skip header line
    const tasks: Task[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 2) {
        tasks.push({
          id: parts[0]?.replace(/"/g, '') || `import-${Date.now()}-${i}`,
          title: parts[1]?.replace(/"/g, '') || 'Imported Task',
          description: parts[2]?.replace(/"/g, '') || '',
          category: (parts[3]?.replace(/"/g, '') as any) || 'personal',
          priority: (parts[4]?.replace(/"/g, '') as any) || 'medium',
          status: (parts[5]?.replace(/"/g, '') as any) || 'due',
          repeatType: (parts[6]?.replace(/"/g, '') as any) || 'daily',
          startDate: parts[9]?.replace(/"/g, '') || new Date().toISOString().split('T')[0],
          completionLogic: 'fixed',
          completionRate: Number(parts[10]) || 0,
          streak: Number(parts[11]) || 0,
          totalCompleted: Number(parts[12]) || 0,
          totalMissed: Number(parts[13]) || 0,
        });
      }
    }
    return tasks;
  }

  // Parse JSON
  const parsed = JSON.parse(fileContent);
  if (Array.isArray(parsed)) {
    return parsed as Task[];
  } else if (parsed && Array.isArray(parsed.tasks)) {
    return parsed.tasks as Task[];
  }
  return [];
}
