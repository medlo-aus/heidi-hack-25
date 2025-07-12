import type { PatientExplainer } from "@/types/patient-explainer"

export const samplePatientData: PatientExplainer = {
  patientInfo: {
    name: "John Smith",
    age: 39,
    gender: "Male",
    consultDate: "December 7, 2024",
    consultType: "Emergency Consultation",
  },
  chiefComplaint: "Chest pain on the left side, sharp in nature, lasting approximately 8 hours",
  diagnosis: {
    primary: "Chest Pain - Requires Further Evaluation",
    differential: [
      "Cardiac chest pain (possible angina)",
      "Musculoskeletal chest pain",
      "Gastroesophageal reflux",
      "Anxiety-related chest pain",
    ],
    explanation:
      "Based on your symptoms of sharp left-sided chest pain with associated shortness of breath and heart racing, we need to rule out serious cardiac causes. Your family history of heart attack and smoking history are important risk factors that require careful evaluation.",
    severity: "moderate",
    followUpRequired: true,
  },
  medications: [
    {
      name: "Aspirin",
      dosage: "81mg",
      frequency: "Once daily",
      duration: "Ongoing (unless contraindicated)",
      instructions: "Take with food to reduce stomach irritation",
      sideEffects: ["Stomach upset", "Increased bleeding risk", "Allergic reactions"],
      purpose: "Heart protection and blood clot prevention",
    },
    {
      name: "Nitroglycerin (if prescribed)",
      dosage: "0.4mg sublingual",
      frequency: "As needed for chest pain",
      duration: "As directed",
      instructions:
        "Place under tongue when experiencing chest pain. May repeat every 5 minutes up to 3 times. Seek emergency care if pain persists.",
      sideEffects: ["Headache", "Dizziness", "Low blood pressure"],
      purpose: "Relief of chest pain if cardiac in origin",
    },
  ],
  educationalResources: [
    {
      title: "Understanding Chest Pain",
      description: "Learn about different causes of chest pain and when to seek medical attention",
      url: "https://www.heart.org/chest-pain-guide",
      category: "condition",
    },
    {
      title: "Heart-Healthy Living",
      description: "Tips for maintaining cardiovascular health through diet and exercise",
      url: "https://www.heart.org/healthy-living",
      category: "lifestyle",
    },
    {
      title: "Smoking Cessation Resources",
      description: "Tools and support to help you quit smoking",
      url: "https://www.smokefree.gov",
      category: "prevention",
    },
  ],
  referrals: [
    {
      specialty: "Cardiology",
      reason: "Evaluation of chest pain with cardiac risk factors",
      urgency: "urgent",
      instructions: "Please schedule within 1-2 weeks. Bring all test results and medication list.",
    },
  ],
  followUp: {
    timeframe: "1-2 weeks",
    reason: "Review test results and assess symptom progression",
    instructions: "Schedule follow-up appointment to discuss EKG, blood work, and any additional testing results",
    testsRequired: ["EKG", "Chest X-ray", "Basic metabolic panel", "Lipid panel", "Troponin levels"],
  },
  emergencyInstructions: {
    symptoms: [
      "Severe chest pain (8/10 or higher)",
      "Chest pain with sweating, nausea, or vomiting",
      "Difficulty breathing or shortness of breath",
      "Pain radiating to arm, jaw, or back",
      "Feeling faint or losing consciousness",
    ],
    actions: [
      "Call 000 immediately",
      "Chew an aspirin if not allergic",
      "Sit upright and try to stay calm",
      "Have someone stay with you until help arrives",
    ],
    emergencyContacts: [
      {
        name: "Emergency Services",
        phone: "000",
        type: "emergency",
      },
      {
        name: "Clinic After-Hours",
        phone: "1800 022 222",
        type: "after-hours",
      },
    ],
  },
  lifestyleRecommendations: [
    "Quit smoking - this is the most important step for your heart health",
    "Limit alcohol consumption to no more than 2 drinks per day",
    "Continue regular exercise but avoid strenuous activity until cleared by cardiology",
    "Maintain a heart-healthy diet low in saturated fats and sodium",
    "Monitor and manage stress levels",
    "Get adequate sleep (7-9 hours per night)",
  ],
  providerInfo: {
    name: "Dr. Sarah Johnson",
    title: "Emergency Medicine Physician",
    contact: "clinic@healthcentre.com.au | (03) 9123 4567",
  },
}
