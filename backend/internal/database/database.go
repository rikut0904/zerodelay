package database

import (
	"fmt"
	"log"
<<<<<<< HEAD
=======
	"strings"
>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601

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

<<<<<<< HEAD
=======
// getLogLevel converts string log level to logger.LogLevel
func getLogLevel(level string) logger.LogLevel {
	switch strings.ToLower(level) {
	case "silent":
		return logger.Silent
	case "error":
		return logger.Error
	case "warn":
		return logger.Warn
	case "info":
		return logger.Info
	default:
		return logger.Warn // Default to Warn if unknown value
	}
}

>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
// NewDatabase creates a new database connection
func NewDatabase(cfg *config.Config) (*DB, error) {
	if cfg.Database.URL == "" {
		return nil, fmt.Errorf("DATABASE_URL is not set")
	}

<<<<<<< HEAD
	db, err := gorm.Open(postgres.Open(cfg.Database.URL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
=======
	logLevel := getLogLevel(cfg.Database.LogLevel)

	db, err := gorm.Open(postgres.Open(cfg.Database.URL), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

<<<<<<< HEAD
	log.Println("Database connection established")
=======
	log.Printf("Database connection established (log level: %s)", cfg.Database.LogLevel)
>>>>>>> 2f2f076d5aa2121f5be0bf3eebcd4472f3689601

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
