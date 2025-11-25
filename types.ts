
export interface AnalysisResult {
  isSafe: boolean;
  safetyRiskDescription?: string;
  technicalScore: number;
  technicalAnalysis: string;
  professionalismScore: number;
  professionalismAnalysis: string;
  overridesActive: boolean;
  overridesList?: string[];
  networkIssues: boolean;
  followUpRequired: boolean;
  followUpDetails?: string;
  coachFeedback: string;
  clientRewrite: string;
}

export const DEFAULT_ANALYSIS: AnalysisResult = {
  isSafe: true,
  technicalScore: 0,
  technicalAnalysis: '',
  professionalismScore: 0,
  professionalismAnalysis: '',
  overridesActive: false,
  networkIssues: false,
  followUpRequired: false,
  coachFeedback: '',
  clientRewrite: '',
};

export interface ReportHistoryItem {
  id: string;
  timestamp: number;
  reportText: string;
  analysis: AnalysisResult;
  technicianName?: string;
  jobSiteName?: string;
}
