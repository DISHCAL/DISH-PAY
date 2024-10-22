function generatePDF() {
    const { jsPDF } = window.jspdf;

    // Kundeninformationen
    const salutation = document.getElementById('salutation').value;
    const customerName = document.getElementById('customerName').value;

    // Überprüfen, ob der Kundenname eingegeben wurde
    if (!customerName.trim()) {
        alert("Bitte geben Sie den Kundennamen ein, bevor Sie das PDF herunterladen.");
        return;
    }

    const calculationType = document.getElementById('calculationType').value;

    const doc = new jsPDF({
        format: 'a4',
        unit: 'pt',
    });

    // Ränder definieren
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const usableWidth = pageWidth - margin * 2;

    // Briefkopf gestalten
    doc.setFillColor(230, 126, 34); // Angepasster Orangeton
    doc.rect(0, 0, pageWidth, 60, 'F');

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text("DISH PAY Angebot", margin, 40);

    // Kundenansprache
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Sehr geehrte${salutation === 'Frau' ? ' Frau' : 'r Herr'} ${customerName},`, margin, 100);
    const offerText = `Vielen Dank für Ihr Interesse an DISH PAY.\nAnbei erhalten Sie unser unverbindliches Angebot basierend auf Ihren Eingaben.\nUnten finden Sie eine detaillierte Übersicht der Kosten.`;
    doc.text(offerText, margin, 120);

    // Tabelleninhalte erstellen
    const tableContent = [];

    // Berechnungsergebnisse aus dem HTML holen
    const resultArea = document.getElementById('resultArea').innerHTML;
    const parser = new DOMParser();
    const docParsed = parser.parseFromString(resultArea, 'text/html');
    const rows = docParsed.querySelectorAll('.result-table tr');

    // Tabelle füllen
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 1) {
            const key = cells[0].innerText;
            const value = cells[1].innerText;
            tableContent.push([key, value]);
        } else {
            // Zeile für Abschnittstitel (z.B. "DISH PAY Kosten")
            const title = cells[0].innerText;
            tableContent.push([{ content: title, colSpan: 2, styles: { halign: 'center', fillColor: [245, 245, 245] } }]);
        }
    });

    // Tabelle im PDF einfügen
    doc.autoTable({
        head: [['Kategorie', 'Kosten']],
        body: tableContent,
        startY: 180,
        theme: 'grid',
        styles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontSize: 12,
            font: 'helvetica',
        },
        headStyles: {
            fillColor: [230, 126, 34], // Angepasster Orangeton
            textColor: [255, 255, 255],
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },
        margin: { left: margin, right: margin },
        tableWidth: usableWidth,
    });

    let finalY = doc.lastAutoTable.finalY;

    // Gebührenhinweis hinzufügen
    const feeDisclaimer = `Hinweis zu den Gebühren:
- Transaktionspreis: 0,06 € pro Transaktion
- Girocard-Gebühr bis 10.000 € monatlich: 0,39%
- Girocard-Gebühr über 10.000 € monatlich: 0,29%
- Disagio Maestro / VPAY: 0,89%
- Disagio Mastercard/VISA Privatkunden: 0,89%
- Disagio Mastercard/VISA Business und NICHT-EWR-RAUM: 2,89%`;
    doc.setFontSize(12);
    doc.text(feeDisclaimer, margin, finalY + 30);

    // Rechtlicher Hinweis hinzufügen
    const legalText = `Dieses Angebot ist freibleibend und unverbindlich. Es dient lediglich als Information und stellt kein rechtlich bindendes Angebot dar. Die angegebenen Gebühren und Kosten können je nach tatsächlichem Transaktionsvolumen variieren. Bei Rückfragen stehen wir Ihnen gerne zur Verfügung.`;
    doc.setFontSize(10);
    doc.text(legalText, margin, finalY + 140, { maxWidth: usableWidth });

    // Streifen am unteren Rand
    doc.setFillColor(230, 126, 34); // Angepasster Orangeton
    doc.rect(0, doc.internal.pageSize.getHeight() - 50, pageWidth, 50, 'F');

    // Erstellungsdatum hinzufügen
    const currentDate = new Date().toLocaleDateString('de-DE');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`Erstellt am: ${currentDate}`, margin, doc.internal.pageSize.getHeight() - 20);

    // PDF-Datei generieren und herunterladen
    doc.save(`${customerName}_DISH_PAY_Angebot.pdf`);
}
