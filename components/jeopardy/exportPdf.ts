import { jsPDF } from 'jspdf';
import { generateStudyTips } from '../../services/jeopardyService';
import { sanitizeForPdf } from '../../utils/sanitize';
import { JeopardyBoardData } from './types';

export const exportJeopardyStudySheet = async (board: JeopardyBoardData, topic: string) => {
    // Generate Study Tips first
    const tips = await generateStudyTips(topic, board.categories.map(c => c.title));

    const doc = new jsPDF();
    // Reset charSpace to ensure no weird kerning artifacts
    doc.setCharSpace(0);

    doc.setFontSize(22);
    doc.text(`Jeopardy Study Guide: ${sanitizeForPdf(topic)}`, 10, 20);
    doc.setFontSize(12);
    let y = 40;
    board.categories.forEach((cat, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold");
        doc.text(`Category ${i + 1}: ${sanitizeForPdf(cat.title)}`, 10, y);
        y += 10;
        cat.questions.forEach((q) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFont("helvetica", "normal");
            const questionText = `Q ($${q.value}): ${sanitizeForPdf(q.question)}`;
            const answerText = `A: ${sanitizeForPdf(q.answer)}`;

            // Explicitly align left and join lines to prevent any justification issues
            const splitQ = doc.splitTextToSize(questionText, 190);
            doc.text(Array.isArray(splitQ) ? splitQ.join("\n") : splitQ, 10, y, { align: 'left' });
            y += (splitQ.length * 5);

            const splitA = doc.splitTextToSize(answerText, 190);
            doc.setTextColor(100);
            doc.text(Array.isArray(splitA) ? splitA.join("\n") : splitA, 10, y, { align: 'left' });
            doc.setTextColor(0);
            y += (splitA.length * 5) + 5;
        });
        y += 10;
    });

    // Append Study Tips Page
    if (tips.length > 0) {
        doc.addPage();
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Study Tips & Key Concepts", 10, 20);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        y = 40;

        tips.forEach((tip) => {
            const tipText = `• ${tip}`;
            const splitTip = doc.splitTextToSize(tipText, 190);
            if (y + (splitTip.length * 7) > 280) { doc.addPage(); y = 20; }

            doc.text(Array.isArray(splitTip) ? splitTip.join("\n") : splitTip, 10, y, { align: 'left' });
            y += (splitTip.length * 7);
        });
    }

    doc.save(`${sanitizeForPdf(topic)}_StudyGuide.pdf`);
};
