import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import {
  Course,
  CourseAttainmentAnalysis,
  COAttainmentResult,
  AssessmentRecord,
} from '../../types';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Download,
  Upload,
  FileSpreadsheet,
  Printer,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  Info,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';

export const AttainModule: React.FC = () => {
  const { t, announce } = useAccessibility();
  const { currentUser } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('course_cs301');
  const [analysis, setAnalysis] = useState<CourseAttainmentAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Attainment Threshold Slider (Configurable, e.g. 50% - 80%, default 60%)
  const [thresholdSlider, setThresholdSlider] = useState<number>(60);

  // Upload CSV Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Accreditation Report Printable View Mode
  const [isReportPrintOpen, setIsReportPrintOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Fetch Courses
  useEffect(() => {
    fetch('/api/attain/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data || []);
        if (data && data.length > 0) {
          setSelectedCourseId(data[0].id);
        }
      })
      .catch(err => console.error('Failed to load courses:', err));
  }, []);

  // Fetch Course Attainment Analysis
  useEffect(() => {
    if (!selectedCourseId) return;
    setIsLoading(true);
    fetch(`/api/attain/analysis/${selectedCourseId}`)
      .then(res => res.json())
      .then(data => {
        setAnalysis(data);
        if (data.thresholdPercentage) {
          setThresholdSlider(data.thresholdPercentage);
        }
      })
      .catch(err => console.error('Failed to load analysis:', err))
      .finally(() => setIsLoading(false));
  }, [selectedCourseId]);

  const activeCourse = useMemo(() => {
    return courses.find(c => c.id === selectedCourseId) || courses[0];
  }, [courses, selectedCourseId]);

  // Recalculate flags when slider changes
  const computedCOResults: COAttainmentResult[] = useMemo(() => {
    if (!analysis) return [];
    return analysis.coResults.map(co => {
      const isBelow = co.attainmentPercentage < thresholdSlider;
      return {
        ...co,
        isBelowThreshold: isBelow,
        status: isBelow ? 'Needs Instructional Intervention' : 'Attained',
      };
    });
  }, [analysis, thresholdSlider]);

  const totalCOs = computedCOResults.length;
  const attainedCount = computedCOResults.filter(c => !c.isBelowThreshold).length;
  const interventionCount = computedCOResults.filter(c => c.isBelowThreshold).length;
  const overallAttainment = Math.round(
    computedCOResults.reduce((acc, c) => acc + c.attainmentPercentage, 0) / (totalCOs || 1)
  );

  // Handle Bulk Upload CSV
  const handleBatchUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    setIsUploading(true);
    try {
      // Parse simple CSV (studentId, studentName, coCode, score, maxScore)
      const lines = csvText.trim().split('\n');
      const records = lines.slice(1).map((line, i) => {
        const parts = line.split(',').map(p => p.trim());
        return {
          courseId: selectedCourseId,
          studentId: parts[0] || `S${100 + i}`,
          studentName: parts[1] || `Student ${i + 1}`,
          courseOutcomeId: parts[2] || 'CO1',
          score: parseFloat(parts[3] || '75'),
          maxScore: parseFloat(parts[4] || '100'),
          assessmentName: 'Midterm 2',
        };
      });

      const res = await fetch('/api/attain/assessments/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourseId,
          records,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsUploadModalOpen(false);
        setCsvText('');
        announce(`Uploaded ${data.count} student assessment records successfully.`);
        // Refresh analysis
        const refresh = await fetch(`/api/attain/analysis/${selectedCourseId}`);
        const refData = await refresh.json();
        setAnalysis(refData);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-amber-600" />
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {t.modules.attain.title}
            </h1>
            <span className="rounded-full bg-amber-100 text-amber-800 text-3xs font-bold px-2.5 py-0.5 border border-amber-200">
              NBA & NAAC Tier-I Criterion 3
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.modules.attain.subtitle}
          </p>
        </div>

        {/* Action Controls: Upload Marks & Export Report */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-upload-marks"
            type="button"
            onClick={() => {
              setCsvText(`StudentID, StudentName, CO, Score, MaxScore
STU_2026_01, Priya Sharma, CO4, 45, 100
STU_2026_02, Arjun Verma, CO4, 52, 100
STU_2026_03, Sneha Roy, CO4, 88, 100
STU_2026_04, Rahul Nair, CO4, 38, 100
STU_2026_05, Kavita Pillai, CO4, 61, 100`);
              setIsUploadModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs"
          >
            <Upload className="h-4 w-4 text-amber-600" />
            <span>Upload Assessment CSV</span>
          </button>

          <button
            id="btn-print-accreditation"
            type="button"
            onClick={() => setIsReportPrintOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 text-xs font-bold shadow-2xs"
          >
            <Printer className="h-4 w-4" />
            <span>NBA / NAAC Audit Report</span>
          </button>
        </div>
      </div>

      {/* Course Selector & Threshold Configurator Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs">
        {/* Course Dropdown */}
        <div className="md:col-span-6 space-y-1">
          <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500">
            Select Accredited Course:
          </label>
          <div className="relative">
            <select
              id="select-course-attain"
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 focus:border-amber-600 focus:outline-hidden"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.name} ({c.academicYear} • {c.semester})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attainment Threshold Slider */}
        <div className="md:col-span-6 space-y-1">
          <div className="flex items-center justify-between text-2xs font-bold uppercase tracking-wider text-slate-500">
            <span className="flex items-center space-x-1">
              <Sliders className="h-3.5 w-3.5 text-amber-600" />
              <span>Configurable Attainment Benchmark:</span>
            </span>
            <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {thresholdSlider}% Minimum Target
            </span>
          </div>
          <div className="flex items-center space-x-3 pt-1">
            <input
              id="range-threshold"
              type="range"
              min="40"
              max="80"
              step="5"
              value={thresholdSlider}
              onChange={e => {
                const val = Number(e.target.value);
                setThresholdSlider(val);
                announce(`Attainment benchmark adjusted to ${val} percent`);
              }}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <span className="text-3xs text-slate-400 font-semibold whitespace-nowrap">
              (Standard: 60%)
            </span>
          </div>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Attainment */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">
            Course Outcome Average
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{overallAttainment}%</span>
            <span className={`text-xs font-bold ${overallAttainment >= thresholdSlider ? 'text-emerald-600' : 'text-amber-600'}`}>
              {overallAttainment >= thresholdSlider ? 'Target Met' : 'Under Observation'}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mt-2">
            <div
              className={`h-full rounded-full ${overallAttainment >= thresholdSlider ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${overallAttainment}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Attained Outcomes */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">
            Outcomes Attained
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-600">{attainedCount}</span>
            <span className="text-xs text-slate-500">of {totalCOs} COs</span>
          </div>
          <p className="text-3xs text-emerald-700 pt-1">
            Meets or exceeds faculty performance benchmark
          </p>
        </div>

        {/* Metric 3: Early Warning Interventions */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">
            Requires Intervention
          </span>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-black ${interventionCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
              {interventionCount}
            </span>
            <span className="text-xs text-slate-500">COs below {thresholdSlider}%</span>
          </div>
          <p className="text-3xs text-rose-700 pt-1">
            {interventionCount > 0 ? 'Immediate remediation flagged' : 'No remedial action needed'}
          </p>
        </div>

        {/* Metric 4: NBA / NAAC Status */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">
            Accreditation Audit Status
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-base font-black text-slate-900">
              {interventionCount <= 1 ? 'Accreditation Compliant' : 'Audit Review Pending'}
            </span>
          </div>
          <p className="text-3xs text-slate-500 pt-1">
            Continuous Quality Improvement (CQI) Loop Active
          </p>
        </div>
      </div>

      {/* Detailed Course Outcomes (CO1 to CO5) Attainment Grid */}
      <section aria-labelledby="co-breakdown-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="co-breakdown-heading" className="text-lg font-bold text-slate-900">
              Course Outcome (CO) Attainment & Pedagogical Interventions
            </h2>
            <p className="text-xs text-slate-500">
              Calculated from mapped midterms, assignments, and practical laboratory rubrics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {computedCOResults.map(co => {
            const isWarning = co.isBelowThreshold;
            return (
              <div
                key={co.coCode}
                className={`flex flex-col justify-between rounded-2xl bg-white p-5 border-2 shadow-2xs transition-all ${
                  isWarning
                    ? 'border-rose-400 bg-rose-50/20'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div>
                  {/* CO Code & Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {co.coCode}
                      </span>
                      <span className="text-3xs font-semibold text-slate-500 capitalize">
                        {co.bloomLevel}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-3xs font-black uppercase tracking-wider ${
                        isWarning
                          ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isWarning ? 'Needs Instructional Intervention' : 'Attained'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {co.description}
                  </p>

                  {/* Attainment Progress Meter */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Attainment Percentage:</span>
                      <span className={`font-black ${isWarning ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {co.attainmentPercentage}%
                      </span>
                    </div>

                    <div className="relative h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isWarning ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${co.attainmentPercentage}%` }}
                      />
                      {/* Threshold marker line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                        style={{ left: `${thresholdSlider}%` }}
                        title={`Benchmark: ${thresholdSlider}%`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-3xs text-slate-400 font-semibold">
                      <span>0%</span>
                      <span className="text-slate-900 font-bold">Target: {thresholdSlider}%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Actionable Pedagogical Interventions */}
                  <div className={`mt-4 rounded-xl p-3 border space-y-1.5 ${
                    isWarning
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <span className="text-3xs font-bold uppercase tracking-wider block flex items-center space-x-1">
                      {isWarning ? (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                          <span className="text-rose-800">Actionable Remedial Plan:</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-slate-600">Continuous Enrichment Plan:</span>
                        </>
                      )}
                    </span>
                    <ul className="space-y-1">
                      {co.recommendedInterventions.map((rec, i) => (
                        <li key={i} className="text-3xs leading-relaxed flex items-start space-x-1.5">
                          <span className="mt-1 h-1 w-1 rounded-full bg-current shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-3xs text-slate-400">
                  <span>Assessed Students: {co.totalStudentsAssessed || 60}</span>
                  <span>Target Threshold: {thresholdSlider}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Historical Trends & Performance Distribution */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Semester-Over-Semester Continuous Quality Improvement Trend */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Continuous Quality Improvement (CQI) Trends
                </h3>
                <p className="text-xs text-slate-500">
                  Semester-over-semester Course Outcome attainment trajectory
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                +9% Growth
              </span>
            </div>

            <div className="space-y-2 pt-2">
              {analysis.historicalSemesterTrends.map((st, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{st.semester}</span>
                    <span className="text-slate-900 font-bold">{st.attainment}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500"
                      style={{ width: `${st.attainment}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Grade & Performance Tiers */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-2xs space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Class Performance Cohort Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Distribution of students across score bands for {activeCourse?.code}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {analysis.studentPerformanceTiers.map((tier, i) => (
                <div key={i} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{tier.tier}</span>
                    <p className="text-3xs text-slate-500">{tier.count} Students enrolled</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900">{tier.percentage}%</span>
                    <p className="text-3xs text-slate-400">of cohort</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload CSV Modal */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Upload Course Assessment Marks
                </h3>
                <p className="text-xs text-slate-500">
                  Paste or upload CSV marks mapped to Course Outcomes (CO1-CO5)
                </p>
              </div>
            </div>

            <form onSubmit={handleBatchUpload} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  CSV Data (StudentID, StudentName, CO, Score, MaxScore)
                </label>
                <textarea
                  rows={8}
                  required
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  className="w-full font-mono text-xs rounded-xl border border-slate-300 p-3"
                />
              </div>

              <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-3xs text-amber-900">
                Mapped course: <strong>{activeCourse?.code} - {activeCourse?.name}</strong>.
                Scores will immediately be processed into the attainment pipeline.
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700"
                >
                  {isUploading ? 'Processing Marks...' : 'Upload & Compute Attainment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable NBA / NAAC Accreditation Report Modal */}
      {isReportPrintOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div
            ref={reportRef}
            className="relative w-full max-w-4xl rounded-2xl bg-white p-8 shadow-2xl border border-slate-300 my-8 space-y-6 text-slate-900"
          >
            {/* Action buttons (hidden when printed) */}
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <span className="text-xs font-bold uppercase text-amber-700">
                Accreditation Document Preview
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 flex items-center space-x-1.5 shadow-xs"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Official Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReportPrintOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Official Accreditation Document Header */}
            <div className="text-center border-b border-slate-300 pb-4 space-y-1">
              <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                SMART CAMPUS UNIVERSITY • DEPARTMENT OF ENGINEERING
              </h2>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                NBA TIER-I & NAAC CRITERION 3: COURSE OUTCOME ATTAINMENT AUDIT DOSSIER
              </p>
              <p className="text-2xs text-slate-500">
                Academic Cycle: {activeCourse?.academicYear} | Semester: {activeCourse?.semester} | Date: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Course Information Metadata */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p><strong>Course Code:</strong> {activeCourse?.code}</p>
                <p><strong>Course Title:</strong> {activeCourse?.name}</p>
                <p><strong>Department:</strong> {activeCourse?.department}</p>
              </div>
              <div>
                <p><strong>Faculty In-Charge:</strong> {activeCourse?.facultyInCharge}</p>
                <p><strong>Attainment Benchmark:</strong> {thresholdSlider}% Student Performance</p>
                <p><strong>Audit Status:</strong> {interventionCount <= 1 ? 'Compliant' : 'Conditional Audit'}</p>
              </div>
            </div>

            {/* Table of CO Attainments */}
            <table className="w-full text-left border-collapse text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300 font-bold">CO Code</th>
                  <th className="p-2 border-r border-slate-300 font-bold">Outcome Statement & Bloom Level</th>
                  <th className="p-2 border-r border-slate-300 font-bold text-center">Attained %</th>
                  <th className="p-2 border-r border-slate-300 font-bold text-center">Target %</th>
                  <th className="p-2 font-bold">Accreditation Status & CQI Remedial Action</th>
                </tr>
              </thead>
              <tbody>
                {computedCOResults.map(co => (
                  <tr key={co.coCode} className="border-b border-slate-200">
                    <td className="p-2 border-r border-slate-200 font-bold">{co.coCode}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-700">
                      <div>{co.description}</div>
                      <span className="text-3xs text-slate-500">Bloom: {co.bloomLevel}</span>
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-bold">
                      {co.attainmentPercentage}%
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center">{thresholdSlider}%</td>
                    <td className="p-2 text-3xs">
                      <span className={`font-bold ${co.isBelowThreshold ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {co.status}
                      </span>
                      <p className="text-slate-600 mt-0.5">{co.recommendedInterventions[0]}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Continuous Quality Improvement & Remedial Narrative */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider">
                Continuous Quality Improvement (CQI) Action Plan Summary:
              </h4>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                Out of {totalCOs} Course Outcomes assessed, {attainedCount} have satisfied the {thresholdSlider}% performance threshold.
                For the {interventionCount} outcomes currently flagged for intervention, mandatory remedial problem-solving sessions, concept review video walkthroughs, and peer mentoring sessions have been designated as part of departmental standard operating procedure.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-8 border-t border-slate-300 flex justify-between text-xs text-slate-700">
              <div className="space-y-8">
                <div className="border-b border-slate-400 w-48" />
                <p><strong>Course Faculty Sign-Off</strong></p>
              </div>
              <div className="space-y-8">
                <div className="border-b border-slate-400 w-48" />
                <p><strong>Head of Department (HOD)</strong></p>
              </div>
              <div className="space-y-8">
                <div className="border-b border-slate-400 w-48" />
                <p><strong>Dean of Academic Quality / IQAC</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
