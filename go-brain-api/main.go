package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	genai "github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// BrainRequest representa uma requisição para o cérebro
type BrainRequest struct {
	Input       string                 `json:"input" binding:"required"`
	Context     map[string]interface{} `json:"context"`
	Mode        string                 `json:"mode"` // "code", "chat", "analysis"
	Temperature float32                `json:"temperature"`
}

// BrainResponse representa a resposta do cérebro
type BrainResponse struct {
	Output           string                 `json:"output"`
	ExcellenceReport map[string]interface{} `json:"excellenceReport,omitempty"`
	Metadata         map[string]interface{} `json:"metadata"`
}

// BrainService encapsula a lógica do agente inteligente
type BrainService struct {
	client *genai.Client
	model  *genai.GenerativeModel
}

// NewBrainService cria uma nova instância do serviço
func NewBrainService(apiKey string) (*BrainService, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, err
	}

	model := client.GenerativeModel("gemini-2.0-flash-exp")
	
	// Configurações padrão do modelo
	model.SetTemperature(0.7)
	model.SetTopK(40)
	model.SetTopP(0.95)
	model.SetMaxOutputTokens(8192)

	return &BrainService{
		client: client,
		model:  model,
	}, nil
}

// Process processa uma requisição usando a "mente" do sistema
func (bs *BrainService) Process(ctx context.Context, req BrainRequest) (*BrainResponse, error) {
	// Construir o prompt com as instruções da "mente"
	systemPrompt := bs.buildSystemPrompt(req.Mode)
	
	// Configurar temperatura se fornecida
	if req.Temperature > 0 {
		bs.model.SetTemperature(req.Temperature)
	}

	// Criar sessão de chat
	session := bs.model.StartChat()
	session.History = []*genai.Content{
		{
			Role: "user",
			Parts: []genai.Part{
				genai.Text(systemPrompt),
			},
		},
		{
			Role: "model",
			Parts: []genai.Part{
				genai.Text("Entendido. Estou pronto para processar requisições com excelência."),
			},
		},
	}

	// Enviar mensagem do usuário
	resp, err := session.SendMessage(ctx, genai.Text(req.Input))
	if err != nil {
		return nil, err
	}

	// Extrair resposta
	var output string
	if len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
		output = string(resp.Candidates[0].Content.Parts[0].(genai.Text))
	}

	// Construir resposta
	response := &BrainResponse{
		Output: output,
		Metadata: map[string]interface{}{
			"model":       "gemini-2.0-flash-exp",
			"mode":        req.Mode,
			"temperature": req.Temperature,
		},
	}

	return response, nil
}

// buildSystemPrompt constrói o prompt do sistema baseado no modo
func (bs *BrainService) buildSystemPrompt(mode string) string {
	basePrompt := `Você é um agente de IA avançado com as seguintes capacidades:

PRINCÍPIO FUNDAMENTAL:
"A mediocridade é inaceitável. Buscar excelência é obrigatório."

SUAS CAPACIDADES:
- Geração de código de alta qualidade (HTML, CSS, JavaScript, React, Node.js)
- Análise e validação de código
- Detecção de simulações e código falso
- Implementação de segurança real (JWT, bcrypt, validação)
- Integração com APIs reais (Stripe, Cloudinary, bancos de dados)
- Arquitetura de sistemas escaláveis
- Boas práticas de desenvolvimento

CRITÉRIOS DE EXCELÊNCIA:
1. Estrutura Semântica: Use tags HTML semânticas apropriadas
2. Acessibilidade: Sempre inclua alt em imagens, labels em inputs
3. Responsividade: Design mobile-first com viewport meta tag
4. Performance: Scripts async/defer, otimização de imagens
5. Segurança: Validação de entrada, proteção XSS/CSRF, rate limiting
6. UX: Estados de loading, tratamento de erros, feedback ao usuário

NUNCA FAÇA:
- Código simulado ou falso
- Placeholders como "TODO: implement"
- Funções vazias
- Comentários "// Implementar depois"
- API keys expostas no código
- Código sem tratamento de erros`

	switch mode {
	case "code":
		return basePrompt + `

MODO: GERAÇÃO DE CÓDIGO
Gere código completo, funcional e pronto para produção. Inclua:
- Implementações reais de todas as funções
- Tratamento de erros robusto
- Validação de entrada
- Comentários explicativos
- Testes quando apropriado`

	case "analysis":
		return basePrompt + `

MODO: ANÁLISE DE CÓDIGO
Analise o código fornecido e identifique:
- Problemas de qualidade
- Simulações ou código falso
- Vulnerabilidades de segurança
- Oportunidades de melhoria
- Score de excelência (0-100)`

	case "chat":
		return basePrompt + `

MODO: ASSISTENTE CONVERSACIONAL
Responda de forma clara, precisa e útil. Forneça:
- Explicações técnicas quando necessário
- Exemplos de código quando relevante
- Sugestões de melhores práticas
- Links para documentação quando apropriado`

	default:
		return basePrompt
	}
}

func main() {
	// Carregar API key do ambiente
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY não configurada")
	}

	// Criar serviço do cérebro
	brainService, err := NewBrainService(apiKey)
	if err != nil {
		log.Fatal("Erro ao criar BrainService:", err)
	}

	// Configurar Gin
	r := gin.Default()

	// Configurar CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"service": "brain-api",
		})
	})

	// Endpoint principal do cérebro
	r.POST("/v1/brain/query", func(c *gin.Context) {
		var req BrainRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Processar requisição
		resp, err := brainService.Process(c.Request.Context(), req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, resp)
	})

	// Endpoint para geração de código
	r.POST("/v1/brain/generate-code", func(c *gin.Context) {
		var req BrainRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Forçar modo code
		req.Mode = "code"

		resp, err := brainService.Process(c.Request.Context(), req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, resp)
	})

	// Endpoint para análise de código
	r.POST("/v1/brain/analyze-code", func(c *gin.Context) {
		var req BrainRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Forçar modo analysis
		req.Mode = "analysis"

		resp, err := brainService.Process(c.Request.Context(), req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, resp)
	})

	// Iniciar servidor
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🧠 Brain API rodando na porta %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Erro ao iniciar servidor:", err)
	}
}
