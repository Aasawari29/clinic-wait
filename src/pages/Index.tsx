import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { PatientRegistration } from "@/components/PatientRegistration";
import { PatientDashboard } from "@/components/PatientDashboard";
import { QueueDisplay } from "@/components/QueueDisplay";
import { AdminPanel } from "@/components/AdminPanel";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");

  const renderSection = () => {
    switch (activeSection) {
      case "register":
        return <PatientRegistration />;
      case "dashboard":
        return <PatientDashboard />;
      case "queue":
        return <QueueDisplay />;
      case "admin":
        return <AdminPanel />;
      default:
        return <HeroSection onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      {renderSection()}
    </div>
  );
};

export default Index;
