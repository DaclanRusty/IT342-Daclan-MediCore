package edu.cit.daclan.medicore.dto.response;

public class AvailableDoctorResponse {
    private Long   doctorId;
    private String firstname;
    private String lastname;
    private String specialization;
    private String email;

    public AvailableDoctorResponse() {}

    public Long   getDoctorId()         { return doctorId; }
    public String getFirstname()        { return firstname; }
    public String getLastname()         { return lastname; }
    public String getSpecialization()   { return specialization; }
    public String getEmail()            { return email; }

    public void setDoctorId(Long doctorId)             { this.doctorId = doctorId; }
    public void setFirstname(String firstname)         { this.firstname = firstname; }
    public void setLastname(String lastname)           { this.lastname = lastname; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public void setEmail(String email)                 { this.email = email; }
}