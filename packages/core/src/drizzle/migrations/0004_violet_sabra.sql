ALTER TABLE sponsors_donations ADD `createdBy` text DEFAULT NULL REFERENCES users(id);