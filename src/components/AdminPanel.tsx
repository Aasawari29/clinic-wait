import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQueue } from "@/hooks/useQueue";
import { useToast } from "@/hooks/use-toast";
import { Settings, Phone, CheckCircle, Clock, AlertTriangle, Users } from "lucide-react";

export const AdminPanel = () => {
  const { departments, getWaitingPatients, callNextPatient, completePatient, patients } = useQueue();
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState("General");

  const handleCallNext = (department: string) => {
    const nextPatient = callNextPatient(department);
    if (nextPatient) {
      toast({
        title: "Patient Called",
        description: `Token ${nextPatient.tokenNumber} - ${nextPatient.name} is now being served.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "No Patients",
        description: "No patients waiting in this department.",
      });
    }
  };

  const handleCompletePatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      completePatient(patientId);
      toast({
        title: "Patient Completed",
        description: `Token ${patient.tokenNumber} - ${patient.name} has been marked as completed.`,
      });
    }
  };

  const currentPatients = patients.filter(p => p.status === 'In Progress');
  const waitingPatients = getWaitingPatients(selectedDepartment);

  return (
    <div className="pt-20 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Settings className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Staff Admin Panel</h1>
          <p className="text-muted-foreground">Manage patient queue and track service status</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {departments.map((dept) => (
                  <div key={dept.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{dept.name}</span>
                      <Badge variant="outline">{dept.waitingCount} waiting</Badge>
                    </div>
                    <Button
                      onClick={() => handleCallNext(dept.name)}
                      disabled={dept.waitingCount === 0}
                      className="w-full"
                      variant={dept.waitingCount > 0 ? "default" : "outline"}
                    >
                      Call Next Patient
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Currently Serving */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Currently Serving</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentPatients.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No patients currently being served
                    </p>
                  ) : (
                    currentPatients.map((patient) => (
                      <div key={patient.id} className="bg-muted/30 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Token {patient.tokenNumber} - {patient.department}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            {patient.isEmergency && (
                              <Badge variant="destructive" className="text-xs">Emergency</Badge>
                            )}
                            {patient.isSeniorCitizen && !patient.isEmergency && (
                              <Badge className="text-xs bg-priority text-priority-foreground">Senior</Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCompletePatient(patient.id)}
                          size="sm"
                          variant="secondary"
                          className="w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Completed
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Queue Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Department Queue Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    {departments.map((dept) => (
                      <TabsTrigger key={dept.id} value={dept.name}>
                        {dept.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {departments.map((dept) => (
                    <TabsContent key={dept.id} value={dept.name}>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">{dept.name} Queue</h3>
                          <div className="flex space-x-2">
                            <Badge variant="outline">
                              {getWaitingPatients(dept.name).length} waiting
                            </Badge>
                            <Button 
                              onClick={() => handleCallNext(dept.name)}
                              disabled={getWaitingPatients(dept.name).length === 0}
                              variant="medical"
                            >
                              Call Next
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {getWaitingPatients(dept.name).map((patient, index) => (
                            <div 
                              key={patient.id}
                              className={`p-4 rounded-lg border transition-all duration-200 ${
                                index === 0 ? 'ring-2 ring-primary bg-primary/5' :
                                patient.isEmergency ? 'bg-destructive/10 border-destructive/20' :
                                patient.isSeniorCitizen ? 'bg-priority/10 border-priority/20' :
                                'bg-card'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                    patient.isEmergency ? 'bg-destructive text-destructive-foreground' :
                                    patient.isSeniorCitizen ? 'bg-priority text-priority-foreground' :
                                    'bg-primary text-primary-foreground'
                                  }`}>
                                    {patient.tokenNumber}
                                  </div>
                                  <div>
                                    <div className="font-medium">{patient.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Age: {patient.age} • {patient.gender} • {patient.visitType}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Registered: {patient.registrationTime.toLocaleTimeString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end space-y-1">
                                  {index === 0 && (
                                    <Badge variant="default" className="text-xs">Next</Badge>
                                  )}
                                  {patient.isEmergency && (
                                    <div className="flex items-center space-x-1 text-destructive">
                                      <AlertTriangle className="h-3 w-3" />
                                      <span className="text-xs font-medium">Emergency</span>
                                    </div>
                                  )}
                                  {patient.isSeniorCitizen && !patient.isEmergency && (
                                    <div className="flex items-center space-x-1 text-priority">
                                      <Users className="h-3 w-3" />
                                      <span className="text-xs font-medium">Senior</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {getWaitingPatients(dept.name).length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>No patients waiting in this department</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};