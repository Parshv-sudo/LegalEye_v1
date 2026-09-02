import React, { useState } from 'react';
import { Role, Matter } from '../types';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  matter: Matter;
  onInvite: (email: string, role: Role, scope: string) => void;
}

export function InviteMemberModal({ isOpen, onClose, matter, onInvite }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('GUEST');
  const [scope, setScope] = useState('matter'); // 'matter' or 'document'

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onInvite(email.trim(), role, scope);
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0A192F]/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-[#F8F9FA]">
          <h2 className="font-heading font-bold text-[#0A192F] text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2D5A27]" aria-hidden="true">person_add</span>
            Invite Collaborator
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0A192F] mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@firm.com"
                className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#115fd4] focus:ring-1 focus:ring-[#115fd4] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A192F] mb-1.5 uppercase tracking-wide">
                Access Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full border border-gray-300 rounded p-2 text-sm focus:border-[#115fd4] focus:ring-1 focus:ring-[#115fd4] outline-none bg-white"
              >
                <option value="PARTNER">Partner (Full Access & Management)</option>
                <option value="ASSOCIATE">Associate (Edit & Upload)</option>
                <option value="GUEST">Guest (View Only / Specific Scope)</option>
              </select>
            </div>

            {role === 'GUEST' && (
              <div>
                <label className="block text-xs font-bold text-[#0A192F] mb-1.5 uppercase tracking-wide">
                  Access Scope
                </label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                      type="radio" 
                      name="scope" 
                      value="matter" 
                      checked={scope === 'matter'} 
                      onChange={() => setScope('matter')}
                      className="text-[#115fd4]"
                    />
                    Entire Matter ({matter.code})
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                      type="radio" 
                      name="scope" 
                      value="document" 
                      checked={scope === 'document'} 
                      onChange={() => setScope('document')}
                      className="text-[#115fd4]"
                    />
                    Single Document Only
                  </label>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 p-3 rounded border border-blue-100 flex gap-2 text-blue-800 text-xs leading-relaxed">
               <span className="material-symbols-outlined text-[16px] shrink-0" aria-hidden="true">info</span>
               <p>Invited users will receive a secure magic link via email to access this matter.</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#115fd4] text-white rounded text-sm hover:bg-[#115fd4]/90 flex items-center gap-2 font-medium shadow-sm"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
