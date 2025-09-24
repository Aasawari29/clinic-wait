import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useQueue } from "@/hooks/useQueue";
import { UserPlus, CheckCircle } from "lucide-react";
import type { Patient } from "@/types/queue";

export const PatientRegistration = () => {
  const { toast } = useToast();
  const { registerPatient } = useQueue();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    department: "",
    visitType: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.name || !formData.age || !formData.gender || !formData.department || !formData.visitType) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all required fields."
        });
        return;
      }

      if (parseInt(formData.age) <= 0 || parseInt(formData.age) > 120) {
        toast({
          variant: "destructive", 
          title: "Invalid Age",
          description: "Please enter a valid age between 1 and 120."
        });
        return;
      }

      const patient = registerPatient({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender as Patient['gender'],
        department: formData.department as Patient['department'],
        visitType: formData.visitType as Patient['visitType']
      });

      setRegisteredPatient(patient);
      
      // Reset form
      setFormData({
        name: "",
        age: "",
        gender: "",
        department: "",
        visitType: ""
      });

      toast({
        title: "Registration Successful!",
        description: `Token ${patient.tokenNumber} assigned for ${patient.department} department.`,
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Please try again or contact support."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registeredPatient) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-lg">
          <Card className="shadow-lg border-primary/20 animate-fade-in">
            <CardHeader className="text-center bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16" />
              </div>
              <CardTitle className="text-2xl">Registration Successful!</CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <div className="bg-muted/50 rounded-lg p-6 mb-6">
                <div className="text-6xl font-bold text-primary mb-2">
                  {registeredPatient.tokenNumber}
                </div>
                <div className="text-lg text-muted-foreground">Your Token Number</div>
              </div>
              
              <div className="space-y-3 text-left mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-semibold">{registeredPatient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-semibold">{registeredPatient.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visit Type:</span>
                  <span className="font-semibold">{registeredPatient.visitType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <span className={`font-semibold ${
                    registeredPatient.isEmergency ? 'text-destructive' :
                    registeredPatient.isSeniorCitizen ? 'text-priority' : 'text-primary'
                  }`}>
                    {registeredPatient.isEmergency ? 'Emergency' :
                     registeredPatient.isSeniorCitizen ? 'Senior Citizen' : 'Normal'}
                  </span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground mb-6 p-4 bg-muted/30 rounded-lg">
                <strong>Please note:</strong> Keep your token number safe. 
                You will be called when it's your turn.
              </div>

              <Button 
                onClick={() => setRegisteredPatient(null)}
                className="w-full"
                variant="medical"
              >
                Register Another Patient
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-lg">
        <Card className="shadow-lg animate-fade-in">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-foreground">Patient Registration</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Enter age"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Gender *</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General OPD</SelectItem>
                    <SelectItem value="Diagnostics">Diagnostics</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitType">Visit Type *</Label>
                <Select value={formData.visitType} onValueChange={(value) => setFormData(prev => ({ ...prev, visitType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New Patient</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
                variant="medical"
                size="lg"
              >
                {isSubmitting ? "Registering..." : "Register Patient"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};