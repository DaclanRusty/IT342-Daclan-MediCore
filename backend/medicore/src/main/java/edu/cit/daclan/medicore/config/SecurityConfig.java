package edu.cit.daclan.medicore.config;

import edu.cit.daclan.medicore.security.JwtAuthFilter;
import edu.cit.daclan.medicore.security.OAuth2LoginFailureHandler;
import edu.cit.daclan.medicore.security.OAuth2LoginSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          @Lazy OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
                          OAuth2LoginFailureHandler oAuth2LoginFailureHandler) {
        this.jwtAuthFilter             = jwtAuthFilter;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        this.oAuth2LoginFailureHandler = oAuth2LoginFailureHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // IF_REQUIRED keeps OAuth2 redirect state working while staying
                // effectively stateless for all JWT API calls
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

                .authorizeHttpRequests(auth -> auth

                        // ── Public endpoints ──────────────────────────────────────────
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // ── OAuth2 redirect endpoints ─────────────────────────────────
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()

                        // ── Admin only ────────────────────────────────────────────────
                        .requestMatchers("/api/v1/admin/**").hasAuthority("ROLE_ADMIN")

                        // ── Doctor only ───────────────────────────────────────────────
                        .requestMatchers("/api/v1/doctor/**").hasAuthority("ROLE_DOCTOR")

                        // ── Secretary only ────────────────────────────────────────────
                        .requestMatchers("/api/v1/secretary/**").hasAuthority("ROLE_SECRETARY")

                        // ── Patient only ──────────────────────────────────────────────
                        .requestMatchers("/api/v1/patient/**").hasAuthority("ROLE_PATIENT")

                        // ── Doctor directory — patients and admins only ───────────────
                        // FIX: was missing, fell through to anyRequest().authenticated()
                        // which allowed any role but gave no explicit access control
                        .requestMatchers(HttpMethod.GET, "/api/v1/doctors").hasAnyAuthority(
                                "ROLE_PATIENT", "ROLE_ADMIN")

                        // ── Appointments — secretary + doctor + patient ───────────────
                        .requestMatchers("/api/v1/appointments/**").hasAnyAuthority(
                                "ROLE_SECRETARY", "ROLE_DOCTOR", "ROLE_PATIENT")

                        // ── Appointments — secretary + doctor + patient ───────────────────────
                        // Already in your config — no change needed for existing rule
                        .requestMatchers("/api/v1/appointments/**").hasAnyAuthority(
                                "ROLE_SECRETARY", "ROLE_DOCTOR", "ROLE_PATIENT")

                        .anyRequest().authenticated()
                )

                // ── OAuth2 Login ──────────────────────────────────────────────────
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler(oAuth2LoginFailureHandler)
                )

                // ── JWT filter ────────────────────────────────────────────────────
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:*"));
        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}