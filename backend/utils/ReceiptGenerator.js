import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

class ReceiptGenerator {
   /**
    * Generate a PDF receipt for a payment
    * @param {Object} data - Payment and appointment details
    * @returns {Promise<Buffer>} - PDF content as buffer
    */
   static async generateReceiptBuffer(data) {
      return new Promise((resolve, reject) => {
         try {
            // Debug log incoming data
            console.log("Generator Data Input:", JSON.stringify(data, null, 2));

            const {
               receiptNumber,
               date,
               time,
               patientName,
               doctorName,
               appointmentDate,
               timeSlot,
               appointmentNumber,
               doctorFee,
               centerFee,
               total,
               paymentMethod,
               transactionId
            } = data;

            // Helper for safe numeric display
            const formatCurrency = (val) => {
               const num = parseFloat(val);
               return isNaN(num) ? '0.00' : num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            };

            // create document with A4 size and 20mm margins
            const margin = 56.7;
            const doc = new PDFDocument({
               size: 'A4',
               margins: { top: margin, bottom: margin, left: margin, right: margin }
            });

            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
               const pdfData = Buffer.concat(buffers);
               resolve(pdfData);
            });

            const contentWidth = doc.page.width - (margin * 2);

            // --- HOSPITAL HEADER ---
            const headerHeight = 80;
            doc.rect(margin, margin, contentWidth, headerHeight)
               .fill('#60a5fa');

            // Logo (REFINED: Circular Shape)
            const logoSize = 60;
            const logoX = margin + 15;
            const logoY = margin + 10;
            const logoRadius = logoSize / 2;

            const logoPathPng = path.join(process.cwd(), '..', 'frontend', 'src', 'assets', 'medical center logo.png');
            const logoPathOld = path.join(process.cwd(), '..', 'frontend', 'src', 'assets', 'medical center logo');

            try {
               const finalLogoPath = fs.existsSync(logoPathPng) ? logoPathPng : (fs.existsSync(logoPathOld) ? logoPathOld : null);

               if (finalLogoPath) {
                  doc.save()
                     .circle(logoX + logoRadius, logoY + logoRadius, logoRadius)
                     .clip()
                     .image(finalLogoPath, logoX, logoY, { height: logoSize, width: logoSize })
                     .restore();
               } else {
                  // Fallback text if logo missing
                  doc.fillColor('#1e40af')
                     .fontSize(18)
                     .font('Helvetica-Bold')
                     .text('PUBUDU', margin + 15, margin + 25)
                     .fontSize(10)
                     .text('MEDICAL CENTER', margin + 15, margin + 45);
               }
            } catch (e) {
               console.error("Error loading logo:", e);
            }

            // Right Side Header Text (White)
            doc.fillColor('#FFFFFF')
               .fontSize(9)
               .font('Helvetica')
               .text('No 46, Matara Road, Hakmana', margin, margin + 30, { align: 'right', width: contentWidth - 15 })
               .text('071-8050917  /  076-9659767  /  076-6880179', margin, margin + 45, { align: 'right', width: contentWidth - 15 });

            doc.moveDown(5);

            // --- RECEIPT TITLE ---
            const afterHeaderY = margin + headerHeight + 25;
            doc.fillColor('#1e40af')
               .fontSize(16)
               .font('Helvetica-Bold')
               .text('PAYMENT RECEIPT', margin, afterHeaderY, { align: 'center' });

            doc.moveDown(0.5);
            doc.strokeColor('#60a5fa')
               .lineWidth(0.5)
               .moveTo(margin + 200, doc.y)
               .lineTo(doc.page.width - margin - 200, doc.y)
               .stroke();

            doc.moveDown(2);

            // --- RECEIPT METADATA SECTION ---
            const metaY = doc.y;
            doc.rect(margin, metaY, contentWidth, 50)
               .fillAndStroke('#eff6ff', '#bfdbfe');

            doc.fillColor('#64748b').fontSize(9).font('Helvetica');
            doc.text('Receipt No', margin + 20, metaY + 12);
            doc.text('Issue Date', margin + contentWidth / 2 + 20, metaY + 12);

            doc.fillColor('#1e293b').font('Helvetica-Bold');
            doc.text(`:  ${receiptNumber || 'N/A'}`, margin + 80, metaY + 12);
            doc.text(`:  ${date || 'N/A'}`, margin + contentWidth / 2 + 80, metaY + 12);

            doc.fillColor('#64748b').font('Helvetica');
            doc.text('Issue Time', margin + contentWidth / 2 + 20, metaY + 30);

            doc.fillColor('#1e293b').font('Helvetica-Bold');
            doc.text(`:  ${time || 'N/A'}`, margin + contentWidth / 2 + 80, metaY + 30);

            doc.moveDown(4);

            // --- PATIENT & APPOINTMENT DETAILS ---
            const detailsY = doc.y;
            const details = [
               ['Patient Name', patientName],
               ['Doctor', doctorName],
               ['Consultation Date', appointmentDate],
               ['Time Slot', timeSlot],
               ['Queue Number', appointmentNumber]
            ];

            let currentY = detailsY;
            details.forEach((detail, i) => {
               const rowBg = i % 2 === 0 ? '#FFFFFF' : '#f8fafc';
               doc.rect(margin, currentY, contentWidth, 25)
                  .fillAndStroke(rowBg, '#bfdbfe');

               doc.fillColor('#64748b').fontSize(10).font('Helvetica')
                  .text(detail[0], margin + 20, currentY + 8);

               doc.fillColor('#1e293b').font('Helvetica-Bold')
                  .text(`:  ${detail[1]}`, margin + 150, currentY + 8);

               currentY += 25;
            });

            doc.moveDown(3);

            // --- PAYMENT BREAKDOWN TABLE ---
            const tableY = doc.y;
            // Header
            doc.rect(margin, tableY, contentWidth, 25)
               .fill('#3b82f6');
            doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold');
            doc.text('Description', margin + 20, tableY + 8);
            doc.text('Amount (LKR)', margin + contentWidth - 120, tableY + 8, { align: 'right', width: 100 });

            // Row 1
            doc.rect(margin, tableY + 25, contentWidth, 25)
               .stroke('#bfdbfe');
            doc.fillColor('#1e293b').font('Helvetica');
            doc.text('Doctor Fee', margin + 20, tableY + 33);
            doc.text(`LKR ${formatCurrency(doctorFee)}`, margin + contentWidth - 120, tableY + 33, { align: 'right', width: 100 });

            // Row 2
            doc.rect(margin, tableY + 50, contentWidth, 25)
               .stroke('#bfdbfe');
            doc.text('Medical Center Charge', margin + 20, tableY + 58);
            doc.text(`LKR ${formatCurrency(centerFee)}`, margin + contentWidth - 120, tableY + 58, { align: 'right', width: 100 });

            // Total Row
            doc.rect(margin, tableY + 75, contentWidth, 30)
               .fill('#3b82f6');
            doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica-Bold');
            doc.text('TOTAL PAID', margin + 20, tableY + 85);
            doc.text(`LKR ${formatCurrency(total)}`, margin + contentWidth - 120, tableY + 85, { align: 'right', width: 100 });

            doc.moveDown(5);

            // --- PAYMENT METHOD SECTION ---
            const methodY = doc.y;
            doc.rect(margin, methodY, contentWidth, 45)
               .fillAndStroke('#eff6ff', '#bfdbfe');

            doc.fillColor('#64748b').fontSize(9).font('Helvetica');
            doc.text('Payment Method', margin + 20, methodY + 10);
            doc.text('Transaction ID', margin + 20, methodY + 25);

            doc.fillColor('#1e293b').font('Helvetica-Bold');
            doc.text(`:  ${paymentMethod || 'N/A'}`, margin + 110, methodY + 10);
            doc.text(`:  ${transactionId || 'N/A'}`, margin + 110, methodY + 25);

            doc.moveDown(4);

            // --- PAYMENT CONFIRMED STAMP ---
            doc.fillColor('#dc2626').fontSize(14).font('Helvetica-Bold')
               .text('SUCCESS - PAYMENT CONFIRMED', margin, doc.y, { align: 'center' });

            doc.moveDown(4);

            // --- FOOTER ---
            const footerY = doc.page.height - margin - 40;
            doc.strokeColor('#bfdbfe')
               .lineWidth(0.5)
               .moveTo(margin, footerY)
               .lineTo(doc.page.width - margin, footerY)
               .stroke();

            doc.fillColor('#94a3b8').fontSize(8).font('Helvetica')
               .text('Please present this receipt at the reception on your appointment date.', margin, footerY + 10, { align: 'center' })
               .text('For inquiries: 071-8050917  /  076-9659767  /  076-6880179', margin, footerY + 20, { align: 'center' });

            doc.end();
         } catch (err) {
            reject(err);
         }
      });
   }
}

export default ReceiptGenerator;
