import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  FileText, 
  MessageSquare, 
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  UserCheck,
  Activity
} from "lucide-react";
import { format } from "date-fns";

const AdminDashboardPage: React.FC = () => {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  // User validation query
  const { data: userData, error: userError } = api.user.getUserById.useQuery(
    { authSubId: user?.id ?? "" },
    { enabled: !!user?.id },
  );
  const isAdmin = userData?.userOption === "A";

  // Admin dashboard queries - accessing data from existing routers
  const consultationsQuery = api.consultation.getQueue.useQuery();
  const medicalCertificatesQuery = api.medicalCertificate.getAll.useQuery();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.replace("/login");
    }
  }, [user, isAdmin, isLoading, router]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      // Handle error if needed
    } finally {
      setIsSigningOut(false);
    }
  };

  // Loading states
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          <p className="ml-4 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <p className="mt-4 text-lg text-red-500">Error loading user data</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  // Calculate statistics
  const totalConsultations = consultationsQuery.data?.length || 0;
  const totalCertificates = medicalCertificatesQuery.data?.length || 0;
  
  /* Get completed consultations count from queue data - 
     Note: This is a simplified approach since we only have access to waiting consultations */
  const pendingConsultations = consultationsQuery.data?.filter(c => c.status === "WAITING").length || 0;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage consultations, medical certificates, and system overview
          </p>
        </div>
        <Button onClick={handleSignOut} disabled={isSigningOut}>
          {isSigningOut ? "Signing out..." : "Sign Out"}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingConsultations}</div>
            <p className="text-xs text-muted-foreground">
              Patients currently waiting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsultations}</div>
            <p className="text-xs text-muted-foreground">
              In system queue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical Certificates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCertificates}</div>
            <p className="text-xs text-muted-foreground">
              Certificates issued
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <CheckCircle className="inline h-6 w-6" />
            </div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="consultations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="consultations">
            <Users className="mr-2 h-4 w-4" />
            Consultations
          </TabsTrigger>
          <TabsTrigger value="certificates">
            <FileText className="mr-2 h-4 w-4" />
            Medical Certificates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consultations">
          <Card>
            <CardHeader>
              <CardTitle>Patient Queue</CardTitle>
              <CardDescription>
                Current patients waiting for consultation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consultationsQuery.isPending ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                  <span className="ml-3">Loading consultations...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Certificate Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultationsQuery.data?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          No consultations in queue
                        </TableCell>
                      </TableRow>
                    ) : (
                      consultationsQuery.data?.map((consultation) => (
                        <TableRow key={consultation.id}>
                          <TableCell className="font-medium">
                            {`${consultation.firstName} ${consultation.lastName}`}
                          </TableCell>
                          <TableCell>
                            {format(new Date(consultation.createdAt), "dd/MM/yyyy HH:mm")}
                          </TableCell>
                          <TableCell>{consultation.certificateReason}</TableCell>
                          <TableCell>
                            <Badge variant={consultation.status === "WAITING" ? "secondary" : "default"}>
                              {consultation.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {consultation.isPriority ? (
                              <Badge variant="destructive">Priority</Badge>
                            ) : (
                              <Badge variant="outline">Standard</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle>Medical Certificates</CardTitle>
              <CardDescription>
                All medical certificates issued through the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {medicalCertificatesQuery.isPending ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                  <span className="ml-3">Loading certificates...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate Code</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Issued Date</TableHead>
                      <TableHead>Leave Period</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicalCertificatesQuery.data?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          No medical certificates issued yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      medicalCertificatesQuery.data?.map((certificate) => (
                        <TableRow key={certificate.id}>
                          <TableCell className="font-mono text-sm">
                            {certificate.medCertCode}
                          </TableCell>
                          <TableCell>
                            {certificate.consultation 
                              ? `${certificate.consultation.firstName} ${certificate.consultation.lastName}`
                              : "Unknown Patient"
                            }
                          </TableCell>
                          <TableCell>
                            {certificate.issuedDate 
                              ? format(new Date(certificate.issuedDate), "dd/MM/yyyy")
                              : "Unknown"
                            }
                          </TableCell>
                          <TableCell>
                            {certificate.startDate && certificate.endDate
                              ? `${format(new Date(certificate.startDate), "dd/MM/yyyy")} - ${format(new Date(certificate.endDate), "dd/MM/yyyy")}`
                              : "Unknown period"
                            }
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {certificate.consultation?.certificateReason || "No reason specified"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage;
