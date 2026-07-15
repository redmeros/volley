package users

import "errors"

var UserAlreadyExistsError = errors.New("user already exists")
var UserNotFoundError = errors.New("user not found")
var InvalidPasswordError = errors.New("invalid username or password")
