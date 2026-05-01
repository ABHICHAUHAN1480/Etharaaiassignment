import { useEffect, useState } from 'react';
import { taskApi } from '../api/etharaapi';

const Task2 = ({ setMyTasks }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState('');

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const response = await taskApi.fetchMyTasks();
        setTasks(Array.isArray(response.data.tasks) ? response.data.tasks : []);
        setMyTasks(response.data.tasks.length);
      } catch (error) {
        console.error('Error fetching my tasks:', error);
        setError('Unable to load your tasks right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyTasks();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    setUpdatingTaskId(taskId);
    setError('');

    try {
      await taskApi.updateTaskStatus(taskId, newStatus);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      setError('Status could not be updated. Please try again.');
    } finally {
      setUpdatingTaskId('');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Assigned work</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">My Tasks</h2>
          <p className="mt-1 text-sm text-slate-500">Track your assigned work and update progress.</p>
        </div>
        <span className="status-pill self-start sm:self-auto">{tasks.length} tasks</span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div key={item} className="animate-pulse rounded-xl border border-slate-100 bg-slate-50 p-5">
              <div className="h-4 w-2/5 rounded bg-slate-200" />
              <div className="mt-3 h-3 w-4/5 rounded bg-slate-200" />
              <div className="mt-5 h-9 w-32 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <p className="text-lg font-semibold text-slate-900">No tasks assigned</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            When an admin assigns work to you, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((task) => {
            const status = task.status || 'todo';
            const statusColor =
              status === 'done'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : status === 'in-progress'
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-slate-200 bg-white text-slate-600';

            return (
              <article key={task._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-slate-950">{task.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {task.description || 'No description added.'}
                      </p>
                    </div>
                    <span className={`status-pill ${statusColor}`}>{status}</span>
                  </div>

                  <div className="grid gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-800">Project:</span>{' '}
                      {task.projectId?.name || 'Unknown project'}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">Assigned by:</span>{' '}
                      {task.assignedBy?.name || task.assignedBy?.email || 'Unknown'}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-800">Due:</span>{' '}
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label htmlFor={`status-${task._id}`} className="text-sm font-semibold text-slate-700">
                      Update status
                    </label>
                    <select
                      id={`status-${task._id}`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                      value={status}
                      onChange={(event) => handleUpdateStatus(task._id, event.target.value)}
                      disabled={updatingTaskId === task._id}
                    >
                      <option value="todo">todo</option>
                      <option value="in-progress">in-progress</option>
                      <option value="done">done</option>
                    </select>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Task2;
