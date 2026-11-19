import { jsPDF } from 'jspdf';
import type { DiagnosticAnswers, DiagnosticReport } from '../types/diagnostic';
import {
  CALENDLY_URL,
  STRUGGLE_PATHS,
  VENDOR_CATEGORY_SOLUTIONS,
  VENDOR_PRICING_TABLE,
} from '../data/questions';
import {
  buildConciseAnswersSummary,
  buildEmrPulseRecommendation,
  buildRevenueImpactNarrative,
  computeBenchmarkComparison,
  computeRevenueRisk,
  computeRiskBreakdownBars,
  computeWorkflowLoadRisk,
} from './riskMetrics';

export function buildDiagnosticPdfDocument(
  report: DiagnosticReport,
  answers: DiagnosticAnswers,
  reportIdOverride?: string,
  _theme: 'light' | 'dark' = 'dark'
): { doc: jsPDF; reportId: string; fileName: string } {
  // Strict 2-Page Print-Friendly Layout (Clean White Background, EMR Pulse Teal #0F766E, Dark Gray #1F2937 Text)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 612pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 792pt
  const margin = 32;
  const contentWidth = pageWidth - margin * 2; // 548pt
  const footerLimitY = pageHeight - 48;

  const randomFour = Math.floor(1000 + Math.random() * 9000);
  const reportId = reportIdOverride || `#EP-2026-${randomFour}`;
  const fileName = `EMR-Pulse-Report-${reportId.replace('#', '')}.pdf`;

  const parsedDate = Date.parse(report.generatedAt);
  const formattedTimestamp = Number.isNaN(parsedDate)
    ? new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : new Date(parsedDate).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

  const pathMeta =
    STRUGGLE_PATHS.find((item) => item.id === answers.strugglePath) ?? STRUGGLE_PATHS[0];
  const revenueRisk = computeRevenueRisk(answers);
  const workflowRisk = computeWorkflowLoadRisk(answers);
  const conciseSummary = buildConciseAnswersSummary(answers);
  const riskBars = computeRiskBreakdownBars(answers);
  const impactNarrative = buildRevenueImpactNarrative(answers);
  const vendorCategories = VENDOR_CATEGORY_SOLUTIONS[answers.strugglePath];
  const emrPulseRecommendation = buildEmrPulseRecommendation(answers, report);

  const LEGAL_DISCLAIMER_TEXT =
    'Legal Disclaimer: This EMR Pulse diagnostic report is an operational assessment based on provided inputs. For informational/advisory purposes only; does not constitute financial guarantees. © 2026 EMR Pulse. All rights reserved.';

  const drawPageHeader = (isFirstPage: boolean) => {
    // Clean White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Subtle transparent watermark in center of background on every page
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(52);
    doc.setTextColor(243, 244, 246); // light gray watermark
    doc.text('EMR PULSE', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 35 });

    if (isFirstPage) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(31, 41, 55); // Dark gray #1F2937
      doc.text('Your Practice Risk & Revenue Snapshot', margin, 34);

      // Report ID & Timestamp neatly aligned at top right
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 118, 110); // EMR Pulse Teal #0F766E
      doc.text(`Report ID: ${reportId}`, pageWidth - margin, 28, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated: ${formattedTimestamp}`, pageWidth - margin, 39, { align: 'right' });

      // Header Calendly Link / CTA
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 118, 110);
      doc.text('Book a call with Mr. Ali →', pageWidth - margin, 52, { align: 'right' });
      doc.link(pageWidth - margin - 120, 42, 120, 14, { url: CALENDLY_URL });

      doc.setDrawColor(229, 231, 235);
      doc.line(margin, 58, pageWidth - margin, 58);

      return 66;
    }

    doc.setDrawColor(229, 231, 235);
    doc.line(margin, 28, pageWidth - margin, 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text(
      `EMR PULSE REPORT  |  ${pathMeta.shortLabel.toUpperCase()}  |  ${reportId}`,
      margin,
      21
    );
    return 38;
  };

  let y = drawPageHeader(true);

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > footerLimitY) {
      doc.addPage();
      y = drawPageHeader(false);
    }
  };

  const drawParagraph = (
    text: string,
    fontSize = 8,
    color: [number, number, number] = [31, 41, 55],
    lineHeightMultiplier = 1.35,
    xOffset = 0,
    maxWidth = contentWidth
  ) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    const step = fontSize * lineHeightMultiplier;
    for (const line of lines) {
      ensureSpace(step + 2);
      doc.text(line, margin + xOffset, y);
      y += step;
    }
  };

  const drawSectionHeading = (title: string) => {
    ensureSpace(22);
    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 118, 110);
    doc.text(title, margin, y);
    y += 10;
  };

  // Concise Profile + Executive Summary
  drawParagraph(`Your Profile: ${conciseSummary}`, 7.8, [31, 41, 55], 1.35);
  y += 2;
  drawParagraph(report.executiveSummary, 8.2, [75, 85, 99], 1.35);
  y += 6;

  // TOP 3 SUMMARY CARDS (Clean print friendly cards)
  const gap = 6;
  const cardW = (contentWidth - gap * 2) / 3;
  const cardH = 60;
  ensureSpace(cardH + 8);

  const riskCards = [revenueRisk, workflowRisk];
  riskCards.forEach((metric, idx) => {
    const cx = margin + idx * (cardW + gap);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(cx, y, cardW, cardH, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(107, 114, 128);
    doc.text(metric.title.toUpperCase(), cx + 6, y + 11);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(metric.rgb[0], metric.rgb[1], metric.rgb[2]);
    doc.text(`${metric.score}% (${metric.label})`, cx + 6, y + 24);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(75, 85, 99);
    const driverText = `${metric.answerLabel}: ${metric.answerDisplay}`;
    doc.text(driverText.length > 32 ? `${driverText.slice(0, 30)}...` : driverText, cx + 6, y + 42, { maxWidth: cardW - 12 });
  });

  const c3x = margin + 2 * (cardW + gap);
  doc.setFillColor(240, 253, 250);
  doc.setDrawColor(15, 118, 110);
  doc.roundedRect(c3x, y, cardW, cardH, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 118, 110);
  doc.text('ESTIMATED ANNUAL IMPACT', c3x + 6, y + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(31, 41, 55);
  const impactHeadLines = doc.splitTextToSize(report.impactRange, cardW - 12) as string[];
  let iy = y + 24;
  impactHeadLines.slice(0, 2).forEach((line) => {
    doc.text(line, c3x + 6, iy);
    iy += 10;
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(75, 85, 99);
  doc.text(`Priority: ${report.recommendedCategory}`, c3x + 6, y + 48, { maxWidth: cardW - 12 });

  y += cardH + 10;

  // =========================================================================
  // SECTION 1: Root Causes & Operational Risks
  // =========================================================================
  drawSectionHeading('1. Root Causes & Operational Risks');

  if (report.rcmRiskAlert) {
    drawParagraph(`RCM RISK ALERT: ${report.rcmRiskAlert}`, 7.8, [185, 28, 28], 1.35);
    y += 4;
  }

  // Risk Table with word wrapping & fixed widths
  const tableX = margin;
  const tableY = y;
  const rowH = 16;
  const tHeaderH = 18;
  const tHeight = tHeaderH + riskBars.length * rowH;
  ensureSpace(tHeight + 8);

  doc.setFillColor(243, 244, 246);
  doc.setDrawColor(229, 231, 235);
  doc.rect(tableX, tableY, contentWidth, tHeaderH, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(31, 41, 55);
  doc.text('Operational Dimension', tableX + 6, tableY + 12);
  doc.text('Practice Response / Input', tableX + 200, tableY + 12);
  doc.text('Risk Index', pageWidth - margin - 6, tableY + 12, { align: 'right' });

  riskBars.forEach((bar, idx) => {
    const ry = tableY + tHeaderH + idx * rowH;
    doc.setFillColor(idx % 2 === 0 ? 255 : 243, idx % 2 === 0 ? 255 : 244, idx % 2 === 0 ? 255 : 246);
    doc.rect(tableX, ry, contentWidth, rowH, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(31, 41, 55);
    doc.text(bar.dimension, tableX + 6, ry + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(75, 85, 99);
    const ansTrunc = bar.userAnswer.length > 38 ? `${bar.userAnswer.slice(0, 36)}...` : bar.userAnswer;
    doc.text(ansTrunc, tableX + 200, ry + 11);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(bar.rgb[0], bar.rgb[1], bar.rgb[2]);
    doc.text(`${bar.levelLabel} (${bar.score}%)`, pageWidth - margin - 6, ry + 11, { align: 'right' });
  });

  y += tHeight + 8;

  report.topRisks.slice(0, 2).forEach((risk, idx) => {
    ensureSpace(28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(31, 41, 55);
    doc.text(`1.${idx + 1} ${risk.title} — Mechanism: ${risk.mechanism}`, margin, y, { maxWidth: contentWidth });
    y += 10;
    drawParagraph(risk.detail, 7.8, [75, 85, 99], 1.35);
    y += 4;
  });

  // =========================================================================
  // SECTION 2: How This Impacts Your Revenue (Compressed for Space)
  // =========================================================================
  drawSectionHeading('2. How This Impacts Your Revenue');
  drawParagraph(impactNarrative, 8, [31, 41, 55], 1.35);
  y += 4;
  drawParagraph(`Conservative Estimate: ${report.impactRange}. ${report.impactDisclaimer}`, 7.8, [15, 118, 110], 1.35);
  y += 6;

  // =========================================================================
  // SECTION 3: Recommended Vendor Categories & Pricing Table
  // =========================================================================
  drawSectionHeading('3. Recommended Vendor Categories & Market Pricing');

  vendorCategories.forEach((item, idx) => {
    ensureSpace(24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(31, 41, 55);
    doc.text(`3.${idx + 1} ${item.category} (Examples: ${item.examples})`, margin, y, { maxWidth: contentWidth });
    y += 10;
    drawParagraph(`Verify: ${item.whatToLookFor}`, 7.5, [75, 85, 99], 1.35);
    y += 4;
  });

  // Pricing Table with fixed column widths and clean wrapping
  const pCols = [
    { label: 'Vendor Name', width: 85 },
    { label: 'Solution Type', width: 85 },
    { label: 'Est. Starting Price', width: 110 },
    { label: 'Best For Practice Fit', width: contentWidth - 280 },
  ];

  const pHeaderH = 16;
  const pRowH = 18;
  const pTableH = pHeaderH + VENDOR_PRICING_TABLE.length * pRowH;
  ensureSpace(pTableH + 8);

  doc.setFillColor(15, 118, 110);
  doc.rect(margin, y, contentWidth, pHeaderH, 'F');
  let px = margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  pCols.forEach((col) => {
    doc.text(col.label, px + 5, y + 11);
    px += col.width;
  });
  y += pHeaderH;

  VENDOR_PRICING_TABLE.forEach((row, idx) => {
    const ry = y + idx * pRowH;
    doc.setFillColor(idx % 2 === 0 ? 255 : 243, idx % 2 === 0 ? 255 : 244, idx % 2 === 0 ? 255 : 246);
    doc.setDrawColor(229, 231, 235);
    doc.rect(margin, ry, contentWidth, pRowH, 'FD');

    let cellX = margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(31, 41, 55);
    doc.text(row.vendorName, cellX + 5, ry + 12);
    cellX += pCols[0].width;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(15, 118, 110);
    doc.text(row.solutionType, cellX + 5, ry + 12);
    cellX += pCols[1].width;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(31, 41, 55);
    doc.text(row.estStartingPrice, cellX + 5, ry + 12);
    cellX += pCols[2].width;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(75, 85, 99);
    const bf = row.bestFor.length > 40 ? `${row.bestFor.slice(0, 38)}...` : row.bestFor;
    doc.text(bf, cellX + 5, ry + 12);
  });

  y += VENDOR_PRICING_TABLE.length * pRowH + 8;

  // =========================================================================
  // EMR Pulse Recommendations & Final CTA (Strict 2 page fit)
  // =========================================================================
  drawSectionHeading('EMR Pulse Recommendations');
  drawParagraph(emrPulseRecommendation.engagementTitle, 8.5, [31, 41, 55], 1.35);
  y += 3;
  drawParagraph(emrPulseRecommendation.tailoredSummary, 7.8, [75, 85, 99], 1.35);
  y += 3;
  drawParagraph(`Pricing Estimate: ${emrPulseRecommendation.approxPricingRange} (${emrPulseRecommendation.pricingStructure})`, 8, [15, 118, 110], 1.35);
  y += 3;
  drawParagraph(`Note: Pricing is approximate based on practice size and scope. Final quotes may vary.`, 7, [180, 83, 9], 1.35);
  y += 6;

  // Final CTA Box on Page 2
  ensureSpace(38);
  doc.setFillColor(243, 244, 246);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(margin, y, contentWidth, 36, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(31, 41, 55);
  doc.text('Still worried? No problem. Just book a call and talk to the expert.', pageWidth / 2, y + 14, {
    align: 'center',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 118, 110);
  doc.text('Book a free 15-minute consultation with Mr. Ali →', pageWidth / 2, y + 26, {
    align: 'center',
  });
  doc.link(margin, y, contentWidth, 36, { url: CALENDLY_URL });

  // Enforce strict 2-page ceiling under all circumstances
  while (doc.getNumberOfPages() > 2) {
    doc.deletePage(doc.getNumberOfPages());
  }

  // Draw uniform Footer & Legal Disclaimer across all pages (Strict 2-page limit)
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const lineY = pageHeight - 32;

    doc.setDrawColor(229, 231, 235);
    doc.line(margin, lineY, pageWidth - margin, lineY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(107, 114, 128);
    doc.text('emrpulse.us', margin, lineY + 8);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, lineY + 8, {
      align: 'right',
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(107, 114, 128);
    const disclLines = doc.splitTextToSize(LEGAL_DISCLAIMER_TEXT, contentWidth - 110) as string[];
    doc.text(disclLines[0] || LEGAL_DISCLAIMER_TEXT, margin + 65, lineY + 8);
  }

  return { doc, reportId, fileName };
}

export function getDiagnosticPdfBase64(
  report: DiagnosticReport,
  answers: DiagnosticAnswers,
  reportIdOverride?: string,
  theme: 'light' | 'dark' = 'dark'
): { base64: string; reportId: string; fileName: string } {
  const { doc, reportId, fileName } = buildDiagnosticPdfDocument(
    report,
    answers,
    reportIdOverride,
    theme
  );
  const dataUri = doc.output('datauristring');
  const commaIdx = dataUri.indexOf(',');
  const base64 = commaIdx >= 0 ? dataUri.slice(commaIdx + 1) : dataUri;
  return { base64, reportId, fileName };
}

export function downloadDiagnosticPdf(
  report: DiagnosticReport,
  answers: DiagnosticAnswers,
  _vendorsUnlocked = true,
  reportIdOverride?: string,
  theme: 'light' | 'dark' = 'dark'
): void {
  const { doc, fileName } = buildDiagnosticPdfDocument(
    report,
    answers,
    reportIdOverride,
    theme
  );
  doc.save(fileName);
}
