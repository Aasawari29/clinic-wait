import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Clock, Shield, Heart, Hospital } from "lucide-react";
import { useQueue } from "@/hooks/useQueue";

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

export const HeroSection = ({ onNavigate }: HeroSectionProps) => {

  const { getQueueStats, departments } = useQueue();
  const stats = getQueueStats();
  const activeDepartments = departments.filter(dept => dept.waitingCount > 0 || dept.totalServed > 0).length;

  const features = [
    {
      icon: Users,
      title: "Easy Registration",
      description: "Quick patient registration with smart queue management"
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Live queue status and estimated wait times"
    },
    {
      icon: Shield,
      title: "Priority Care",
      description: "Emergency and senior citizen priority handling"
    }
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-primary to-secondary p-4 rounded-full shadow-lg">
              <Hospital className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MediCare Hospital
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamlined healthcare with intelligent queue management. 
            Register, track your position, and receive priority care when needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="medical" 
              size="lg"
              onClick={() => onNavigate('register')}
              className="text-lg px-8 py-4"
            >
              Register Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onNavigate('queue')}
              className="text-lg px-8 py-4"
            >
              View Queue Status
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

        <div className="bg-card rounded-xl p-8 shadow-sm border border-border">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Smart Queue Management
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our advanced system automatically prioritizes emergency cases and senior citizens, 
                ensuring efficient and fair healthcare delivery for all patients.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Emergency Priority</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-priority rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Senior Citizen Priority</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Regular Queue</span>
                </div>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Queue Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average Wait Time</span>
                  {/* <span className="font-semibold text-foreground">15 mins</span> */}
                  <span className="font-semibold text-foreground">{stats.averageWaitTime || 0} mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patients Served Today</span>
                  {/* <span className="font-semibold text-foreground">247</span> */}
                  <span className="font-semibold text-foreground">{stats.totalServedToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Departments</span>
                  {/* <span className="font-semibold text-foreground">4</span> */}
                  <span className="font-semibold text-foreground">{activeDepartments}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};