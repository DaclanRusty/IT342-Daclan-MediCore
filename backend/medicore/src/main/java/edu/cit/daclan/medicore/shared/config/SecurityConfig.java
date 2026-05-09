package edu.cit.daclan.medicore.shared.config;

import edu.cit.daclan.medicore.shared.security.JwtAuthFilter;
import edu.cit.daclan.medicore.shared.security.OAuth2LoginFailureHandler;
import edu.cit.daclan.medicore.shared.security.OAuth2LoginSuccessHandler;
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
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

                .authorizeHttpRequests(auth -> auth

                        // ── Public ────────────────────────────────────────────────
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .requestMatchers("/api/v1/health-tips").permitAll()

                        // ── Admin ─────────────────────────────────────────────────
                        .requestMatchers("/api/v1/admin/**").hasAuthority("ROLE_ADMIN")

                        // ── Doctor ────────────────────────────────────────────────
                        .requestMatchers("/api/v1/doctor/**").hasAuthority("ROLE_DOCTOR")
                        .requestMatchers("/api/v1/doctor/profile/picture").hasAuthority("ROLE_DOCTOR")

                        // ── Secretary ─────────────────────────────────────────────
                        .requestMatchers("/api/v1/secretary/**").hasAuthority("ROLE_SECRETARY")
                        .requestMatchers("/api/v1/secretary/profile/picture").hasAuthority("ROLE_SECRETARY")

                        // ── Patient profile picture ───────────────────────────────
                        .requestMatchers("/api/v1/patient/profile/picture").hasAuthority("ROLE_PATIENT")  // 👈 added

                        // ── Patient profile (GET + PUT) ───────────────────────────
                        .requestMatchers("/api/v1/patient/profile").hasAuthority("ROLE_PATIENT")

                        // ── Patient (all other patient routes) ────────────────────
                        .requestMatchers("/api/v1/patient/**").hasAuthority("ROLE_PATIENT")

                        // ── Doctors list ──────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/v1/doctors").hasAnyAuthority(
                                "ROLE_PATIENT", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/doctors/with-secretary")
                        .hasAnyAuthority("ROLE_PATIENT", "ROLE_ADMIN")

                        // ── Appointments ──────────────────────────────────────────
                        .requestMatchers("/api/v1/appointments/**").hasAnyAuthority(
                                "ROLE_SECRETARY", "ROLE_DOCTOR", "ROLE_PATIENT")

                        .anyRequest().authenticated()
                )

                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler(oAuth2LoginFailureHandler)
                )

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
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
