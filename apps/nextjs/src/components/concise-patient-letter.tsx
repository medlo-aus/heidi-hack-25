import type { PatientExplainer } from "@/types/patient-explainer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Pill, Calendar, Phone, User, FileText, Heart, Clock } from "lucide-react"

interface ConcisePatientLetterProps {
  data: PatientExplainer
}

export default function ConcisePatientLetter({ data }: ConcisePatientLetterProps) {
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

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient Care Summary</h1>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {data.patientInfo.name}, {data.patientInfo.age}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {data.patientInfo.consultDate}
          </span>
        </div>
      </div>

      {/* Card 1: Assessment & Emergency Care */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Your Assessment & Emergency Care
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Diagnosis */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="font-semibold">Assessment:</span>
              <Badge variant={getSeverityColor(data.diagnosis.severity)} className="text-xs">
                {data.diagnosis.severity.toUpperCase()}
              </Badge>
            </div>
            <p className="font-medium text-gray-900 mb-2">{data.diagnosis.primary}</p>
            <p className="text-sm text-gray-700">{data.diagnosis.explanation}</p>
          </div>

          {/* Emergency Instructions */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600 hidden" />
            <AlertTitle className="text-red-800 text-sm">⚠️ Call 000 immediately if you have:</AlertTitle>
            <AlertDescription className="text-red-700 text-sm">
              <div className="grid md:grid-cols-2 gap-2 mt-2">
                <ul className="space-y-1 text-xs">
                  {data.emergencyInstructions.symptoms.slice(0, 3).map((symptom, index) => (
                    <li key={index}>• {symptom}</li>
                  ))}
                </ul>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="h-3 w-3" />
                    <span className="font-medium">Emergency: 000</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs hidden">
                    <Phone className="h-3 w-3" />
                    <span className="font-medium">After Hours: 1800 022 222</span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Card 2: Your Treatment Plan */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Pill className="h-5 w-5 text-green-600" />
            Your Treatment Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Medications */}
          {data.medications.length > 0 && (
            <div className="space-y-3">
              {data.medications.map((medication, index) => (
                <div key={index} className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {medication.dosage}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <p>
                        <span className="font-medium">Take:</span> {medication.frequency}
                      </p>
                      <p>
                        <span className="font-medium">Purpose:</span> {medication.purpose}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">{medication.instructions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Key Lifestyle Recommendations */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-blue-600" />
              Important Actions
            </h4>
            <ul className="space-y-1 text-sm">
              {data.lifestyleRecommendations.slice(0, 3).map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Next Steps */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-orange-600" />
            Your Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Follow-up */}
          {data.followUp && (
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="font-semibold">Follow-up Required</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">When:</span> {data.followUp.timeframe}
              </p>
              <p className="text-sm text-gray-600">{data.followUp.reason}</p>

              {data.followUp.testsRequired.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">Tests ordered:</p>
                  <div className="flex flex-wrap gap-1">
                    {data.followUp.testsRequired.slice(0, 4).map((test, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {test}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Referrals */}
          {data.referrals.length > 0 && (
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-2">Specialist Referral</h4>
              {data.referrals.map((referral, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{referral.specialty}</span>
                    <Badge variant="outline" className="text-xs">
                      {referral.urgency.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-xs">{referral.reason}</p>
                </div>
              ))}
            </div>
          )}

          {/* Provider Contact */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-gray-600" />
              <span className="font-semibold text-sm">Your Doctor</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{data.providerInfo.name}</p>
            <p className="text-xs text-gray-600">{data.providerInfo.title}</p>
            <p className="text-xs text-gray-500">{data.providerInfo.contact}</p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-4 border-t">
        <p>Keep this summary for your records. Contact your healthcare provider if you have questions.</p>
      </div>
    </div>
  )
}
