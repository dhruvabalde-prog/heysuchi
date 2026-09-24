export function missionProgress(tasks: Array<{status:string}>) {
  const total = tasks.length;
  const completed = tasks.filter((task) => ["done","verified"].includes(task.status)).length;
  return { total, completed, progress: total ? Math.round((completed / total) * 100) : 0, complete: total > 0 && completed === total };
}
