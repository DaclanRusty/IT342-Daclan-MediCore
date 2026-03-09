package edu.cit.daclan.medicore.dto.response;

public class AuthResponse {

    private UserInfo user;
    private String accessToken;
    private String refreshToken;

    public AuthResponse() {}

    public UserInfo getUser() { return user; }
    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public void setUser(UserInfo user) { this.user = user; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UserInfo user;
        private String accessToken, refreshToken;

        public Builder user(UserInfo user) { this.user = user; return this; }
        public Builder accessToken(String accessToken) { this.accessToken = accessToken; return this; }
        public Builder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }

        public AuthResponse build() {
            AuthResponse r = new AuthResponse();
            r.user = this.user;
            r.accessToken = this.accessToken;
            r.refreshToken = this.refreshToken;
            return r;
        }
    }

    public static class UserInfo {
        private String email, firstname, lastname, role;

        public UserInfo() {}

        public String getEmail() { return email; }
        public String getFirstname() { return firstname; }
        public String getLastname() { return lastname; }
        public String getRole() { return role; }
        public void setEmail(String email) { this.email = email; }
        public void setFirstname(String firstname) { this.firstname = firstname; }
        public void setLastname(String lastname) { this.lastname = lastname; }
        public void setRole(String role) { this.role = role; }

        public static UserInfoBuilder builder() { return new UserInfoBuilder(); }

        public static class UserInfoBuilder {
            private String email, firstname, lastname, role;

            public UserInfoBuilder email(String email) { this.email = email; return this; }
            public UserInfoBuilder firstname(String firstname) { this.firstname = firstname; return this; }
            public UserInfoBuilder lastname(String lastname) { this.lastname = lastname; return this; }
            public UserInfoBuilder role(String role) { this.role = role; return this; }

            public UserInfo build() {
                UserInfo u = new UserInfo();
                u.email = this.email;
                u.firstname = this.firstname;
                u.lastname = this.lastname;
                u.role = this.role;
                return u;
            }
        }
    }
}