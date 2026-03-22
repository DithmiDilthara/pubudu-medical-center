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
                const doc = new PDFDocument({ margin: 50, size: 'A4' });
                let buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => resolve(Buffer.concat(buffers)));

                const { startDate, endDate } = params;
                const title = type.charAt(0).toUpperCase() + type.slice(1) + ' Report';

                // --- Header & Branding ---
                doc.fillColor('#2563eb')
                   .fontSize(24)
                   .text('Pubudu Medical Center', { align: 'left' })
                   .fontSize(10)
                   .fillColor('#64748b')
                   .text('No 46, Matara road, Hakmana', { align: 'left' })
                   .text('Phone: 071-8050917 / 0769659767', { align: 'left' })
                   .moveDown();

                doc.strokeColor('#e2e8f0')
                   .lineWidth(1)
                   .moveTo(50, 105)
                   .lineTo(550, 105)
                   .stroke();

                doc.moveDown(2);

                // --- Report Title & Period ---
                doc.fillColor('#0f172a')
                   .fontSize(18)
                   .text(title, { align: 'center' })
                   .fontSize(10)
                   .fillColor('#64748b')
                   .text(`Period: ${startDate || 'All Time'} to ${endDate || 'Present'}`, { align: 'center' })
                   .moveDown(2);

                // --- Summary Section ---
                doc.fillColor('#0f172a').fontSize(14).text('Summary Statistics', 50);
                doc.moveDown(0.5);
                
                const summaryY = doc.y;
                doc.rect(50, summaryY, 500, 60).fillAndStroke('#f8fafc', '#e2e8f0');
                
                doc.fillColor('#64748b').fontSize(10);
                if (type === 'revenue') {
                    doc.text('Total Revenue', 70, summaryY + 15)
                       .text('Total Appointments', 250, summaryY + 15)
                       .text('LKR ' + (data.totalRevenue?.toLocaleString() || '0'), 70, summaryY + 35, { color: '#2563eb', fontSize: 14 })
                       .text(data.appointmentCount?.toString() || '0', 250, summaryY + 35, { fontSize: 14 });
                } else if (type === 'patients') {
                    doc.text('Total Registrations', 70, summaryY + 15)
                       .text('Online', 220, summaryY + 15)
                       .text('Receptionist', 370, summaryY + 15)
                       .text(data.summary?.total?.toString() || '0', 70, summaryY + 35, { fontSize: 14 })
                       .text(data.summary?.online?.toString() || '0', 220, summaryY + 35, { fontSize: 14 })
                       .text(data.summary?.receptionist?.toString() || '0', 370, summaryY + 35, { fontSize: 14 });
                } else if (type === 'appointments') {
                    doc.text('Total', 70, summaryY + 15)
                       .text('Cancelled', 170, summaryY + 15)
                       .text('Absent', 270, summaryY + 15)
                       .text(data.summary?.total?.toString() || '0', 70, summaryY + 35, { fontSize: 14 })
                       .text(data.summary?.cancelled?.toString() || '0', 170, summaryY + 35, { fontSize: 14 })
                       .text(data.summary?.absent?.toString() || '0', 270, summaryY + 35, { fontSize: 14 });
                }

                doc.moveDown(5);

                // --- Data Table ---
                doc.fillColor('#0f172a').fontSize(14).text('Detailed Records', 50);
                doc.moveDown(1);

                const tableTop = doc.y;
                const colWidths = type === 'revenue' ? [120, 120, 100, 80] : 
                                  type === 'patients' ? [130, 100, 100, 100] : 
                                  [120, 120, 80, 80];
                
                const headers = type === 'revenue' ? ['Patient', 'Doctor', 'Date', 'Fee (LKR)'] :
                                type === 'patients' ? ['Name', 'NIC', 'Source', 'Contact'] :
                                ['Patient', 'Doctor', 'Date', 'Status'];

                // Draw Table Header
                doc.rect(50, tableTop, 500, 25).fill('#eff6ff');
                doc.fillColor('#1e40af').fontSize(10).font('Helvetica-Bold');
                
                let currentX = 60;
                headers.forEach((h, i) => {
                    doc.text(h, currentX, tableTop + 7);
                    currentX += colWidths[i];
                });

                // Draw Rows
                doc.font('Helvetica').fillColor('#334155');
                let currentY = tableTop + 25;
                const records = data.appointments || data.patients || data.appointments; // Fix: patients has 'patients' key

                (records || []).slice(0, 50).forEach((item, index) => {
                    if (currentY > 700) {
                        doc.addPage();
                        currentY = 50;
                    }

                    if (index % 2 === 1) {
                        doc.rect(50, currentY, 500, 20).fill('#f8fafc');
                        doc.fillColor('#334155');
                    }

                    let rowX = 60;
                    if (type === 'revenue' || type === 'appointments') {
                        doc.text(item.patient_name || item.patient || 'N/A', rowX, currentY + 5);
                        rowX += colWidths[0];
                        doc.text(item.doctor_name || item.doctor || 'N/A', rowX, currentY + 5);
                        rowX += colWidths[1];
                        doc.text(item.date || 'N/A', rowX, currentY + 5);
                        rowX += colWidths[2];
                        doc.text(type === 'revenue' ? (item.center_fee?.toFixed(2) || '0.00') : (item.status || 'N/A'), rowX, currentY + 5);
                    } else if (type === 'patients') {
                        doc.text(item.name || 'N/A', rowX, currentY + 5);
                        rowX += colWidths[0];
                        doc.text(item.nic || 'N/A', rowX, currentY + 5);
                        rowX += colWidths[1];
                        doc.text(item.source || 'N/A', rowX, currentY + 5);
                        rowX += colWidths[2];
                        doc.text(item.contact || 'N/A', rowX, currentY + 5);
                    }

                    currentY += 20;
                });

                // --- Footer ---
                const pageCount = doc.bufferedPageRange().count;
                for (let i = 0; i < pageCount; i++) {
                    doc.switchToPage(i);
                    doc.fontSize(8).fillColor('#94a3b8')
                       .text(`Page ${i + 1} of ${pageCount}`, 50, 780, { align: 'center' })
                       .text(`Generated on ${new Date().toLocaleString()}`, 50, 792, { align: 'center' });
                }

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }
}

export default ReportGenerator;
