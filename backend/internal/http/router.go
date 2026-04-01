package http

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"swimming-best/backend/internal/auth"
	"swimming-best/backend/internal/domain"
	"swimming-best/backend/internal/repository"
	"swimming-best/backend/internal/service"
)

type RouterOption func(*routerOptions)

type routerOptions struct {
	adminService *service.AdminService
	publicService *service.PublicService
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type createSwimmerRequest struct {
	RealName       string                `json:"realName"`
	Nickname       string                `json:"nickname"`
	PublicNameMode domain.PublicNameMode `json:"publicNameMode"`
	IsPublic       bool                  `json:"isPublic"`
	AvatarURL      string                `json:"avatarUrl"`
	BirthYear      int                   `json:"birthYear"`
	TeamName       string                `json:"teamName"`
	Notes          string                `json:"notes"`
}

type createEventRequest struct {
	PoolLengthM int               `json:"poolLengthM"`
	DistanceM   int               `json:"distanceM"`
	Stroke      domain.Stroke     `json:"stroke"`
	EffortType  domain.EffortType `json:"effortType"`
	DisplayName string            `json:"displayName"`
	SortOrder   int               `json:"sortOrder"`
	IsActive    bool              `json:"isActive"`
}

type quickRecordRequest struct {
	SwimmerID   string            `json:"swimmerId"`
	EventID     string            `json:"eventId"`
	TimeMS      int64             `json:"timeMs"`
	SourceType  domain.SourceType `json:"sourceType"`
	PerformedOn string            `json:"performedOn"`
	PublicNote  string            `json:"publicNote"`
	AdminNote   string            `json:"adminNote"`
}

type createContextRequest struct {
	SourceType  domain.SourceType `json:"sourceType"`
	Title       string            `json:"title"`
	PerformedOn string            `json:"performedOn"`
	Location    string            `json:"location"`
	PublicNote  string            `json:"publicNote"`
	AdminNote   string            `json:"adminNote"`
}

type addContextPerformancesRequest struct {
	Performances []contextPerformanceRequest `json:"performances"`
}

type contextPerformanceRequest struct {
	SwimmerID    string              `json:"swimmerId"`
	EventID      string              `json:"eventId"`
	TimeMS       int64               `json:"timeMs"`
	ResultStatus domain.ResultStatus `json:"resultStatus"`
	PublicNote   string              `json:"publicNote"`
	AdminNote    string              `json:"adminNote"`
}

type createGoalRequest struct {
	SwimmerID    string             `json:"swimmerId"`
	EventID      string             `json:"eventId"`
	ParentGoalID string             `json:"parentGoalId"`
	Horizon      domain.GoalHorizon `json:"horizon"`
	Title        string             `json:"title"`
	TargetTimeMS int64              `json:"targetTimeMs"`
	TargetDate   string             `json:"targetDate"`
	IsPublic     bool               `json:"isPublic"`
	PublicNote   string             `json:"publicNote"`
	AdminNote    string             `json:"adminNote"`
}

func WithAdminService(adminService *service.AdminService) RouterOption {
	return func(options *routerOptions) {
		options.adminService = adminService
	}
}

func WithPublicService(publicService *service.PublicService) RouterOption {
	return func(options *routerOptions) {
		options.publicService = publicService
	}
}

func NewRouter(authService *auth.Service, opts ...RouterOption) *gin.Engine {
	gin.SetMode(gin.TestMode)

	options := routerOptions{}
	for _, option := range opts {
		option(&options)
	}

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

	if options.adminService != nil {
		registerAdminRoutes(admin, options.adminService)
	}

	if options.publicService != nil {
		registerPublicRoutes(router, options.publicService)
	}

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

func registerAdminRoutes(admin *gin.RouterGroup, adminService *service.AdminService) {
	admin.POST("/swimmers", func(c *gin.Context) {
		var request createSwimmerRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_request"})
			return
		}

		swimmer, err := adminService.CreateSwimmer(c.Request.Context(), domain.CreateSwimmerParams{
			RealName:       request.RealName,
			Nickname:       request.Nickname,
			PublicNameMode: request.PublicNameMode,
			IsPublic:       request.IsPublic,
			AvatarURL:      request.AvatarURL,
			BirthYear:      request.BirthYear,
			TeamName:       request.TeamName,
			Notes:          request.Notes,
		})
		if err != nil {
			writeAdminError(c, err)
			return
		}

		c.JSON(http.StatusCreated, swimmer)
	})

	admin.POST("/events", func(c *gin.Context) {
		var request createEventRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_request"})
			return
		}

		event, err := adminService.CreateEvent(c.Request.Context(), domain.CreateEventParams{
			PoolLengthM: request.PoolLengthM,
			DistanceM:   request.DistanceM,
			Stroke:      request.Stroke,
			EffortType:  request.EffortType,
			DisplayName: request.DisplayName,
			SortOrder:   request.SortOrder,
			IsActive:    request.IsActive,
		})
		if err != nil {
			writeAdminError(c, err)
			return
		}

		c.JSON(http.StatusCreated, event)
	})

	admin.POST("/performances/quick", func(c *gin.Context) {
		var request quickRecordRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_request"})
			return
		}

		result, err := adminService.QuickRecordPerformance(c.Request.Context(), service.QuickRecordPerformanceInput{
			SwimmerID:   request.SwimmerID,
			EventID:     request.EventID,
			TimeMS:      request.TimeMS,
			SourceType:  request.SourceType,
			PerformedOn: request.PerformedOn,
			PublicNote:  request.PublicNote,
			AdminNote:   request.AdminNote,
		})
		if err != nil {
			writeAdminError(c, err)
			return
		}

		c.JSON(http.StatusCreated, result)
	})

	admin.POST("/contexts", func(c *gin.Context) {
		var request createContextRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_request"})
			return
		}

		recordContext, err := adminService.CreateContext(c.Request.Context(), service.CreateContextInput{
			SourceType:  request.SourceType,
			Title:       request.Title,
			PerformedOn: request.PerformedOn,
			Location:    request.Location,
			PublicNote:  request.PublicNote,
			AdminNote:   request.AdminNote,
		})
		if err != nil {
			writeAdminError(c, err)
			return
		}

		c.JSON(http.StatusCreated, recordContext)
	})

	admin.POST("/contexts/:id/performances", func(c *gin.Context) {
		var request addContextPerformancesRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_request"})
			return
		}

		inputs := make([]service.ContextPerformanceInput, 0, len(request.Performances))
		for _, performance := range request.Performances {
			inputs = append(inputs, service.ContextPerformanceInput{
				SwimmerID:    performance.SwimmerID,
				EventID:      performance.EventID,
				TimeMS:       performance.TimeMS,
				ResultStatus: performance.ResultStatus,
				PublicNote:   performance.PublicNote,
				AdminNote:    performance.AdminNote,
			})
		}

		performances, err := adminService.AddContextPerformances(c.Request.Context(), c.Param("id"), inputs)
		if err != nil {
			writeAdminError(c, err)
			return
		}

		c.JSON(http.StatusCreated, gin.H{"performances": performances})
	})

	admin.POST("/goals", func(c *gin.Context) {
		var request createGoalRequest
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_request"})
			return
		}

		goal, err := adminService.CreateGoal(c.Request.Context(), service.CreateGoalInput{
			SwimmerID:    request.SwimmerID,
			EventID:      request.EventID,
			ParentGoalID: request.ParentGoalID,
			Horizon:      request.Horizon,
			Title:        request.Title,
			TargetTimeMS: request.TargetTimeMS,
			TargetDate:   request.TargetDate,
			IsPublic:     request.IsPublic,
			PublicNote:   request.PublicNote,
			AdminNote:    request.AdminNote,
		})
		if err != nil {
			writeAdminError(c, err)
			return
		}

		c.JSON(http.StatusCreated, goal)
	})
}

func writeAdminError(c *gin.Context, err error) {
	switch {
	case err == nil:
		return
	case errors.Is(err, repository.ErrConflict):
		c.JSON(http.StatusConflict, gin.H{"error": "conflict"})
	case errors.Is(err, repository.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}
}

func registerPublicRoutes(router *gin.Engine, publicService *service.PublicService) {
	router.GET("/api/public/swimmers", func(c *gin.Context) {
		swimmers, err := publicService.ListPublicSwimmers(c.Request.Context())
		if err != nil {
			writePublicError(c, err)
			return
		}

		c.JSON(http.StatusOK, gin.H{"swimmers": swimmers})
	})

	router.GET("/api/public/swimmers/:slug/events/:eventId/analytics", func(c *gin.Context) {
		payload, err := publicService.GetPublicEventAnalytics(c.Request.Context(), c.Param("slug"), c.Param("eventId"))
		if err != nil {
			writePublicError(c, err)
			return
		}

		c.JSON(http.StatusOK, payload)
	})

	router.GET("/api/public/compare", func(c *gin.Context) {
		payload, err := publicService.ComparePublicEvent(c.Request.Context(), c.Query("eventId"), c.QueryArray("swimmerId"))
		if err != nil {
			writePublicError(c, err)
			return
		}

		c.JSON(http.StatusOK, payload)
	})
}

func writePublicError(c *gin.Context, err error) {
	switch {
	case err == nil:
		return
	case errors.Is(err, repository.ErrNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}
}
