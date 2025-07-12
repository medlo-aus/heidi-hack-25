import type { PatientExplainer } from "@/types/patient-explainer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Pill,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Phone,
  User,
  Stethoscope,
  FileText,
  Clock,
  Activity,
} from "lucide-react"

interface PatientExplainerLetterProps {
  data: PatientExplainer
}

export default function PatientExplainerLetter({ data }: PatientExplainerLetterProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "moderate":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergent":
        return "destructive"
      case "urgent":
        return "default"
      case "routine":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      {/* Header */}
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-900">Patient Care Summary</CardTitle>
              <CardDescription className="text-lg">Post-Consultation Explainer Letter</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Patient:</span> {data.patientInfo.name}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Date:</span> {data.patientInfo.consultDate}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Age/Gender:</span> {data.patientInfo.age} years, {data.patientInfo.gender}
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Consultation:</span> {data.patientInfo.consultType}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chief Complaint */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Your Visit Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{data.chiefComplaint}</p>
        </CardContent>
      </Card>

      {/* Diagnosis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Diagnosis & Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">Primary Assessment:</span>
              <Badge variant={getSeverityColor(data.diagnosis.severity)}>
                {data.diagnosis.severity.toUpperCase()} PRIORITY
              </Badge>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-3">{data.diagnosis.primary}</p>
            <p className="text-gray-700 leading-relaxed">{data.diagnosis.explanation}</p>
          </div>

          {data.diagnosis.differential.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Other Conditions We're Considering:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {data.diagnosis.differential.map((condition, index) => (
                  <li key={index}>{condition}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Instructions */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">⚠️ When to Seek Emergency Care</AlertTitle>
        <AlertDescription className="space-y-3 text-red-700">
          <div>
            <p className="font-medium mb-2">Call 911 immediately if you experience:</p>
            <ul className="list-disc list-inside space-y-1">
              {data.emergencyInstructions.symptoms.map((symptom, index) => (
                <li key={index}>{symptom}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">Emergency Actions:</p>
            <ul className="list-disc list-inside space-y-1">
              {data.emergencyInstructions.actions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            {data.emergencyInstructions.emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="font-medium">{contact.name}:</span>
                <span>{contact.phone}</span>
              </div>
            ))}
          </div>
        </AlertDescription>
      </Alert>

      {/* Medications */}
      {data.medications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-green-600" />
              Your Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.medications.map((medication, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">{medication.name}</h4>
                  <Badge variant="outline">{medication.dosage}</Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <span className="font-medium">How to take:</span> {medication.frequency}
                    </p>
                    <p>
                      <span className="font-medium">Duration:</span> {medication.duration}
                    </p>
                    <p>
                      <span className="font-medium">Purpose:</span> {medication.purpose}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Instructions:</p>
                    <p className="text-gray-700 mb-2">{medication.instructions}</p>
                    {medication.sideEffects.length > 0 && (
                      <div>
                        <p className="font-medium">Possible side effects:</p>
                        <p className="text-gray-600">{medication.sideEffects.join(", ")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Follow-up */}
      {data.followUp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Follow-up Care
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="font-semibold">Schedule within: {data.followUp.timeframe}</span>
              </div>
              <p className="text-gray-700 mb-3">{data.followUp.reason}</p>
              <p className="text-sm text-gray-600">{data.followUp.instructions}</p>
            </div>

            {data.followUp.testsRequired.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Tests/Studies Ordered:</h4>
                <div className="flex flex-wrap gap-2">
                  {data.followUp.testsRequired.map((test, index) => (
                    <Badge key={index} variant="secondary">
                      {test}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Referrals */}
      {data.referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-purple-600" />
              Specialist Referrals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.referrals.map((referral, index) => (
              <div key={index} className="border rounded-lg p-4 bg-purple-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{referral.specialty}</h4>
                  <Badge variant={getUrgencyColor(referral.urgency)}>{referral.urgency.toUpperCase()}</Badge>
                </div>
                <p className="text-gray-700 mb-2">{referral.reason}</p>
                <p className="text-sm text-gray-600">{referral.instructions}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Lifestyle Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            Lifestyle Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.lifestyleRecommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-pink-600 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Educational Resources */}
      {data.educationalResources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-blue-600" />
              Learn More
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {data.educationalResources.map((resource, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <h4 className="font-semibold text-gray-900 mb-2">{resource.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      Visit Resource <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Provider Information */}
      <Card className="border-t-4 border-t-blue-600">
        <CardHeader>
          <CardTitle>Your Healthcare Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{data.providerInfo.name}</p>
              <p className="text-gray-600">{data.providerInfo.title}</p>
              <p className="text-sm text-gray-500">{data.providerInfo.contact}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-6 border-t">
        <p>This letter summarizes your recent consultation. Please keep it for your records.</p>
        <p className="mt-1">If you have questions about this information, please contact your healthcare provider.</p>
      </div>
    </div>
  )
}
