package tech.ouss.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "tech.ouss.backend")
public class backendApplication {

	public static void main(String[] args) {
		SpringApplication.run(backendApplication.class, args);
	}

}
