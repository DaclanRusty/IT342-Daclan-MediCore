package edu.cit.daclan.medicore.shared.security;

import edu.cit.daclan.medicore.feature.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public OAuth2LoginSuccessHandler(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        // Guard: already redirected (e.g. committed response)
        if (response.isCommitted()) return;

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof OAuth2User oAuth2User)) {
            response.sendRedirect(frontendUrl +
                    "/auth/callback?error=" +
                    encode("Authentication failed: invalid principal type."));
            return;
        }

        try {
            // Returns an enriched JWT (email + role + firstname + lastname)
            String accessToken = authService.authenticateWithGoogleOAuth2User(oAuth2User);
            response.sendRedirect(frontendUrl +
                    "/auth/callback?token=" + encode(accessToken));

        } catch (IllegalArgumentException | IllegalStateException ex) {
            response.sendRedirect(frontendUrl +
                    "/auth/callback?error=" + encode(ex.getMessage()));
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value != null ? value : "Unknown error",
                StandardCharsets.UTF_8);
    }
}
