

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ShieldAlert, FileText, CheckCircle2, AlertTriangle, Loader2, ArrowRight, ArrowLeft, RefreshCw, Clock, Building2, User, ClipboardList } from 'lucide-react';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { analyzeReport } from './services/auditService';
import { AnalysisResult, ReportHistoryItem } from './types';
import { HistorySidebar } from './components/HistorySidebar';

const SAMPLE_BAD_REPORTS = [
  `AHU-1 tripped on freeze stat again. I jumped it out to keep the unit running because the customer was complaining about it being hot. Will come back later to check the valve. Forced the VFD to 60hz to get more air flow.`,
  `Chiller 2 went down on low pressure. Reset the alarm. It came back immediately. I overrode the low pressure switch input in the software to false so it would run. It's making a weird noise but cooling the building. Job done.`,
  `Boiler loop pump VFD failed. I bypassed the VFD and wired the pump across the line. It's running full speed now. The diff pressure sensor is reading high but whatever. Removed the safety interlock wire so it wouldn't trip the breaker.`,
  `VAV 2-10 box controller offline. I couldn't communicate with it so I manually opened the damper 100% and left it. Replaced the fuse in the panel but left the door open because I lost the screw.`,
];

const SAMPLE_GOOD_REPORTS = [
  `Arrived to investigate AHU-3 high static pressure alarm. Found the fire damper in the supply duct had sprung closed. Verified no fire alarm active. Reset the damper linkage and verified full open position. Commanded fan to 25% and ramped up, observing static pressure trends. Static pressure control loop is now stable at 1.5" WC. Cleared alarms and returned unit to Auto.`,
  `Chiller 1 flow switch alarm. Verified pump status command and feedback match. Checked DP switch across the barrel, found it fluctuating. Bleed air from the sensing lines and verified steady pressure. Trended flow status for 15 minutes, no dropouts. Checked strainer DP, clean. Returned system to normal operation.`,
  `Investigated "hot call" in Room 304. VAV discharge temp was 55F but room temp was 76F. Found reheat valve stuck at 0%. Commanded valve to 100%, actuator did not move. Verified 24VAC at the actuator. Diagnosed failed actuator. Replaced with new Belimo actuator, verified operation through full stroke. Calibrated air flow. Room temp dropping.`,
  `Boiler 2 failed to ignite. Checked flame safeguard controller, code indicating pilot failure. Removed pilot assembly, found carbon buildup on the electrode. Cleaned electrode and verified spark gap. Reassembled and tested ignition sequence 3 times. Burner fired successfully each time. Verified O2 levels in flue gas are within spec.`,
];

const App: React.FC = () => {
  const [reportText, setReportText] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [jobSiteName, setJobSiteName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ReportHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('audit_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleAudit = async () => {
    if (!reportText.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeReport(reportText, apiKey);
      setAnalysisResult(result);
      
      // Save to history
      const newItem: ReportHistoryItem = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        timestamp: Date.now(),
        reportText: reportText,
        analysis: result,
        technicianName: technicianName,
        jobSiteName: jobSiteName
      };
      
      const newHistory = [newItem, ...history];
      setHistory(newHistory);
      localStorage.setItem('audit_history', JSON.stringify(newHistory));
      
    } catch (err) {
      setError("Failed to analyze report. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSample = (type: 'good' | 'bad') => {
    const sourceArray = type === 'good' ? SAMPLE_GOOD_REPORTS : SAMPLE_BAD_REPORTS;
    const randomReport = sourceArray[Math.floor(Math.random() * sourceArray.length)];
    setReportText(randomReport);
    setTechnicianName("Alex Smith");
    setJobSiteName(type === 'good' ? "Memorial Hospital - East Wing" : "Downtown Office Plaza");
    setAnalysisResult(null);
    setError(null);
  };

  const handleAuditAnother = () => {
    setAnalysisResult(null);
    setReportText('');
    setTechnicianName('');
    setJobSiteName('');
    setApiKey('');
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToEditor = () => {
    setAnalysisResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHistory = (item: ReportHistoryItem) => {
    setReportText(item.reportText);
    setTechnicianName(item.technicianName || '');
    setJobSiteName(item.jobSiteName || '');
    setAnalysisResult(item.analysis);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('audit_history');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-red-100 selection:text-red-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="bg-red-50 p-2.5 rounded-xl border border-red-100 shadow-sm">
              <ClipboardList className="h-8 w-8 text-red-600" strokeWidth={1.5} />
            </div>
            <div className="hidden sm:block h-10 w-px bg-slate-200"></div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-tight">
                Technician's Report Analysis
              </h1>
              <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">
                Operations & Safety Compliance
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative group"
              title="History"
            >
              <Clock className="w-5 h-5" />
              {history.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      <HistorySidebar 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleSelectHistory}
        onClear={handleClearHistory}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!analysisResult ? (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-1 bg-gradient-to-r from-red-500 via-red-600 to-slate-900"></div>
              
              <div className="p-6 sm:p-10">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                    Report Auditor
                  </h2>
                  <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
                    Paste the technician's daily log below to verify safety compliance, technical depth, and professionalism.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
                    <button 
                      onClick={() => loadSample('bad')}
                      className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wide border-2 border-red-100 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-200 transition-all flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" /> Load Risky Sample
                    </button>
                    <button 
                      onClick={() => loadSample('good')}
                      className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wide border-2 border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-200 transition-all flex items-center justify-center gap-2"
                    >
                       <CheckCircle2 className="w-4 h-4" /> Load Good Sample
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="techName" className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Technician Name
                      </label>
                      <input
                        id="techName"
                        type="text"
                        value={technicianName}
                        onChange={(e) => setTechnicianName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-800 placeholder:text-slate-400 text-sm transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="jobSite" className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> Job Site Name
                      </label>
                      <input
                        id="jobSite"
                        type="text"
                        value={jobSiteName}
                        onChange={(e) => setJobSiteName(e.target.value)}
                        placeholder="e.g. Central Hospital"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-800 placeholder:text-slate-400 text-sm transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="apiKey" className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" /> Gemini API Key
                      </label>
                      <input
                        id="apiKey"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste your Gemini API key"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-slate-800 placeholder:text-slate-400 text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-slate-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                    <textarea
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="Paste report text here..."
                      className="relative w-full h-48 sm:h-64 p-5 bg-white text-slate-700 placeholder:text-slate-300 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none text-base sm:text-lg leading-relaxed shadow-inner transition-shadow"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="mt-8">
                  <button
                    onClick={handleAudit}
                    disabled={!reportText.trim() || isAnalyzing}
                    className="w-full group relative overflow-hidden bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-lg font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                    <span className="relative flex items-center justify-center gap-3">
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Running Safety Diagnostics...
                        </>
                      ) : (
                        <>
                          Run Audit
                          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                    Powered by Gemini 3.0 Pro • Secure & Private Analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            {/* Top Navigation Bar */}
             <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                 <button
                    onClick={handleBackToEditor}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors group"
                 >
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Editor
                 </button>
                 <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Report Analysis
                 </div>
            </div>

            <AnalysisDashboard 
              result={analysisResult} 
              technicianName={technicianName}
              jobSiteName={jobSiteName}
            />

             {/* Bottom Action Area */}
            <div className="bg-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 text-center relative overflow-hidden group">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="relative z-10 max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold text-white mb-3">Audit Complete</h3>
                    <p className="text-slate-400 mb-8">Ready to process the next technician report?</p>
                    
                    <button
                        onClick={handleAuditAnother}
                        className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-bold py-4 px-8 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 w-full sm:w-auto min-w-[240px]"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Audit Another Report
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
