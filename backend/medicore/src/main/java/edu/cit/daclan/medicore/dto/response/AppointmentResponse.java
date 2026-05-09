package edu.cit.daclan.medicore.dto.response;

public class AppointmentResponse {

    private Long      id;
    private String    requestedDate;
    private String    requestedTime;
    private String    reasonForVisit;
    private String    status;
    private DoctorInfo  doctor;
    private PatientInfo patient;   // ← NEW

    public AppointmentResponse() {}

    public Long        getId()            { return id; }
    public String      getRequestedDate() { return requestedDate; }
    public String      getRequestedTime() { return requestedTime; }
    public String      getReasonForVisit(){ return reasonForVisit; }
    public String      getStatus()        { return status; }
    public DoctorInfo  getDoctor()        { return doctor; }
    public PatientInfo getPatient()       { return patient; }   // ← NEW

    public void setId(Long id)                      { this.id = id; }
    public void setRequestedDate(String d)          { this.requestedDate = d; }
    public void setRequestedTime(String t)          { this.requestedTime = t; }
    public void setReasonForVisit(String r)         { this.reasonForVisit = r; }
    public void setStatus(String s)                 { this.status = s; }
    public void setDoctor(DoctorInfo d)             { this.doctor = d; }
    public void setPatient(PatientInfo p)           { this.patient = p; }   // ← NEW

    // ── Doctor nested DTO ──────────────────────────────────────────────────
    public static class DoctorInfo {
        private Long   doctorId;
        private String firstName;
        private String lastName;
        private String specialization;
        private String profilePicture;

        public DoctorInfo() {}

        public Long   getDoctorId()        { return doctorId; }
        public String getFirstName()       { return firstName; }
        public String getLastName()        { return lastName; }
        public String getSpecialization()  { return specialization; }
        public String getProfilePicture()  { return profilePicture; }

        public void setDoctorId(Long id)         { this.doctorId = id; }
        public void setFirstName(String f)       { this.firstName = f; }
        public void setLastName(String l)        { this.lastName = l; }
        public void setSpecialization(String s)  { this.specialization = s; }
        public void setProfilePicture(String p)  { this.profilePicture = p; }
    }

    // ── Patient nested DTO ─────────────────────────────────────────────────
    public static class PatientInfo {
        private Long   patientId;
        private String firstName;
        private String lastName;
        private String email;

        public PatientInfo() {}

        public Long   getPatientId()  { return patientId; }
        public String getFirstName()  { return firstName; }
        public String getLastName()   { return lastName; }
        public String getEmail()      { return email; }

        public void setPatientId(Long id)   { this.patientId = id; }
        public void setFirstName(String f)  { this.firstName = f; }
        public void setLastName(String l)   { this.lastName = l; }
        public void setEmail(String e)      { this.email = e; }
    }

    // ── Builder ────────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long        id;
        private String      requestedDate, requestedTime, reasonForVisit, status;
        private DoctorInfo  doctor;
        private PatientInfo patient;   // ← NEW

        public Builder id(Long id)                    { this.id = id;            return this; }
        public Builder requestedDate(String d)        { this.requestedDate = d;  return this; }
        public Builder requestedTime(String t)        { this.requestedTime = t;  return this; }
        public Builder reasonForVisit(String r)       { this.reasonForVisit = r; return this; }
        public Builder status(String s)               { this.status = s;         return this; }
        public Builder doctor(DoctorInfo d)           { this.doctor = d;         return this; }
        public Builder patient(PatientInfo p)         { this.patient = p;        return this; }   // ← NEW

        public AppointmentResponse build() {
            AppointmentResponse r = new AppointmentResponse();
            r.id            = this.id;
            r.requestedDate = this.requestedDate;
            r.requestedTime = this.requestedTime;
            r.reasonForVisit= this.reasonForVisit;
            r.status        = this.status;
            r.doctor        = this.doctor;
            r.patient       = this.patient;   // ← NEW
            return r;
        }
    }
}