
import React from 'react';
import { AlertTriangle, CheckCircle, Shield, Activity, UserCheck, AlertOctagon, Network, PenTool, ClipboardCheck, Lightbulb, MessageSquareQuote, Download, FileText } from 'lucide-react';
import { jsPDF } from "jspdf";
import { AnalysisResult } from '../types';
import { MetricCard } from './MetricCard';

interface Props {
  result: AnalysisResult;
  technicianName: string;
  jobSiteName: string;
}

export const AnalysisDashboard: React.FC<Props> = ({ result, technicianName, jobSiteName }) => {
  // Simple markdown parser for client rewrite
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('###')) {
        return <h4 key={i} className="text-lg font-bold text-slate-900 mt-4 mb-2">{line.replace('###', '').trim()}</h4>;
      }
      // Bullet points
      if (line.trim().startsWith('-')) {
        const content = line.trim().substring(1).trim();
        // Handle bolding within bullets
        const parts = content.split(/(\*\*.*?\*\*)/g);
        return (
          <li key={i} className="ml-4 mb-1 text-slate-700">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="text-slate-900">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </li>
        );
      }
      // Standard Paragraphs with bolding
      const parts = line.split(/(\*\*.*?\*\*)/g);
      if (line.trim() === '') return <div key={i} className="h-2"></div>;
      
      return (
        <p key={i} className="mb-2 text-slate-700 leading-relaxed">
           {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="text-slate-900">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
        </p>
      );
    });
  };

  // Parser for single line bold text (used in Follow Up)
  const renderBoldText = (text: string | undefined) => {
    if (!text) return null;
    return text.split(/(\*\*.*?\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="text-red-950 font-black">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = 0;

    // --- Header Background ---
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // --- Header Text ---
    yPos = 25;
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Technician Report Analysis", margin, yPos);
    
    // --- Metadata Section ---
    yPos = 55;
    doc.setTextColor(51, 65, 85); // Slate-700
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    const date = new Date().toLocaleDateString();
    doc.text(`DATE: ${date}`, margin, yPos);
    doc.text(`TECHNICIAN: ${technicianName || 'N/A'}`, margin, yPos + 6);
    doc.text(`JOB SITE: ${jobSiteName || 'N/A'}`, margin, yPos + 12);

    // --- Safety Status Banner ---
    yPos = 85;
    if (result.isSafe) {
        doc.setFillColor(236, 253, 245); // Emerald-50
        doc.setDrawColor(16, 185, 129); // Emerald-500
        doc.setTextColor(6, 95, 70); // Emerald-900
    } else {
        doc.setFillColor(254, 242, 242); // Red-50
        doc.setDrawColor(220, 38, 38); // Red-600
        doc.setTextColor(153, 27, 27); // Red-900
    }
    
    // Draw rounded rect manually or just a rect
    doc.rect(margin, yPos, contentWidth, 25, 'FD'); // Fill and Draw border
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    const safetyTitle = result.isSafe ? "SAFETY COMPLIANT" : "CRITICAL SAFETY RISK DETECTED";
    doc.text(safetyTitle, margin + 5, yPos + 10);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const safetyDesc = result.isSafe 
        ? "No safety interlocks or critical devices appear to be compromised." 
        : result.safetyRiskDescription || "Risks detected.";
    
    // Wrap safety description
    const splitSafety = doc.splitTextToSize(safetyDesc, contentWidth - 10);
    doc.text(splitSafety, margin + 5, yPos + 18);

    // --- Scores ---
    yPos += 40;
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("PERFORMANCE SCORES", margin, yPos);
    
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Technical Knowledge: ${result.technicalScore}/5`, margin, yPos);
    doc.text(`Professionalism: ${result.professionalismScore}/5`, margin + 60, yPos);

    // --- Client Ready Rewrite (The main content) ---
    yPos += 20;
    doc.setFillColor(241, 245, 249); // Slate-100 (Divider)
    doc.rect(margin, yPos, contentWidth, 1, 'F'); // Line
    
    yPos += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text("Client-Ready Report", margin, yPos);
    
    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85); // Slate-700

    // Clean up markdown for PDF text
    const cleanRewrite = result.clientRewrite.replace(/\*\*/g, ''); 
    const splitRewrite = doc.splitTextToSize(cleanRewrite, contentWidth);
    
    // Pagination for long text
    const pageHeight = doc.internal.pageSize.getHeight();
    
    for (let i = 0; i < splitRewrite.length; i++) {
        if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = 20; // Reset Y on new page
        }
        doc.text(splitRewrite[i], margin, yPos);
        yPos += 6; // Line height
    }

    // --- Footer ---
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Generated by Technician Report Analysis - Page ${i} of ${pageCount}`, margin, pageHeight - 10);
    }

    // Save
    const fileName = `Report_${jobSiteName ? jobSiteName.replace(/[^a-z0-9]/gi, '_') : 'Site'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const handleExportTXT = () => {
    const date = new Date().toLocaleDateString();
    const content = `TECHNICIAN REPORT SUMMARY
==========================================
Date: ${date}
Job Site: ${jobSiteName || 'N/A'}
Technician: ${technicianName || 'N/A'}

CLIENT-READY REPORT:
------------------------------------------
${result.clientRewrite.replace(/\*\*/g, '')} 

OPERATIONAL ANALYSIS:
------------------------------------------
Safety Status: ${result.isSafe ? 'COMPLIANT' : 'CRITICAL RISK DETECTED'}
${!result.isSafe ? `Risk Detail: ${result.safetyRiskDescription}\n` : ''}
Technical Knowledge Score: ${result.technicalScore}/5
Professionalism Score: ${result.professionalismScore}/5

Overrides Active: ${result.overridesActive ? 'YES' : 'NO'}
${result.overridesActive ? `Points in Hand: ${result.overridesList?.join(', ')}\n` : ''}
Network Issues: ${result.networkIssues ? 'YES' : 'NO'}

Follow-up Required: ${result.followUpRequired ? 'YES' : 'NO'}
${result.followUpRequired ? `Next Steps: ${result.followUpDetails?.replace(/\*\*/g, '')}` : ''}

------------------------------------------
Audit generated by Technician Report Analyzers
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${jobSiteName ? jobSiteName.replace(/\s+/g, '_') : 'Site'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Safety Status Banner */}
      <div className={`rounded-2xl p-6 border-l-8 shadow-sm ${
        result.isSafe 
          ? 'bg-white border-emerald-500 shadow-emerald-100' 
          : 'bg-red-50 border-red-600 shadow-red-100'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${result.isSafe ? 'bg-emerald-100' : 'bg-red-200'}`}>
            {result.isSafe ? (
              <Shield className="w-8 h-8 text-emerald-600" />
            ) : (
              <AlertOctagon className="w-8 h-8 text-red-600" />
            )}
          </div>
          <div>
            <h3 className={`text-xl font-black uppercase tracking-wide ${result.isSafe ? 'text-emerald-900' : 'text-red-900'}`}>
              {result.isSafe ? 'Safety Compliant' : 'CRITICAL SAFETY RISK DETECTED'}
            </h3>
            <p className={`mt-2 text-lg font-medium ${result.isSafe ? 'text-emerald-700' : 'text-red-800'}`}>
              {result.isSafe 
                ? 'No safety interlocks or critical devices appear to be compromised.' 
                : result.safetyRiskDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard 
          title="Technical Knowledge"
          score={result.technicalScore}
          analysis={result.technicalAnalysis}
          icon={Activity}
          color="blue"
        />
        <MetricCard 
          title="Professionalism"
          score={result.professionalismScore}
          analysis={result.professionalismAnalysis}
          icon={UserCheck}
          color="slate"
        />
      </div>

      {/* Operational Flags & Follow Up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Operational Flags
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600 font-medium">Overrides Active</span>
              {result.overridesActive ? (
                 <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase">Yes</span>
              ) : (
                 <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full uppercase">No</span>
              )}
            </div>
            {result.overridesActive && result.overridesList && (
              <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-100">
                <strong>Points in Hand:</strong> {result.overridesList.join(', ')}
              </div>
            )}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600 font-medium">Network Issues</span>
              {result.networkIssues ? (
                 <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full uppercase flex items-center gap-1">
                   <Network className="w-3 h-3" /> Detected
                 </span>
              ) : (
                 <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full uppercase">None</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
           <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" /> Follow-up Actions
          </h4>
          <div className={`h-full ${result.followUpRequired ? 'text-red-900' : 'text-slate-500'}`}>
            {result.followUpRequired ? (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 h-full">
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                   <span className="font-bold text-red-700 text-sm uppercase">Action Required</span>
                </div>
                <h5 className="text-xs font-bold text-red-900 uppercase tracking-wide mt-3 mb-1">Recommended Next Steps:</h5>
                <p className="text-sm font-medium leading-relaxed text-red-800">
                  {renderBoldText(result.followUpDetails)}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <CheckCircle className="w-8 h-8 mb-2 opacity-20" />
                <span className="text-sm">No follow-up required</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coach's Feedback Banner */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <MessageSquareQuote className="w-32 h-32 text-blue-600 -rotate-12 translate-x-8 -translate-y-8" />
        </div>
        <div className="relative z-10">
           <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-2">
             <Lightbulb className="w-5 h-5 text-blue-600 fill-blue-600/20" /> Coach's Feedback
           </h4>
           <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100/50">
             <p className="text-lg font-medium text-slate-800 leading-relaxed italic">
               "{result.coachFeedback}"
             </p>
           </div>
        </div>
      </div>

      {/* Client Rewrite */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-lg">
               <PenTool className="w-5 h-5 text-white" />
             </div>
             <div>
               <h3 className="text-white font-bold text-lg">Client-Ready Rewrite</h3>
               <p className="text-slate-400 text-xs">Formatted for official reports</p>
             </div>
           </div>
           
           <div className="flex items-center gap-2">
              {/* Text Export */}
             <button 
                onClick={handleExportTXT}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/20 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-white/10"
                title="Download as Text File"
             >
                <FileText className="w-4 h-4" />
                TXT
             </button>

             {/* PDF Export */}
             <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-red-900/20"
                title="Download as PDF"
             >
                <Download className="w-4 h-4" />
                PDF
             </button>
           </div>
        </div>
        
        {/* Context Info Banner */}
        <div className="bg-slate-50 border-b border-slate-100 p-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
             <UserCheck className="w-3.5 h-3.5 text-slate-400" />
             <span className="font-medium">Technician:</span> {technicianName || 'Not specified'}
          </div>
          <div className="flex items-center gap-1.5">
             <Shield className="w-3.5 h-3.5 text-slate-400" />
             <span className="font-medium">Site:</span> {jobSiteName || 'Not specified'}
          </div>
        </div>

        <div className="p-8 bg-white text-slate-800 text-base leading-relaxed">
           {renderMarkdown(result.clientRewrite)}
        </div>
      </div>
    </div>
  );
};
