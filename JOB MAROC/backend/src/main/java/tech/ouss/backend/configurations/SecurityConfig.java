package tech.ouss.backend.configurations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import tech.ouss.backend.components.AuthEntryPointJwt;
import tech.ouss.backend.components.AuthTokenFilter;
import tech.ouss.backend.components.JwtUtils;
import tech.ouss.backend.services.CustomUserDetailsService;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Optional: enables @PreAuthorize, @PostAuthorize etc.
public class SecurityConfig {

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Autowired
    private CustomUserDetailsService userDetailsService; // Autowire your custom UserDetailsService

    // Utility class for JWT operations
    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Creates and configures the custom JWT authentication filter.
     * This filter is responsible for processing JWT tokens in requests.
     * @return AuthTokenFilter instance.
     */
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        // Instantiate the filter with its dependencies
        return new AuthTokenFilter(jwtUtils, userDetailsService);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService); // Set the custom user details service
        authProvider.setPasswordEncoder(passwordEncoder()); // Set the password encoder
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow requests from your React app's origin (e.g., http://localhost:5173)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://127.0.0.1:5173")); // Add other origins if needed
        // Allow common HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Allow standard headers and custom headers like Authorization
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type", "X-Requested-With"));
        // Allow credentials (like cookies or authorization headers)
        configuration.setAllowCredentials(true);
        // Set max age for pre-flight requests (OPTIONS)
        configuration.setMaxAge(3600L); // 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this CORS configuration to all paths
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


    /**
     * Configures the main security filter chain.
     * Defines which endpoints require authentication, session management policy,
     * exception handling, CORS, CSRF, and adds the custom JWT filter.
     * @param http HttpSecurity object to configure.
     * @return SecurityFilterChain instance.
     * @throws Exception If configuration fails.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Apply CORS configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Disable CSRF protection - common for stateless APIs (like JWT-based ones)
                .csrf(AbstractHttpConfigurer::disable)
                // Configure exception handling, specifically for authentication errors
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                // Configure session management to be STATELESS - essential for JWT
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Configure authorization rules for HTTP requests
                .authorizeHttpRequests(auth -> auth
                        // Permit access to the H2 database console (if used, common in dev)
                        .requestMatchers("/h2-console/**").permitAll()
                        // Permit access to the sign-in endpoint
                            .requestMatchers("/signin"   , "/google-signin" , "/manager/addNew" , "/talent/add").permitAll()
                        // Permit access to Swagger UI / API docs if you add them
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api/upload/image").permitAll()
                        .requestMatchers("/api/upload/cv").permitAll()
                        .anyRequest().authenticated()
                )
                // Configure the authentication provider
                .authenticationProvider(authenticationProvider())
                // Add the custom JWT filter before the standard UsernamePasswordAuthenticationFilter
                .addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class)
                // Configure headers, specifically for H2 console frame options if needed
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.sameOrigin()) // Allow H2 console to be embedded in a frame from the same origin
                );
        return http.build();
    }
}
