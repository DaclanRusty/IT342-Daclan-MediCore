package edu.cit.daclan.medicore.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpiration;

    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // ── Basic token (email + role only) ───────────────────────────────────
    // Used by OAuth2LoginSuccessHandler — at that point we only have
    // the User entity, so we call the enriched overload below instead.
    public String generateAccessToken(String email, String role) {
        return generateAccessToken(email, role, "", "");
    }

    // ── Enriched token (email + role + name) ─────────────────────────────
    // Always prefer this overload so AuthCallbackPage can read
    // payload.firstname and payload.lastname without an extra API call.
    public String generateAccessToken(String email, String role,
                                      String firstname, String lastname) {
        return Jwts.builder()
                .subject(email)
                .claim("role",      role)
                .claim("firstname", firstname != null ? firstname : "")
                .claim("lastname",  lastname  != null ? lastname  : "")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}