import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Monitor, Clock, Users, AlertTriangle } from "lucide-react";



export const QueueDisplay = () => {

  const [currentTime, setCurrentTime] = useState(new Date());

  const [departments, setDepartments] = useState<any[]>([]);

  const [stats, setStats] = useState<any>({

    totalPatients: 0,

    totalServedToday: 0,

    averageWaitTime: 0,

    busiestDepartment: "None"

  });



  // Update time

  useEffect(() => {

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => clearInterval(timer);

  }, []);



  // Fetch departments + stats

  useEffect(() => {

    const fetchData = async () => {

      try {

        const [deptRes, statsRes] = await Promise.all([

          fetch("http://localhost:4000/api/departments"),

          fetch("http://localhost:4000/api/stats")

        ]);



        setDepartments(await deptRes.json());

        setStats(await statsRes.json());

      } catch (err) {

        console.error("Error fetching queue data", err);

      }

    };



    fetchData();

    const interval = setInterval(fetchData, 5000); // auto-refresh every 5s

    return () => clearInterval(interval);

  }, []);



  const DepartmentCard = ({ department }: { department: any }) => {

    const waitingPatients = department.waitingPatients || [];

    const emergencyCount = waitingPatients.filter((p: any) => p.isEmergency).length;

    const seniorCount = waitingPatients.filter((p: any) => p.isSeniorCitizen && !p.isEmergency).length;



    return (

      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">

        <CardHeader className="pb-4">

          <CardTitle className="flex items-center justify-between">

            <span className="text-xl">{department.name}</span>

            <Badge variant="outline" className="text-sm">

              {waitingPatients.length} waiting

            </Badge>

          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-4">

          <div className="bg-muted/30 rounded-lg p-4">

            <div className="flex justify-between items-center mb-2">

              <span className="text-sm text-muted-foreground">Now Serving</span>

              <Monitor className="h-4 w-4 text-primary" />

            </div>

            <div className="text-3xl font-bold text-primary">

              {department.currentToken || "None"}

            </div>

          </div>



          <div className="bg-secondary/20 rounded-lg p-4">

            <div className="flex justify-between items-center mb-2">

              <span className="text-sm text-muted-foreground">Next in Line</span>

              <Clock className="h-4 w-4 text-secondary" />

            </div>

            <div className="text-2xl font-semibold text-secondary">

              {department.nextToken || "None"}

            </div>

          </div>



          {(emergencyCount > 0 || seniorCount > 0) && (

            <div className="space-y-2">

              {emergencyCount > 0 && (

                <div className="flex items-center space-x-2 text-sm">

                  <AlertTriangle className="h-4 w-4 text-destructive animate-emergency-flash" />

                  <span className="text-destructive font-medium">

                    {emergencyCount} Emergency case{emergencyCount !== 1 ? "s" : ""}

                  </span>

                </div>

              )}

              {seniorCount > 0 && (

                <div className="flex items-center space-x-2 text-sm">

                  <Users className="h-4 w-4 text-priority" />

                  <span className="text-priority font-medium">

                    {seniorCount} Senior citizen{seniorCount !== 1 ? "s" : ""}

                  </span>

                </div>

              )}

            </div>

          )}



          <div className="pt-2 border-t border-border">

            <div className="flex justify-between text-sm text-muted-foreground">

              <span>Served Today</span>

              <span className="font-medium">{department.totalServed}</span>

            </div>

          </div>

        </CardContent>

      </Card>

    );

  };



  return (

    <div className="pt-20 pb-16 min-h-screen bg-background">

      <div className="container mx-auto px-4">

        <div className="text-center mb-8 animate-fade-in">

          <div className="flex justify-center mb-4">

            <div className="bg-primary/10 p-3 rounded-full">

              <Monitor className="h-8 w-8 text-primary" />

            </div>

          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">Queue Status Board</h1>

          <div className="text-lg text-muted-foreground">

            {currentTime.toLocaleString()}

          </div>

        </div>



        {/* Statistics Overview */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          <Card className="text-center p-4">

            <div className="text-2xl font-bold text-primary">{stats.totalPatients}</div>

            <div className="text-sm text-muted-foreground">Total Patients</div>

          </Card>

          <Card className="text-center p-4">

            <div className="text-2xl font-bold text-secondary">{stats.totalServedToday}</div>

            <div className="text-sm text-muted-foreground">Served Today</div>

          </Card>

          <Card className="text-center p-4">

            <div className="text-2xl font-bold text-accent">{stats.averageWaitTime}m</div>

            <div className="text-sm text-muted-foreground">Avg Wait Time</div>

          </Card>

          <Card className="text-center p-4">

            <div className="text-2xl font-bold text-priority">{stats.busiestDepartment}</div>

            <div className="text-sm text-muted-foreground">Busiest Dept</div>

          </Card>

        </div>



        <Tabs defaultValue="all" className="w-full">

          <TabsList className="grid w-full grid-cols-5 mb-8">

            <TabsTrigger value="all">All Departments</TabsTrigger>

            {departments.map((d) => (

              <TabsTrigger key={d.id} value={d.name}>{d.name}</TabsTrigger>

            ))}

          </TabsList>



          <TabsContent value="all">

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

              {departments.map((department) => (

                <DepartmentCard key={department.id} department={department} />

              ))}

            </div>

          </TabsContent>



          {departments.map((department) => (

            <TabsContent key={department.id} value={department.name}>

              <div className="max-w-md mx-auto">

                <DepartmentCard department={department} />



                <Card className="mt-6">

                  <CardHeader>

                    <CardTitle>Waiting Queue - {department.name}</CardTitle>

                  </CardHeader>

                  <CardContent>

                    <div className="space-y-3">

                      {department.waitingPatients.slice(0, 10).map((patient: any, index: number) => (

                        <div

                          key={patient.id}

                          className={`flex items-center justify-between p-3 rounded-lg ${

                            patient.isEmergency

                              ? "bg-destructive/10 border border-destructive/20"

                              : patient.isSeniorCitizen

                              ? "bg-priority/10 border border-priority/20"

                              : "bg-muted/30"

                          }`}

                        >

                          <div className="flex items-center space-x-3">

                            <div

                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${

                                patient.isEmergency

                                  ? "bg-destructive text-destructive-foreground"

                                  : patient.isSeniorCitizen

                                  ? "bg-priority text-priority-foreground"

                                  : "bg-primary text-primary-foreground"

                              }`}

                            >

                              {patient.tokenNumber}

                            </div>

                            <span className="font-medium">{patient.name}</span>

                          </div>

                          <div className="text-right">

                            <div className="text-sm text-muted-foreground">

                              {new Date(patient.registrationTime).toLocaleTimeString()}

                            </div>

                            {patient.isEmergency && (

                              <Badge variant="destructive" className="text-xs">Emergency</Badge>

                            )}

                            {patient.isSeniorCitizen && !patient.isEmergency && (

                              <Badge className="text-xs bg-priority text-priority-foreground">Senior</Badge>

                            )}

                          </div>

                        </div>

                      ))}

                      {department.waitingPatients.length === 0 && (

                        <div className="text-center text-muted-foreground py-8">

                          No patients waiting

                        </div>

                      )}

                    </div>

                  </CardContent>

                </Card>

              </div>

            </TabsContent>

          ))}

        </Tabs>

      </div>

    </div>

  );

};

