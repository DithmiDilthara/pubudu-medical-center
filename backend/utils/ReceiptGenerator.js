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
                const {
                    receiptNumber,
                    date,
                    patientName,
                    doctorName,
                    appointmentDate,
                    timeSlot,
                    appointmentNumber,
                    amount,
                    paymentMethod,
                    transactionId
                } = data;

                const doc = new PDFDocument({ margin: 50 });
                let buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });

                // Header
                doc.fillColor('#0066CC')
                   .fontSize(20)
                   .text('Pubudu Medical Center', { align: 'center' })
                   .fontSize(10)
                   .fillColor('#333')
                   .text('123 Main Road, Colombo, Sri Lanka', { align: 'center' })
                   .text('Phone: +94 11 234 5678 | Email: info@pubudumc.lk', { align: 'center' })
                   .moveDown();

                doc.moveTo(50, 110)
                   .lineTo(550, 110)
                   .stroke('#CCCCCC');

                doc.moveDown(2);

                // Receipt Title
                doc.fillColor('#444')
                   .fontSize(16)
                   .text('PAYMENT RECEIPT', { align: 'center', underline: true })
                   .moveDown(2);

                // Receipt Info
                const startY = doc.y;
                doc.fontSize(10)
                   .fillColor('#666')
                   .text(`Receipt No: ${receiptNumber || 'N/A'}`, 50, startY)
                   .text(`Date: ${date || new Date().toLocaleDateString()}`, 400, startY);

                doc.moveDown(2);

                // Patient Info
                doc.fillColor('#000')
                   .fontSize(12)
                   .text('Patient Details', { underline: true })
                   .moveDown(0.5)
                   .fontSize(11)
                   .text(`Name: ${patientName}`)
                   .moveDown(2);

                // Appointment details Table-like structure
                const tableTop = doc.y;
                doc.fillColor('#F4F4F4')
                   .rect(50, tableTop, 500, 20)
                   .fill();

                doc.fillColor('#000')
                   .fontSize(10)
                   .text('Description', 60, tableTop + 5)
                   .text('Details', 300, tableTop + 5);

                let currentY = tableTop + 25;

                const details = [
                    ['Doctor', doctorName],
                    ['Appointment Date', appointmentDate],
                    ['Time Slot', timeSlot],
                    ['Queue Number', appointmentNumber],
                    ['Payment Method', paymentMethod || 'Online'],
                    ['Transaction ID', transactionId || 'N/A']
                ];

                details.forEach(([label, value]) => {
                    doc.text(label, 60, currentY)
                       .text(value, 300, currentY);
                    currentY += 20;
                });

                doc.moveTo(50, currentY)
                   .lineTo(550, currentY)
                   .stroke('#EEE');

                currentY += 10;

                // Total
                doc.fontSize(14)
                   .text('TOTAL AMOUNT:', 300, currentY)
                   .fillColor('#0066CC')
                   .text(`LKR ${parseFloat(amount).toFixed(2)}`, 450, currentY);

                // Footer
                doc.moveDown(5);
                doc.fillColor('#999')
                   .fontSize(9)
                   .text('This is a computer-generated receipt and does not require a signature.', { align: 'center' })
                   .text('Thank you for choosing Pubudu Medical Center.', { align: 'center' });

                doc.end();
            } catch (err) {
                reject(err);
            }
        });
    }
}

export default ReceiptGenerator;
