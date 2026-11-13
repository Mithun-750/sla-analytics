import { useState } from 'react';
import {
  useUsers,
  useCreateUser,
  useToggleAvailability,
  useUpdateUserSkills,
  useSkills,
} from '../../api/hooks';
import Spinner from '../../components/Spinner';
import Pagination from '../../components/Pagination';
import type { User, UserSkill } from '../../api/types';

export default function AdminUsers() {
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useUsers(
    roleFilter || undefined,
    search || undefined,
    page,
    15,
  );
  const { data: allSkills } = useSkills();

  const createUserMutation = useCreateUser();
  const toggleAvailMutation = useToggleAvailability();
  const updateSkillsMutation = useUpdateUserSkills();

  // Create User modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<'AGENT' | 'SUPERVISOR' | 'ADMIN'>('AGENT');
  const [newMaxTickets, setNewMaxTickets] = useState(5);
  const [createError, setCreateError] = useState('');

  // Manage Skills modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [selectedProficiency, setSelectedProficiency] = useState<number>(3);
  const [skillsError, setSkillsError] = useState('');

  const handleOpenSkillsModal = (user: User) => {
    setEditingUser(user);
    setUserSkills(user.skills ? [...user.skills] : []);
    setSelectedSkillId('');
    setSelectedProficiency(3);
    setSkillsError('');
  };

  const handleAddSkill = () => {
    if (!selectedSkillId) return;
    const skillObj = allSkills?.find((s) => s.id === Number(selectedSkillId));
    if (!skillObj) return;

    if (userSkills.some((s) => s.skillId === skillObj.id)) {
      setSkillsError('User already has this skill');
      return;
    }

    setUserSkills([
      ...userSkills,
      {
        skillId: skillObj.id,
        skillName: skillObj.name,
        proficiencyLevel: selectedProficiency,
      },
    ]);
    setSelectedSkillId('');
    setSkillsError('');
  };

  const handleRemoveSkill = (skillId: number) => {
    setUserSkills(userSkills.filter((s) => s.skillId !== skillId));
  };

  const handleSaveSkills = async () => {
    if (!editingUser) return;
    try {
      await updateSkillsMutation.mutateAsync({
        id: editingUser.id,
        skills: userSkills.map((s) => ({
          skillId: s.skillId,
          proficiencyLevel: s.proficiencyLevel,
        })),
      });
      setEditingUser(null);
    } catch {
      setSkillsError('Failed to save skills');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setCreateError('Username is required');
      return;
    }
    try {
      await createUserMutation.mutateAsync({
        username: newUsername.trim(),
        role: newRole,
        maxConcurrentTickets: Number(newMaxTickets),
      });
      setShowCreateModal(false);
      setNewUsername('');
      setNewRole('AGENT');
      setNewMaxTickets(5);
      setCreateError('');
    } catch {
      setCreateError('Failed to create user');
    }
  };

  const handleToggleAvailability = async (user: User) => {
    try {
      await toggleAvailMutation.mutateAsync({
        id: user.id,
        available: !user.available,
      });
    } catch {
      alert('Failed to update availability');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage agents, supervisors, and platform administrators</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by username..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(0);
            }}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Roles</option>
            <option value="AGENT">Agent</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {isLoading && <Spinner />}
        {isError && <p className="text-red-500 text-sm">Failed to load users.</p>}

        {data && (
          <div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="pb-2 pr-4 font-medium">ID</th>
                    <th className="pb-2 pr-4 font-medium">Username</th>
                    <th className="pb-2 pr-4 font-medium">Role</th>
                    <th className="pb-2 pr-4 font-medium">Availability</th>
                    <th className="pb-2 pr-4 font-medium">Max Tickets</th>
                    <th className="pb-2 pr-4 font-medium">Skills</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.content.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 pr-4 text-xs font-mono text-gray-400">#{u.id}</td>
                      <td className="py-2.5 pr-4 font-medium text-gray-800">{u.username}</td>
                      <td className="py-2.5 pr-4">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <button
                          onClick={() => handleToggleAvailability(u)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                            u.available
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {u.available ? 'Available' : 'Unavailable'}
                        </button>
                      </td>
                      <td className="py-2.5 pr-4 text-gray-600">{u.maxConcurrentTickets}</td>
                      <td className="py-2.5 pr-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.skills && u.skills.length > 0 ? (
                            u.skills.map((s) => (
                              <span
                                key={s.skillId}
                                className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded"
                              >
                                {s.skillName} (lvl {s.proficiencyLevel})
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenSkillsModal(u)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Manage Skills
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              onPageChange={setPage}
              entityName="users"
            />
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreateUser}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl space-y-4"
          >
            <h3 className="text-base font-semibold text-gray-800">Add New User</h3>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. john_doe"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="AGENT">Agent</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Max Concurrent Tickets
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={newMaxTickets}
                onChange={(e) => setNewMaxTickets(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {createError && <p className="text-xs text-red-600">{createError}</p>}

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createUserMutation.isPending}
                className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {createUserMutation.isPending ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manage Skills Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-gray-800">
              Manage Skills for {editingUser.username}
            </h3>

            {/* Current skills */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">Assigned Skills</p>
              {userSkills.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No skills assigned yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {userSkills.map((s) => (
                    <div
                      key={s.skillId}
                      className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded-md text-xs"
                    >
                      <span className="font-medium text-gray-800">{s.skillName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Proficiency: lvl {s.proficiencyLevel}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s.skillId)}
                          className="text-red-500 hover:text-red-700 ml-2 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add new skill inline */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-700 mb-2">Assign New Skill</p>
              <div className="flex gap-2">
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select a skill...</option>
                  {allSkills?.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedProficiency}
                  onChange={(e) => setSelectedProficiency(Number(e.target.value))}
                  className="w-24 border border-gray-300 rounded-md px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value={1}>Lvl 1</option>
                  <option value={2}>Lvl 2</option>
                  <option value={3}>Lvl 3</option>
                  <option value={4}>Lvl 4</option>
                  <option value={5}>Lvl 5</option>
                </select>

                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {skillsError && <p className="text-xs text-red-600">{skillsError}</p>}

            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSkills}
                disabled={updateSkillsMutation.isPending}
                className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {updateSkillsMutation.isPending ? 'Saving…' : 'Save Skills'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
