import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, User, ShieldCheck } from 'lucide-react';
import { ChatAgent } from '../../types/chat';
import { chatService } from '../../services/chatService';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAgent: (agentId: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onSelectAgent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<ChatAgent[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAgents(chatService.getAuthorisedAgents());
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredAgents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return agents;
    return agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(query) ||
        agent.id.toLowerCase().includes(query) ||
        agent.availability.toLowerCase().includes(query)
    );
  }, [agents, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      id="new-chat-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="new-chat-modal-content"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0D93AA]/10 flex items-center justify-center text-[#0D93AA]">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Start New Chat</h2>
              <p className="text-xs text-slate-500">Lusaka Central Express Agency</p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-new-chat-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Field */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              id="input-search-authorised-agents"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search authorised Agents..."
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0D93AA] focus:ring-2 focus:ring-[#0D93AA]/20 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Agents List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {filteredAgents.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <User size={22} />
              </div>
              <p className="text-sm font-semibold text-slate-800">No agents found</p>
              <p className="text-xs text-slate-500 mt-1">
                No authorised agents match &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          ) : (
            filteredAgents.map((agent) => {
              const availabilityColor =
                agent.availability === 'On Active Request'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : agent.availability === 'Available'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200';

              return (
                <button
                  key={agent.id}
                  type="button"
                  id={`btn-select-agent-${agent.id}`}
                  onClick={() => onSelectAgent(agent.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Agent Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[#0D93AA]/10 border border-[#0D93AA]/20 flex items-center justify-center text-[#0D93AA] font-bold text-xs">
                        {agent.avatarInitials}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                          agent.availability === 'On Active Request'
                            ? 'bg-amber-500'
                            : agent.availability === 'Available'
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        }`}
                      />
                    </div>

                    {/* Agent Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-[#0D93AA] transition-colors truncate">
                          {agent.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono text-slate-500">{agent.id}</span>
                        {agent.activeRequestType && agent.activeRequestType !== 'None' && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500">{agent.activeRequestType}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Availability Badge */}
                  <div className="flex-shrink-0 ml-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${availabilityColor}`}
                    >
                      {agent.availability}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>8 Authorised Agents in Agency</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
