import React from 'react';
import { X, Clock, AlertTriangle, CheckCircle, Trash2, ChevronRight } from 'lucide-react';
import { ReportHistoryItem } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: ReportHistoryItem[];
  onSelect: (item: ReportHistoryItem) => void;
  onClear: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelect, 
  onClear 
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Audit History</h2>
                <p className="text-xs text-slate-500">{history.length} reports stored</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
              aria-label="Close history"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center px-6">
                <Clock className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No history yet</p>
                <p className="text-sm mt-1">Audited reports will appear here automatically.</p>
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="w-full text-left group p-4 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50/50 cursor-pointer transition-all shadow-sm hover:shadow-md flex flex-col gap-2 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-xs font-semibold text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    {item.analysis.isSafe ? (
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle className="w-3 h-3" /> Safe
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                        <AlertTriangle className="w-3 h-3" /> Risk
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-700 font-medium line-clamp-2 leading-relaxed">
                    {item.reportText}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      Tech: <span className="font-semibold text-slate-700">{item.analysis.technicalScore}/5</span>
                    </span>
                    <span className="flex items-center gap-1">
                      Prof: <span className="font-semibold text-slate-700">{item.analysis.professionalismScore}/5</span>
                    </span>
                    <ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-red-400 transition-colors" />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {history.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={onClear}
                className="w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 p-3 rounded-xl transition-colors font-semibold border border-transparent hover:border-red-100"
              >
                <Trash2 className="w-4 h-4" />
                Clear History
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
