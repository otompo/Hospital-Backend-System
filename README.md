# Hospital Backend System: Design Documentation & Justification

## 1. Overview

This document provides an in-depth justification for the architectural and technological choices made in designing the hospital backend system. The system supports:

- **User authentication**
- **Patient-doctor assignments**
- **Encrypted doctor notes**
- **Dynamic scheduling**
- **LLM integration for automated medical insights**

---

## 2. Technology Stack & Justification

| Component             | Technology Used               | Justification                                                                            |
| --------------------- | ----------------------------- | ---------------------------------------------------------------------------------------- |
| **Backend Framework** | Node.js (Express.js)          | Fast, scalable, and event-driven, making it ideal for real-time healthcare applications. |
| **Database**          | MongoDB (Mongoose ORM)        | Flexible schema for dynamic patient-doctor relationships and unstructured medical notes. |
| **Authentication**    | JWT (JSON Web Token) + bcrypt | Ensures secure stateless authentication, widely used in modern web applications.         |
| **Encryption**        | AES-256 (crypto module)       | Industry-standard encryption to protect sensitive medical notes.                         |
| **Scheduling**        | node-cron                     | Allows automated patient reminders and scheduling of medical tasks.                      |
| **LLM Processing**    | OpenAI GPT-4 API              | AI-powered analysis of doctor notes for automated task extraction.                       |

---

## 3. Authentication & Security

### **Design Choice: JWT (JSON Web Token) & bcrypt**

✅ **Justification:**

- JWT allows stateless authentication, making it scalable and suitable for microservices.
- Passwords are hashed using bcrypt to prevent unauthorized access, ensuring compliance with security best practices.

✅ **Implementation:**

- Users authenticate using email and password.
- A signed JWT token is issued upon successful login.
- The token is included in Authorization headers for API access.
- Tokens expire after a set duration (e.g., **5 days**) to reduce security risks.

---

## 4. Patient-Doctor Assignment

### **Design Choice: Dynamic Assignments Using MongoDB**

✅ **Justification:**

- Doctors handle multiple patients, and patients can switch doctors if needed.
- MongoDB allows flexible storage and quick queries for patient-doctor relationships.

✅ **Implementation:**

- `Assignment` Schema tracks active patient-doctor relationships.
- Patients can request a doctor assignment via API.

---

## 5. Secure Storage & Encryption for Medical Notes

### **Design Choice: AES-256 Encryption**

✅ **Justification:**

- Ensures end-to-end encryption of sensitive medical data.
- Prevents unauthorized access, even if the database is compromised.

✅ **Implementation:**

- AES-256 encryption is applied before storing doctor notes in MongoDB.
- Only authorized users (**doctor & patient**) can decrypt notes.
- Decryption happens on-demand, reducing security risks.

---

## 6. Dynamic Scheduling for Medical Tasks & Reminders

### **Design Choice: node-cron for Automated Task Reminders**

✅ **Justification:**

- Ensures patients adhere to treatment schedules.
- Reduces administrative overhead by automating patient check-ins.
- Tasks reschedule automatically if a patient misses a check-in.

✅ **Implementation:**

- A **cron job** runs every hour, checking for upcoming reminders.
- If a reminder is due, a **notification** is sent to the patient.
- If the patient fails to check in, the system extends the reminder schedule.

---

## 7. LLM Integration for Actionable Medical Insights

### **Design Choice: OpenAI GPT-4 / Google Gemini for AI-powered Processing**

✅ **Justification:**

- Extracts key tasks and schedules from doctor notes.
- Reduces manual workload on doctors by automatically generating treatment plans.
- Enhances patient compliance by structuring tasks as checklists.

✅ **Implementation:**

- The **doctor submits a note** via API.
- The **LLM processes the note** to extract:
  - **Checklist**: Immediate actions (e.g., _"Buy medication"_).
  - **Plan**: Scheduled actions (e.g., _"Take medicine daily for 7 days"_).
- Extracted insights are stored in the database and used to create reminders.

---

# API Endpoints

## **Authentication & User Management**

Endpoints for user signup, login, and authentication.

- **User Registration**

  - `POST /api/auth/register`
  - Registers a new user (patient or doctor).

- **User Login**
  - `POST /api/auth/login`
  - Authenticates a user and returns an access token.

---

## **Doctor-Patient Assignment**

Endpoints for assigning doctors to patients.

- **Assign Doctor to Patient**

  - `POST /api/assign`
  - Allows patients to select a doctor for medical consultation.

- **Get My Assigned Doctors**
  - `GET /api/my-assigned-doctors`
  - Retrieves a list of doctors assigned to a specific patient.

---

## **Doctor Management**

Endpoints for doctors to retrieve their assigned patients.

- **Get All Doctors**

  - `GET /api/doctors`
  - Retrieves a list of all registered doctors.

- **Get Doctor’s Assigned Patients**
  - `GET /api/my-assigned-patients`
  - Fetches the list of patients assigned to a specific doctor.

---

## **Doctor Notes & Actionable Steps**

Endpoints for doctors to submit notes and manage follow-up actions.

- **Submit Doctor Notes**

  - `POST /api/doctor/notes`
  - Doctors submit notes about a patient’s condition and treatment plan.

- **Get Doctor’s Notes**

  - `GET /api/notes/doctor`
  - Retrieves a doctor’s submitted notes for review.

- **Get Patient Notes**
  - `GET /api/notes/patient`
  - Retrieves medical notes related to a specific patient.

---

## **Reminders & Follow-Ups**

Endpoints for retrieving and checking in on actionable steps.

- **Check-In for a Reminder**

  - `PATCH /api/reminders/:reminderId/check-in`
  - Patients mark a reminder as completed.

- **Retrieve All Reminders**
  - `GET /api/reminders`
  - Fetches all upcoming reminders and actionable steps.
