package edu.cit.daclan.medicore.dto.response;

public class AuthResponse {

    private UserInfo user;
    private String accessToken;
    private String refreshToken;
    private String message;   // ← ADD THIS

    public AuthResponse() {}

    public UserInfo getUser()          { return user; }
    public String getAccessToken()     { return accessToken; }
    public String getRefreshToken()    { return refreshToken; }
    public String getMessage()         { return message; }

    public void setUser(UserInfo user)             { this.user = user; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public void setRefreshToken(String r)          { this.refreshToken = r; }
    public void setMessage(String message)         { this.message = message; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UserInfo user;
        private String accessToken, refreshToken, message;

        public Builder user(UserInfo u)            { this.user = u; return this; }
        public Builder accessToken(String t)       { this.accessToken = t; return this; }
        public Builder refreshToken(String t)      { this.refreshToken = t; return this; }
        public Builder message(String m)           { this.message = m; return this; }

        public AuthResponse build() {
            AuthResponse r = new AuthResponse();
            r.user         = this.user;
            r.accessToken  = this.accessToken;
            r.refreshToken = this.refreshToken;
            r.message      = this.message;
            return r;
        }
    }

    public static class UserInfo {
        private String email, firstname, lastname, role;

        public UserInfo() {}

        public String getEmail()     { return email; }
        public String getFirstname() { return firstname; }
        public String getLastname()  { return lastname; }
        public String getRole()      { return role; }

        public void setEmail(String e)     { this.email = e; }
        public void setFirstname(String f) { this.firstname = f; }
        public void setLastname(String l)  { this.lastname = l; }
        public void setRole(String r)      { this.role = r; }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String email, firstname, lastname, role;

            public Builder email(String e)     { this.email = e; return this; }
            public Builder firstname(String f) { this.firstname = f; return this; }
            public Builder lastname(String l)  { this.lastname = l; return this; }
            public Builder role(String r)      { this.role = r; return this; }

            public UserInfo build() {
                UserInfo u = new UserInfo();
                u.email     = this.email;
                u.firstname = this.firstname;
                u.lastname  = this.lastname;
                u.role      = this.role;
                return u;
            }
        }
    }
}