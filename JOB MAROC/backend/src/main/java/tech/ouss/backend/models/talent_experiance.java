package tech.ouss.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
//import models.talent;
import tech.ouss.backend.models.*;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class talent_experiance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int experiance_id;

    @ManyToOne
    @JsonBackReference("talent")
    @JoinColumn(name = "talent_id")
    private talent talent;

    @Column(name = "company_name")
    private String company_name;

    @Column(name = "job_title")
    private String job_title;

    @Column(name = "start_date")
    private String start_date;

    @Column(name = "end_date")
    private String end_date;

    @Column(name = "description")
    private String description;


}
