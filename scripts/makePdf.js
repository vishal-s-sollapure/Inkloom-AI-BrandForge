// Script to render ROUND2-PROJECT-SUMMARY.md into a high-quality PDF using Microsoft Edge headless
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const mdPath = path.join(rootDir, 'ROUND2-PROJECT-SUMMARY.md');
const htmlPath = path.join(rootDir, 'BrandForge-Round2-Project-Summary.html');
const pdfPath = path.join(rootDir, 'BrandForge-Round2-Project-Summary.pdf');

const mdContent = fs.readFileSync(mdPath, 'utf-8');

// Basic Markdown to HTML converter tailored for standard formatting
function mdToHtml(md) {
  let html = md;

  // Escape HTML entities inside inline code first
  html = html.replace(/`([^`]+)`/g, (m, p1) => `<code>${p1.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`);

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, (m, code) => `<pre><code>${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr/>');

  // Tables
  html = html.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (tableMatch) => {
    const lines = tableMatch.trim().split(/\r?\n/).filter(l => l.trim().startsWith('|'));
    if (lines.length < 2) return tableMatch;
    
    let tableHtml = '<table><thead>';
    const headerCols = lines[0].split('|').slice(1, -1).map(c => c.trim());
    tableHtml += '<tr>' + headerCols.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';

    // Skip separator line (index 1)
    for (let i = 2; i < lines.length; i++) {
      const rowCols = lines[i].split('|').slice(1, -1).map(c => c.trim());
      tableHtml += '<tr>' + rowCols.map(c => `<td>${c}</td>`).join('') + '</tr>';
    }
    tableHtml += '</tbody></table>';
    return tableHtml;
  });

  // Unordered list items
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gims, (match) => {
    // Avoid double wrapping
    return `<ul>${match}</ul>`.replace(/<\/ul>\s*<ul>/g, '');
  });

  // Ordered list items
  html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li value="$1">$2</li>');

  // Bold & Italics
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Markdown links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Paragraphs
  const blocks = html.split(/\n{2,}/);
  html = blocks.map(b => {
    b = b.trim();
    if (!b) return '';
    if (b.startsWith('<h') || b.startsWith('<table') || b.startsWith('<pre') || b.startsWith('<ul') || b.startsWith('<ol') || b.startsWith('<blockquote') || b.startsWith('<hr')) {
      return b;
    }
    return `<p>${b.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  return html;
}

const bodyHtml = mdToHtml(mdContent);

const completeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BrandForge Round 2 Project Summary</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 18mm 20mm 18mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #1a1a1a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 13px;
    }
    h1 {
      font-size: 24px;
      color: #180D1C;
      border-bottom: 2px solid #D9778F;
      padding-bottom: 6px;
      margin-top: 0;
      margin-bottom: 8px;
    }
    h2 {
      font-size: 17px;
      color: #6E3358;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 4px;
      margin-top: 20px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    h3 {
      font-size: 14px;
      color: #2b2b2b;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }
    p {
      margin-top: 0;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 15px;
      font-size: 12px;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #d0d0d0;
      padding: 6px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f7f3f6;
      color: #4a154b;
      font-weight: 600;
    }
    code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 11.5px;
      background-color: #f5f0f3;
      color: #6E3358;
      padding: 2px 4px;
      border-radius: 3px;
    }
    pre {
      background-color: #180D1C;
      color: #f7e8ee;
      padding: 10px 14px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 11px;
      line-height: 1.4;
      page-break-inside: avoid;
    }
    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
    }
    blockquote {
      margin: 12px 0;
      padding: 8px 14px;
      border-left: 4px solid #D9778F;
      background-color: #faf5f7;
      color: #4a4a4a;
      font-size: 12.5px;
      page-break-inside: avoid;
    }
    ul, ol {
      margin-top: 4px;
      margin-bottom: 12px;
      padding-left: 22px;
    }
    li {
      margin-bottom: 4px;
    }
    hr {
      border: 0;
      border-top: 1px solid #e0d0d8;
      margin: 18px 0;
    }
    a {
      color: #9c2750;
      text-decoration: underline;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

fs.writeFileSync(htmlPath, completeHtml, 'utf-8');
console.log(`Wrote styled HTML to: ${htmlPath}`);

// Run Microsoft Edge headless to generate the PDF
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
if (fs.existsSync(edgePath)) {
  try {
    const cmd = `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "file:///${htmlPath.replace(/\\/g, '/')}"`;
    execSync(cmd, { stdio: 'inherit' });
    console.log(`Successfully generated PDF at: ${pdfPath}`);
  } catch (err) {
    console.error('Edge headless PDF generation error:', err.message);
  }
} else {
  console.log('Edge not found at standard path.');
}
