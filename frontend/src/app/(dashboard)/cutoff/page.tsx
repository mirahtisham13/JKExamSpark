"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Info, CheckCircle, ShieldAlert, Target, Users, MinusCircle, ShieldCheck } from 'lucide-react';
import { get } from '@/lib/api';
import { useCutoffs } from '@/hooks/useCutoff';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Exam } from '@/types';

function getConfidenceColor(confidence: string) {
  switch (confidence) {
    case 'HIGH': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/50';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50';
    case 'LOW': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  }
}

export default function CutoffPredictorPage() {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ['completed-exams'],
    queryFn: () => get<Exam[]>('/exams/', { status: 'completed' }),
  });

  React.useEffect(() => {
    if (exams && exams.length > 0 && !selectedExamId) {
      setSelectedExamId(String(exams[0].id));
    }
  }, [exams, selectedExamId]);

  const { data: cutoffData, isLoading: cutoffsLoading } = useCutoffs(selectedExamId);

  if (examsLoading) {
    return <div className="p-12"><Spinner /></div>;
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Disclaimer Section */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-5 rounded-xl flex items-start space-x-4 shadow-sm">
        <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-red-900 dark:text-red-400 text-lg">Important Disclaimer: Estimates Only</h3>
          <p className="text-sm text-red-800 dark:text-red-300 mt-1">
            Estimated cutoffs are calculated using statistical modeling applied to scores voluntarily submitted by students on this platform. 
            <strong> These are NOT official JKSSB cutoffs.</strong> Actual JKSSB cutoffs may differ significantly depending on the complete candidate pool and normalization procedures. 
            Do not make career or document verification decisions based solely on these estimates.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold flex items-center">
          <Target className="w-8 h-8 mr-3 text-primary" /> Cutoff Predictor
        </h1>
        <select 
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none w-full sm:w-64"
          value={selectedExamId || ''}
          onChange={(e) => setSelectedExamId(e.target.value)}
        >
          {exams?.length === 0 && <option value="">No completed exams found</option>}
          {exams?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {!selectedExamId ? (
        <EmptyState icon="target" title="Select an exam" description="Choose an exam from the dropdown to view cutoff predictions." />
      ) : cutoffsLoading ? (
        <div className="p-12 flex justify-center"><Spinner /></div>
      ) : cutoffData ? (
        <div className="space-y-10">
          
          {/* Official Cutoffs */}
          {cutoffData.official_cutoffs.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center text-green-700 dark:text-green-500">
                <ShieldCheck className="w-6 h-6 mr-2" /> Official JKSSB Cutoffs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cutoffData.official_cutoffs.map(oc => (
                  <div key={oc.id} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
                    <div className="text-green-800 dark:text-green-400 font-bold text-lg mb-1">{oc.category_name}</div>
                    <div className="text-3xl font-black text-green-900 dark:text-green-300">{oc.cutoff_marks.toFixed(2)}</div>
                    <div className="mt-3 text-xs text-green-700 dark:text-green-500 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" /> Published {new Date(oc.published_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estimated Cutoffs */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center text-primary">
              <Target className="w-6 h-6 mr-2" /> Estimated Cutoffs (Platform Data)
            </h2>
            
            {cutoffData.estimated_cutoffs.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-100 dark:border-gray-800 text-center">
                <p className="text-gray-500">Not enough data to calculate estimates for any category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cutoffData.estimated_cutoffs.map(est => (
                  <div key={est.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-start">
                      <div className="font-bold text-xl">{est.category_name}</div>
                      <div className={`px-2.5 py-1 rounded text-xs font-bold border ${getConfidenceColor(est.confidence_level)}`}>
                        {est.confidence_level} CONFIDENCE
                      </div>
                    </div>
                    <div className="p-5 bg-gray-50/50 dark:bg-gray-800/20">
                      <div className="text-sm text-gray-500 mb-1">Estimated Range</div>
                      <div className="text-2xl font-black text-primary">
                        {est.estimated_min.toFixed(2)} <span className="text-gray-400 font-normal mx-1">—</span> {est.estimated_max.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 flex items-center"><Users className="w-4 h-4 mr-1.5" /> Sample Size</div>
                        <div className="font-bold mt-1 text-gray-900 dark:text-gray-200">{est.sample_size} scores</div>
                      </div>
                      <div>
                        <div className="text-gray-500 flex items-center"><Target className="w-4 h-4 mr-1.5" /> Calculated</div>
                        <div className="font-medium mt-1 text-gray-900 dark:text-gray-200">
                          {new Date(est.calculated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Insufficient Data */}
          {cutoffData.insufficient_data_categories.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center mb-2">
                <MinusCircle className="w-5 h-5 mr-2 text-gray-400" /> Insufficient Data
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                The following categories have fewer than 10 submitted scores. An estimate cannot be reliably calculated yet:
              </p>
              <div className="flex flex-wrap gap-2">
                {cutoffData.insufficient_data_categories.map(cat => (
                  <Badge key={cat} variant="gray">{cat}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Methodology Explaination */}
          <div className="pt-8">
            <button 
              onClick={() => setShowMethodology(!showMethodology)}
              className="flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors"
            >
              <Info className="w-4 h-4 mr-1.5" /> 
              {showMethodology ? 'Hide Methodology' : 'How are estimates calculated?'}
            </button>
            
            {showMethodology && (
              <div className="mt-4 p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl text-sm text-gray-700 dark:text-gray-300 space-y-3">
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Estimation Methodology (v1.0)</h4>
                <p>Estimates are calculated by cross-referencing the submitted scores with the official number of vacancies for that category.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Preliminary Cutoff:</strong> The system finds the submitted score at the rank corresponding to the number of vacancies.</li>
                  <li><strong>Confidence Level:</strong> 
                    <ul className="list-disc pl-5 mt-1 text-gray-600 dark:text-gray-400">
                      <li><span className="font-semibold text-green-600 dark:text-green-500">HIGH</span> (&gt;100 scores): Applies a tight padding of ±2.0 marks.</li>
                      <li><span className="font-semibold text-yellow-600 dark:text-yellow-500">MEDIUM</span> (30-100 scores): Applies a padding of ±3.0 marks.</li>
                      <li><span className="font-semibold text-red-600 dark:text-red-500">LOW</span> (10-29 scores): Applies a wide padding of ±5.0 marks.</li>
                    </ul>
                  </li>
                  <li><strong>Minimum Requirement:</strong> At least 10 scores must be submitted in a category to generate any estimate.</li>
                </ul>
              </div>
            )}
          </div>

        </div>
      ) : null}
    </div>
  );
}
