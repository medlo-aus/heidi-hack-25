import jsPDF from "jspdf";

/**
 * Generates a medical certificate PDF for a given consultation.
 * Assumptions:
 * - consultation.patientName, consultation.dateOfBirth, consultation.phoneNumber, consultation.email, consultation.doctorName, consultation.doctorAhpraNumber, and consultation.medicalCertificates[0] are present.
 * - Dates are in UTC and string format.
 * - This function is intended for use in the dashboard and certificate download actions.
 */
export function generateMedicalCertificatePDF(consultation: any) {
  const doc = new jsPDF();

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

  // Patient details
  doc.text("RE:", 15, 65);
  doc.text(`Name: ${consultation.patientName}`, 15, 75);
  doc.text(`Date of Birth: ${consultation.dateOfBirth}`, 15, 85);
  doc.text(`Mobile: ${consultation.phoneNumber}`, 15, 95);
  doc.text(`Email: ${consultation.email}`, 15, 105);

  // Certificate title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("MEDICAL CERTIFICATE", 15, 125);

  // Certificate content
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("This is to certify that:", 15, 140);

  // Create the certificate text with wrapped lines
  const cert = consultation.medicalCertificates?.[0] || {};
  const certText = `Based on my assessment via telehealth consultation today, I believe ${consultation.patientName} will be unfit from ${cert.startDate} to ${cert.endDate} (inclusive) for ${cert.leaveFrom} due to ${cert.description || "a medical condition"}.`;

  const splitText = doc.splitTextToSize(certText, 180);
  doc.text(splitText, 15, 155);

  // Doctor details and signature
  const yPos = 155 + splitText.length * 7;

  doc.setFont("helvetica", "bold");
  doc.text(`Dr. ${consultation.doctorName}`, 15, yPos + 30);
  doc.setFont("helvetica", "normal");
  doc.text("General Practitioner (GP)", 15, yPos + 44);
  doc.text(`${consultation.doctorAhpraNumber}`, 15, yPos + 51);
  doc.text("Doccy", 15, yPos + 58);

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Save the PDF
  const fileName = `Doccy_Medical_Certificate_${consultation.patientName}_${cert.startDate}.pdf`;
  doc.save(fileName);
}
