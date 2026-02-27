-- MySQL dump 10.13  Distrib 8.0.41, for macos15 (x86_64)
--
-- Host: localhost    Database: cleanup_db
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cleaner_offers`
--

DROP TABLE IF EXISTS `cleaner_offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cleaner_offers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `service_title` text COLLATE utf8mb4_unicode_ci,
  `service_description` text COLLATE utf8mb4_unicode_ci,
  `hourly_rate` decimal(10,0) DEFAULT NULL,
  `min_hours` int DEFAULT NULL,
  `service_area` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `cleaner_offers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cleaner_offers`
--

LOCK TABLES `cleaner_offers` WRITE;
/*!40000 ALTER TABLE `cleaner_offers` DISABLE KEYS */;
INSERT INTO `cleaner_offers` VALUES (1,7,'fzefez','fzefez',22,22,'dazd','pending'),(6,17,'Cleaning Kitchen','Cleaning Kitchen',10,2,NULL,'pending'),(16,9,'dzadze','dzedez',100,2,'dazdz','pending'),(19,25,'jkfe','vsdvd',11,11,'azf','pending'),(20,28,'Service','Hi',10,1,NULL,'pending');
/*!40000 ALTER TABLE `cleaner_offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cleaner_ratings`
--

DROP TABLE IF EXISTS `cleaner_ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cleaner_ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_id` int NOT NULL,
  `cleaner_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `rating` tinyint NOT NULL,
  `comment` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_job_customer` (`job_id`,`customer_id`),
  KEY `cleaner_id` (`cleaner_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `cleaner_ratings_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  CONSTRAINT `cleaner_ratings_ibfk_2` FOREIGN KEY (`cleaner_id`) REFERENCES `users` (`id`),
  CONSTRAINT `cleaner_ratings_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cleaner_ratings`
--

LOCK TABLES `cleaner_ratings` WRITE;
/*!40000 ALTER TABLE `cleaner_ratings` DISABLE KEYS */;
INSERT INTO `cleaner_ratings` VALUES (1,16,7,2,5,NULL,'2025-12-06 16:28:11'),(2,15,7,2,2,NULL,'2025-12-06 16:28:14'),(3,14,7,2,5,NULL,'2025-12-06 16:28:26'),(4,13,7,2,5,NULL,'2025-12-06 16:28:27'),(5,12,7,2,5,NULL,'2025-12-06 16:28:28'),(6,9,7,2,5,NULL,'2025-12-06 16:28:29'),(7,5,7,2,5,NULL,'2025-12-06 16:28:30'),(8,6,7,2,5,NULL,'2025-12-06 16:28:31'),(9,3,7,2,5,NULL,'2025-12-06 16:28:32'),(10,18,19,2,2,'Bof','2025-12-06 16:38:54'),(11,19,19,2,5,NULL,'2025-12-06 16:54:27'),(12,20,19,2,4,'dazed','2025-12-06 16:57:02'),(13,21,19,2,5,'dazd','2025-12-06 17:03:38'),(14,22,7,2,5,'GOoddd','2025-12-06 17:29:17'),(15,17,7,2,5,NULL,'2025-12-06 18:42:02'),(16,4,7,2,5,NULL,'2025-12-06 18:42:11'),(17,23,7,2,3,NULL,'2025-12-06 21:40:04'),(18,26,7,21,5,NULL,'2025-12-06 22:03:53'),(19,25,7,2,5,NULL,'2025-12-06 22:55:28'),(20,24,7,2,5,NULL,'2025-12-06 22:55:29'),(21,34,7,2,5,NULL,'2025-12-07 00:37:51'),(22,33,9,2,5,NULL,'2025-12-07 00:37:52'),(23,32,9,2,5,NULL,'2025-12-07 00:37:53'),(24,31,9,2,5,NULL,'2025-12-07 00:37:54'),(25,30,9,2,5,NULL,'2025-12-07 00:37:54'),(26,29,9,2,5,NULL,'2025-12-07 00:37:55'),(27,27,9,2,5,NULL,'2025-12-07 00:37:56'),(28,36,19,18,5,NULL,'2025-12-07 14:29:55'),(29,37,19,18,3,'fzef','2025-12-07 14:55:53'),(30,39,25,24,5,NULL,'2025-12-07 16:45:05'),(31,40,25,24,5,NULL,'2025-12-07 17:07:36'),(32,41,25,24,5,NULL,'2025-12-07 17:13:01'),(33,42,25,24,5,NULL,'2025-12-07 17:13:03'),(34,44,28,29,5,'Very good !!!','2025-12-08 14:22:04'),(35,47,9,29,5,NULL,'2025-12-08 19:15:16'),(36,46,9,29,5,NULL,'2025-12-08 19:15:17'),(37,45,28,29,5,NULL,'2025-12-08 19:15:18'),(38,49,28,29,1,'Bad','2025-12-09 13:13:45'),(39,50,28,29,5,'hvgk','2025-12-09 16:28:08'),(40,48,28,2,5,'good','2025-12-09 19:40:58'),(41,51,28,2,1,'Very bad','2025-12-09 21:11:48'),(42,52,28,2,1,'Bad','2025-12-09 23:23:41'),(43,53,28,2,4,'Goodd','2025-12-09 23:41:17'),(44,54,28,2,1,NULL,'2025-12-10 00:24:02'),(45,55,28,2,5,'Thierry','2025-12-10 14:06:42');
/*!40000 ALTER TABLE `cleaner_ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cleaner_slots`
--

DROP TABLE IF EXISTS `cleaner_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cleaner_slots` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cleaner_id` bigint unsigned NOT NULL,
  `customer_id` bigint unsigned DEFAULT NULL,
  `service_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slot_date` date NOT NULL,
  `slot_time` time NOT NULL,
  `duration_hours` int NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price_total` decimal(10,2) NOT NULL,
  `status` enum('open','accepted','declined','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slots_cleaner` (`cleaner_id`),
  KEY `idx_slots_customer` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cleaner_slots`
--

LOCK TABLES `cleaner_slots` WRITE;
/*!40000 ALTER TABLE `cleaner_slots` DISABLE KEYS */;
INSERT INTO `cleaner_slots` VALUES (1,7,2,'Cleanng','0101-10-10','10:10:00',2,'22',2.00,'accepted','2025-12-06 18:40:56'),(2,7,2,'Thierryyyyyleboss','2035-12-07','12:12:00',3,'Thieryry',100.00,'accepted','2025-12-06 18:43:12'),(3,19,18,'Thierry cleaning','2025-12-06','20:00:00',3,'Thierry rue',10.00,'accepted','2025-12-06 18:52:25'),(4,19,NULL,'PF','1111-01-01','11:11:00',1,'1&',11.00,'declined','2025-12-06 19:09:16'),(5,19,2,'E2E2','0112-02-12','12:12:00',12,'12',12.00,'accepted','2025-12-06 19:10:31'),(6,19,NULL,'AZZ','0011-11-11','11:11:00',1,'1',1.00,'declined','2025-12-06 19:16:04'),(7,19,NULL,'djkze','1818-12-08','11:11:00',1,'dz',1.00,'declined','2025-12-06 19:16:51'),(8,19,2,'azdazd','0011-11-11','01:01:00',11,'1',1.00,'accepted','2025-12-06 19:19:57'),(9,19,2,'azeaze','0011-11-11','01:01:00',11,'1',1.00,'accepted','2025-12-06 19:20:23'),(10,19,2,'azeaze','1111-11-11','11:11:00',1,'11',1.00,'accepted','2025-12-06 19:25:17'),(11,19,2,'Thierry le boss','2025-12-07','11:11:00',1,'1',1.00,'accepted','2025-12-06 19:26:06'),(12,19,2,'azeaz','1111-11-11','11:11:00',11,'111',11.00,'accepted','2025-12-06 19:29:53'),(13,7,2,'Tihhhe','2025-12-24','12:00:00',2,'22',222.00,'accepted','2025-12-06 21:46:57'),(14,9,2,'azdazd','0011-11-11','11:11:00',22,'zd',10.00,'accepted','2025-12-06 22:56:31'),(15,7,2,'101010','0011-11-11','11:11:00',12,'A',10.00,'accepted','2025-12-06 23:28:59'),(16,7,2,'fzezfe','0222-02-22','22:22:00',22,'22',22.00,'accepted','2025-12-07 00:05:53'),(17,7,2,'azeaze','0011-11-11','11:11:00',1,'11',9999999.00,'accepted','2025-12-07 00:40:11'),(18,23,22,'Thh','1111-11-11','11:11:00',1,'1',100.00,'accepted','2025-12-07 00:45:14'),(19,7,18,'Thierry','3000-10-10','10:10:00',12,'1',122.00,'accepted','2025-12-07 14:07:43'),(20,7,18,'rzrz','1331-03-11','11:11:00',1,'1',1.00,'accepted','2025-12-07 14:07:52');
/*!40000 ALTER TABLE `cleaner_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `cleaner_id` int NOT NULL,
  `job_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_conv` (`customer_id`,`cleaner_id`,`job_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,18,19,NULL,'2025-12-06 18:52:31'),(4,21,7,NULL,'2025-12-06 22:03:28'),(6,1,9,NULL,'2025-12-06 23:18:51'),(7,22,23,NULL,'2025-12-07 00:44:29'),(8,18,7,NULL,'2025-12-07 14:28:59'),(12,24,25,NULL,'2025-12-07 17:58:21'),(21,2,28,NULL,'2025-12-10 14:04:46');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_settings`
--

DROP TABLE IF EXISTS `customer_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_settings` (
  `customer_id` int NOT NULL,
  `address_line` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_zip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_last4` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pref_products` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pref_pets` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pref_language` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pref_access` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`customer_id`),
  CONSTRAINT `fk_settings_user` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_settings`
--

LOCK TABLES `customer_settings` WRITE;
/*!40000 ALTER TABLE `customer_settings` DISABLE KEYS */;
INSERT INTO `customer_settings` VALUES (2,'azeaze','aze','aze','aze','aze','No preference','Pets at home','English','azeaze'),(18,'azd','azdaz','azdza',NULL,NULL,NULL,NULL,NULL,NULL),(24,'hviukb','kjb',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `customer_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_responses`
--

DROP TABLE IF EXISTS `job_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_responses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_id` int NOT NULL,
  `cleaner_id` int NOT NULL,
  `response` enum('accepted','declined') COLLATE utf8mb4_unicode_ci NOT NULL,
  `responded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_job_cleaner` (`job_id`,`cleaner_id`),
  KEY `cleaner_id` (`cleaner_id`),
  CONSTRAINT `job_responses_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  CONSTRAINT `job_responses_ibfk_2` FOREIGN KEY (`cleaner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_responses`
--

LOCK TABLES `job_responses` WRITE;
/*!40000 ALTER TABLE `job_responses` DISABLE KEYS */;
INSERT INTO `job_responses` VALUES (1,2,7,'accepted','2025-12-02 15:12:20'),(2,1,7,'accepted','2025-12-02 15:12:25'),(8,3,7,'accepted','2025-12-02 15:25:14'),(11,4,7,'accepted','2025-12-02 15:26:54'),(12,5,7,'accepted','2025-12-02 15:33:25'),(17,6,7,'accepted','2025-12-02 15:33:27'),(18,7,7,'declined','2025-12-02 15:47:04'),(19,8,7,'declined','2025-12-02 15:47:05'),(20,8,14,'accepted','2025-12-02 15:48:33'),(21,7,14,'declined','2025-12-02 15:48:35'),(22,7,17,'declined','2025-12-02 17:52:19'),(23,9,7,'accepted','2025-12-02 18:01:56'),(24,10,7,'declined','2025-12-02 18:01:56'),(25,10,9,'declined','2025-12-02 18:02:46'),(26,7,9,'declined','2025-12-02 18:02:46'),(27,11,7,'declined','2025-12-06 13:10:41'),(28,12,7,'accepted','2025-12-06 13:48:28'),(29,11,9,'declined','2025-12-06 13:49:02'),(30,13,7,'accepted','2025-12-06 15:30:49'),(31,14,7,'accepted','2025-12-06 15:57:47'),(32,15,7,'accepted','2025-12-06 16:12:40'),(33,16,7,'accepted','2025-12-06 16:19:42'),(34,17,7,'accepted','2025-12-06 16:34:10'),(35,18,19,'accepted','2025-12-06 16:38:30'),(36,11,19,'declined','2025-12-06 16:38:33'),(37,10,19,'declined','2025-12-06 16:38:34'),(38,7,19,'declined','2025-12-06 16:38:34'),(39,19,19,'accepted','2025-12-06 16:54:18'),(40,20,19,'accepted','2025-12-06 16:56:49'),(41,21,19,'accepted','2025-12-06 17:03:29'),(42,22,7,'accepted','2025-12-06 17:29:03'),(43,23,7,'accepted','2025-12-06 21:39:14'),(44,24,7,'accepted','2025-12-06 21:46:28'),(45,25,7,'accepted','2025-12-06 22:02:17'),(46,26,7,'accepted','2025-12-06 22:03:28'),(47,27,9,'accepted','2025-12-06 22:57:00'),(48,29,9,'accepted','2025-12-06 23:18:50'),(49,28,9,'accepted','2025-12-06 23:18:51'),(50,30,9,'accepted','2025-12-06 23:19:04'),(51,31,9,'accepted','2025-12-06 23:22:05'),(52,32,9,'accepted','2025-12-06 23:27:29'),(53,33,9,'accepted','2025-12-06 23:27:45'),(54,34,7,'accepted','2025-12-06 23:28:25'),(55,11,23,'declined','2025-12-07 00:44:26'),(56,10,23,'declined','2025-12-07 00:44:26'),(57,7,23,'declined','2025-12-07 00:44:28'),(58,35,23,'accepted','2025-12-07 00:44:29'),(59,36,19,'accepted','2025-12-07 14:29:42'),(60,37,19,'accepted','2025-12-07 14:48:00'),(61,11,25,'declined','2025-12-07 14:58:32'),(62,10,25,'declined','2025-12-07 14:58:32'),(63,7,25,'declined','2025-12-07 14:58:33'),(64,38,7,'accepted','2025-12-07 16:36:05'),(65,39,25,'accepted','2025-12-07 16:37:51'),(66,40,25,'accepted','2025-12-07 16:45:37'),(67,41,25,'accepted','2025-12-07 17:07:19'),(68,42,25,'accepted','2025-12-07 17:12:22'),(69,43,25,'accepted','2025-12-07 17:58:21'),(70,11,28,'declined','2025-12-08 14:20:07'),(71,10,28,'declined','2025-12-08 14:20:08'),(72,7,28,'declined','2025-12-08 14:20:09'),(73,44,28,'accepted','2025-12-08 14:20:33'),(74,45,28,'accepted','2025-12-08 19:14:01'),(75,46,28,'declined','2025-12-08 19:14:28'),(76,46,9,'accepted','2025-12-08 19:14:38'),(77,47,9,'accepted','2025-12-08 19:15:06'),(78,48,28,'accepted','2025-12-09 02:21:30'),(79,49,28,'accepted','2025-12-09 13:12:12'),(80,50,28,'accepted','2025-12-09 16:27:33'),(81,51,28,'accepted','2025-12-09 21:10:37'),(82,52,28,'accepted','2025-12-09 23:22:45'),(83,53,28,'accepted','2025-12-09 23:40:33'),(84,54,28,'accepted','2025-12-10 00:22:41'),(85,55,28,'accepted','2025-12-10 14:04:46');
/*!40000 ALTER TABLE `job_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `service_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frequency` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'One-time',
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `job_date` date NOT NULL,
  `job_time` time NOT NULL,
  `duration_hours` int NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('open','assigned','done') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `assigned_cleaner_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_at` timestamp NULL DEFAULT NULL,
  `price_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `customer_hourly_rate` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `assigned_cleaner_id` (`assigned_cleaner_id`),
  CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `jobs_ibfk_2` FOREIGN KEY (`assigned_cleaner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES (1,15,'Regular cleaning','One-time','zefzef','0012-02-12','21:12:00',2,'fe','done',7,'2025-12-02 15:12:03',NULL,0.00,NULL),(2,15,'Regular cleaning','One-time','zefzef','0012-02-12','21:12:00',2,'fe','done',7,'2025-12-02 15:12:03',NULL,0.00,NULL),(3,2,'Regular cleaning','One-time','Thierry','1011-01-01','11:11:00',2,'zefz','done',7,'2025-12-02 15:24:54','2025-12-02 15:26:32',0.00,NULL),(4,2,'Regular cleaning','One-time','Thierry','1011-01-01','11:11:00',2,'zefz','done',7,'2025-12-02 15:24:54','2025-12-02 15:26:54',0.00,NULL),(5,2,'Regular cleaning','One-time','azdzed','0101-10-10','11:10:00',5,NULL,'done',7,'2025-12-02 15:33:05','2025-12-02 15:33:26',0.00,NULL),(6,2,'Regular cleaning','One-time','azdzed','0101-10-10','11:10:00',5,NULL,'done',7,'2025-12-02 15:33:05','2025-12-02 15:33:27',0.00,NULL),(7,2,'Regular cleaning','One-time','ezfze','0001-11-11','11:11:00',2,NULL,'open',NULL,'2025-12-02 15:46:58',NULL,0.00,NULL),(8,2,'Regular cleaning','One-time','ezfze','0001-11-11','11:11:00',2,NULL,'assigned',14,'2025-12-02 15:46:58','2025-12-02 15:48:33',0.00,NULL),(9,2,'Move‑out clean','One-time','Thei','1010-10-10','10:10:00',5,NULL,'done',7,'2025-12-02 18:01:27','2025-12-02 18:01:56',0.00,NULL),(10,2,'Move‑out clean','One-time','Thei','1010-10-10','10:10:00',5,NULL,'open',NULL,'2025-12-02 18:01:27',NULL,0.00,NULL),(11,2,'Windows','One-time','azd','1221-02-12','12:12:00',2,NULL,'open',NULL,'2025-12-02 18:06:17',NULL,0.00,NULL),(12,2,'Ironing','One-time','10 rue Paris','2004-12-06','11:00:00',2,'Toque a la porte connard','done',7,'2025-12-06 13:47:36','2025-12-06 13:48:28',0.00,NULL),(13,2,'Regular cleaning','One-time','Thierry','2004-01-01','11:11:00',4,NULL,'done',7,'2025-12-06 15:30:43','2025-12-06 15:30:49',0.00,NULL),(14,2,'Regular cleaning','One-time','Thierry DU','2025-12-07','10:10:00',2,NULL,'done',7,'2025-12-06 15:57:41','2025-12-06 15:57:47',0.00,NULL),(15,2,'Regular cleaning','One-time','Stephaene','2025-12-06','16:30:00',2,NULL,'done',7,'2025-12-06 16:12:36','2025-12-06 16:12:40',0.00,NULL),(16,2,'Regular cleaning','One-time','zaefr','2025-12-06','16:00:00',2,NULL,'done',7,'2025-12-06 16:19:38','2025-12-06 16:19:42',0.00,NULL),(17,2,'Regular cleaning','One-time','azrazerez','2025-12-06','16:00:00',2,NULL,'done',7,'2025-12-06 16:34:02','2025-12-06 16:34:10',0.00,NULL),(18,2,'Regular cleaning','One-time','Theiryryry','1011-01-01','10:10:00',2,NULL,'done',19,'2025-12-06 16:37:44','2025-12-06 16:38:30',0.00,NULL),(19,2,'Regular cleaning','One-time','azertt','1111-08-13','13:31:00',2,NULL,'done',19,'2025-12-06 16:54:16','2025-12-06 16:54:18',0.00,NULL),(20,2,'Regular cleaning','One-time','zadazd','1010-10-10','01:01:00',2,NULL,'done',19,'2025-12-06 16:56:45','2025-12-06 16:56:49',0.00,NULL),(21,2,'Regular cleaning','One-time','azeazeaz','1010-10-10','10:10:00',2,NULL,'done',19,'2025-12-06 17:03:19','2025-12-06 17:03:29',0.00,NULL),(22,2,'Regular cleaning','One-time','Thierryyyyyy','1111-01-01','12:22:00',3,NULL,'done',7,'2025-12-06 17:28:38','2025-12-06 17:29:03',0.00,NULL),(23,2,'Regular cleaning','One-time','dazdz','1111-12-19','11:11:00',2,NULL,'done',7,'2025-12-06 21:38:54','2025-12-06 21:39:14',0.00,NULL),(24,2,'Move‑out clean','One-time','Rue de la fayette','2025-12-10','10:00:00',5,NULL,'done',7,'2025-12-06 21:46:24','2025-12-06 21:46:28',0.00,NULL),(25,2,'Regular cleaning','One-time','Thierry','2004-10-05','10:10:00',2,NULL,'done',7,'2025-12-06 22:02:12','2025-12-06 22:02:17',0.00,NULL),(26,21,'Regular cleaning','One-time','PDPD','2004-12-05','10:10:00',2,NULL,'done',7,'2025-12-06 22:03:24','2025-12-06 22:03:28',0.00,NULL),(27,2,'Regular cleaning','One-time','azeaze','0011-11-11','11:11:00',3,NULL,'done',9,'2025-12-06 22:56:55','2025-12-06 22:57:00',0.00,NULL),(28,1,'Regular cleaning','One-time','10 Downing St','2025-12-07','14:00:00',2,'Some notes','done',9,'2025-12-06 23:13:56','2025-12-06 23:18:51',50.00,NULL),(29,2,'Regular cleaning','One-time','111','0111-11-11','11:11:00',2,NULL,'done',9,'2025-12-06 23:18:41','2025-12-06 23:18:50',0.00,NULL),(30,2,'Regular cleaning','One-time','111','0111-11-11','11:11:00',2,NULL,'done',9,'2025-12-06 23:19:00','2025-12-06 23:19:04',0.00,NULL),(31,2,'Regular cleaning','One-time','11111','0011-11-11','11:01:00',2,NULL,'done',9,'2025-12-06 23:22:01','2025-12-06 23:22:05',99999.00,NULL),(32,2,'Regular cleaning','One-time','fezfez','1111-11-11','11:11:00',2,NULL,'done',9,'2025-12-06 23:27:22','2025-12-06 23:27:29',11111.00,NULL),(33,2,'Regular cleaning','One-time','fezfez','1111-11-11','11:11:00',2,NULL,'done',9,'2025-12-06 23:27:39','2025-12-06 23:27:45',99999.00,NULL),(34,2,'Regular cleaning','One-time','fezfez','1111-11-11','11:11:00',2,NULL,'done',7,'2025-12-06 23:28:22','2025-12-06 23:28:25',10009.00,NULL),(35,22,'Regular cleaning','One-time','Thierry RUe','2025-01-01','10:00:00',2,NULL,'done',23,'2025-12-07 00:44:20','2025-12-07 00:44:29',0.00,NULL),(36,18,'Regular cleaning','One-time','DHOUZFU','0011-11-11','11:11:00',5,NULL,'done',19,'2025-12-07 14:29:35','2025-12-07 14:29:42',0.00,NULL),(37,18,'Regular cleaning','One-time','Thierry','1000-01-01','11:11:00',2,NULL,'done',19,'2025-12-07 14:41:10','2025-12-07 14:48:00',0.00,NULL),(38,2,'Regular cleaning','One-time','Thierry','3000-12-12','10:20:00',3,NULL,'assigned',7,'2025-12-07 16:35:59','2025-12-07 16:36:05',0.00,NULL),(39,24,'Windows','One-time','Thierry','3000-03-30','00:00:00',5,NULL,'done',25,'2025-12-07 16:37:37','2025-12-07 16:37:51',0.00,NULL),(40,24,'Regular cleaning','One-time','TYUI','1011-01-01','11:11:00',3,NULL,'done',25,'2025-12-07 16:45:32','2025-12-07 16:45:37',0.00,NULL),(41,24,'Regular cleaning','One-time','zadazd','1111-11-11','11:11:00',2,NULL,'done',25,'2025-12-07 17:07:15','2025-12-07 17:07:19',0.00,NULL),(42,24,'Regular cleaning','One-time','azeaze','9821-07-18','11:11:00',2,NULL,'done',25,'2025-12-07 17:12:17','2025-12-07 17:12:22',0.00,NULL),(43,24,'Regular cleaning','One-time','azeaze','1717-07-17','11:11:00',2,NULL,'assigned',25,'2025-12-07 17:57:54','2025-12-07 17:58:21',0.00,19.00),(44,29,'Regular cleaning','One-time','Thierry Adresse','2004-01-01','10:00:00',4,NULL,'done',28,'2025-12-08 14:19:35','2025-12-08 14:20:33',0.00,10.00),(45,29,'Regular cleaning','One-time','edeezaf','2222-02-12','22:22:00',5,NULL,'done',28,'2025-12-08 19:13:53','2025-12-08 19:14:01',0.00,100.00),(46,29,'Regular cleaning','One-time','edeezaf','2222-02-12','22:22:00',5,NULL,'done',9,'2025-12-08 19:14:22','2025-12-08 19:14:38',0.00,100.00),(47,29,'Regular cleaning','One-time','edeezaf','2222-02-12','22:22:00',5,NULL,'done',9,'2025-12-08 19:14:58','2025-12-08 19:15:06',0.00,100.00),(48,2,'Regular cleaning','One-time','dazd','1222-12-11','12:12:00',2,NULL,'done',28,'2025-12-09 02:21:23','2025-12-09 02:21:30',0.00,1221.00),(49,29,'Regular cleaning','One-time','Thierry','2025-12-09','10:00:00',5,'Be carefull dog inside ','done',28,'2025-12-09 13:11:53','2025-12-09 13:12:12',0.00,100.00),(50,29,'Regular cleaning','One-time','azeazea','1011-01-01','11:11:00',2,NULL,'done',28,'2025-12-09 16:27:05','2025-12-09 16:27:33',0.00,10.00),(51,2,'Regular cleaning','One-time','fuizeb','1011-01-01','10:01:00',2,NULL,'done',28,'2025-12-09 21:08:43','2025-12-09 21:10:38',0.00,10.00),(52,2,'Regular cleaning','One-time','ibra','2025-12-09','11:00:00',2,NULL,'done',28,'2025-12-09 23:22:23','2025-12-09 23:22:45',0.00,90.00),(53,2,'Regular cleaning','One-time','Adress','1010-10-10','10:10:00',2,NULL,'done',28,'2025-12-09 23:38:43','2025-12-09 23:40:33',0.00,18.00),(54,2,'Regular cleaning','One-time','Thierry','1111-01-01','10:00:00',2,NULL,'done',28,'2025-12-10 00:21:36','2025-12-10 00:22:41',0.00,90.00),(55,2,'Regular cleaning','One-time','Thierry','1000-01-01','10:00:00',2,NULL,'done',28,'2025-12-10 14:04:32','2025-12-10 14:04:46',0.00,20.00);
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `sender_role` enum('customer','cleaner') COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,18,'customer','Thiuerry ca va','2025-12-06 18:58:11'),(2,1,18,'customer','fbhzefjkbzrfjv','2025-12-06 18:58:31'),(3,1,18,'customer','ndajzdazd','2025-12-06 18:58:36'),(4,1,18,'customer','le boss','2025-12-06 19:04:38'),(5,1,19,'cleaner','bhjzde','2025-12-06 19:08:26'),(6,1,18,'customer','BLBLLB','2025-12-06 19:08:35'),(7,1,18,'customer','azd','2025-12-06 19:08:46'),(13,4,7,'cleaner','dze','2025-12-06 22:03:36'),(14,4,21,'customer','dzed','2025-12-06 22:03:38'),(15,7,22,'customer','dzed','2025-12-07 00:49:09'),(22,12,24,'customer','Theryry','2025-12-07 17:58:41'),(23,12,24,'customer','Hi','2025-12-07 17:58:45'),(35,21,28,'cleaner','Hi','2025-12-10 14:04:55'),(36,21,2,'customer','Hi','2025-12-10 14:05:01');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `main_city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience_years` int DEFAULT '0',
  `services_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `average_rating` decimal(3,2) DEFAULT NULL,
  `rating_count` int DEFAULT '0',
  `address_line` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_zip` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_label` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_last4` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pref_products` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pref_pets` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pref_language` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pref_access` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'zefzbj@gmail.com','$2b$10$xok6FeCYNPgfsxOYMDJg7OGyof714r8GnLTtGYEQKzsqGtMFA8jym','2025-12-01 23:35:46',NULL,NULL,'customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,'Thierry@gmail.com','$2b$10$KwOGHE9Qs8E./uO/ncjR4eaiqmndzuM4SYIlgxnrVfr5EKHWTU8E2','2025-12-01 23:36:14','Thierry','Dupont','customer',1,NULL,0,NULL,NULL,0,'Rue','Thiais','ST42YJ',NULL,NULL,'Use my products','No pets','English','Add door code or special instructions'),(3,'feza@gmail.com','$2b$10$YVQwX7D2wt52YeYj2kdU3eT5NzBdoLaEPpUtTJkkKl6K9UvtUWbWe','2025-12-01 23:57:34',NULL,NULL,'customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,'T@gmail.com','$2b$10$KBzkAadrJo5iywN/5mAbDuZ.Dd.dSyMLE1TU86TG5x8R/AAgrolu6','2025-12-02 00:05:22',NULL,NULL,'customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,'A@g','$2b$10$YctFQXztuyfcA/e95OWP6OkUgXAJyVLDgxhGNC7GZY5AO3hQHuGly','2025-12-02 00:14:17','faezjhfzei','jzbejkzr','customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,'d@d','$2b$10$k6u8YQaS.krRKIKSywyWpurPpGIIRizK8o73lkK6ONKC2nieiDZ8y','2025-12-02 00:27:53','Thiuerry','d','customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,'A@A','$2b$10$s8inn.sPN0szDerPkuAsI.2pHm/n4WvqjQS56TzUMeNQXzBMy.exS','2025-12-02 00:28:48','They',NULL,'cleaner',1,'dze',0,'fzef',4.71,17,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,'C@C','$2b$10$J34XeLWYHNN9Ky.W7Rny7eDHv/I78FRrHYXau53q0879FL3YBq5LS','2025-12-02 01:35:27','Cleaner','C','customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,'PP@PP','$2b$10$6lKiFuQlujCAhBHXunf.ouGLkqNouHHuJKfZoIr8SmKUhmqzggbxW','2025-12-02 01:36:09','A','A','cleaner',1,NULL,0,NULL,5.00,8,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,'0@0','$2b$10$lhMW8t1jk4iBlEdksW00SuGJdSY2qmZq6B4P08Z2X9.gFFqN84Ize','2025-12-02 01:37:24','Find','Cleaners','customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,'1@1','$2b$10$jbq3UDzKv4gMX2sOw2buN.UQdTJsD1TgmfZXw/s0ClmRl6nqjPFcG','2025-12-02 01:37:59','Become','Cleaner','customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,'2@2','$2b$10$aqhUaQNkKxjfP.BnsVGZwe4dhS.2dfJIOQs8SAZBKjhZatW/sgaHe','2025-12-02 01:39:16','Become ','cleaner','customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,'test@test','$2b$10$9Dbm6MhZCNc0Y/prA3qZ6elMVq1Jbpl2oILHIJ46aMu8ctLksydqe','2025-12-02 01:41:27','FJO','JKFE','customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,'test2@test2','$2b$10$piJ2pOSRueDb2k5lqcyd.eRh1Kb/xSpFeFjXLbpplQXTVXix79ISi','2025-12-02 01:42:11','Tefib','eghrjbg','cleaner',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(15,'N@N','$2b$10$gjkr..Z6gEEDGRh7E8prCO8QU8LnU9vCYskdXDHn0yDenmWAnIIiG','2025-12-02 12:27:08','Thierry','DU','customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,'AB@AB','$2b$10$Z2hGmPCSJ0iqRLtD73LvQuYLsVOCP.7zB.WuCqulLiYbX6/ta0bEC','2025-12-02 15:04:42','AAAA','AAAA','customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,'P@P','$2b$10$zPeXQsIsfcZ2W3Dvh7paaO30S3XLVWQGR8e5ianuGALwW8uG.8ium','2025-12-02 17:51:40','Thierry','DU','cleaner',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(18,'00@00','$2b$10$jq6GwV1upxwnhIKClzXn1eFPf1gEYH8sKkRiE71npkRHT2iZMpjBi','2025-12-06 16:37:12','Thierry','Thie','customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(19,'11@11','$2b$10$Lz6FImlA/nvPdP3bXbnBxuzSIlwgK3umkDZgg8n752scErIShxCsi','2025-12-06 16:38:19','bifjezfj','orzrn&','cleaner',1,NULL,0,NULL,4.00,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(20,'C@X','$2b$10$1CfeGf7ALtaPdQllQXNm2emnRNZdvyWlxwB3F4urKlQE44Acxrt5O','2025-12-06 19:27:49','azeaze','azeaze','customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(21,'94@94','$2b$10$ZikmHqy4hSTszh/UJ5gp3eUxHfElrarRltPigvOxwLMfIruEVih.e','2025-12-06 22:02:58','94@94','Thierry','customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(22,'T@T','$2b$10$2o4Rd5TuGjis8tSg08zNTeNbYWLjY1N9JSlHPQXmtGf0gy4YCbVAq','2025-12-07 00:43:31','Bis','Bis','customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(23,'F@F','$2b$10$PpR6aav2JCvO2L5SeJEWpehhYAeYD3Dpgs.EFcDMLaqx8hfP3u3/C','2025-12-07 00:43:35','Thierry','DU','cleaner',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(24,'Test1@Test1','$2b$10$ZulhKHct9nPaAIP8ztvnKektq.PAP9In0R.YVrIDaBSfWMANcYze.','2025-12-07 14:57:45','Stephane ','S','customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(25,'Test2@T','$2b$10$1ZtAoxgclR1weE7hwM24zenPD9FRfHhNkxfWLMRnGszV64L9vCNbS','2025-12-07 14:58:02','Therry','T','cleaner',1,NULL,0,NULL,5.00,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(26,'admin@cleanup.com','<hash_bcrypt>','2025-12-08 11:58:45',NULL,NULL,'admin',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(27,'Thierry_admin@cleanup.com','$2b$10$mX1ZCDzw8YXDGY.WvnQB1.jIqZCVPdaOlrYwprhZ4JgWAPapSOFmW','2025-12-08 12:07:12','Thierry','DU','admin',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(28,'W@W','$2b$10$.9xsu.T57cPbtakvdTVCxewOqoWiwcQxXmUcq8jDc.QvY7Z7pAjI2','2025-12-08 14:17:17','Thierry','P','cleaner',1,NULL,10,'Window',3.30,10,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(29,'ABC@ABC','$2b$10$TnhgiTIGdsgd71A03FPtFe1HAI0wfK1e0YJAHUk/xiodnsOE4HIdi','2025-12-08 14:19:01','A','B','customer',1,NULL,0,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-11 12:23:21
