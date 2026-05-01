import { useEffect, useMemo, useState } from 'react';
import { projectApi, userApi } from '../api/etharaapi';
import Task from './Task';

const PlusIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
  </svg>
);

const UserIcon = () => (
  <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
  </svg>
);

const Project = ({ project, profile, onProjectUpdate }) => {
  const [availableMembers, setAvailableMembers] = useState([]);
  const [showAvailableMembers, setShowAvailableMembers] = useState(false);
  const [fetchedMemberUsers, setFetchedMemberUsers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [error, setError] = useState('');

  const memberIds = useMemo(
    () =>
      (project.members || [])
        .map((member) => {
          if (typeof member === 'string') return member;
          return member?._id || member?.id || '';
        })
        .filter(Boolean),
    [project.members]
  );
  const profileId = profile?._id || profile?.id || '';
  const projectMemberObjects = useMemo(
    () => (project.members || []).filter((member) => typeof member === 'object' && (member?._id || member?.id)),
    [project.members]
  );

  const memberUsers = useMemo(() => {
    const usersById = new Map();

    [...projectMemberObjects, ...fetchedMemberUsers].forEach((user) => {
      const userId = user?._id || user?.id || '';
      if (userId) usersById.set(userId, user);
    });

    memberIds.forEach((id) => {
      if (!usersById.has(id)) usersById.set(id, { id, name: `Member ${id.slice(-4)}`, email: id });
    });

    return Array.from(usersById.values());
  }, [fetchedMemberUsers, memberIds, projectMemberObjects]);

  useEffect(() => {
    let isMounted = true;
    const missingNamedMembers = memberIds.filter((id) => {
      return !projectMemberObjects.some((member) => (member?._id || member?.id) === id);
    });

    if (missingNamedMembers.length === 0) {
      return undefined;
    }

    const loadMemberDetails = async () => {
      try {
        const response = await userApi.getsomeUsers(missingNamedMembers);
        if (isMounted) {
          setFetchedMemberUsers(Array.isArray(response.data.users) ? response.data.users : []);
        }
      } catch (error) {
        console.error('Error fetching project members:', error);
      }
    };

    loadMemberDetails();

    return () => {
      isMounted = false;
    };
  }, [memberIds, projectMemberObjects]);

  const handleFindMembers = async () => {
    setIsLoadingMembers(true);
    setError('');

    try {
      const response = await userApi.getAllUsers();
      const users = response.data.users || [];
      const available = users.filter((user) => {
        const userId = user.id || user._id || '';
        return userId && !memberIds.includes(userId) && userId !== profileId && user.role !== 'admin';
      });

      setAvailableMembers(available);
      setShowAvailableMembers(true);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Available members could not be loaded right now.');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleAddMember = async (user) => {
    setError('');

    try {
      const userId = user.id || user._id || '';
      if (!userId) {
        setError('Invalid user selected.');
        return;
      }

      const response = await projectApi.addMember(project._id, userId);
      const updatedProject = response.data.project || {
        ...project,
        members: [...memberIds, userId],
      };

      onProjectUpdate?.(updatedProject);
      setFetchedMemberUsers((currentUsers) => [...currentUsers, user]);
      setAvailableMembers((currentMembers) => currentMembers.filter((member) => (member.id || member._id) !== userId));
    } catch (error) {
      console.error('Error adding member:', error);
      setError('Could not add member to the project. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-950">Project members</h4>
            <p className="mt-1 text-sm text-slate-500">People currently attached to this project.</p>
          </div>
          {profile?.role === 'admin' && (
            <button type="button" onClick={handleFindMembers} className="secondary-button gap-2 self-start" disabled={isLoadingMembers}>
              <PlusIcon />
              {isLoadingMembers ? 'Loading...' : 'Find members'}
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {showAvailableMembers && (
          <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h5 className="text-sm font-bold text-slate-950">Available members</h5>
              <span className="status-pill bg-white">{availableMembers.length} found</span>
            </div>
            {availableMembers.length === 0 ? (
              <p className="text-sm text-slate-500">No available non-admin members were found for this project.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {availableMembers.map((user) => (
                  <div key={user.id || user._id} className="flex items-center gap-3 rounded-lg border border-white bg-white p-3 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
                      <UserIcon />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                    <button type="button" className="secondary-button gap-2" onClick={() => handleAddMember(user)}>
                      <PlusIcon />
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {memberUsers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
              This project does not have any members yet.
            </div>
          ) : (
            memberUsers.map((user, index) => (
              <div key={`${user.id || user._id}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                  <UserIcon />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.name || `Member ${index + 1}`}</p>
                  <p className="truncate text-xs text-slate-500">{user.email || `ID: ${user.id || user._id}`}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Task project={project} profile={profile} memberUsers={memberUsers} />
    </div>
  );
};

export default Project;
