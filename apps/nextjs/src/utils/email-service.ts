// src/utils/emailService.ts
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import { Resend } from "resend";

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to format dates as DD/MM/YYYY
const formatDateToDDMMYYYY = (date: Date | null): string => {
  if (!date) return "";

  try {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

// Function to generate invoice PDF buffer (keep this part unchanged)
export async function generateInvoicePDFBuffer(
  invoice: any,
  consultation: any,
) {
  // Your existing PDF generation code...
  const doc = new jsPDF();

  console.log("invoice.date" + invoice.date);
  console.log("consultation.dateOfBirth" + consultation.dateOfBirth);
  console.log("consultation.date" + consultation.date);

  // Invoice data
  const invoiceData = {
    paymentIntendId: invoice.paymentIntendId || "unknown",
    date: formatDateToDDMMYYYY(invoice.date) || "unknown",
    description: invoice.description || "unknown",
    currency: invoice.currency || "unknown",
    amount: String(invoice.amount) || "unknown",
    status: invoice.status || "unknown",
  };

  // Patient data
  const consultationData = {
    patientName:
      `${consultation.firstName} ${consultation.lastName}` || "unknown",
    dateOfBirth: formatDateToDDMMYYYY(consultation.dateOfBirth) || "unknown",
    phoneNumber: consultation.phoneNumber || "unknown",
    email: consultation.email || "unknown",
    doctor: consultation.doctor || "unknown",
    date: formatDateToDDMMYYYY(invoice.date) || "unknown", // use invoice date because consultation not yet started
    reason: consultation.reason || "unknown",
  };

  // -- Header section --
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Doccy", 105, 15, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Fast, convenient, and secure telehealth services. Connect with licensed doctors from the comfort of your home.",
    105,
    22,
    { align: "center" },
  );
  doc.text("Telehealth Platform | ABN: 667 986 361", 105, 27, {
    align: "center",
  });
  doc.text(
    "1-9 Sackville Street, Collingwood, Melbourne, VIC 3066, Australia | Phone: 03 8679 2280 | Email: info@heidi.com.au",
    105,
    32,
    { align: "center" },
  );

  // Add horizontal line
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(10, 37, 200, 37);

  // ----- Invoice details section -----
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 105, 50, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  // Left side - Invoice details
  doc.text("Invoice Payment Intend ID:", 15, 65);
  doc.text(invoiceData.paymentIntendId, 60, 65);

  doc.text("Invoice Date:", 15, 72);
  doc.text(invoiceData.date, 60, 72);

  doc.text("Status:", 15, 79);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceData.status.toUpperCase(), 60, 79);
  doc.setFont("helvetica", "normal");

  // Right side - Patient details
  doc.text("Bill To:", 120, 65);
  doc.setFont("helvetica", "bold");
  doc.text(consultationData.patientName, 150, 65);
  doc.setFont("helvetica", "normal");

  if (consultationData.dateOfBirth) {
    doc.text("Date of Birth:", 120, 72);
    doc.text(consultationData.dateOfBirth, 150, 72);
  }

  if (consultationData.phoneNumber) {
    doc.text("Phone:", 120, 79);
    doc.text(consultationData.phoneNumber, 150, 79);
  }

  if (consultationData.email) {
    doc.text("Email:", 120, 86);
    doc.text(consultationData.email, 150, 86);
  }

  // ----- Services section -----
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Services", 15, 105);

  // Table header
  doc.setFontSize(10);
  doc.setDrawColor(0);
  doc.setLineWidth(0.1);
  doc.line(15, 110, 195, 110);

  doc.text("Description", 15, 115);
  doc.text("Date", 120, 115);
  doc.text("Amount", 170, 115);

  doc.line(15, 118, 195, 118);

  // Table content
  doc.setFont("helvetica", "normal");
  doc.text(invoiceData.description, 15, 125);
  doc.text(consultationData.date, 120, 125);
  doc.text(`${invoiceData.amount}`, 170, 125);

  // // Add doctor information
  // doc.text(`Doctor: ${consultationData.doctor}`, 15, 135);

  doc.line(15, 145, 195, 145);

  // Total section
  doc.text("Subtotal (GST included):", 115, 155);
  doc.text(
    `${invoiceData.currency.toUpperCase()} ${invoiceData.amount}`,
    170,
    155,
  );

  doc.setFont("helvetica", "bold");
  doc.text("Total:", 140, 170);
  doc.text(
    `${invoiceData.currency.toUpperCase()} ${invoiceData.amount}`,
    170,
    170,
  );

  // Payment information
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Payment Information", 15, 190);

  if (invoiceData.status.toLowerCase() === "paid") {
    doc.text(
      "This invoice was paid successfully at the time of consultation.",
      15,
      197,
    );
  } else if (invoiceData.status.toLowerCase() === "pending") {
    doc.text(
      "This invoice is pending payment. Please process payment within 7 days.",
      15,
      197,
    );
  } else {
    doc.text(
      "This invoice has been cancelled. No payment is required.",
      15,
      197,
    );
  }

  // Footer
  doc.setFontSize(8);
  doc.text(
    "Thank you for choosing Doccy for your healthcare needs.",
    105,
    280,
    { align: "center" },
  );

  // Return PDF as buffer
  return Buffer.from(doc.output("arraybuffer"));
}

// Function to generate medical certificate PDF buffer
export async function generateMedicalCertificatePDFBuffer(consultation: any) {
  const doc = new jsPDF();

  // Prepare consultation data
  const consultationData = {
    consultationId: `${consultation.id}` || "unknown",
    patientName: `${consultation.firstName} ${consultation.lastName}` || "unknown",
    dateOfBirth: formatDateToDDMMYYYY(consultation.dateOfBirth) || "unknown",
    phoneNumber: consultation.phoneNumber || "unknown",  
    email: consultation.email || "unknown",
    doctorName: consultation.doctor?.user?.firstName && consultation.doctor?.user?.lastName 
      ? `${consultation.doctor.user.firstName} ${consultation.doctor.user.lastName}` 
      : "Doctor",
    doctorAhpraNumber: consultation.doctor?.ahpraNumber ? `AHPRA No: ${consultation.doctor.ahpraNumber}` : "AHPRA No: Not Available",
    certificateReason: consultation.certificateReason || "medical condition",
    leaveFrom: consultation.leaveFrom || "work/study",
    startDate: formatDateToDDMMYYYY(consultation.certificateStartDate) || "unknown",
    endDate: formatDateToDDMMYYYY(consultation.certificateEndDate) || "unknown",
    issueDate: formatDateToDDMMYYYY(new Date()) || "unknown",
  };

  // Add header with company information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Doccy", 105, 15, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Fast, convenient, and secure telehealth services. Connect with licensed doctors from the comfort of your home.",
    105,
    22,
    { align: "center" },
  );
  doc.text("Telehealth Platform | ABN: 667 986 361", 105, 27, {
    align: "center",
  });
  doc.text(
    "1-9 Sackville Street, Collingwood, Melbourne, VIC 3066, Australia | Phone: 03 8679 2280 | Email: info@heidi.com.au",
    105,
    32,
    { align: "center" },
  );

  // Add horizontal line
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(10, 37, 200, 37);

  // Certificate issue date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${consultationData.issueDate}`, 15, 50);
  doc.text(`Consultation ID: ${consultationData.consultationId}`, 15, 60);

  // Patient details
  doc.setFont("helvetica", "bold");
  doc.text("RE:", 15, 70);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${consultationData.patientName}`, 15, 80);
  doc.text(`Date of Birth: ${consultationData.dateOfBirth}`, 15, 90);
  doc.text(`Mobile: ${consultationData.phoneNumber}`, 15, 100);
  doc.text(`Email: ${consultationData.email}`, 15, 110);

  // Certificate title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("MEDICAL CERTIFICATE", 15, 125);

  // Certificate content
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("This is to certify that:", 15, 140);

  // Create the certificate text with wrapped lines
  const certText = `Based on my assessment via telehealth consultation today, I believe ${consultationData.patientName} will be unfit from ${consultationData.startDate} to ${consultationData.endDate} (inclusive) for ${consultationData.leaveFrom} due to ${consultationData.certificateReason}.`;

  const splitText = doc.splitTextToSize(certText, 180);
  doc.text(splitText, 15, 155);

  // Doctor details and signature
  const yPos = 155 + splitText.length * 7;

  doc.setFont("helvetica", "bold");
  doc.text(`Dr. ${consultationData.doctorName}`, 15, yPos + 30);
  doc.setFont("helvetica", "normal");
  doc.text("General Practitioner (GP)", 15, yPos + 44);
  doc.text(consultationData.doctorAhpraNumber, 15, yPos + 51);
  doc.text("Doccy", 15, yPos + 58);

  // Footer
  doc.setFontSize(8);
  doc.text(
    "This certificate was issued following a telehealth consultation and is valid for the dates specified above.",
    105,
    280,
    { align: "center" },
  );

  // Return PDF as buffer
  return Buffer.from(doc.output("arraybuffer"));
}

export async function sendInvoiceEmail(
  to: string,
  invoiceBuffer: Buffer,
  patientName: string,
  paymentIntendId: string,
) {
  const fileName = `Doccy_Invoice_${patientName}_${format(new Date(), "dd-MM-yyyy")}.pdf`;
  const today = format(new Date(), "dd MMMM yyyy");
  const currentYear = new Date().getFullYear();

  try {
    const { data, error } = await resend.emails.send({
      from: "Doccy Telehealth <onboarding@resend.dev>",
      to: [to],
      subject: "Your Doccy Telehealth Invoice",
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <body style="background-color:rgb(250,251,251);font-family:ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';font-size:1rem;line-height:1.5rem;margin:0;padding:0;">
    <!-- Header with Logo -->
    <div style="text-align:center;padding:20px 0;background-color:#4a6cf7;">
      <h1 style="color:white;margin:0;padding:0;font-size:24px;">Doccy Telehealth</h1>
    </div>
    
    <!-- Main Content -->
    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:rgb(255,255,255);padding:45px;max-width:600px;margin:0 auto;">
      <tbody>
        <tr style="width:100%">
          <td>
            <!-- Invoice Title -->
            <h1 style="margin-top:0px;margin-bottom:20px;text-align:center;line-height:2rem;color:#4a6cf7;">
              Your Invoice
            </h1>
            
            <!-- Greeting and Introduction -->
            <div style="margin-bottom:30px;border-bottom:1px solid #eaeaea;padding-bottom:20px;">
              <p style="font-size:1rem;line-height:1.5rem;margin-top:16px;margin-bottom:16px">
                Dear ${patientName},
              </p>
              <p style="font-size:1rem;line-height:1.5rem;margin-top:16px;margin-bottom:16px">
                Thank you for using Doccy Telehealth services. We've attached your invoice to this email.
              </p>
            </div>
            
            <!-- Invoice Information -->
            <div style="background-color:#f9f9f9;border-radius:8px;padding:20px;margin-bottom:30px;">
              <h2 style="font-size:18px;margin-top:0;margin-bottom:16px;color:#333;">Invoice Details</h2>
              
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #eaeaea;color:#555;width:40%;">Invoice Payment Intend ID:</td>
                  <td style="padding:8px 0;border-bottom:1px solid #eaeaea;font-weight:500;">${paymentIntendId}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #eaeaea;color:#555;">Date:</td>
                  <td style="padding:8px 0;border-bottom:1px solid #eaeaea;font-weight:500;">${today}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #eaeaea;color:#555;">Status:</td>
                  <td style="padding:8px 0;border-bottom:1px solid #eaeaea;font-weight:500;color:#10b981;">PAID</td>
                </tr>
              </table>
            </div>
            
            <!-- Attachment Information -->
            <div style="border:1px solid #eaeaea;border-radius:8px;padding:20px;margin-bottom:30px;text-align:center;">
              <div style="font-size:36px;color:#4a6cf7;margin-bottom:10px;">📄</div>
              <h3 style="margin-top:0;margin-bottom:10px;color:#333;">Invoice Attached</h3>
              <p style="margin:0;color:#666;font-size:14px;">
                Please find your invoice attached to this email as a PDF document.
              </p>
            </div>
            
            <!-- Support Information -->
            <div style="margin-top:30px;border-top:1px solid #eaeaea;padding-top:20px;">
              <p style="font-size:14px;line-height:24px;margin-top:0;margin-bottom:16px;color:#666;">
                If you have any questions about this invoice, please contact Medlo team:
              </p>
              
              <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:20px;text-align:center;">
                <tbody>
                  <tr>
                    <td>
                      <a href="mailto:info@heidi.com.au" style="border-radius:0.5rem;background-color:#4a6cf7;padding:12px 24px;color:rgb(255,255,255);text-decoration:none;display:inline-block;font-weight:500;">
                        Contact Medlo
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Footer -->
    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:20px auto 0;">
      <tbody>
        <tr>
          <td>
            <p style="text-align:center;color:rgb(156,163,175);font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px;">
              &copy; ${currentYear} Doccy Telehealth. All rights reserved.
            </p>
            <p style="text-align:center;color:rgb(156,163,175);font-size:14px;line-height:24px;margin-top:16px;margin-bottom:45px;">
              1-9 Sackville Street, Collingwood, Melbourne, VIC 3066, Australia<br>
              Phone: 03 8679 2280 | Email: info@heidi.com.au
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`,
      text: `Dear ${patientName},

Thank you for using Doccy Telehealth services. 

INVOICE DETAILS
Invoice Payment Intend ID: ${paymentIntendId}
Date: ${today}
Status: Paid

Your invoice is attached to this email as a PDF document.

If you have any questions, please contact our support team at info@heidi.com.au.

Best regards,
Doccy Telehealth Team

1-9 Sackville Street, Collingwood, Melbourne, VIC 3066, Australia
Phone: 03 8679 2280 | Email: info@heidi.com.au`,
      attachments: [
        {
          filename: fileName,
          content: invoiceBuffer,
        },
      ],
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    return { id: data?.id, success: true };
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    throw error;
  }
}

// Function to send medical certificate email
export async function sendMedicalCertificateEmail(
  to: string,
  certificateBuffer: Buffer,
  patientName: string,
  doctorName: string,
  certificateStartDate: string,
  certificateEndDate: string,
  certificateReason: string,
) {
  const fileName = `Doccy_Medical_Certificate_${patientName}_${format(new Date(), "dd-MM-yyyy")}.pdf`;
  const today = format(new Date(), "dd MMMM yyyy");
  const currentYear = new Date().getFullYear();

  try {
    const { data, error } = await resend.emails.send({
      from: "Doccy Telehealth <onboarding@resend.dev>",
      to: [to],
      subject: "Your Doccy Medical Certificate - Approved",
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <body style="background-color:rgb(250,251,251);font-family:ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';font-size:1rem;line-height:1.5rem;margin:0;padding:0;">
    <!-- Header with Logo -->
    <div style="text-align:center;padding:20px 0;background-color:#10b981;">
      <h1 style="color:white;margin:0;padding:0;font-size:24px;">Doccy Telehealth</h1>
    </div>
    
    <!-- Main Content -->
    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:rgb(255,255,255);padding:45px;max-width:600px;margin:0 auto;">
      <tbody>
        <tr style="width:100%">
          <td>
            <!-- Certificate Title -->
            <h1 style="margin-top:0px;margin-bottom:20px;text-align:center;line-height:2rem;color:#10b981;">
              Medical Certificate Approved ✅
            </h1>
            
            <!-- Greeting and Introduction -->
            <div style="margin-bottom:30px;border-bottom:1px solid #eaeaea;padding-bottom:20px;">
              <p style="font-size:1rem;line-height:1.5rem;margin-top:16px;margin-bottom:16px">
                Dear ${patientName},
              </p>
              <p style="font-size:1rem;line-height:1.5rem;margin-top:16px;margin-bottom:16px">
                Great news! Your medical certificate has been approved by ${doctorName} and is now ready for use.
              </p>
            </div>
            
            <!-- Certificate Information -->
            <div style="background-color:#f0fdf4;border-radius:8px;padding:20px;margin-bottom:30px;border-left:4px solid #10b981;">
              <h2 style="font-size:18px;margin-top:0;margin-bottom:16px;color:#333;">Certificate Details</h2>
              
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #d1fae5;color:#555;width:40%;">Patient Name:</td>
                  <td style="padding:8px 0;border-bottom:1px solid #d1fae5;font-weight:500;">${patientName}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #d1fae5;color:#555;">Reason:</td>
                  <td style="padding:8px 0;border-bottom:1px solid #d1fae5;font-weight:500;">${certificateReason}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #d1fae5;color:#555;">Valid From:</td>
                  <td style="padding:8px 0;border-bottom:1px solid #d1fae5;font-weight:500;">${certificateStartDate}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #d1fae5;color:#555;">Valid Until:</td>
                  <td style="padding:8px 0;border-bottom:1px solid #d1fae5;font-weight:500;">${certificateEndDate}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #d1fae5;color:#555;">Approved By:</td>
                  <td style="padding:8px 0;border-bottom:1px solid #d1fae5;font-weight:500;">Dr. ${doctorName}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#555;">Issue Date:</td>
                  <td style="padding:8px 0;font-weight:500;">${today}</td>
                </tr>
              </table>
            </div>
            
            <!-- Attachment Information -->
            <div style="border:1px solid #d1fae5;border-radius:8px;padding:20px;margin-bottom:30px;text-align:center;background-color:#f0fdf4;">
              <div style="font-size:36px;color:#10b981;margin-bottom:10px;">🏥</div>
              <h3 style="margin-top:0;margin-bottom:10px;color:#333;">Certificate Attached</h3>
              <p style="margin:0;color:#666;font-size:14px;">
                Your official medical certificate is attached to this email as a PDF document.<br>
                You can present this to your employer, school, or institution as required.
              </p>
            </div>
            
            <!-- Important Information -->
            <div style="background-color:#fef3c7;border-radius:8px;padding:20px;margin-bottom:30px;border-left:4px solid #f59e0b;">
              <h3 style="margin-top:0;margin-bottom:12px;color:#92400e;">Important Information</h3>
              <ul style="margin:0;padding-left:20px;color:#92400e;font-size:14px;">
                <li style="margin-bottom:8px;">This certificate is valid for the dates specified above</li>
                <li style="margin-bottom:8px;">Keep the PDF file safe as a digital copy</li>
                <li style="margin-bottom:8px;">This certificate was issued following a telehealth consultation</li>
                <li>If you need any clarification, please contact Medlo team</li>
              </ul>
            </div>
            
            <!-- Support Information -->
            <div style="margin-top:30px;border-top:1px solid #eaeaea;padding-top:20px;">
              <p style="font-size:14px;line-height:24px;margin-top:0;margin-bottom:16px;color:#666;">
                If you have any questions about this certificate, please contact Medlo team:
              </p>
              
              <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:20px;text-align:center;">
                <tbody>
                  <tr>
                    <td>
                      <a href="mailto:info@heidi.com.au" style="border-radius:0.5rem;background-color:#10b981;padding:12px 24px;color:rgb(255,255,255);text-decoration:none;display:inline-block;font-weight:500;">
                        Contact Medlo
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Footer -->
    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:20px auto 0;">
      <tbody>
        <tr>
          <td>
            <p style="text-align:center;color:rgb(156,163,175);font-size:14px;line-height:24px;margin-top:16px;margin-bottom:16px;">
              &copy; ${currentYear} Doccy Telehealth. All rights reserved.
            </p>
            <p style="text-align:center;color:rgb(156,163,175);font-size:14px;line-height:24px;margin-top:16px;margin-bottom:45px;">
              1-9 Sackville Street, Collingwood, Melbourne, VIC 3066, Australia<br>
              Phone: 03 8679 2280 | Email: info@heidi.com.au
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`,
      text: `Dear ${patientName},

Great news! Your medical certificate has been approved by Dr. ${doctorName} and is now ready for use.

CERTIFICATE DETAILS
Patient Name: ${patientName}
Reason: ${certificateReason}
Valid From: ${certificateStartDate}
Valid Until: ${certificateEndDate}
Approved By: Dr. ${doctorName}
Issue Date: ${today}

Your official medical certificate is attached to this email as a PDF document. You can present this to your employer, school, or institution as required.

IMPORTANT INFORMATION:
- This certificate is valid for the dates specified above
- Keep the PDF file safe as a digital copy
- This certificate was issued following a telehealth consultation
- If you need any clarification, please contact our support team

If you have any questions, please contact our support team at info@heidi.com.au.

Best regards,
Doccy Telehealth Team

1-9 Sackville Street, Collingwood, Melbourne, VIC 3066, Australia
Phone: 03 8679 2280 | Email: info@heidi.com.au`,
      attachments: [
        {
          filename: fileName,
          content: certificateBuffer,
        },
      ],
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    return { id: data?.id, success: true };
  } catch (error) {
    console.error("Failed to send medical certificate email via Resend:", error);
    throw error;
  }
}