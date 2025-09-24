import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQueue } from "@/hooks/useQueue";
import { Clock, Users, AlertCircle, CheckCircle2, Timer } from "lucide-react";
import type { Patient } from "@/types/queue";

export const PatientDashboard = () => {
  const { patients, departments, getWaitingPatients } = useQueue();
  const [tokenSearch, setTokenSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [searchError, setSearchError] = useState("");

  const handleSearch = () => {
    setSearchError("");
    setFoundPatient(null);

    if (!tokenSearch || !selectedDepartment) {
      setSearchError("Please enter token number and select department");
      return;
    }

    const patient = patients.find(p => 
      p.tokenNumber === parseInt(tokenSearch) && 
      p.department === selectedDepartment
    );

    if (!patient) {
      setSearchError("Token not found. Please check your token number and department.");
      return;
    }

    setFoundPatient(patient);
  };

  const getPatientPosition = (patient: Patient) => {
    const waitingPatients = getWaitingPatients(patient.department);
    const position = waitingPatients.findIndex(p => p.id === patient.id);
    return position === -1 ? 0 : position + 1;
  };

  const getEstimatedWaitTime = (patient: Patient) => {
    const position = getPatientPosition(patient);
    const avgServiceTime = 15; // Average 15 minutes per patient
    return position * avgServiceTime;
  };

  const getCurrentDepartmentStatus = (department: string) => {
    return departments.find(d => d.name === department);
  };

  return (
    <div className="pt-20 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="bg-secondary/10 p-3 rounded-full">
              <Users className="h-8 w-8 text-secondary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Patient Dashboard</h1>
          <p className="text-muted-foreground">Track your queue status and estimated wait time</p>
        </div>

        {!foundPatient ? (
          <Card className="max-w-md mx-auto shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle className="text-center">Find Your Queue Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Token Number</Label>
                <Input
                  id="token"
                  type="number"
                  placeholder="Enter your token number"
                  value={tokenSearch}
                  onChange={(e) => setTokenSearch(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="">Select your department</option>
                  <option value="General">General OPD</option>
                  <option value="Diagnostics">Diagnostics</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Pharmacy">Pharmacy</option>
                </select>
              </div>

              {searchError && (
                <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                  {searchError}
                </div>
              )}

              <Button onClick={handleSearch} className="w-full" variant="medical">
                Find My Status
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Patient Info Header */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{foundPatient.name}</h2>
                    <p className="text-muted-foreground">
                      Token #{foundPatient.tokenNumber} • {foundPatient.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      foundPatient.status === 'Completed' ? 'bg-secondary text-secondary-foreground' :
                      foundPatient.status === 'In Progress' ? 'bg-primary text-primary-foreground animate-pulse-glow' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {foundPatient.status === 'Completed' && <CheckCircle2 className="h-4 w-4 mr-1" />}
                      {foundPatient.status === 'In Progress' && <Timer className="h-4 w-4 mr-1" />}
                      {foundPatient.status === 'Waiting' && <Clock className="h-4 w-4 mr-1" />}
                      {foundPatient.status}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Visit Type</div>
                    <div className="font-semibold">{foundPatient.visitType}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Registration</div>
                    <div className="font-semibold">{foundPatient.registrationTime.toLocaleTimeString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Priority</div>
                    <div className={`font-semibold ${
                      foundPatient.isEmergency ? 'text-destructive' :
                      foundPatient.isSeniorCitizen ? 'text-priority' : 'text-primary'
                    }`}>
                      {foundPatient.isEmergency ? 'Emergency' :
                       foundPatient.isSeniorCitizen ? 'Senior' : 'Normal'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Age</div>
                    <div className="font-semibold">{foundPatient.age}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {foundPatient.status === 'Waiting' && (
              <>
                {/* Current Status */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="text-center p-6">
                    <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-3">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary mb-1">
                      {getPatientPosition(foundPatient)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Position in Queue
                    </div>
                  </Card>

                  <Card className="text-center p-6">
                    <div className="bg-secondary/10 p-3 rounded-full w-fit mx-auto mb-3">
                      <Clock className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="text-2xl font-bold text-secondary mb-1">
                      ~{getEstimatedWaitTime(foundPatient)}m
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Estimated Wait
                    </div>
                  </Card>

                  <Card className="text-center p-6">
                    <div className="bg-accent/10 p-3 rounded-full w-fit mx-auto mb-3">
                      <AlertCircle className="h-6 w-6 text-accent" />
                    </div>
                    <div className="text-2xl font-bold text-accent mb-1">
                      {getCurrentDepartmentStatus(foundPatient.department)?.currentToken || 'None'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Now Serving
                    </div>
                  </Card>
                </div>

                {/* Queue Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Queue Progress - {foundPatient.department}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getWaitingPatients(foundPatient.department).slice(0, 5).map((patient, index) => {
                        const isCurrentPatient = patient.id === foundPatient.id;
                        return (
                          <div 
                            key={patient.id}
                            className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                              isCurrentPatient ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/20' :
                              index === 0 ? 'bg-secondary/10 border border-secondary/20' :
                              'bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isCurrentPatient ? 'bg-primary text-primary-foreground' :
                                index === 0 ? 'bg-secondary text-secondary-foreground' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {patient.tokenNumber}
                              </div>
                              <div>
                                <div className={`font-medium ${isCurrentPatient ? 'text-primary' : ''}`}>
                                  {isCurrentPatient ? 'You' : `Token ${patient.tokenNumber}`}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {index === 0 ? 'Next in line' : `Position ${index + 1}`}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              {patient.isEmergency && (
                                <Badge variant="destructive" className="text-xs">Emergency</Badge>
                              )}
                              {patient.isSeniorCitizen && !patient.isEmergency && (
                                <Badge className="text-xs bg-priority text-priority-foreground">Senior</Badge>
                              )}
                              {isCurrentPatient && (
                                <Badge variant="default" className="text-xs">You</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {foundPatient.status === 'In Progress' && (
              <Card className="text-center p-8 bg-primary/5 border-primary/20">
                <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                  <Timer className="h-8 w-8 text-primary animate-pulse-glow" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">You're Being Served!</h3>
                <p className="text-muted-foreground">
                  Please proceed to the {foundPatient.department} department counter.
                </p>
              </Card>
            )}

            {foundPatient.status === 'Completed' && (
              <Card className="text-center p-8 bg-secondary/5 border-secondary/20">
                <div className="bg-secondary/10 p-4 rounded-full w-fit mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-secondary mb-2">Service Completed</h3>
                <p className="text-muted-foreground">
                  Thank you for visiting MediCare Hospital. We hope you had a pleasant experience.
                </p>
              </Card>
            )}

            <div className="text-center">
              <Button 
                onClick={() => {
                  setFoundPatient(null);
                  setTokenSearch("");
                  setSelectedDepartment("");
                  setSearchError("");
                }}
                variant="outline"
              >
                Search Another Token
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};