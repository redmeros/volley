package users

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/redmeros/volley/internal/app"
	"golang.org/x/crypto/bcrypt"
)

type UserModule struct {
	vapp  *app.VApp
	group *gin.RouterGroup
}

func NewUserModule(vapp *app.VApp) *UserModule {
	return &UserModule{
		vapp:  vapp,
		group: vapp.API.Group("/users"),
	}
}

func (m *UserModule) AuthenticateUser(ctx context.Context, email, password string) (*User, error) {
	sql := `SELECT id, username, email, password_hash, created_at FROM users WHERE email = $1`
	conn, err := m.vapp.Pool.Acquire(ctx)
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	var user User
	err = conn.QueryRow(ctx, sql, email).Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash, &user.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("error during fetching user: %w", err)
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			return nil, ErrInvalidPassword
		}
		return nil, err
	}

	return &user, nil
}

func (m *UserModule) CreateNewUser(ctx context.Context, username, email, password string) (*User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &User{
		Username:     username,
		Email:        email,
		PasswordHash: string(hashedPassword),
		CreatedAt:    time.Now(),
	}

	conn, err := m.vapp.Pool.Acquire(ctx)
	if err != nil {
		return nil, err
	}
	defer conn.Release()

	sql := `INSERT INTO users (username, email, password_hash, created_at) VALUES ($1, $2, $3, $4) RETURNING id`
	err = conn.QueryRow(ctx, sql, user.Username, user.Email, user.PasswordHash, user.CreatedAt).Scan(&user.ID)
	if err != nil {
		if pgErr, ok := errors.AsType[*pgconn.PgError](err); ok {
			if pgErr.Code == "23505" { // unique_violation
				return nil, ErrUserAlreadyExists
			}
		}
		return nil, fmt.Errorf("error during inserting user: %w", err)
	}

	return user, nil
}
