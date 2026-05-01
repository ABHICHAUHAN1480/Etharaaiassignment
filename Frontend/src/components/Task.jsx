import { useCallback, useEffect, useMemo, useState } from 'react';
import { taskApi } from '../api/etharaapi';

const PlusIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
  </svg>
);

const TaskIcon = () => (
  <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M5.25 5.25h13.5v13.5H5.25z" />
  </svg>
);

const statusClasses = {
  done: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'in-progress': 'border-amber-200 bg-amber-50 text-amber-700',
  todo: 'border-slate-200 bg-white text-slate-600',
};

const Task = ({ project, profile, memberUsers }) => {
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', dueDate: '' });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [error, setError] = useState('');

  const memberNameById = useMemo(() => {
    const map = new Map();
    memberUsers.forEach((user) => {
      const userId = user?._id || user?.id || '';
      map.set(userId, user?.name || user?.email || 'Assigned member');
    });
    return map;
  }, [memberUsers]);

  const loadTasks = useCallback(async () => {
    try {
      const response = await taskApi.fetchProjectTasks(project._id);
      setTasks(Array.isArray(response.data.tasks) ? response.data.tasks : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Project tasks could not be loaded right now.');
    } finally {
      setIsLoadingTasks(false);
    }
  }, [project._id]);

  useEffect(() => {
    let isMounted = true;

    taskApi.fetchProjectTasks(project._id)
      .then((response) => {
        if (isMounted) {
          setTasks(Array.isArray(response.data.tasks) ? response.data.tasks : []);
        }
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
        if (isMounted) {
          setError('Project tasks could not be loaded right now.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingTasks(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [project._id]);
   
  const handleCreateTask = async (event) => {
    event.preventDefault();
    setError('');
    setIsCreatingTask(true);

    try {
      await taskApi.createTask({
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        projectId: project._id,
        assignedTo: taskForm.assignedTo || memberUsers[0]?.id || memberUsers[0]?._id,
        dueDate: taskForm.dueDate || undefined,
      });

      setTaskForm((form) => ({
        title: '',
        description: '',
        assignedTo: form.assignedTo,
        dueDate: '',
      }));
      setShowTaskForm(false);
      await loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      const responseError = error?.response?.data?.error;
      setError(
        typeof responseError === 'string'
          ? responseError
          : responseError?.message || 'Could not create the task. Please check the details.'
      );
    } finally {
      setIsCreatingTask(false);
    }
  };


  return (
    <section className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-base font-bold text-slate-950">Tasks</h4>
          <p className="mt-1 text-sm text-slate-500">Admin-created work assigned to project members.</p>
        </div>
        {profile?.role === 'admin' && (
          <button
            type="button"
            className="primary-button gap-2 self-start"
            onClick={() => setShowTaskForm((isOpen) => !isOpen)}
            disabled={memberUsers.length === 0}
            title={memberUsers.length === 0 ? 'Add a project member before assigning tasks' : 'Create task'}
          >
            <PlusIcon />
            New task
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {showTaskForm && (
        <form onSubmit={handleCreateTask} className="mt-5 grid gap-4 rounded-xl border border-white bg-white p-4 shadow-sm md:grid-cols-2">
          <div>
            <label htmlFor={`task-title-${project._id}`} className="field-label">
              Task title
            </label>
            <input
              id={`task-title-${project._id}`}
              className="field-input"
              value={taskForm.title}
              onChange={(event) => setTaskForm((form) => ({ ...form, title: event.target.value }))}
              placeholder="Prepare project brief"
              required
            />
          </div>
          <div>
            <label htmlFor={`task-assignee-${project._id}`} className="field-label">
              Assign to
            </label>
            <select
              id={`task-assignee-${project._id}`}
              className="field-input"
              value={taskForm.assignedTo || memberUsers[0]?.id || memberUsers[0]?._id || ''}
              onChange={(event) => setTaskForm((form) => ({ ...form, assignedTo: event.target.value }))}
              required
            >
              {memberUsers.map((user) => (
                <option key={user.id || user._id} value={user.id || user._id}>
                  {user.name || user.email || 'Project member'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`task-date-${project._id}`} className="field-label">
              Due date
            </label>
            <input
              id={`task-date-${project._id}`}
              type="date"
              className="field-input"
              value={taskForm.dueDate}
              onChange={(event) => setTaskForm((form) => ({ ...form, dueDate: event.target.value }))}
            />
          </div>
          <div className="md:row-span-2">
            <label htmlFor={`task-description-${project._id}`} className="field-label">
              Description
            </label>
            <textarea
              id={`task-description-${project._id}`}
              className="field-input min-h-28 resize-y"
              value={taskForm.description}
              onChange={(event) => setTaskForm((form) => ({ ...form, description: event.target.value }))}
              placeholder="Add the task details"
            />
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button type="button" className="secondary-button" onClick={() => setShowTaskForm(false)} disabled={isCreatingTask}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isCreatingTask}>
              {isCreatingTask ? 'Assigning...' : 'Assign task'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 space-y-3">
        {isLoadingTasks ? (
          <div className="animate-pulse rounded-xl border border-white bg-white p-4">
            <div className="h-4 w-2/5 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-3/5 rounded bg-slate-200" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
            No tasks have been assigned for this project yet.
          </div>
        ) : (
          tasks.map((task) => {
            const assignedId = typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo?._id || task.assignedTo?.id || '';
            const assignedName = task.assignedTo?.name || task.assignedTo?.email || memberNameById.get(assignedId) || 'Assigned member';
            const taskStatus = task.status || 'todo';

            return (
              <article key={task._id} className="rounded-xl border border-white bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <TaskIcon />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-950">{task.title}</h5>
                      {task.description && <p className="mt-1 text-sm leading-6 text-slate-500">{task.description}</p>}
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Assigned to {assignedName}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`status-pill ${statusClasses[taskStatus] || statusClasses.todo}`}>{taskStatus}</span>
                    {task.dueDate && (
                      <span className="status-pill">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};

export default Task;
