import type { PatientExplainer } from "@/types/patient-explainer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  Heart,
  Phone,
  Pill,
  Stethoscope,
  User,
} from "lucide-react";

interface PatientExplainerLetterProps {
  data: PatientExplainer;
}

export default function PatientExplainerLetter({
  data,
}: PatientExplainerLetterProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "moderate":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergent":
        return "destructive";
      case "urgent":
        return "default";
      case "routine":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-4xl space-y-6 bg-gradient-to-br from-blue-50 to-white p-6">
      {/* Header */}
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-900">
                Patient Care Summary
              </CardTitle>
              <CardDescription className="text-lg">
                Post-Consultation Explainer Letter
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Patient:</span>{" "}
                {data.patientInfo.name}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Date:</span>{" "}
                {data.patientInfo.consultDate}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Age/Gender:</span>{" "}
                {data.patientInfo.age} years, {data.patientInfo.gender}
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Consultation:</span>{" "}
                {data.patientInfo.consultType}
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
          <p className="leading-relaxed text-gray-700">{data.chiefComplaint}</p>
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
            <div className="mb-2 flex items-center gap-2">
              <span className="font-semibold">Primary Assessment:</span>
              <Badge variant={getSeverityColor(data.diagnosis.severity)}>
                {data.diagnosis.severity.toUpperCase()} PRIORITY
              </Badge>
            </div>
            <p className="mb-3 text-lg font-medium text-gray-900">
              {data.diagnosis.primary}
            </p>
            <p className="leading-relaxed text-gray-700">
              {data.diagnosis.explanation}
            </p>
          </div>

          {data.diagnosis.differential.length > 0 && (
            <div>
              <h4 className="mb-2 font-semibold">
                Other Conditions We're Considering:
              </h4>
              <ul className="list-inside list-disc space-y-1 text-gray-700">
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
        {/* <AlertTriangle className="h-4 w-4 text-red-600" /> */}
        <AlertTitle className="text-red-800">
          <div className="mr-2 inline h-4 w-4">⚠️</div>
          When to Seek Emergency Care
        </AlertTitle>
        <AlertDescription className="space-y-3 text-red-700">
          <div>
            <p className="mb-2 font-medium">
              Call 000 immediately if you experience:
            </p>
            <ul className="list-inside list-disc space-y-1">
              {data.emergencyInstructions.symptoms.map((symptom, index) => (
                <li key={index}>{symptom}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 font-medium">Emergency Actions:</p>
            <ul className="list-inside list-disc space-y-1">
              {data.emergencyInstructions.actions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            {data.emergencyInstructions.emergencyContacts.map(
              (contact, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">{contact.name}:</span>
                  <span>{contact.phone}</span>
                </div>
              ),
            )}
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
              <div key={index} className="rounded-lg border bg-gray-50 p-4">
                <div className="mb-3 flex items-start justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {medication.name}
                  </h4>
                  <Badge variant="outline">{medication.dosage}</Badge>
                </div>
                <div className="grid gap-4 text-sm md:grid-cols-2">
                  <div>
                    <p>
                      <span className="font-medium">How to take:</span>{" "}
                      {medication.frequency}
                    </p>
                    <p>
                      <span className="font-medium">Duration:</span>{" "}
                      {medication.duration}
                    </p>
                    <p>
                      <span className="font-medium">Purpose:</span>{" "}
                      {medication.purpose}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 font-medium">Instructions:</p>
                    <p className="mb-2 text-gray-700">
                      {medication.instructions}
                    </p>
                    {medication.sideEffects.length > 0 && (
                      <div>
                        <p className="font-medium">Possible side effects:</p>
                        <p className="text-gray-600">
                          {medication.sideEffects.join(", ")}
                        </p>
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
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="font-semibold">
                  Schedule within: {data.followUp.timeframe}
                </span>
              </div>
              <p className="mb-3 text-gray-700">{data.followUp.reason}</p>
              <p className="text-sm text-gray-600">
                {data.followUp.instructions}
              </p>
            </div>

            {data.followUp.testsRequired.length > 0 && (
              <div>
                <h4 className="mb-2 font-semibold">Tests/Studies Ordered:</h4>
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
              <div key={index} className="rounded-lg border bg-purple-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">
                    {referral.specialty}
                  </h4>
                  <Badge variant={getUrgencyColor(referral.urgency)}>
                    {referral.urgency.toUpperCase()}
                  </Badge>
                </div>
                <p className="mb-2 text-gray-700">{referral.reason}</p>
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
                <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-pink-600" />
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
            <div className="grid gap-4 md:grid-cols-2">
              {data.educationalResources.map((resource, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
                >
                  <h4 className="mb-2 font-semibold text-gray-900">
                    {resource.title}
                  </h4>
                  <p className="mb-3 text-sm text-gray-600">
                    {resource.description}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    asChild
                  >
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Resource <ExternalLink className="ml-1 h-3 w-3" />
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
            <div className="rounded-full bg-blue-100 p-3">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {data.providerInfo.name}
              </p>
              <p className="text-gray-600">{data.providerInfo.title}</p>
              <p className="text-sm text-gray-500">
                {data.providerInfo.contact}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="border-t pt-6 text-center text-sm text-gray-500">
        <p>
          This letter summarizes your recent consultation. Please keep it for
          your records.
        </p>
        <p className="mt-1">
          If you have questions about this information, please contact your
          healthcare provider.
        </p>
      </div>
    </div>
  );
}
