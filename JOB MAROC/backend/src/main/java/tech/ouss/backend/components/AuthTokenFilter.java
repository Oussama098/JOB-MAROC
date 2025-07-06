package tech.ouss.backend.components;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Custom JWT Authentication Filter.
 * This filter intercepts incoming requests once, extracts the JWT token from the
 * Authorization header, validates it, and sets the user authentication
 * in the Spring Security Context if the token is valid.
 */
// @Component // Remove @Component here if instantiated manually in SecurityConfig
public class AuthTokenFilter extends OncePerRequestFilter {

    // Use final fields and constructor injection - generally preferred
    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService; // Use the interface

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    /**
     * Constructor for dependency injection.
     * @param jwtUtils Utility class for JWT operations.
     * @param userDetailsService Service to load user-specific data.
     */
    // @Autowired // No need for @Autowired on constructor if dependencies are managed by Spring
    public AuthTokenFilter(JwtUtils jwtUtils, UserDetailsService userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Performs the filtering logic for JWT authentication.
     * Extracts token, validates it, loads user details, and sets authentication.
     *
     * @param request     The incoming servlet request.
     * @param response    The outgoing servlet response.
     * @param filterChain The filter chain.
     */
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        logger.debug("AuthTokenFilter executing for request: {}", request.getRequestURI());

        try {
            // 1. Parse JWT from the Authorization header
            String jwt = parseJwt(request);

            // 2. Validate the JWT
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                // 3. Extract username from the validated token
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                logger.debug("Username extracted from JWT: {}", username);

                // 4. Load UserDetails from the database
                // It's crucial that your UserDetailsService implementation handles UsernameNotFoundException
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // 5. Create an Authentication token
                // Use UsernamePasswordAuthenticationToken for standard Spring Security flow
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, // Principal
                                null,        // Credentials (not needed for JWT authentication)
                                userDetails.getAuthorities()); // Authorities (roles/permissions)

                // 6. Set additional details for the authentication
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 7. Set the Authentication object in the SecurityContext
                // This signifies that the current user is authenticated for the request duration
                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.debug("User '{}' authenticated successfully with roles: {}", username, userDetails.getAuthorities());
            } else {
                logger.debug("No valid JWT found in request header for URI: {}", request.getRequestURI());
            }
        } catch (Exception e) {
            // Log any exceptions during the authentication process
            logger.error("Cannot set user authentication: {}", e.getMessage());
            // Optionally log the stack trace for deeper debugging
            // logger.error("Authentication error details:", e);
        }

        // Continue the filter chain, regardless of whether authentication was set
        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the JWT token from the 'Authorization: Bearer <token>' header.
     *
     * @param request The incoming servlet request.
     * @return The JWT token string or null if not found or invalid format.
     */
    private String parseJwt(HttpServletRequest request) {
        // Get the Authorization header value
        String headerAuth = request.getHeader("Authorization");

        // Check if the header exists and starts with "Bearer "
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            // Extract the token part (substring after "Bearer ")
            String token = headerAuth.substring(7);
            logger.debug("Parsed JWT from header: {}", token);
            return token;
        }

        // Return null if the header is missing or doesn't have the Bearer prefix
        logger.debug("No JWT Bearer token found in Authorization header for URI: {}", request.getRequestURI());
        return null;
    }
}
