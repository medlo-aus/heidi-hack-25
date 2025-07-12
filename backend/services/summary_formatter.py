from models import VisitSummary

def format_summary(visit: VisitSummary) -> str:
    meds = "\n".join([f"- {m.name} ({m.dosage}, {m.frequency})" for m in visit.medications])
    referrals = "\n".join([f"- {r.specialist} ({r.location or 'No location'})" for r in visit.referrals])
    
    return f"""
Hi {visit.patient_name},

🩺 Diagnosis:
{visit.diagnosis}

💊 Medications:
{meds}

➡️ Referrals:
{referrals}

📝 Recommendations:
{visit.recommendations}

📅 Next Appointment:
{visit.next_appointment.strftime('%Y-%m-%d %H:%M') if visit.next_appointment else 'Not scheduled'}

This is a mock summary. In real implementation, it would be sent via email and SMS.
"""
