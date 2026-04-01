package main

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func newRouter() *gin.Engine {
	router := gin.New()
	router.Use(gin.Recovery())

	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"service": "swimming-best-backend",
			"status":  "ok",
		})
	})

	return router
}

func main() {
	addr := os.Getenv("SWIMMING_BEST_ADDR")
	if addr == "" {
		addr = ":8080"
	}

	if err := newRouter().Run(addr); err != nil {
		panic(err)
	}
}
