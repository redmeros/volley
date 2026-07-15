package users

import (
	"context"
	"errors"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pterm/pterm"
	"github.com/redmeros/volley/internal/app"
)

const moduleName = "users"

func getUserModule(a *app.VApp) *UserModule {
	module, ok := a.Modules[moduleName]
	if !ok {
		panic("user module is not initialized")
	}
	userModule, ok := module.(*UserModule)
	if !ok {
		panic("user module has wrong type")
	}
	return userModule
}

func RegisterUsersHandlers(a *app.VApp) {
	pterm.Info.Printfln("Registering users handlers")
	userModule := NewUserModule(a)
	a.Modules[moduleName] = userModule
	RegisterNewUserHandler(a)
	RegisterLoginHandler(a)
	RegisterTestProtectedHandler(a)
	RegisterTestUnprotectedHandler(a)
}

func AuthMiddleware(a *app.VApp) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(401, gin.H{"error": "Authorization header is missing"})
			return
		}

		tokenString := authHeader[len("Bearer "):]
		claims, err := validateToken(tokenString, a)
		if err != nil {
			c.AbortWithStatusJSON(401, gin.H{"error": "Invalid token: " + err.Error()})
			return
		}

		c.Set("claims", claims)
		c.Next()
	}
}

func RegisterTestProtectedHandler(a *app.VApp) {
	userModule := getUserModule(a)

	userModule.group.GET("/testProtected", AuthMiddleware(a), func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "You have accessed a protected route!"})
	})
}

func RegisterTestUnprotectedHandler(a *app.VApp) {
	userModule := getUserModule(a)

	userModule.group.GET("/testUnprotected", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "You have accessed an unprotected route!"})
	})
}

func RegisterLoginHandler(a *app.VApp) {
	userModule := getUserModule(a)
	userModule.group.POST("/login", func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), time.Second*5)
		defer cancel()

		req := LoginRequest{}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		user, err := userModule.AuthenticateUser(ctx, req.Email, req.Password)
		if err != nil {
			if errors.Is(err, UserNotFoundError) || errors.Is(err, InvalidPasswordError) {
				c.JSON(401, gin.H{"error": "invalid username or password"})
				return
			}
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		token, err := generateToken(user, a)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"token": token})
	})
}

func RegisterNewUserHandler(a *app.VApp) {
	userModule := getUserModule(a)

	userModule.group.POST("/register", func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), time.Second*5)
		defer cancel()

		req := NewUserRequest{}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		user, err := userModule.CreateNewUser(ctx, req.Username, req.Email, req.Password)
		if err != nil {
			if errors.Is(err, UserAlreadyExistsError) {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, user)
	})
}
