package http

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"swimming-best/backend/internal/auth"
)

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func NewRouter(authService *auth.Service) *gin.Engine {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.Use(gin.Recovery())

	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"service": "swimming-best-backend",
			"status":  "ok",
		})
	})

	router.POST("/api/admin/login", func(c *gin.Context) {
		var request loginRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_request"})
			return
		}

		username, ok := authService.Authenticate(request.Username, request.Password)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid_credentials"})
			return
		}

		if err := authService.WriteSessionCookie(c.Writer, username); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "session_write_failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"username": username})
	})

	router.POST("/api/admin/logout", func(c *gin.Context) {
		authService.ClearSessionCookie(c.Writer)
		c.Status(http.StatusNoContent)
	})

	admin := router.Group("/api/admin")
	admin.Use(requireAdmin(authService))
	admin.GET("/me", func(c *gin.Context) {
		username := c.GetString("admin_username")
		c.JSON(http.StatusOK, gin.H{"username": username})
	})

	return router
}

func requireAdmin(authService *auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		username, ok := authService.UsernameFromRequest(c.Request)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		c.Set("admin_username", username)
		c.Next()
	}
}

