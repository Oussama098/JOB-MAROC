-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 01 mai 2025 à 01:50
-- Version du serveur : 10.4.25-MariaDB
-- Version de PHP : 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `jobstudents`
--

-- --------------------------------------------------------

--
-- Structure de la table `diplome`
--

CREATE TABLE `diplome` (
  `diplome_id` int(11) NOT NULL,
  `talent_id` int(11) DEFAULT NULL,
  `diplome_name` varchar(255) DEFAULT NULL,
  `diplome_description` varchar(255) DEFAULT NULL,
  `diplome_date_debut` varchar(255) DEFAULT NULL,
  `diplome_date_fin` varchar(255) DEFAULT NULL,
  `diplome_etablissement` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `experiance`
--

CREATE TABLE `experiance` (
  `experiance_id` int(11) NOT NULL,
  `talent_id` int(11) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `job_title` varchar(255) DEFAULT NULL,
  `start_date` varchar(255) DEFAULT NULL,
  `end_date` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `role`
--

CREATE TABLE `role` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(255) NOT NULL,
  `role_description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `role`
--

INSERT INTO `role` (`role_id`, `role_name`, `role_description`) VALUES
(1, 'ADMIN', NULL),
(2, 'TALENT', NULL),
(3, 'GESTIONNAIRE', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `skills`
--

CREATE TABLE `skills` (
  `id` int(11) NOT NULL,
  `talent_id` int(11) DEFAULT NULL,
  `skill_name` varchar(255) DEFAULT NULL,
  `skill_level` int(11) DEFAULT NULL,
  `skill_description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `talent`
--

CREATE TABLE `talent` (
  `talent_id` int(11) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `cv_path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `user_entity`
--

CREATE TABLE `user_entity` (
  `user_id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role_id` int(11) NOT NULL,
  `registration_date` datetime DEFAULT NULL,
  `last_login_date` datetime DEFAULT NULL,
  `deletation_date` datetime DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `address` varchar(255) NOT NULL,
  `nationality` varchar(255) NOT NULL,
  `sexe` char(1) NOT NULL,
  `datenais` date NOT NULL,
  `lieu` varchar(255) NOT NULL,
  `situation_familliale` smallint(6) NOT NULL,
  `num_tel` varchar(255) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `is_accepted` smallint(6) DEFAULT NULL,
  `cin` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `user_entity`
--

INSERT INTO `user_entity` (`user_id`, `email`, `first_name`, `last_name`, `password`, `role_id`, `registration_date`, `last_login_date`, `deletation_date`, `is_active`, `address`, `nationality`, `sexe`, `datenais`, `lieu`, `situation_familliale`, `num_tel`, `image_path`, `is_accepted`, `cin`) VALUES
(1, 'iodsaodoasndosa', 'hamid', 'el bakri', '12345', 1, '2025-04-28 16:43:47', '2025-04-28 16:43:47', NULL, b'0', 'dbasjbksdabsa', 'marocaine', 'M', '2025-04-24', 'arbaoua', 1, '08219839321', 'ksadnndsla', NULL, 'GB273560');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `diplome`
--
ALTER TABLE `diplome`
  ADD PRIMARY KEY (`diplome_id`),
  ADD KEY `FK_DIPLOME_ON_TALENT` (`talent_id`);

--
-- Index pour la table `experiance`
--
ALTER TABLE `experiance`
  ADD PRIMARY KEY (`experiance_id`),
  ADD KEY `FK_EXPERIANCE_ON_TALENT` (`talent_id`);

--
-- Index pour la table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `uc_role_role_name` (`role_name`);

--
-- Index pour la table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_SKILLS_ON_TALENT` (`talent_id`);

--
-- Index pour la table `talent`
--
ALTER TABLE `talent`
  ADD PRIMARY KEY (`talent_id`),
  ADD UNIQUE KEY `uc_talent_user` (`user_id`);

--
-- Index pour la table `user_entity`
--
ALTER TABLE `user_entity`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `FK_USER_ENTITY_ON_ROLE` (`role_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `diplome`
--
ALTER TABLE `diplome`
  MODIFY `diplome_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `experiance`
--
ALTER TABLE `experiance`
  MODIFY `experiance_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `role`
--
ALTER TABLE `role`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `talent`
--
ALTER TABLE `talent`
  MODIFY `talent_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `user_entity`
--
ALTER TABLE `user_entity`
  MODIFY `user_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `diplome`
--
ALTER TABLE `diplome`
  ADD CONSTRAINT `FK_DIPLOME_ON_TALENT` FOREIGN KEY (`talent_id`) REFERENCES `talent` (`talent_id`);

--
-- Contraintes pour la table `experiance`
--
ALTER TABLE `experiance`
  ADD CONSTRAINT `FK_EXPERIANCE_ON_TALENT` FOREIGN KEY (`talent_id`) REFERENCES `talent` (`talent_id`);

--
-- Contraintes pour la table `skills`
--
ALTER TABLE `skills`
  ADD CONSTRAINT `FK_SKILLS_ON_TALENT` FOREIGN KEY (`talent_id`) REFERENCES `talent` (`talent_id`);

--
-- Contraintes pour la table `talent`
--
ALTER TABLE `talent`
  ADD CONSTRAINT `FK_TALENT_ON_USER` FOREIGN KEY (`user_id`) REFERENCES `user_entity` (`user_id`);

--
-- Contraintes pour la table `user_entity`
--
ALTER TABLE `user_entity`
  ADD CONSTRAINT `FK_USER_ENTITY_ON_ROLE` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
