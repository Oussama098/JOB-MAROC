CREATE TABLE `role`
(
    role_id          INT AUTO_INCREMENT NOT NULL,
    role_name        VARCHAR(255) NULL,
    role_description VARCHAR(255) NULL,
    CONSTRAINT pk_role PRIMARY KEY (role_id)
);
CREATE TABLE user_entity
(
    user_id              BIGINT AUTO_INCREMENT NOT NULL,
    email                VARCHAR(255)          NOT NULL,
    first_name           VARCHAR(255)          NULL,
    last_name            VARCHAR(255)          NULL,
    password             VARCHAR(255)          NULL,
    role_id              INT                   NOT NULL,
    registration_date    datetime              NOT NULL,
    last_login_date      datetime              NOT NULL,
    deletation_date      datetime              NOT NULL,
    is_active            BIT(1)                NOT NULL,
    address              VARCHAR(255)          NOT NULL,
    nationality          VARCHAR(255)          NOT NULL,
    sexe                 CHAR                  NOT NULL,
    datenais             date                  NOT NULL,
    lieu                 VARCHAR(255)          NOT NULL,
    situation_familliale SMALLINT              NOT NULL,
    num_tel              VARCHAR(255)          NOT NULL,
    image_path           VARCHAR(255)          NOT NULL,
    is_accepted          SMALLINT              NOT NULL,
    cin                  VARCHAR(255)          NOT NULL,
    CONSTRAINT pk_user_entity PRIMARY KEY (user_id)
);

ALTER TABLE user_entity
    ADD CONSTRAINT FK_USER_ENTITY_ON_ROLE FOREIGN KEY (role_id) REFERENCES `role` (role_id);
CREATE TABLE talent
(
    talent_id INT AUTO_INCREMENT NOT NULL,
    user_id   BIGINT             NOT NULL,
    cv_path   VARCHAR(255)       NOT NULL,
    CONSTRAINT pk_talent PRIMARY KEY (talent_id)
);

ALTER TABLE talent
    ADD CONSTRAINT uc_talent_user UNIQUE (user_id);

ALTER TABLE talent
    ADD CONSTRAINT FK_TALENT_ON_USER FOREIGN KEY (user_id) REFERENCES user_entity (user_id);
CREATE TABLE skills
(
    id                INT AUTO_INCREMENT NOT NULL,
    talent_id         INT                NULL,
    skill_name        VARCHAR(255)       NULL,
    skill_level       INT                NULL,
    skill_description VARCHAR(255)       NULL,
    CONSTRAINT pk_skills PRIMARY KEY (id)
);

ALTER TABLE skills
    ADD CONSTRAINT FK_SKILLS_ON_TALENT FOREIGN KEY (talent_id) REFERENCES talent (talent_id);
CREATE TABLE experiance
(
    experiance_id INT AUTO_INCREMENT NOT NULL,
    talent_id     INT                NULL,
    company_name  VARCHAR(255)       NULL,
    job_title     VARCHAR(255)       NULL,
    start_date    VARCHAR(255)       NULL,
    end_date      VARCHAR(255)       NULL,
    `description` VARCHAR(255)       NULL,
    CONSTRAINT pk_experiance PRIMARY KEY (experiance_id)
);

ALTER TABLE experiance
    ADD CONSTRAINT FK_EXPERIANCE_ON_TALENT FOREIGN KEY (talent_id) REFERENCES talent (talent_id);
CREATE TABLE diplome
(
    diplome_id            INT AUTO_INCREMENT NOT NULL,
    talent_id             INT                NULL,
    diplome_name          VARCHAR(255)       NULL,
    diplome_description   VARCHAR(255)       NULL,
    diplome_date_debut    VARCHAR(255)       NULL,
    diplome_date_fin      VARCHAR(255)       NULL,
    diplome_etablissement VARCHAR(255)       NULL,
    CONSTRAINT pk_diplome PRIMARY KEY (diplome_id)
);

ALTER TABLE diplome
    ADD CONSTRAINT FK_DIPLOME_ON_TALENT FOREIGN KEY (talent_id) REFERENCES talent (talent_id);
ALTER TABLE user_entity
    MODIFY deletation_date datetime NULL;

ALTER TABLE user_entity
    MODIFY is_accepted SMALLINT NULL;
ALTER TABLE `role`
    ADD CONSTRAINT uc_role_role_name UNIQUE (role_name);

ALTER TABLE `role`
    MODIFY role_name VARCHAR(255) NOT NULL;
ALTER TABLE user_entity
    MODIFY last_login_date datetime NULL;

ALTER TABLE user_entity
    MODIFY registration_date datetime NULL;
ALTER TABLE user_entity
    ADD CONSTRAINT FK_USER_ENTITY_ON_ROLE FOREIGN KEY (role_id) REFERENCES `role` (role_id);