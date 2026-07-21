package users

import "errors"

var (
	ErrUserAlreadyExists    = errors.New("user already exists")
	ErrUserNotFound         = errors.New("user not found")
	ErrInvalidPassword      = errors.New("invalid username or password")
	ErrUserNotAuthenticated = errors.New("user not authenticated")
)
