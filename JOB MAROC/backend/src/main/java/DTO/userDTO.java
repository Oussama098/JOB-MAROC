package DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import tech.ouss.backend.Enums.AcceptanceStatus;


@Data
@AllArgsConstructor
public class userDTO {
    private String username;
    private String password;
    // Role of the user (included in the login response)
    private String role;

    private AcceptanceStatus is_accepted;
    private String token;

    // Constructor for login request (username and password)
    public userDTO(String username, String password) {
        this.username = username;
        this.password = password;
    }



    public userDTO() {
    }

    public userDTO(String token){
        this.token = token;
    }
    // Constructor for login response (username, role, token)
    public userDTO(String username, String role, AcceptanceStatus is_accepted,String token) {
        this.username = username;
        this.role = role;
        this.token = token;
        this.is_accepted = is_accepted;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
