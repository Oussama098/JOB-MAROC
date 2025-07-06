package tech.ouss.backend.components;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Utility class for handling JWT (JSON Web Token) operations:
 * - Generation of tokens
 * - Validation of tokens
 * - Extraction of information (like username) from tokens
 * - Parsing tokens from HTTP requests
 */
@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    // Secret key for signing the JWT. Should be strong and kept secure.
    // Loaded from application.properties (or environment variables).
    @Value("${spring.app.jwtSecret}")
    private String jwtSecret;

    // Token expiration time in milliseconds.
    // Loaded from application.properties.
    @Value("${spring.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    /**
     * Generates a JWT token for the given authenticated user details.
     *
     * @param userDetails The UserDetails object representing the authenticated user.
     * @return A JWT string.
     */
    public String generateJwtToken(UserDetails userDetails) {
        String username = userDetails.getUsername();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        logger.debug("Generating JWT for user: {}, Expiration: {}", username, expiryDate);

        // Build the JWT token
        return Jwts.builder()
                .subject(username) // Set the subject (usually the username)
                .issuedAt(now) // Set the time the token was issued
                .expiration(expiryDate) // Set the expiration date/time
                .signWith(key(), Jwts.SIG.HS512) // Sign the token with the secret key using HS512
                .compact(); // Build and serialize the token to a compact string
    }

    /**
     * Extracts the username from a given JWT token.
     *
     * @param token The JWT token string.
     * @return The username contained within the token's subject claim.
     */
    public String getUserNameFromJwtToken(String token) {
        // Parse the token and extract the claims payload
        Claims claims = Jwts.parser()
                .verifyWith(key()) // Verify the signature using the secret key
                .build()
                .parseSignedClaims(token) // Parse the token string
                .getPayload(); // Get the claims payload

        // Return the subject claim (which should be the username)
        return claims.getSubject();
    }

    /**
     * Validates the integrity and expiration of a JWT token.
     *
     * @param authToken The JWT token string to validate.
     * @return true if the token is valid, false otherwise.
     */
    public boolean validateJwtToken(String authToken) {
        if (!StringUtils.hasText(authToken)) {
            logger.warn("JWT token string is empty or null.");
            return false;
        }
        try {
            // Attempt to parse the token. If successful, it means the signature is valid
            // and the token hasn't expired (parsing checks expiration by default).
            Jwts.parser()
                    .verifyWith(key()) // Specify the key for verification
                    .build()
                    .parseSignedClaims(authToken); // Parse and validate
            logger.debug("JWT token is valid.");
            return true;
        } catch (SignatureException e) {
            // Logged when the JWT signature does not match the expected signature.
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            // Logged when the JWT string is not correctly structured.
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            // Logged when the JWT has passed its expiration time.
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            // Logged when the JWT format or configuration is not supported.
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            // Logged when the JWT string is null, empty, or only whitespace.
            // This case might be caught earlier, but included for completeness.
            logger.error("JWT claims string is empty: {}", e.getMessage());
        } catch (Exception e) {
            // Catch any other unexpected exceptions during validation
            logger.error("Unexpected error validating JWT token: {}", e.getMessage());
        }

        // If any exception occurred, the token is invalid.
        return false;
    }

    /**
     * Parses the JWT token from the 'Authorization: Bearer <token>' header of an HTTP request.
     *
     * @param request The HttpServletRequest.
     * @return The token string or null if not found.
     */
    public String getJwtFromHeader(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        logger.debug("Authorization header: {}", bearerToken);
        // Check if the header exists and starts with "Bearer "
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            // Return the token part (substring after "Bearer ")
            return bearerToken.substring(7);
        }
        return null; // Return null if no valid Bearer token is found
    }


    /**
     * Generates the signing key from the base64 encoded secret string.
     * Uses HMAC-SHA algorithm (specifically HS512 in generateJwtToken).
     *
     * @return The SecretKey object used for signing and verification.
     */
    private SecretKey key() {
        // Decode the base64 encoded secret string from properties
        byte[] keyBytes = Decoders.BASE64.decode(this.jwtSecret);
        // Generate the SecretKey using HMAC-SHA algorithm
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
