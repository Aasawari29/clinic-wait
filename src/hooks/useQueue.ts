import { useState, useEffect, useCallback } from 'react';
import { Patient, Department, QueueStats } from '@/types/queue';

const STORAGE_KEY = 'hospital_queue_data';

export const useQueue = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<Department[]>([
    { id: 'general', name: 'General', currentToken: null, nextToken: null, totalServed: 0, waitingCount: 0 },
    { id: 'diagnostics', name: 'Diagnostics', currentToken: null, nextToken: null, totalServed: 0, waitingCount: 0 },
    { id: 'emergency', name: 'Emergency', currentToken: null, nextToken: null, totalServed: 0, waitingCount: 0 },
    { id: 'pharmacy', name: 'Pharmacy', currentToken: null, nextToken: null, totalServed: 0, waitingCount: 0 },
  ]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const { patients: savedPatients, departments: savedDepartments } = JSON.parse(savedData);
        setPatients(savedPatients.map((p: Patient) => ({
          ...p,
          registrationTime: new Date(p.registrationTime)
        })));
        setDepartments(savedDepartments);
      } catch (error) {
        console.error('Error loading queue data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever patients or departments change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ patients, departments }));
  }, [patients, departments]);

  const generateTokenNumber = useCallback((department: string) => {
    const deptPatients = patients.filter(p => p.department.toLowerCase() === department.toLowerCase());
    return deptPatients.length + 1;
  }, [patients]);

  const registerPatient = useCallback((patientData: Omit<Patient, 'id' | 'tokenNumber' | 'registrationTime' | 'status' | 'priority' | 'isEmergency' | 'isSeniorCitizen'>) => {
    const tokenNumber = generateTokenNumber(patientData.department);
    const isEmergency = patientData.visitType === 'Emergency';
    const isSeniorCitizen = patientData.age >= 60;
    
    // Priority calculation: Emergency = 3, Senior = 2, Normal = 1
    let priority = 1;
    if (isEmergency) priority = 3;
    else if (isSeniorCitizen) priority = 2;

    const newPatient: Patient = {
      ...patientData,
      id: `${patientData.department.toLowerCase()}-${Date.now()}`,
      tokenNumber,
      registrationTime: new Date(),
      status: 'Waiting',
      priority,
      isEmergency,
      isSeniorCitizen,
    };

    setPatients(prev => [...prev, newPatient]);
    
    // Update department waiting count
    setDepartments(prev => prev.map(dept => 
      dept.name === patientData.department 
        ? { ...dept, waitingCount: dept.waitingCount + 1 }
        : dept
    ));

    return newPatient;
  }, [generateTokenNumber]);

  const getWaitingPatients = useCallback((department: string) => {
    return patients
      .filter(p => p.department === department && p.status === 'Waiting')
      .sort((a, b) => {
        // Sort by priority first, then by registration time
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.registrationTime.getTime() - b.registrationTime.getTime();
      });
  }, [patients]);

  const callNextPatient = useCallback((department: string) => {
    const waitingPatients = getWaitingPatients(department);
    if (waitingPatients.length === 0) return null;

    const nextPatient = waitingPatients[0];
    
    // Update patient status
    setPatients(prev => prev.map(p => 
      p.id === nextPatient.id ? { ...p, status: 'In Progress' } : p
    ));

    // Update department current and next tokens
    setDepartments(prev => prev.map(dept => {
      if (dept.name === department) {
        const remainingWaiting = waitingPatients.slice(1);
        return {
          ...dept,
          currentToken: nextPatient.tokenNumber,
          nextToken: remainingWaiting.length > 0 ? remainingWaiting[0].tokenNumber : null,
          waitingCount: dept.waitingCount - 1
        };
      }
      return dept;
    }));

    return nextPatient;
  }, [getWaitingPatients]);

  const completePatient = useCallback((patientId: string) => {
    setPatients(prev => prev.map(p => 
      p.id === patientId ? { ...p, status: 'Completed' } : p
    ));

    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setDepartments(prev => prev.map(dept => 
        dept.name === patient.department 
          ? { ...dept, totalServed: dept.totalServed + 1, currentToken: null }
          : dept
      ));
    }
  }, [patients]);

  const getQueueStats = useCallback((): QueueStats => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPatients = patients.filter(p => p.registrationTime >= today);
    const completedToday = todayPatients.filter(p => p.status === 'Completed');
    
    // Calculate average wait time for completed patients
    const totalWaitTime = completedToday.reduce((sum, patient) => {
      const waitTime = new Date().getTime() - patient.registrationTime.getTime();
      return sum + waitTime;
    }, 0);
    
    const averageWaitTime = completedToday.length > 0 ? totalWaitTime / completedToday.length / (1000 * 60) : 0; // in minutes

    // Find busiest department
    const deptCounts = departments.reduce((acc, dept) => {
      acc[dept.name] = dept.totalServed + dept.waitingCount;
      return acc;
    }, {} as Record<string, number>);
    
    const busiestDepartment = Object.keys(deptCounts).reduce((a, b) => 
      deptCounts[a] > deptCounts[b] ? a : b
    );

    return {
      totalPatients: todayPatients.length,
      averageWaitTime: Math.round(averageWaitTime),
      busiestDepartment,
      totalServedToday: completedToday.length,
    };
  }, [patients, departments]);

//   const getQueueStats = useCallback((): QueueStats => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
  
//   const todayPatients = patients.filter(p => p.registrationTime >= today);
//   const completedToday = todayPatients.filter(p => p.status === 'Completed');
//   const waitingPatients = patients.filter(p => p.status === 'Waiting');
//   const inProgressPatients = patients.filter(p => p.status === 'In Progress');
  
//   // Calculate more realistic average wait time
//   let averageWaitTime = 0;
  
//   if (waitingPatients.length === 0 && inProgressPatients.length === 0) {
//     // No queue - immediate service
//     averageWaitTime = 0;
//   } else if (waitingPatients.length <= 2) {
//     // Short queue - minimal wait
//     averageWaitTime = waitingPatients.length * 5; // 5 mins per patient ahead
//   } else {
//     // Calculate based on completed patients or estimate
//     if (completedToday.length > 0) {
//       const totalWaitTime = completedToday.reduce((sum, patient) => {
//         const waitTime = new Date().getTime() - patient.registrationTime.getTime();
//         return sum + waitTime;
//       }, 0);
//       averageWaitTime = totalWaitTime / completedToday.length / (1000 * 60); // in minutes
//     } else {
//       // Estimate based on queue length (10 mins per patient)
//       averageWaitTime = waitingPatients.length * 10;
//     }
//   }

//   // Find busiest department
//   const deptCounts = departments.reduce((acc, dept) => {
//     acc[dept.name] = dept.totalServed + dept.waitingCount;
//     return acc;
//   }, {} as Record<string, number>);
  
//   const busiestDepartment = Object.keys(deptCounts).reduce((a, b) => 
//     deptCounts[a] > deptCounts[b] ? a : b
//   );

//   return {
//     totalPatients: todayPatients.length,
//     averageWaitTime: Math.round(averageWaitTime),
//     busiestDepartment,
//     totalServedToday: completedToday.length,
//   };
// }, [patients, departments]);

  return {
    patients,
    departments,
    registerPatient,
    getWaitingPatients,
    callNextPatient,
    completePatient,
    getQueueStats,
  };
};