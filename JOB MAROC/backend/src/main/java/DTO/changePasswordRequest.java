package DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class changePasswordRequest {
    private int userId;
    private String email;
    private String oldPassword;
    private String newPassword;

}
