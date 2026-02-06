-- Asset Management Database Schema for MySQL RDS
-- Run this script after creating your RDS MySQL instance

-- Create database (if not already created)
CREATE DATABASE IF NOT EXISTS assetdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE assetdb;

-- Assets table - stores primary asset data
CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    imageUrl VARCHAR(500),
    userId VARCHAR(100) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better query performance
    INDEX idx_userId (userId),
    INDEX idx_category (category),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Create a view for easy querying
CREATE OR REPLACE VIEW asset_summary AS
SELECT 
    id,
    name,
    category,
    userId,
    createdAt,
    CASE 
        WHEN imageUrl IS NOT NULL AND imageUrl != '' THEN 'Yes'
        ELSE 'No'
    END AS hasImage
FROM assets
ORDER BY createdAt DESC;

-- Insert sample data (optional - for testing)
-- INSERT INTO assets (id, name, description, category, imageUrl, userId) VALUES
-- (UUID(), 'Sample Laptop', 'MacBook Pro 16-inch', 'electronics', '', 'test-user-123'),
-- (UUID(), 'Office Desk', 'Standing desk with adjustable height', 'furniture', '', 'test-user-123'),
-- (UUID(), 'Company Car', 'Tesla Model 3', 'vehicles', '', 'test-user-123');

-- Verify table creation
SHOW TABLES;
DESCRIBE assets;
