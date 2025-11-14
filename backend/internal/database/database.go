package database

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"zerodelay/internal/config"
	"zerodelay/internal/domain/model"
)

// DB holds the database connection
type DB struct {
	*gorm.DB
}

// NewDatabase creates a new database connection
func NewDatabase(cfg *config.Config) (*DB, error) {
	if cfg.Database.URL == "" {
		return nil, fmt.Errorf("DATABASE_URL is not set")
	}

	db, err := gorm.Open(postgres.Open(cfg.Database.URL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connection established")

	return &DB{db}, nil
}

// AutoMigrate runs auto migration for all models
func (db *DB) AutoMigrate() error {
	return db.DB.AutoMigrate(
		&model.User{},
		&model.Place{},
	)
}

// Close closes the database connection
func (db *DB) Close() error {
	sqlDB, err := db.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
