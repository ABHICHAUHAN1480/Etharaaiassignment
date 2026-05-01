import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi, userApi } from '../api/etharaapi';
import Project from '../components/Project';
import Task2 from '../components/Task2';
const normalizeProjects = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.projects)) return payload.projects;
  if (Array.isArray(payload?.project)) return payload.project;
  return [];
};

const ChevronIcon = ({ isOpen }) => (
  <svg
    aria-hidden="true"
    className={`h-5 w-5 transition ${isOpen ? 'rotate-180' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
  </svg>
);

const LogoutIcon = () => (
  <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m12 0-4-4m4 4-4 4M21 4v16" />
  </svg>
);

const PlusIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
  </svg>
);

const Home = () => {
  const [profile, setProfile] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [openProjectId, setOpenProjectId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [projectFormError, setProjectFormError] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const navigate = useNavigate();
  const projects = useMemo(() => (Array.isArray(myProjects) ? myProjects : []), [myProjects]);
  const [mytasks, setMyTasks] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      setIsLoading(true);
      setError('');

      try {
        const profileResponse = await userApi.getProfile();
        if (!isMounted) return;
        setProfile(profileResponse.data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
        navigate('/login');
        return;
      }

      try {
        const projectResponse = await projectApi.fetchuserProjects();
        if (!isMounted) return;
        setMyProjects(normalizeProjects(projectResponse.data));
      } catch (error) {
        console.error('Error fetching user projects:', error);
        if (isMounted) {
          setError('Projects could not be loaded right now. Please refresh in a moment.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const dashboardStats = useMemo(() => {
    const totalMembers = projects.reduce((count, project) => count + (project.members?.length || 0), 0);

    return [
      { label: 'Projects', value: projects.length },
      { label: 'Member slots', value: totalMembers },
      { label: 'Role', value: profile?.role === 'admin' ? 'Admin' : 'Member' },
      { label: 'My tasks', value: mytasks },
    ];
  }, [projects, profile]);

  const toggleProject = (id) => {
    setOpenProjectId((prev) => (prev === id ? null : id));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleProjectUpdate = (updatedProject) => {
    if (!updatedProject?._id) return;

    setMyProjects((currentProjects) => {
      const list = Array.isArray(currentProjects) ? currentProjects : [];
      return list.map((project) => (project._id === updatedProject._id ? updatedProject : project));
    });
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    setProjectFormError('');
    setIsCreatingProject(true);

    try {
      const response = await projectApi.createProject({
        name: projectForm.name.trim(),
        description: projectForm.description.trim(),
      });
      const createdProject = response.data.project;

      if (createdProject) {
        setMyProjects((currentProjects) => [createdProject, ...(Array.isArray(currentProjects) ? currentProjects : [])]);
        setOpenProjectId(createdProject._id);
      }

      setProjectForm({ name: '', description: '' });
      setIsProjectModalOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
      const responseError = error?.response?.data?.error;
      setProjectFormError(
        typeof responseError === 'string'
          ? responseError
          : responseError?.message || 'Project could not be created. Please check the details.'
      );
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <main className="app-shell px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-base font-black text-cyan-300">
              E
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Ethara AI</p>
              <h1 className="text-xl font-bold text-slate-950">Project workspace</h1>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="secondary-button gap-2 self-start sm:self-auto">
            <LogoutIcon />
            Logout
          </button>
        </header>

        <section className="mb-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/80 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Dashboard</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              {profile ? `Hello, ${profile.name}` : 'Loading your workspace'}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Your assigned projects and team access are collected here so you can quickly check status and membership.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-1">
            {dashboardStats.map((stat) => (
              <div key={stat.label} className="surface p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">My Projects</h2>
              <p className="mt-1 text-sm text-slate-500">Open a project to view its team members.</p>
            </div>
            {profile?.role === 'admin' && (
              <button
                type="button"
                className="primary-button gap-2 self-start disabled:opacity-70"
                onClick={() => setIsProjectModalOpen(true)}
              >
                <PlusIcon />
                New project
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4 p-5 sm:p-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="animate-pulse rounded-xl border border-slate-100 bg-slate-50 p-5">
                  <div className="h-4 w-2/5 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-4/5 rounded bg-slate-200" />
                  <div className="mt-5 h-9 w-28 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 sm:p-6">
              {error && (
                <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                  {error}
                </div>
              )}

              {projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                  <p className="text-lg font-semibold text-slate-900">No projects assigned yet</p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Once a project is assigned to your account, it will appear here with its team membership.
                  </p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {projects.map((project) => {
                    const isOpen = openProjectId === project._id;

                    return (
                      <li key={project._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-200 hover:shadow-md">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-bold text-slate-950">{project.name}</h3>
                              <span className="status-pill">{profile?.role === 'admin' ? 'Admin' : 'Member'}</span>
                            </div>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                              {project.description || 'No description has been added for this project.'}
                            </p>
                            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                              {project.members?.length || 0} members
                            </p>
                          </div>

                          <button
                            type="button"
                            className="icon-button"
                            onClick={() => toggleProject(project._id)}
                            aria-label={isOpen ? 'Collapse project' : 'Expand project'}
                            title={isOpen ? 'Collapse project' : 'Expand project'}
                          >
                            <ChevronIcon isOpen={isOpen} />
                          </button>
                        </div>

                        {isOpen && (
                          <div className="mt-5 border-t border-slate-100 pt-5">
                            <Project project={project} profile={profile} onProjectUpdate={handleProjectUpdate} />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </section>


      { profile?.role !== 'admin' && (
        <section className="surface overflow-hidden mt-5">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Task2 setMyTasks={setMyTasks} />
          </div>
        </section>
      )}
        {isProjectModalOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
            <section className="surface w-full max-w-lg p-6">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Admin action</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Create new project</h2>
                <p className="mt-2 text-sm text-slate-500">Add the project details now, then add members and tasks from the project panel.</p>
              </div>

              {projectFormError && (
                <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {projectFormError}
                </div>
              )}

              <form onSubmit={handleCreateProject} className="space-y-5">
                <div>
                  <label htmlFor="project-name" className="field-label">
                    Project name
                  </label>
                  <input
                    id="project-name"
                    className="field-input"
                    value={projectForm.name}
                    onChange={(event) => setProjectForm((form) => ({ ...form, name: event.target.value }))}
                    placeholder="Client onboarding"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="project-description" className="field-label">
                    Description
                  </label>
                  <textarea
                    id="project-description"
                    className="field-input min-h-28 resize-y"
                    value={projectForm.description}
                    onChange={(event) => setProjectForm((form) => ({ ...form, description: event.target.value }))}
                    placeholder="What should this project accomplish?"
                    required
                  />
                </div>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setIsProjectModalOpen(false)}
                    disabled={isCreatingProject}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-button" disabled={isCreatingProject}>
                    {isCreatingProject ? 'Creating...' : 'Create project'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
