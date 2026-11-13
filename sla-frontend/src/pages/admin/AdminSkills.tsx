import { useState } from 'react';
import { useSkills, useCreateSkill } from '../../api/hooks';
import Spinner from '../../components/Spinner';

export default function AdminSkills() {
  const { data: skills, isLoading, isError } = useSkills();
  const createSkillMutation = useCreateSkill();

  const [showModal, setShowModal] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) {
      setErrorMsg('Skill name is required');
      return;
    }
    try {
      await createSkillMutation.mutateAsync({ name: skillName.trim() });
      setShowModal(false);
      setSkillName('');
      setErrorMsg('');
    } catch {
      setErrorMsg('Failed to create skill');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Skills Management</h1>
          <p className="text-sm text-gray-500 mt-1">Configure technical and domain skills required for ticket routing</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Add Skill
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {isLoading && <Spinner />}
        {isError && <p className="text-red-500 text-sm">Failed to load skills.</p>}

        {skills && (
          <div className="divide-y divide-gray-100">
            {skills.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No skills registered.</p>
            ) : (
              skills.map((skill) => (
                <div
                  key={skill.id}
                  className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400">#{skill.id}</span>
                    <span className="text-sm font-medium text-gray-800">{skill.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">Active</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Skill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl space-y-4"
          >
            <h3 className="text-base font-semibold text-gray-800">Add New Skill</h3>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Skill Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. Database Troubleshooting"
              />
            </div>

            {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createSkillMutation.isPending}
                className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {createSkillMutation.isPending ? 'Creating…' : 'Create Skill'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
