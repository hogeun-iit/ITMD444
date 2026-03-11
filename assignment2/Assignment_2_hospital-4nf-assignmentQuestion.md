# Database Normalization Assignment

## Hospital Management System

### Assignment Description

You are tasked with designing a database for a hospital management system. The hospital needs to track doctors, their specializations, the departments they work in, the clinics they visit (as doctors can work at multiple affiliated clinics), patients they treat, and the medications they prescribe. Each patient can be treated by multiple doctors and can receive multiple prescriptions.

### Initial Unnormalized Table

```text
HOSPITAL_MANAGEMENT (
    DoctorID, DoctorName, DoctorPhone, DoctorEmail,
    Specialization1, Certification1, CertDate1,
    Specialization2, Certification2, CertDate2,
    DepartmentID, DepartmentName, DepartmentLocation, DepartmentHead,
    ClinicID, ClinicName, ClinicAddress, ClinicPhone,
    ConsultationDays, ConsultationHours,
    PatientID, PatientName, PatientDOB, PatientPhone, PatientEmail,
    PatientAddress, EmergencyContact, EmergencyPhone,
    Diagnosis, TreatmentDate,
    MedicationID, MedicationName, Dosage, Frequency,
    PrescriptionDate, PrescriptionEndDate
)
```

### Sample Data

```text
D101, "Dr. Sarah Smith", "555-0101", "smith@hospital.com",
"Cardiology", "ABIM-001", "2020-01-15",
"Internal Medicine", "ABIM-002", "2018-06-20",
DEPT01, "Cardiology Department", "Building A, Floor 3", "Dr. James Wilson",
CL01, "Downtown Clinic", "123 Main St", "555-9999",
"Mon,Wed,Fri", "9:00-17:00",
P1001, "John Doe", "1980-05-15", "555-1234", "john@email.com",
"456 Oak St", "Jane Doe", "555-5678",
"Hypertension", "2024-01-10",
MED101, "Lisinopril", "10mg", "Once daily",
"2024-01-10", "2024-07-10"
```

### Assignment Tasks

1. Identify all the problems with the current table structure in terms of normalization.
2. Convert the table to First Normal Form (1NF).
3. Convert the 1NF tables to Second Normal Form (2NF).
4. Convert the 2NF tables to Third Normal Form (3NF).
5. Convert the 3NF tables to Fourth Normal Form (4NF).
6. Create appropriate primary and foreign key constraints.
7. Write the DDL statements for the final 4NF schema.

### Sample Queries

1. Find all doctors with their specializations
2. Get complete prescription history for a patient
