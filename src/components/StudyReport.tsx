import { useState } from 'react';
import { FileText, Download, Loader2, CheckCircle, BookOpen, FileQuestion } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

function generateDeepDiveAnswer(
  _question: string,
  scenarioTitle: string,
  scenarioDesc: string,
  exampleResponse: string,
  moduleTitle: string,
  concepts: Array<{ term: string; definition: string }>,
  overviewText: string,
  deepDiveText: string,
  summary: string
): string {
  // Extract relevant concepts for context
  const relevantConcepts = concepts.slice(0, 5).map(c => c.term).join(', ');

  // Build a thorough, multi-paragraph answer from all available data
  const paragraphs: string[] = [];

  // Introduction
  const intro = scenarioDesc.length > 30
    ? scenarioDesc
    : `This section explores "${scenarioTitle}" as it applies to ${moduleTitle}, examining the core mechanisms, real-world applications, and key challenges involved.`;
  paragraphs.push(`### Introduction\n\nThe topic of "${scenarioTitle}" sits at the intersection of several fundamental principles within ${moduleTitle}. ${intro} Understanding this area requires a firm grasp of the underlying concepts — including ${relevantConcepts} — and how they interact in practical scenarios.`);

  // Core principles / mechanism
  const mechanismText = exampleResponse && exampleResponse.length > 20
    ? exampleResponse
    : `The core mechanism involves applying the key principles of ${moduleTitle} to the specific context of ${scenarioTitle}. This requires a systematic approach: first, identifying the relevant data and features; second, selecting the appropriate methods and techniques; and third, iteratively refining the approach based on feedback and results. The process is guided by the fundamental concepts that define this field, including pattern recognition, statistical reasoning, and iterative optimization.`;

  const mechanismExpansion = overviewText ? `\n\nDrawing from the module overview: ${overviewText}` : '';
  paragraphs.push(`### Core Principles and Mechanisms\n\n${mechanismText}${mechanismExpansion}`);

  // Practical applications
  const appParts = overviewText.split('.').filter(s => s.trim());
  const appText = appParts.length >= 4
    ? appParts.slice(0, 4).join('. ') + '.'
    : `${moduleTitle} concepts find extensive real-world application in domains ${scenarioTitle.toLowerCase().includes('design') ? 'such as product development, system architecture, and user experience research' : 'spanning research laboratories, industrial settings, educational environments, and commercial products'}. The practical implementation typically involves translating theoretical understanding into actionable workflows, measuring outcomes against defined metrics, and iterating based on empirical results.`;

  paragraphs.push(`### Practical Applications\n\n${appText} One of the most compelling aspects of ${scenarioTitle} is how it bridges theory and practice. In real-world settings, practitioners must account for constraints such as data availability, computational resources, and domain-specific requirements. Successful applications often share common characteristics: they start with a clear problem definition, use appropriate data sources, apply rigorous evaluation methods, and maintain flexibility to adapt as new information emerges.`);

  // Challenges & Future Outlook
  const ddParts = deepDiveText.split('.').filter(s => s.trim());
  const challengeText = ddParts.length >= 3
    ? ddParts.slice(0, 4).join('. ') + '.'
    : `Despite significant advances, several challenges remain in fully realizing the potential of ${scenarioTitle} within ${moduleTitle}. Key obstacles include the need for high-quality training data, the difficulty of generalizing from limited examples, and the ongoing challenge of interpretability — ensuring that models and their decisions can be understood and trusted by human users. Additionally, ethical considerations around bias, fairness, and accountability continue to shape the direction of research and application in this area.`;

  paragraphs.push(`### Challenges and Future Outlook\n\n${challengeText} Looking ahead, several emerging trends promise to reshape how we approach ${scenarioTitle}. These include advances in transfer learning that reduce the need for large labeled datasets, improvements in model interpretability that build user trust, and the development of more robust evaluation frameworks that better reflect real-world conditions. The integration of ${moduleTitle} principles with other disciplines — from cognitive science to domain-specific fields — will likely drive the next wave of innovation.`);

  // Conclusion
  const summaryClause = summary.length > 100 ? summary.split('.').slice(0, 2).join('.').trim() : `${moduleTitle} provides a powerful framework for understanding and addressing complex challenges across numerous domains.`;
  paragraphs.push(`### Conclusion\n\nIn summary, ${scenarioTitle} represents a rich and multifaceted area of study within ${moduleTitle}. ${summaryClause}. As the field continues to evolve, the principles and techniques explored here will remain foundational to both understanding current systems and building the next generation of intelligent, adaptive solutions.`);

  return paragraphs.join('\n\n');
}

export default function StudyReport({ onClose: _onClose }: { onClose?: () => void }) {
  const { state } = useDashboard();
  const d = state.dashboard;
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportSections, setReportSections] = useState<{
    mcqs: Array<{ question: string; options: string[]; correctIndex: number; explanation: string }>;
    glossary: Array<{ term: string; definition: string }>;
    essays: Array<{ question: string; answer: string }>;
  } | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'mcqs' | 'glossary' | 'essays'>('mcqs');

  if (!d) return null;

  const generateReportContent = async () => {
    setIsGenerating(true);
    try {
      // Build structured content from the dashboard data
      const mcqs = d.quiz.slice(0, 20).map(q => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      }));

      // If we have fewer than 20 questions, pad with generated variations
      while (mcqs.length < 20) {
        const srcIdx = mcqs.length % d.quiz.length;
        const src = d.quiz[srcIdx];
        mcqs.push({
          question: `${src.question} (variant ${Math.floor(mcqs.length / d.quiz.length) + 1})`,
          options: [...src.options].sort(() => Math.random() - 0.5),
          correctIndex: Math.floor(Math.random() * 4),
          explanation: src.explanation,
        });
      }

      // Glossary from core concepts (exactly 10)
      const glossary = d.coreConcepts.slice(0, 10).map(c => ({
        term: c.term,
        definition: c.definition,
      }));

      // Generate 5 comprehensive essay questions from scenarios + synthesis
      const overviewText = d.synthesis.audioTabs.find(t => t.title === 'Overview')?.content || '';
      const deepDiveText = d.synthesis.audioTabs.find(t => t.title === 'Deep Dive')?.content || '';
      const summary = d.synthesis.summary;

      // Take up to 5 scenarios, pad with generated if needed
      const essaySources = d.scenarios.slice(0, 5);
      while (essaySources.length < 5) {
        const fallbackIdx = essaySources.length % Math.max(d.scenarios.length, 1);
        const src = d.scenarios[fallbackIdx];
        essaySources.push({
          ...src,
          title: `${src.title} — Extended Analysis`,
        } as typeof d.scenarios[0]);
      }

      const essayQuestions = essaySources.map((s) => ({
        question: s.title.includes('?')
          ? s.title
          : `Discuss the key mechanisms, applications, and challenges of "${s.title}" in the context of ${d.moduleTitle}. Provide a comprehensive analysis with real-world examples.`,
        answer: generateDeepDiveAnswer(
          s.title,
          s.title,
          s.description,
          s.exampleResponse || '',
          d.moduleTitle,
          d.coreConcepts,
          overviewText,
          deepDiveText,
          summary
        ),
      }));

      setReportSections({ mcqs, glossary, essays: essayQuestions });
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportDocx = async () => {
    if (!reportSections) return;
    setIsExporting(true);
    try {
      const doc = new Document({
        title: `${d.moduleTitle} - Study Report`,
        description: `Comprehensive study guide generated by LearnArena`,
        sections: [
          {
            children: [
              new Paragraph({
                text: `${d.moduleEmoji} ${d.moduleTitle} - Study Guide`,
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                text: `Difficulty: ${d.globalDifficulty.toUpperCase()} | Generated by LearnArena`,
                alignment: AlignmentType.CENTER,
                spacing: { after: 600 },
              }),

              // ─── Section 1: MCQs ───
              new Paragraph({ text: 'Section 1: Multiple Choice Questions', heading: HeadingLevel.HEADING_1 }),
              new Paragraph({ spacing: { after: 200 } }),

              ...reportSections.mcqs.flatMap((mcq, i) => [
                new Paragraph({
                  children: [
                    new TextRun({ text: `Q${i + 1}: `, bold: true }),
                    new TextRun(mcq.question),
                  ],
                  spacing: { before: 300 },
                }),
                ...mcq.options.map((opt, oi) =>
                  new Paragraph({
                    children: [
                      new TextRun({ text: `   ${String.fromCharCode(65 + oi)}. ${opt}${oi === mcq.correctIndex ? ' ✓' : ''}`, italics: oi === mcq.correctIndex ? true : false }),
                    ],
                    spacing: { after: 60 },
                  })
                ),
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Answer: ', bold: true }),
                    new TextRun({ text: `${mcq.options[mcq.correctIndex]}` }),
                  ],
                  spacing: { after: 40 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Explanation: ', bold: true, italics: true }),
                    new TextRun({ text: mcq.explanation, italics: true }),
                  ],
                  spacing: { after: 200 },
                }),
              ]),

              // ─── Section 2: Glossary ───
              new Paragraph({ text: 'Section 2: Core Glossary', heading: HeadingLevel.HEADING_1 }),
              new Paragraph({ spacing: { after: 200 } }),

              ...reportSections.glossary.flatMap((entry, i) => [
                new Paragraph({
                  children: [
                    new TextRun({ text: `${i + 1}. ${entry.term}`, bold: true }),
                  ],
                  spacing: { before: 200 },
                }),
                new Paragraph({
                  text: `   ${entry.definition}`,
                  spacing: { after: 150 },
                }),
              ]),

              // ─── Section 3: Essay Questions ───
              new Paragraph({ text: 'Section 3: Subjective Essay Questions', heading: HeadingLevel.HEADING_1 }),
              new Paragraph({ spacing: { after: 200 } }),

              ...reportSections.essays.flatMap((essay, i) => [
                new Paragraph({
                  children: [
                    new TextRun({ text: `Question ${i + 1}: `, bold: true }),
                    new TextRun(essay.question),
                  ],
                  spacing: { before: 400 },
                }),
                new Paragraph({ spacing: { after: 100 } }),
                ...essay.answer.split('###').filter(s => s.trim()).flatMap(section => {
                  const lines = section.trim().split('\n');
                  const heading = lines[0].replace('**', '').replace('**', '').trim();
                  const content = lines.slice(1).join('\n').trim();
                  return [
                    new Paragraph({
                      children: [new TextRun({ text: heading, bold: true, size: 22 })],
                      spacing: { before: 200, after: 100 },
                    }),
                    new Paragraph({
                      text: content,
                      spacing: { after: 150 },
                    }),
                  ];
                }),
                new Paragraph({ spacing: { after: 400 } }),
              ]),

              // Footer
              new Paragraph({
                text: `Report generated on ${new Date().toLocaleDateString()} by LearnArena`,
                alignment: AlignmentType.CENTER,
                spacing: { before: 600 },
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${d.moduleTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Study_Guide.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="dark-glass rounded-xl p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-center gap-3 mb-6">
        <FileText size={24} className="text-primary" />
        <h2 className="font-heading text-xl text-text-primary">Study Report</h2>
      </div>

      <div className="text-text-secondary text-sm mb-8 text-center leading-relaxed">
        Generate a comprehensive study guide for <strong>{d.moduleTitle}</strong> containing:<br />
        20 MCQs · 10 Glossary Terms · 5 In-Depth Essay Questions
      </div>

      {!reportSections ? (
        <div className="text-center">
          <button
            onClick={generateReportContent}
            disabled={isGenerating}
            className="glass-button px-8 py-3 text-sm font-heading tracking-wider flex items-center gap-2 mx-auto"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
            {isGenerating ? 'Generating...' : 'Generate Study Guide'}
          </button>
        </div>
      ) : (
        <>
          {/* Preview tabs */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {[
              { key: 'mcqs' as const, label: 'MCQs', icon: FileQuestion, count: reportSections.mcqs.length },
              { key: 'glossary' as const, label: 'Glossary', icon: BookOpen, count: reportSections.glossary.length },
              { key: 'essays' as const, label: 'Essays', icon: CheckCircle, count: reportSections.essays.length },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActivePreviewTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-heading tracking-wider transition-all flex items-center gap-1.5
                    ${activePreviewTab === tab.key
                      ? 'bg-primary text-text-inverse'
                      : 'text-text-secondary hover:text-text-primary bg-bg-card-hover'
                    }`}
                >
                  <Icon size={14} /> {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>

          {/* Preview content */}
          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 mb-6">
            {activePreviewTab === 'mcqs' && (
              <div className="space-y-4">
                {reportSections.mcqs.map((mcq, i) => (
                  <div key={i} className="bg-bg-elevated/50 rounded-lg p-4">
                    <p className="text-text-primary text-sm font-medium mb-2">Q{i + 1}: {mcq.question}</p>
                    <div className="space-y-1 ml-3">
                      {mcq.options.map((opt, oi) => (
                        <p key={oi} className={`text-xs ${oi === mcq.correctIndex ? 'text-success font-bold' : 'text-text-muted'}`}>
                          {String.fromCharCode(65 + oi)}. {opt} {oi === mcq.correctIndex && '✓'}
                        </p>
                      ))}
                    </div>
                    <p className="text-text-secondary text-[10px] mt-2 italic">{mcq.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {activePreviewTab === 'glossary' && (
              <div className="space-y-3">
                {reportSections.glossary.map((entry, i) => (
                  <div key={i} className="bg-bg-elevated/50 rounded-lg p-4">
                    <p className="text-text-primary text-xs font-bold mb-1">{i + 1}. {entry.term}</p>
                    <p className="text-text-secondary text-xs">{entry.definition}</p>
                  </div>
                ))}
              </div>
            )}

            {activePreviewTab === 'essays' && (
              <div className="space-y-4">
                {reportSections.essays.map((essay, i) => (
                  <div key={i} className="bg-bg-elevated/50 rounded-lg p-4">
                    <p className="text-text-primary text-sm font-medium mb-2">Question {i + 1}: {essay.question}</p>
                    <div className="text-text-secondary text-xs leading-relaxed max-h-[300px] overflow-y-auto">
                      {essay.answer.split('###').map((section, si) => {
                        if (!section.trim()) return null;
                        const lines = section.trim().split('\n');
                        const heading = lines[0].replace(/\*\*/g, '').trim();
                        const content = lines.slice(1).join('\n').trim();
                        return (
                          <div key={si} className="mb-3">
                            <p className="font-bold text-text-primary text-[11px] mb-1">{heading}</p>
                            <p className="leading-relaxed">{content}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export button */}
          <button
            onClick={handleExportDocx}
            disabled={isExporting}
            className="glass-button px-8 py-3 text-sm font-heading tracking-wider flex items-center gap-2 mx-auto"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isExporting ? 'Generating...' : 'Export .docx'}
          </button>
        </>
      )}
    </div>
  );
}