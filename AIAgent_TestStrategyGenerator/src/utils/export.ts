import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';

// --- Markdown download ---

export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  triggerDownload(blob, `${filename}.md`);
}

// --- Word (.docx) download ---

function parseInline(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(new TextRun({ text: text.slice(lastIndex, match.index) }));
    }
    runs.push(new TextRun({ text: match[1], bold: true }));
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    runs.push(new TextRun({ text: text.slice(lastIndex) }));
  }

  return runs.length ? runs : [new TextRun({ text })];
}

function markdownToDocxParagraphs(markdown: string): Paragraph[] {
  const lines = markdown.split('\n');
  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: '' }));
      continue;
    }

    if (trimmed.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({ text: trimmed.slice(2), heading: HeadingLevel.HEADING_1 })
      );
    } else if (trimmed.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({ text: trimmed.slice(3), heading: HeadingLevel.HEADING_2 })
      );
    } else if (trimmed.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({ text: trimmed.slice(4), heading: HeadingLevel.HEADING_3 })
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.slice(2);
      paragraphs.push(
        new Paragraph({
          children: parseInline(bulletText),
          bullet: { level: 0 },
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          children: parseInline(trimmed),
          alignment: AlignmentType.LEFT,
        })
      );
    }
  }

  return paragraphs;
}

export async function downloadDocx(content: string, filename: string) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: markdownToDocxParagraphs(content),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `${filename}.docx`);
}

// --- PDF download ---

export async function downloadPdf(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found for PDF export.`);
    return;
  }

  const [{ jsPDF }, html2canvasModule] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);
  const html2canvas = html2canvasModule.default;

  // Temporarily force light background for readable PDF regardless of current theme
  const prevBg = element.style.backgroundColor;
  const prevColor = element.style.color;
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#0f172a';

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  element.style.backgroundColor = prevBg;
  element.style.color = prevColor;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * contentWidth) / canvas.width;

  let remaining = imgHeight;
  let yOffset = 0;

  while (remaining > 0) {
    const sliceHeight = Math.min(remaining, pageHeight - margin * 2);
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = (sliceHeight * canvas.width) / contentWidth;

    const ctx = sliceCanvas.getContext('2d')!;
    ctx.drawImage(
      canvas,
      0,
      (yOffset * canvas.width) / contentWidth,
      canvas.width,
      sliceCanvas.height,
      0,
      0,
      canvas.width,
      sliceCanvas.height
    );

    if (yOffset > 0) pdf.addPage();
    pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, margin, contentWidth, sliceHeight);

    yOffset += sliceHeight;
    remaining -= sliceHeight;
  }

  pdf.save(`${filename}.pdf`);
}

// --- Shared helper ---

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
