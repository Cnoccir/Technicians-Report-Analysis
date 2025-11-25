import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  score: number;
  analysis: string;
  icon: LucideIcon;
  color: 'blue' | 'slate';
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, score, analysis, icon: Icon, color }) => {
  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-emerald-600 bg-emerald-50 ring-emerald-100';
    if (score >= 3) return 'text-amber-600 bg-amber-50 ring-amber-100';
    return 'text-red-600 bg-red-50 ring-red-100';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${color === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900">{title}</h4>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-black ring-1 inset-0 ${getScoreColor(score)}`}>
          {score}/5
        </div>
      </div>
      
      <p className="text-slate-600 text-sm leading-relaxed flex-grow">
        {analysis}
      </p>

      <div className="mt-4 pt-4 border-t border-slate-50">
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              score >= 4 ? 'bg-emerald-500' : score >= 3 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${(score / 5) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};