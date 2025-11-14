# 🚀 GUIA COMPLETO: GOLANG PARA BACKENDS ESCALÁVEIS

## 🎯 INSTRUÇÕES ADICIONADAS AO SISTEMA

O sistema agora tem conhecimento profundo de **Golang** e vai usar automaticamente quando detectar:

✅ "backend escalável"
✅ "alta performance"
✅ "microserviços"
✅ "API REST rápida"
✅ "sistema distribuído"
✅ "concorrência"

---

## 💡 POR QUE GOLANG?

### ⚡ Performance
- 🚀 **10-100x mais rápido** que Node.js/Python
- 💪 Performance próxima de C/C++
- 📊 Baixo consumo de memória
- ⚡ Compilação rápida (segundos)

### 🔧 Simplicidade
- 📝 Sintaxe limpa e minimalista
- 🎯 Fácil de aprender (25 palavras-chave)
- 🔨 Ferramentas nativas (go fmt, go test, go build)
- 📦 Gerenciamento de dependências integrado

### 🌐 Concorrência
- 🚀 Goroutines (threads leves)
- 📡 Channels para comunicação
- 💪 Milhares de goroutines simultâneas
- ⚡ Scheduler eficiente

### 📦 Deploy
- 🎯 Binário único (sem dependências)
- 🐳 Imagens Docker minúsculas (5-20MB)
- 🚀 Cross-compilation nativa
- ⚡ Startup instantâneo

---

## 🏗️ ESTRUTURA DE PROJETO GO PROFISSIONAL

```
projeto/
├── backend/                    ← Backend Go
│   ├── cmd/
│   │   └── api/
│   │       └── main.go        ← Entry point
│   ├── internal/              ← Código privado
│   │   ├── handlers/          ← HTTP handlers (controllers)
│   │   │   ├── user_handler.go
│   │   │   ├── auth_handler.go
│   │   │   └── product_handler.go
│   │   ├── models/            ← Modelos de dados
│   │   │   ├── user.go
│   │   │   ├── product.go
│   │   │   └── order.go
│   │   ├── repository/        ← Acesso ao banco (DAO)
│   │   │   ├── user_repo.go
│   │   │   ├── product_repo.go
│   │   │   └── order_repo.go
│   │   ├── service/           ← Lógica de negócio
│   │   │   ├── user_service.go
│   │   │   ├── auth_service.go
│   │   │   └── product_service.go
│   │   └── middleware/        ← Middlewares
│   │       ├── auth.go
│   │       ├── logger.go
│   │       ├── cors.go
│   │       └── rate_limit.go
│   ├── pkg/                   ← Código reutilizável (público)
│   │   ├── database/
│   │   │   ├── postgres.go
│   │   │   └── redis.go
│   │   ├── utils/
│   │   │   ├── jwt.go
│   │   │   ├── hash.go
│   │   │   └── validator.go
│   │   └── config/
│   │       └── config.go
│   ├── migrations/            ← Migrações SQL
│   │   ├── 001_create_users.sql
│   │   └── 002_create_products.sql
│   ├── go.mod                 ← Dependências
│   ├── go.sum                 ← Lock file
│   ├── .env.example           ← Variáveis de ambiente
│   ├── Dockerfile             ← Docker para Go
│   └── Makefile               ← Comandos úteis
├── frontend/                   ← Frontend (React/Vue/Angular)
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml         ← Orquestração
├── .gitignore
└── README.md
```

---

## 🎯 EXEMPLO COMPLETO: API REST COM GO + GIN

### 1. main.go (Entry Point)

```go
// cmd/api/main.go
package main

import (
    "log"
    "os"
    
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    
    "myapp/internal/handlers"
    "myapp/internal/middleware"
    "myapp/pkg/database"
)

func main() {
    // Carregar variáveis de ambiente
    if err := godotenv.Load(); err != nil {
        log.Println("Arquivo .env não encontrado")
    }
    
    // Conectar ao banco de dados
    db, err := database.Connect()
    if err != nil {
        log.Fatal("Erro ao conectar ao banco:", err)
    }
    
    // Configurar Gin
    if os.Getenv("ENV") == "production" {
        gin.SetMode(gin.ReleaseMode)
    }
    
    r := gin.Default()
    
    // Middlewares globais
    r.Use(middleware.CORS())
    r.Use(middleware.Logger())
    r.Use(middleware.RateLimiter())
    
    // Health check
    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "ok"})
    })
    
    // Rotas da API
    api := r.Group("/api/v1")
    {
        // Rotas públicas
        api.POST("/auth/register", handlers.Register(db))
        api.POST("/auth/login", handlers.Login(db))
        
        // Rotas protegidas
        protected := api.Group("")
        protected.Use(middleware.AuthRequired())
        {
            // Usuários
            protected.GET("/users", handlers.GetUsers(db))
            protected.GET("/users/:id", handlers.GetUser(db))
            protected.PUT("/users/:id", handlers.UpdateUser(db))
            protected.DELETE("/users/:id", handlers.DeleteUser(db))
            
            // Produtos
            protected.GET("/products", handlers.GetProducts(db))
            protected.POST("/products", handlers.CreateProduct(db))
            protected.PUT("/products/:id", handlers.UpdateProduct(db))
            protected.DELETE("/products/:id", handlers.DeleteProduct(db))
        }
    }
    
    // Iniciar servidor
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    
    log.Printf("Servidor rodando na porta %s", port)
    if err := r.Run(":" + port); err != nil {
        log.Fatal("Erro ao iniciar servidor:", err)
    }
}
```

---

### 2. Models (Modelos de Dados)

```go
// internal/models/user.go
package models

import (
    "time"
    "gorm.io/gorm"
)

type User struct {
    ID        uint           `gorm:"primaryKey" json:"id"`
    Name      string         `gorm:"not null" json:"name" binding:"required"`
    Email     string         `gorm:"uniqueIndex;not null" json:"email" binding:"required,email"`
    Password  string         `gorm:"not null" json:"-"` // Não retorna no JSON
    Role      string         `gorm:"default:user" json:"role"`
    Active    bool           `gorm:"default:true" json:"active"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Product struct {
    ID          uint           `gorm:"primaryKey" json:"id"`
    Name        string         `gorm:"not null" json:"name" binding:"required"`
    Description string         `json:"description"`
    Price       float64        `gorm:"not null" json:"price" binding:"required,gt=0"`
    Stock       int            `gorm:"default:0" json:"stock"`
    UserID      uint           `gorm:"not null" json:"user_id"`
    User        User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
    CreatedAt   time.Time      `json:"created_at"`
    UpdatedAt   time.Time      `json:"updated_at"`
    DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
```

---

### 3. Handlers (Controllers)

```go
// internal/handlers/user_handler.go
package handlers

import (
    "net/http"
    "strconv"
    
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    
    "myapp/internal/models"
)

func GetUsers(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var users []models.User
        
        // Paginação
        page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
        limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
        offset := (page - 1) * limit
        
        // Buscar usuários
        if err := db.Limit(limit).Offset(offset).Find(&users).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Erro ao buscar usuários",
            })
            return
        }
        
        // Contar total
        var total int64
        db.Model(&models.User{}).Count(&total)
        
        c.JSON(http.StatusOK, gin.H{
            "data": users,
            "pagination": gin.H{
                "page":  page,
                "limit": limit,
                "total": total,
            },
        })
    }
}

func GetUser(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        id := c.Param("id")
        var user models.User
        
        if err := db.First(&user, id).Error; err != nil {
            if err == gorm.ErrRecordNotFound {
                c.JSON(http.StatusNotFound, gin.H{
                    "error": "Usuário não encontrado",
                })
                return
            }
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Erro ao buscar usuário",
            })
            return
        }
        
        c.JSON(http.StatusOK, gin.H{"data": user})
    }
}

func UpdateUser(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        id := c.Param("id")
        var user models.User
        
        // Buscar usuário
        if err := db.First(&user, id).Error; err != nil {
            c.JSON(http.StatusNotFound, gin.H{
                "error": "Usuário não encontrado",
            })
            return
        }
        
        // Validar dados
        var input models.User
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{
                "error": err.Error(),
            })
            return
        }
        
        // Atualizar
        user.Name = input.Name
        user.Email = input.Email
        
        if err := db.Save(&user).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Erro ao atualizar usuário",
            })
            return
        }
        
        c.JSON(http.StatusOK, gin.H{"data": user})
    }
}

func DeleteUser(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        id := c.Param("id")
        
        if err := db.Delete(&models.User{}, id).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Erro ao deletar usuário",
            })
            return
        }
        
        c.JSON(http.StatusOK, gin.H{
            "message": "Usuário deletado com sucesso",
        })
    }
}
```

---

### 4. Middleware (Autenticação JWT)

```go
// internal/middleware/auth.go
package middleware

import (
    "net/http"
    "strings"
    
    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("seu-secret-aqui") // Use variável de ambiente!

func AuthRequired() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Pegar token do header
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Token não fornecido",
            })
            c.Abort()
            return
        }
        
        // Remover "Bearer " do token
        tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
        
        // Validar token
        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            return jwtSecret, nil
        })
        
        if err != nil || !token.Valid {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Token inválido",
            })
            c.Abort()
            return
        }
        
        // Extrair claims
        if claims, ok := token.Claims.(jwt.MapClaims); ok {
            c.Set("user_id", claims["user_id"])
            c.Set("email", claims["email"])
        }
        
        c.Next()
    }
}
```

---

### 5. Database Connection

```go
// pkg/database/postgres.go
package database

import (
    "fmt"
    "os"
    
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
    
    "myapp/internal/models"
)

func Connect() (*gorm.DB, error) {
    // Configurar DSN
    dsn := fmt.Sprintf(
        "host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
        os.Getenv("DB_HOST"),
        os.Getenv("DB_USER"),
        os.Getenv("DB_PASSWORD"),
        os.Getenv("DB_NAME"),
        os.Getenv("DB_PORT"),
    )
    
    // Conectar
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
        Logger: logger.Default.LogMode(logger.Info),
    })
    
    if err != nil {
        return nil, err
    }
    
    // Auto-migrar modelos
    if err := db.AutoMigrate(
        &models.User{},
        &models.Product{},
    ); err != nil {
        return nil, err
    }
    
    return db, nil
}
```

---

### 6. Dockerfile (Multi-stage Build)

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copiar go.mod e go.sum
COPY go.mod go.sum ./
RUN go mod download

# Copiar código fonte
COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/api

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copiar binário do builder
COPY --from=builder /app/main .
COPY --from=builder /app/.env.example .env

EXPOSE 8080

CMD ["./main"]
```

---

### 7. docker-compose.yml

```yaml
version: '3.8'

services:
  # Backend Go
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - ENV=development
      - DB_HOST=postgres
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=myapp
      - DB_PORT=5432
      - JWT_SECRET=seu-secret-super-seguro
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
    command: go run cmd/api/main.go
  
  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  # Frontend (React/Vue/Angular)
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - REACT_APP_API_URL=http://localhost:8080/api/v1

volumes:
  postgres_data:
```

---

## 🚀 COMANDOS ÚTEIS

### Desenvolvimento
```bash
# Rodar localmente
go run cmd/api/main.go

# Build
go build -o bin/api cmd/api/main.go

# Rodar testes
go test ./...

# Formatar código
go fmt ./...

# Verificar erros
go vet ./...

# Instalar dependências
go mod download

# Atualizar dependências
go get -u ./...

# Limpar cache
go clean -modcache
```

### Docker
```bash
# Build
docker build -t myapp-backend .

# Run
docker run -p 8080:8080 myapp-backend

# Docker Compose
docker-compose up -d
docker-compose logs -f backend
docker-compose down
```

---

## 🎯 PRÓXIMOS PASSOS

Agora seu sistema vai:

✅ Detectar automaticamente quando usar Go
✅ Gerar estrutura profissional de projeto Go
✅ Criar API REST completa com Gin
✅ Implementar autenticação JWT
✅ Configurar banco de dados (PostgreSQL)
✅ Criar Dockerfile otimizado
✅ Gerar docker-compose.yml completo
✅ Combinar Go backend com React/Vue/Angular frontend

**Teste agora com prompts como:**
- "Crie um backend escalável em Go com API REST"
- "Faça uma API de e-commerce com Go e React"
- "Crie um sistema de autenticação com Go e JWT"
- "Faça um microserviço em Go com PostgreSQL"

🚀 **Seu sistema agora é MUITO mais poderoso!**
