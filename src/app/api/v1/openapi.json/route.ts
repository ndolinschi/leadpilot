import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "LeadPilot Public API",
      version: "1.0.0",
      description:
        "Public REST API for LeadPilot: Ingest leads, score buying intent with calibrated JS ML, retrieve ranked queues, orchestrate omnichannel messages, and handle Telegram/Viber webhooks.",
      contact: {
        name: "LeadPilot RevOps Engineering",
        url: "https://leadpilot.io",
      },
    },
    servers: [
      {
        url: "/api/v1",
        description: "Current environment endpoint root",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "lp_live_*",
          description: "Enter your LeadPilot API Key prefixed with lp_live_ or lp_test_",
        },
        ApiKeyHeader: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "Alternative header for LeadPilot API key",
        },
      },
      schemas: {
        Lead: {
          type: "object",
          required: ["name", "company"],
          properties: {
            id: { type: "string", example: "lead_001" },
            name: { type: "string", example: "Alexandru Morari" },
            company: { type: "string", example: "Clinica Sanatate SRL" },
            title: { type: "string", example: "Chief Medical Officer" },
            email: { type: "string", format: "email", example: "alex@sanatate.md" },
            phone: { type: "string", example: "+373 69 123456" },
            country: { type: "string", example: "Moldova" },
            industry: { type: "string", example: "Healthcare" },
            companySize: { type: "integer", example: 45 },
            source: { type: "string", example: "inbound" },
            channel: { type: "string", enum: ["email", "call", "linkedin", "messenger"], example: "messenger" },
            seniority: { type: "string", example: "Executive" },
            score: { type: "number", example: 92.4 },
            probability: { type: "number", example: 0.924 },
            stage: { type: "string", example: "qualified" },
          },
        },
        ScoreRequest: {
          type: "object",
          properties: {
            industry: { type: "string", example: "Healthcare" },
            companySize: { type: "integer", example: 50 },
            source: { type: "string", example: "inbound" },
            country: { type: "string", example: "Moldova" },
            seniority: { type: "string", example: "Executive" },
            lastTouchDays: { type: "integer", example: 1 },
            emailsOpened: { type: "integer", example: 4 },
            emailsSent: { type: "integer", example: 5 },
            siteVisits: { type: "integer", example: 6 },
            demoRequested: { type: "boolean", example: true },
            budgetSignal: { type: "number", example: 0.9 },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }, { ApiKeyHeader: [] }],
    paths: {
      "/health": {
        get: {
          summary: "API Health & Runtime Status",
          security: [],
          responses: {
            200: {
              description: "Service is online and healthy",
            },
          },
        },
      },
      "/leads": {
        get: {
          summary: "List Scored Leads",
          parameters: [
            { name: "channel", in: "query", schema: { type: "string" } },
            { name: "minScore", in: "query", schema: { type: "number" } },
            { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
          ],
          responses: {
            200: { description: "Array of scored leads" },
            401: { description: "Missing or invalid API key" },
          },
        },
        post: {
          summary: "Ingest and ML-Score a New Lead",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Lead" },
              },
            },
          },
          responses: {
            201: { description: "Lead created and scored" },
            400: { description: "Validation error" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/leads/{id}": {
        get: {
          summary: "Get Lead by ID",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Scored lead record" },
            404: { description: "Lead not found" },
          },
        },
      },
      "/score": {
        post: {
          summary: "Stateless Intent Scoring & Channel Softmax",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ScoreRequest" },
              },
            },
          },
          responses: {
            200: { description: "Score, probability, channel recommendation and explainability" },
          },
        },
      },
      "/messages": {
        post: {
          summary: "Log or Auto-Generate an Omnichannel Message",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    leadId: { type: "string" },
                    channel: { type: "string" },
                    body: { type: "string" },
                    autoGenerate: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Message logged or generated" },
          },
        },
      },
      "/webhooks/telegram": {
        post: {
          summary: "Telegram Webhook Endpoint",
          security: [],
          description: "Receives Telegram update payloads, verifies tokens, and creates inbound leads & messages.",
          responses: {
            200: { description: "Webhook verified and processed" },
            503: { description: "Connector unconfigured — includes setup instructions" },
          },
        },
      },
      "/webhooks/viber": {
        post: {
          summary: "Viber Webhook Endpoint",
          security: [],
          description: "Receives Viber bot events, validates signatures, and streams client chats to Inbox.",
          responses: {
            200: { description: "Webhook verified and processed" },
            503: { description: "Connector unconfigured — includes setup instructions" },
          },
        },
      },
      "/webhooks/facebook": {
        post: {
          summary: "Facebook Lead Ads Webhook Endpoint",
          security: [],
          description: "Receives Meta Lead Ads and Messenger payloads and creates inbound leads & messages.",
          responses: {
            200: { description: "Webhook verified and processed" },
            503: { description: "Connector unconfigured — includes setup instructions" },
          },
        },
      },
    },
  };

  return NextResponse.json(spec, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
