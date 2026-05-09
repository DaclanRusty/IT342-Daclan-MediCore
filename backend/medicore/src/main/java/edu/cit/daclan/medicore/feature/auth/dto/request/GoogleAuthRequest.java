package edu.cit.daclan.medicore.feature.auth.dto.request;

public class GoogleAuthRequest {
    private String credential; // the Google ID token from frontend

    public GoogleAuthRequest() {}
    public String getCredential() { return credential; }
    public void setCredential(String credential) { this.credential = credential; }
}
