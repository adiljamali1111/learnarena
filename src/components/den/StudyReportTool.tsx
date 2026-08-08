import { useState, useCallback } from 'react';
import { FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, HeadingLevel, TextRun, BorderStyle } from 'docx';
import { useDashboard } from '../../context/DashboardContext';
import { useDenTool } from './useDenTool';
import { generateDenContent } from '../../services/openrouter';
import DenToolShell from './DenToolShell';
import type { StudyReportContent } from '../../types/dashboard';

interface Props {
  moduleTitle: string;
  sourceText: string;
  onBack: () => void;
}

type TabKey = 'objective' | 'subjective' | 'glossary';

export default function StudyReportTool({ moduleTitle, sourceText, onBack }: Props) {
  const { generateDenToolContent } = useDashboard();
  const [tab, setTab] = useState<TabKey>('objective');
  const [exporting, setExporting] = useState(false);

  const { data, loading, error, generating, regenerate } = useDenTool<StudyReportContent>(
    () => generateDenContent('study-report', moduleTitle, sourceText, []) as Promise<StudyReportContent>,
    `study-report_${moduleTitle}`,
  );

  const handleExport = useCallback(async () => {
    if (!data) return;
    setExporting(true);
    try {
      const content: Paragraph[] = [];

      // Title
      content.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: `Study Report: ${moduleTitle}`, bold: true, size: 36 })],
        }),
        new Paragraph({ children: [new TextRun({ text: '', size: 24 })] }),
      );

      // Objective
      content.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: 'Objective Questions', bold: true, size: 28 })],
        }),
      );
      data.objective.forEach((item, i) => {
        content.push(
          new Paragraph({ children: [new TextRun({ text: `${i + 1}. ${item.question}`, bold: true, size: 22 })] }),
          new Paragraph({ children: [new TextRun({ text: `Answer: ${item.answer}`, size: 22 })] }),
          new Paragraph({ children: [new TextRun({ text: '', size: 22 })] }),
        );
      });

      // Subjective
      content.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: 'Subjective Questions', bold: true, size: 28 })],
        }),
      );
      data.subjective.forEach((item, i) => {
        content.push(
          new Paragraph({ children: [new TextRun({ text: `${i + 1}. ${item.question}`, bold: true, size: 22 })] }),
          new Paragraph({ children: [new TextRun({ text: `Answer: ${item.answer}`, size: 22 })] }),
          new Paragraph({ children: [new TextRun({ text: '', size: 22 })] }),
        );
      });

      // Glossary
      content.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: 'Glossary', bold: true, size: 28 })],
        }),
        new Paragraph({ children: [new TextRun({ text: '', size: 22 })] }),
      );

      // Glossary as table
      const tableRows = data.glossary.map(
        (item) =>
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: item.term, bold: true, size: 20 })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: item.definition, size: 20 })] })],
              }),
            ],
          }),
      );
      content.push(
        new Paragraph({
          children: [
            new Table({
              rows: tableRows,
            }),
          ],
        }),
      );

      const doc = new Document({ sections: [{ children: content }] });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${moduleTitle.replace(/[^a-zA-Z0-9]/g, '_')}_study_report.docx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Study report exported as .docx');
    } catch (err) {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  }, [data, moduleTitle]);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'objective', label: 'Objective', count: data?.objective.length ?? 0 },
    { key: 'subjective', label: 'Subjective', count: data?.subjective.length ?? 0 },
    { key: 'glossary', label: 'Glossary', count: data?.glossary.length ?? 0 },
  ];

  return (
    <DenToolShell
      title="Study Report"
      loading={loading}
      error={error}
      generating={generating}
      onBack={onBack}
      onRegenerate={regenerate}
    >
      {data && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 bg-dark-elevated rounded-lg p-1 mb-4">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-heading transition-all cursor-pointer ${
                  tab === t.key
                    ? 'bg-primary text-dark-base font-bold'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {t.label} <span className="text-2xs opacity-60">({t.count})</span>
              </button>
            ))}
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-dark-base text-xs font-heading font-bold hover:bg-primary-light transition-colors cursor-pointer mb-4 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? 'Exporting...' : 'Export .docx'}
          </button>

          {/* Content */}
          {tab === 'objective' && (
            <div className="space-y-4">
              {data.objective.map((item, i) => (
                <div key={i} className="glass-card p-4">
                  <p className="text-sm font-medium text-foreground mb-2">{i + 1}. {item.question}</p>
                  <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                    <p className="text-xs text-success font-medium mb-0.5">Answer</p>
                    <p className="text-sm text-foreground/80">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'subjective' && (
            <div className="space-y-4">
              {data.subjective.map((item, i) => (
                <div key={i} className="glass-card p-4">
                  <p className="text-sm font-medium text-foreground mb-2">{i + 1}. {item.question}</p>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <p className="text-xs text-primary font-medium mb-0.5">Model Answer</p>
                    <p className="text-sm text-foreground/80">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'glossary' && (
            <div className="space-y-2">
              {data.glossary.map((item, i) => (
                <div key={i} className="glass-card p-4 flex items-start gap-3">
                  <span className="text-xs text-muted-lighter font-mono mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="text-sm font-medium text-accent">{item.term}</p>
                    <p className="text-xs text-muted mt-0.5">{item.definition}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DenToolShell>
  );
}