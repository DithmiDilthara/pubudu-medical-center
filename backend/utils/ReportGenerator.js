import PDFDocument from 'pdfkit';

class ReportGenerator {
    /**
     * Generate a PDF report
     * @param {string} type - report type (revenue, patients, appointments)
     * @param {Object} data - report data from controller
     * @param {Object} params - query params (startDate, endDate)
     * @returns {Promise<Buffer>} - PDF content as buffer
     */
    static async generateReportBuffer(type, data, params) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
                let buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => resolve(Buffer.concat(buffers)));

                const { startDate, endDate } = params;
                const margin = 50;
                const contentWidth = doc.page.width - 2 * margin;

                // --- 1. HOSPITAL HEADER (from Payment Receipt) ---
                const logoPath = '../frontend/src/assets/medical center logo.png';
                const headerHeight = 75;

                // Light blue bar background
                doc.rect(0, 0, doc.page.width, headerHeight).fill('#60a5fa');

                // Circular Logo
                const logoRadius = 25;
                const logoX = margin;
                const logoY = (headerHeight - 2 * logoRadius) / 2;

                try {
                    doc.save()
                       .circle(logoX + logoRadius, logoY + logoRadius, logoRadius)
                       .clip()
                       .image(logoPath, logoX, logoY, { width: 50, height: 50 })
                       .restore();
                } catch (logoErr) {
                    console.log("Logo not found for report, skipping:", logoErr.message);
                }

                // Hospital Contact Info (Right Aligned)
                doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold');
                doc.text('Pubudu Medical Center', margin + 60, logoY + 5);
                
                doc.fontSize(9).font('Helvetica');
                const contactX = doc.page.width - margin - 200;
                doc.text('No 46, Matara Road, Hakmana', contactX, logoY + 5, { align: 'right', width: 200 })
                   .text('071-8050917  /  076-9659767', contactX, logoY + 18, { align: 'right', width: 200 })
                   .text('076-6880179', contactX, logoY + 31, { align: 'right', width: 200 });

                doc.moveDown(4);

                // --- 2. REPORT TITLE ---
                const title = type === 'revenue' ? 'REVENUE REPORT' : 
                              type === 'patients' ? 'PATIENT REGISTRATION REPORT' : 
                              'APPOINTMENT REPORT';
                
                doc.fillColor('#1e40af').fontSize(18).font('Helvetica-Bold')
                   .text(title, margin, 100, { align: 'center' });

                const now = new Date();
                const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                
                doc.fillColor('#64748b').fontSize(10).font('Helvetica')
                   .text(`Period: ${startDate} – ${endDate}  |  Issued: ${dateStr} at ${timeStr}`, margin, 125, { align: 'center' });

                doc.strokeColor('#60a5fa').lineWidth(0.5).moveTo(margin, 145).lineTo(doc.page.width - margin, 145).stroke();

                doc.moveDown(3);

                // --- 3. REVENUE SPECIFIC SECTIONS ---
                if (type === 'revenue') {
                    // KPI CARDS
                    const cardY = 165;
                    const cardWidth = (contentWidth - 20) / 2;
                    const cardHeight = 60;

                    // Left Card: Total Revenue
                    doc.rect(margin, cardY, cardWidth, cardHeight).fillAndStroke('#eff6ff', '#3b82f6');
                    doc.fillColor('#64748b').fontSize(9).text('Total Revenue', margin + 15, cardY + 12);
                    doc.fillColor('#1e40af').fontSize(16).font('Helvetica-Bold').text(`LKR ${data.totalRevenue?.toLocaleString() || '0.00'}`, margin + 15, cardY + 28);

                    // Right Card: Total Appointments
                    doc.rect(margin + cardWidth + 20, cardY, cardWidth, cardHeight).fillAndStroke('#e0f2fe', '#3b82f6');
                    doc.fillColor('#64748b').font('Helvetica').fontSize(9).text('Total Appointments', margin + cardWidth + 35, cardY + 12);
                    doc.fillColor('#1e40af').fontSize(16).font('Helvetica-Bold').text(`${data.appointmentCount || '0'}`, margin + cardWidth + 35, cardY + 28);

                    doc.moveDown(6);

                    // REVENUE BY SPECIALISATION TABLE
                    doc.fillColor('#1e40af').fontSize(12).text('REVENUE BY SPECIALISATION', margin);
                    doc.moveDown(0.5);

                    const tableY = doc.y;
                    const tableCols = [140, 105, 60, 80, 110];
                    const tableWidth = contentWidth;

                    // Header
                    doc.rect(margin, tableY, tableWidth, 25).fill('#3b82f6');
                    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
                    let curX = margin + 10;
                    ['Doctor', 'Specialisation', 'Patients', 'Center Fee', 'Total Revenue'].forEach((h, i) => {
                        doc.text(h, curX, tableY + 8, { width: tableCols[i] - 10, align: i > 2 ? 'right' : 'left' });
                        curX += tableCols[i];
                    });

                    // Rows
                    let curY = tableY + 25;
                    const tableData = data.doctors || [];

                    tableData.forEach((row, i) => {
                        if (i % 2 === 1) doc.rect(margin, curY, tableWidth, 25).fill('#f8fafc');
                        doc.fillColor('#1e293b').font('Helvetica').fontSize(9);
                        
                        let rX = margin + 10;
                        doc.text(row.doctor_name, rX, curY + 8, { width: tableCols[0] - 10 });
                        rX += tableCols[0];
                        doc.text(row.specialisation, rX, curY + 8, { width: tableCols[1] - 10 });
                        rX += tableCols[1];
                        doc.text(row.patient_volume.toString(), rX, curY + 8, { width: tableCols[2] - 10, align: 'center' });
                        rX += tableCols[2];
                        doc.text(row.center_fee.toLocaleString(), rX, curY + 8, { width: tableCols[3] - 10, align: 'right' });
                        rX += tableCols[3];
                        doc.text(row.total_revenue.toLocaleString(), rX, curY + 8, { width: tableCols[4] - 10, align: 'right' });
                        
                        curY += 25;
                    });

                    // Grand Total Row
                    doc.rect(margin, curY, tableWidth, 30).fill('#1e40af');
                    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10);
                    doc.text('GRAND TOTAL', margin + 10, curY + 10);
                    doc.text(data.grandTotal?.volume.toString() || '0', margin + 10 + tableCols[0] + tableCols[1], curY + 10, { width: tableCols[2] - 10, align: 'center' });
                    doc.text(`LKR ${data.grandTotal?.revenue.toLocaleString() || '0.00'}`, margin + 10 + tableCols[0] + tableCols[1] + tableCols[2] + tableCols[3], curY + 10, { width: tableCols[4] - 10, align: 'right' });

                    doc.moveDown(4);

                    // ANALYTICS CHART
                    if (curY > 500) doc.addPage();
                    this.drawRevenueChart(doc, data.doctors || []);
                }

                // --- 4. FOOTER ---
                const pageCount = doc.bufferedPageRange().count;
                for (let i = 0; i < pageCount; i++) {
                    doc.switchToPage(i);
                    const footerY = doc.page.height - 50;
                    doc.strokeColor('#bfdbfe').lineWidth(0.5).moveTo(margin, footerY).lineTo(doc.page.width - margin, footerY).stroke();
                    doc.fillColor('#94a3b8').fontSize(8).font('Helvetica')
                       .text(`* Revenue calculated from Medical Center Fee only. | Period: ${startDate} – ${endDate}`, margin, footerY + 10, { align: 'left' })
                       .text(`Page ${i + 1} of ${pageCount}`, margin, footerY + 10, { align: 'right' });
                }

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }

    static drawRevenueChart(doc, doctors) {
        const margin = 50;
        const chartY = doc.y + 30;
        const chartHeight = 150;
        const chartWidth = doc.page.width - 2 * margin;

        doc.fillColor('#1e40af').fontSize(12).font('Helvetica-Bold').text('Analytics – Revenue & Patient Volume by Doctor', margin, chartY - 20);

        // Chart Background & Grid
        doc.rect(margin, chartY, chartWidth, chartHeight).fill('#FFFFFF');
        doc.strokeColor('#bfdbfe').dash(2, { space: 2 }).lineWidth(0.5);
        
        // DRAW Y-AXIS SCALE
        const maxRevenue = Math.max(...doctors.map(d => d.total_revenue), 1000);
        for (let i = 0; i <= 5; i++) {
            const h = chartY + (chartHeight / 5) * i;
            doc.moveTo(margin, h).lineTo(margin + chartWidth, h).stroke();
            
            // Y-Axis Labels (Numerical Scale)
            const labelValue = (maxRevenue - (maxRevenue / 5) * i).toFixed(0);
            doc.fillColor('#94a3b8').fontSize(7).font('Helvetica')
               .text(labelValue, margin - 45, h - 3, { width: 40, align: 'right' });
        }
        doc.undash();

        // Y-AXIS TITLE (Vertical)
        doc.save()
           .rotate(-90, { origin: [margin - 48, chartY + (chartHeight / 2)] })
           .fillColor('#64748b').fontSize(8).font('Helvetica-Bold')
           .text('REVENUE (LKR)', margin - 48, chartY + (chartHeight / 2), { width: chartHeight, align: 'center' })
           .restore();

        if (doctors.length === 0) return;

        const maxVolume = Math.max(...doctors.map(d => d.patient_volume), 10);
        const barAreaWidth = chartWidth / doctors.length;
        const barWidth = Math.min(barAreaWidth * 0.4, 25);

        doctors.forEach((docData, i) => {
            const x = margin + i * barAreaWidth + (barAreaWidth / 2);
            
            // Revenue Bar (Dark Blue)
            const revHeight = (docData.total_revenue / maxRevenue) * chartHeight;
            doc.fillColor('#3b82f6').rect(x - barWidth, chartY + chartHeight - revHeight, barWidth, revHeight).fill();
            
            // Volume Bar (Light Blue)
            const volHeight = (docData.patient_volume / maxVolume) * chartHeight;
            doc.fillColor('#93c5fd').rect(x, chartY + chartHeight - volHeight, barWidth, volHeight).fill();

            // Labels
            doc.fillColor('#1e293b').fontSize(7).font('Helvetica')
               .text(docData.doctor_name.split(' ').pop(), x - barAreaWidth/2, chartY + chartHeight + 5, { width: barAreaWidth, align: 'center' });
        });

        // Legends
        const legendY = chartY - 15;
        doc.fillColor('#3b82f6').rect(doc.page.width - margin - 150, legendY, 10, 10).fill();
        doc.fillColor('#1e40af').fontSize(8).text('Revenue', doc.page.width - margin - 135, legendY + 1);
        doc.fillColor('#93c5fd').rect(doc.page.width - margin - 80, legendY, 10, 10).fill();
        doc.fillColor('#1e40af').text('Volume', doc.page.width - margin - 65, legendY + 1);

        // X-AXIS TITLE (Bottom)
        doc.fillColor('#64748b').fontSize(8).font('Helvetica-Bold')
           .text('DOCTOR NAME', margin, chartY + chartHeight + 20, { align: 'center', width: chartWidth });
    }
}

export default ReportGenerator;
