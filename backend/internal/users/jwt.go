package users

import (
	"fmt"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/redmeros/volley/internal/app"
)

const alg = "HS256"

type VolleyClaims struct {
	jwt.RegisteredClaims
	IsAdmin bool   `json:"is_admin"`
	Role    string `json:"role"`
}

func (c *VolleyClaims) GetUserID() (int, error) {
	id, err := strconv.Atoi(c.Subject)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func validateToken(tokenString string, app *app.VApp) (*VolleyClaims, error) {
	m := getUserModule(app)

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		return []byte(m.vapp.Config.Base.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}

	isAdmin, ok := claims["is_admin"].(bool)
	if !ok {
		return nil, fmt.Errorf("invalid is_admin claim")
	}

	role, ok := claims["role"].(string)
	if !ok {
		return nil, fmt.Errorf("invalid role claim")
	}

	expiration, ok := claims["exp"].(float64)
	if !ok {
		return nil, fmt.Errorf("invalid exp claim")
	}

	if time.Now().Unix() > int64(expiration) {
		return nil, fmt.Errorf("token has expired")
	}

	subject, ok := claims["sub"].(string)
	if !ok {
		return nil, fmt.Errorf("invalid sub claim")
	}

	issuer, ok := claims["iss"].(string)
	if !ok {
		return nil, fmt.Errorf("invalid iss claim")
	}

	if issuer != m.vapp.Config.Base.JWTIssuer {
		return nil, fmt.Errorf("invalid issuer")
	}

	return &VolleyClaims{
		IsAdmin: isAdmin,
		Role:    role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   subject,
			Issuer:    issuer,
			ExpiresAt: jwt.NewNumericDate(time.Unix(int64(expiration), 0)),
		},
	}, nil
}

func generateToken(user *User, app *app.VApp) (string, error) {
	t := jwt.New(jwt.GetSigningMethod(alg))

	m := getUserModule(app)
	expiration := m.vapp.Config.Base.JWTExpiration

	claims := &VolleyClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   fmt.Sprintf("%d", user.ID),
			Issuer:    m.vapp.Config.Base.JWTIssuer,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expiration) * time.Second)),
		},
		IsAdmin: false,
		Role:    "user",
	}

	t.Claims = claims

	tokenStr, err := t.SignedString([]byte(app.Config.Base.JWTSecret))

	if err != nil {
		return "", err
	}

	return tokenStr, nil
}
