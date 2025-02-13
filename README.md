# API Endpoints

## Authentication & User Management

Endpoints for user signup, login, and authentication.

- **User Registration**

  - `POST /api/auth/register`
  - Registers a new user (patient or doctor).

- **User Login**
  - `POST /api/auth/login`
  - Authenticates a user and returns an access token.

## Doctor-Patient Assignment

Endpoints for assigning doctors to patients.

- **Assign Doctor to Patient**
  - `POST /api/assign`
  - Allows patients to select a doctor for medical consultation.

## Doctor Management

Endpoints for doctors to retrieve their assigned patients.

- **Get All Doctors**

  - `GET /api/doctors`
  - Retrieves a list of all registered doctors.

- **Get Doctor’s Assigned Patients**
  - `GET /api/my-assigned-patients`
  - Fetches the list of patients assigned to a specific doctor.

## Doctor Notes & Actionable Steps

Endpoints for doctors to submit notes and manage follow-up actions.

- **Submit Doctor Notes**

  - `POST /api/doctor/notes`
  - Doctors submit notes about a patient’s condition and treatment plan.

- **Get Doctor’s Notes**
  - `GET /api/notes/doctor`
  - Retrieves a doctor’s submitted notes for review.

## Reminders & Follow-Ups

Endpoints for retrieving and checking in on actionable steps.

- **Check-In for a Reminder**

  - `PATCH /api/reminders/:reminderId/check-in`
  - Patients mark a reminder as completed.

- **Retrieve All Reminders**
  - `GET /api/reminders`
  - Fetches all upcoming reminders and actionable steps.
