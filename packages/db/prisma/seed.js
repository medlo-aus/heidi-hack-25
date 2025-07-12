import * as crypto from "crypto";
import { PrismaClient } from "@prisma/client";

// Direct environment variable setup - no need for dotenv
process.env.DATABASE_URL =
  "postgresql://postgres.qpwchebnythjusemnlla:KentSupabase23!@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
process.env.DIRECT_URL =
  "postgresql://postgres.qpwchebnythjusemnlla:KentSupabase23!@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres";

const prisma = new PrismaClient();

// Simple password hashing function using Node's built-in crypto
function hashPassword(password) {
  // In a real app, use a proper salt and more secure approach
  // This is simplified for seeding purposes
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("Starting seeding process...");

  try {
    // Create Admin User
    const adminUser = await prisma.user.create({
      data: {
        authSubId: "auth0|adminuser1",
        firstName: "Admin",
        lastName: "User",
        dateOfBirth: new Date("1980-01-01"),
        phoneNumber: "1234567890",
        email: "admin@example.com",
        password: hashPassword("password123"),
        gender: "Other",
        userOption: "A", // Administrator
        address: "123 Admin St, Sydney, NSW 2000, Australia",
      },
    });
    console.log("Created admin user:", adminUser.id);

    // Create Patient User (Kent Go)
    const kentUser = await prisma.user.create({
      data: {
        authSubId: "auth0|kentgo1",
        firstName: "Kent",
        lastName: "Go",
        dateOfBirth: new Date("1990-05-15"),
        phoneNumber: "0412345678",
        email: "kentgo09@gmail.com",
        password: hashPassword("KentDoccy23!"),
        gender: "Male",
        userOption: "P", // Patient
        address: "123 Patient Street, Sydney, NSW 2000",
      },
    });
    console.log("Created Kent Go user:", kentUser.id);

    // Create Kent's Patient record
    const kentPatient = await prisma.patient.create({
      data: {
        userId: kentUser.id,
        hasRegularGP: false,
        consultationStatus: "not_requested",
      },
    });
    console.log("Created patient record for Kent:", kentPatient.id);

    // Create Doctor Users
    const doctorSmith = await prisma.user.create({
      data: {
        authSubId: "auth0|doctorsmith1",
        firstName: "Jane",
        lastName: "Smith",
        dateOfBirth: new Date("1980-03-20"),
        phoneNumber: "0498765432",
        email: "jane.smith@example.com",
        password: hashPassword("password123"),
        gender: "Female",
        userOption: "D", // Doctor
        address: "456 Doctor Avenue, Melbourne, VIC 3000",
      },
    });
    console.log("Created Dr. Smith user:", doctorSmith.id);

    const doctorChen = await prisma.user.create({
      data: {
        authSubId: "auth0|doctorchen1",
        firstName: "Michael",
        lastName: "Chen",
        dateOfBirth: new Date("1975-11-10"),
        phoneNumber: "0487654321",
        email: "michael.chen@example.com",
        password: hashPassword("password123"),
        gender: "Male",
        userOption: "D", // Doctor
        address: "789 Medical Street, Brisbane, QLD 4000",
      },
    });
    console.log("Created Dr. Chen user:", doctorChen.id);

    const doctorJohnson = await prisma.user.create({
      data: {
        authSubId: "auth0|doctorjohnson1",
        firstName: "Sarah",
        lastName: "Johnson",
        dateOfBirth: new Date("1982-07-15"),
        phoneNumber: "0476543210",
        email: "sarah.johnson@example.com",
        password: hashPassword("password123"),
        gender: "Female",
        userOption: "D", // Doctor
        address: "321 Health Road, Perth, WA 6000",
      },
    });
    console.log("Created Dr. Johnson user:", doctorJohnson.id);

    // Create Doctor records
    const doctorSmithRecord = await prisma.doctor.create({
      data: {
        userId: doctorSmith.id,
        ahpraNumber: "MED0001234",
        bio: "Dr. Jane Smith is a general practitioner with over 15 years of experience.",
        languageSpoken: ["English", "Spanish"],
        ahpraVerifySuccess: true,
        consultationTypeAvailable: ["video", "audio", "text"],
        specialty: ["General Practice", "Family Medicine"],
        consultationStatus: "available",
      },
    });
    console.log("Created doctor record for Dr. Smith:", doctorSmithRecord.id);

    const doctorChenRecord = await prisma.doctor.create({
      data: {
        userId: doctorChen.id,
        ahpraNumber: "MED0005678",
        bio: "Dr. Michael Chen specializes in respiratory conditions and general health.",
        languageSpoken: ["English", "Chinese"],
        ahpraVerifySuccess: true,
        consultationTypeAvailable: ["video", "audio"],
        specialty: ["Respiratory Medicine", "General Practice"],
        consultationStatus: "available",
      },
    });
    console.log("Created doctor record for Dr. Chen:", doctorChenRecord.id);

    const doctorJohnsonRecord = await prisma.doctor.create({
      data: {
        userId: doctorJohnson.id,
        ahpraNumber: "MED0009012",
        bio: "Dr. Sarah Johnson is experienced in pediatrics and women's health.",
        languageSpoken: ["English", "French"],
        ahpraVerifySuccess: true,
        consultationTypeAvailable: ["video", "text"],
        specialty: ["Pediatrics", "Women's Health"],
        consultationStatus: "offline",
      },
    });
    console.log(
      "Created doctor record for Dr. Johnson:",
      doctorJohnsonRecord.id,
    );

    // Create Transcript
    const transcript = await prisma.transcript.create({
      data: {
        content:
          "Doctor: How are you feeling today?\nPatient: I have a severe cough and fever for the past 3 days.\nDoctor: Any other symptoms?\nPatient: Just fatigue and some body aches.",
      },
    });
    console.log("Created transcript:", transcript.id);

    // Create Feedback
    const feedback = await prisma.feedback.create({
      data: {
        rating: 5,
        comments:
          "Dr. Smith was very thorough and professional. Would recommend!",
      },
    });
    console.log("Created feedback:", feedback.id);

    // Create a consultation for Kent with Dr. Smith
    const kentConsultation = await prisma.consultation.create({
      data: {
        userId: kentUser.id,
        patientId: kentPatient.id,
        doctorId: doctorSmithRecord.id,
        transcriptId: transcript.id,
        feedbackId: feedback.id,
        status: "completed",
        reason: "Respiratory infection symptoms",
        consultationType: "video",
        requestedAt: new Date("2025-04-20T09:00:00Z"),
        startedAt: new Date("2025-04-20T09:05:00Z"),
        endedAt: new Date("2025-04-20T09:25:00Z"),
        waitDuration: 1200, // 20 minutes in seconds
        notes:
          "Patient presented with respiratory symptoms consistent with viral infection.",
        twilioRoomSid: "RM12345678901234567890123456789012",
        firstName: "Kent",
        lastName: "Go",
        email: "kentgo09@gmail.com",
        dateOfBirth: new Date("1990-05-15"),
        gender: "Male",
        streetAddress: "123 Patient Street",
        suburb: "Sydney",
        postcode: 2000,
        state: "NSW",
        medicareNumber: 1234567890,
        phoneNumber: "0412345678",
        certificateReason: "Acute respiratory infection",
        leaveFrom: "work",
        certificateStartDate: new Date("2025-04-20"),
        certificateEndDate: new Date("2025-04-23"),
        symptomsInfo: "Cough, fever, fatigue, and body aches for 3 days",
        pastHistory: "No significant past medical history",
        requiresUrgentAttention: false,
        mildSymptoms: true,
        willSeeDoctorIfNotImproving: true,
        inAustralia: true,
        description:
          "Patient has viral respiratory infection requiring rest and hydration.",
      },
    });
    console.log("Created consultation for Kent:", kentConsultation.id);

    // Create an invoice for Kent's consultation
    const invoice = await prisma.invoice.create({
      data: {
        consultationId: kentConsultation.id,
        date: new Date("2025-04-20"),
        description: "Video consultation for respiratory infection",
        amount: 75.0,
        status: "paid",
      },
    });
    console.log("Created invoice:", invoice.id);

    // Create an unregistered user (guest)
    const guestUser = await prisma.user.create({
      data: {
        authSubId: "auth0|guestuser1",
        firstName: "Guest",
        lastName: "User",
        email: "guest@example.com",
        password: hashPassword("password123"),
        userOption: "P", // Patient
      },
    });
    console.log("Created guest user:", guestUser.id);

    // Create a consultation for the unregistered user with minimal information
    const guestConsultation = await prisma.consultation.create({
      data: {
        userId: guestUser.id,
        patientId: kentPatient.id, // Using Kent's patient ID for simplicity, in real app would create a temporary patient
        doctorId: doctorChenRecord.id,
        status: "incomplete",
        consultationType: "text",
        firstName: "Guest",
        lastName: "User",
        email: "guest@example.com",
        dateOfBirth: new Date("1985-06-22"),
        gender: "Other",
        streetAddress: "456 Guest Lane",
        suburb: "Melbourne",
        postcode: 3000,
        state: "VIC",
        medicareNumber: 98765432,
        phoneNumber: "0400000000",
        certificateReason: "Skin rash",
        leaveFrom: "work",
        certificateStartDate: new Date("2025-04-23"),
        certificateEndDate: new Date("2025-04-25"),
        symptomsInfo: "Persistent skin rash on arms and neck",
        pastHistory: "Allergic to penicillin",
        requiresUrgentAttention: false,
        mildSymptoms: true,
        willSeeDoctorIfNotImproving: true,
        inAustralia: true,
      },
    });
    console.log("Created consultation for guest user:", guestConsultation.id);

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
