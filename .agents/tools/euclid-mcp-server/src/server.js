#!/usr/bin/env node

/**
 * EUCLID MCP Server
 * Model Context Protocol server for EUCLID ecosystem management
 * 
 * Implements Salem Drunk Tank methodology:
 * - Single-user admin access patterns
 * - Multi-reader interface management
 * - Evidence-based operations ("truth from wiring, not depth")
 * - Cross-directory contamination prevention
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

// Import tool implementations
import { CurriculumAnalyzer } from "./tools/curriculum-analyzer.js";
import { ComponentMapper } from "./tools/component-mapper.js";
import { PipelineReconciler } from "./tools/pipeline-reconciler.js";
import { SalemInterface } from "./tools/salem-interface.js";
import { ArchiveLinker } from "./tools/archive-linker.js";
import { EuclidFileManager } from "./tools/file-manager.js";
import { DependencyTracker } from "./tools/dependency-tracker.js";
import { EvidenceValidator } from "./tools/evidence-validator.js";

// Initialize server and tools
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new Server(
  {
    name: "euclid-ecosystem",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Configuration paths
const EUCLID_BASE_PATH = path.resolve(__dirname, "../../../");
const EUCLID_NORMALIZATION_PATH = path.join(EUCLID_BASE_PATH, "EUCLID_NORMALIZATION");
const PUBLIC_PATH = path.join(EUCLID_BASE_PATH, "public");

// Initialize tool instances
const tools = {
  curriculumAnalyzer: new CurriculumAnalyzer(EUCLID_NORMALIZATION_PATH, PUBLIC_PATH),
  componentMapper: new ComponentMapper(PUBLIC_PATH),
  pipelineReconciler: new PipelineReconciler(EUCLID_BASE_PATH),
  salemInterface: new SalemInterface(PUBLIC_PATH),
  archiveLinker: new ArchiveLinker(EUCLID_BASE_PATH),
  fileManager: new EuclidFileManager(EUCLID_BASE_PATH),
  dependencyTracker: new DependencyTracker(EUCLID_BASE_PATH),
  evidenceValidator: new EvidenceValidator(EUCLID_BASE_PATH),
};

// Tool definitions
const TOOL_DEFINITIONS = [
  {
    name: "curriculum-analyzer",
    description: "Analyze grade-level lesson structures, curriculum dependencies, and educational content hierarchies",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["analyze-structure", "find-dependencies", "validate-curriculum", "extract-concepts"],
          description: "Analysis action to perform"
        },
        target: {
          type: "string",
          description: "Target file, directory, or curriculum identifier to analyze"
        },
        options: {
          type: "object",
          properties: {
            gradeLevel: { type: "string", description: "Target grade level (PreK-12)" },
            civilization: { type: "string", description: "Ancient civilization context" },
            includeMetadata: { type: "boolean", description: "Include metadata in analysis" },
            depth: { type: "integer", description: "Analysis depth level (1-5)" }
          },
          additionalProperties: false
        }
      },
      required: ["action"],
      additionalProperties: false
    }
  },
  {
    name: "component-mapper",
    description: "Map relationships between UI components, interfaces, and identify integration points",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["map-components", "find-dependencies", "analyze-interfaces", "detect-patterns"],
          description: "Mapping action to perform"
        },
        componentPath: {
          type: "string",
          description: "Path to component or interface to analyze"
        },
        options: {
          type: "object",
          properties: {
            includeArchived: { type: "boolean", description: "Include archived components" },
            visualFormat: { type: "string", enum: ["mermaid", "graphviz", "json"], description: "Output format" },
            maxDepth: { type: "integer", description: "Maximum relationship depth" }
          },
          additionalProperties: false
        }
      },
      required: ["action"],
      additionalProperties: false
    }
  },
  {
    name: "pipeline-reconciler",
    description: "Connect pipeline diagrams to code and validate system architecture consistency",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["reconcile-pipelines", "validate-architecture", "check-consistency", "generate-diagram"],
          description: "Reconciliation action to perform"
        },
        pipelinePath: {
          type: "string",
          description: "Path to pipeline diagram or configuration"
        },
        options: {
          type: "object",
          properties: {
            outputFormat: { type: "string", enum: ["markdown", "mermaid", "json"], description: "Report format" },
            includeMetrics: { type: "boolean", description: "Include performance metrics" },
            validateCode: { type: "boolean", description: "Validate against actual code" }
          },
          additionalProperties: false
        }
      },
      required: ["action"],
      additionalProperties: false
    }
  },
  {
    name: "salem-interface",
    description: "Unified dashboard management for Salem Drunk Tank interface with multi-reader access control",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["dashboard-status", "interface-health", "access-control", "navigation-map"],
          description: "Interface management action"
        },
        targetInterface: {
          type: "string",
          description: "Specific interface or component to manage"
        },
        options: {
          type: "object",
          properties: {
            includeReadOnlyUsers: { type: "boolean", description: "Include read-only user data" },
            systemHealth: { type: "boolean", description: "Include system health metrics" },
            figmaMode: { type: "boolean", description: "Enable Figma-style navigation" }
          },
          additionalProperties: false
        }
      },
      required: ["action"],
      additionalProperties: false
    }
  },
  {
    name: "archive-linker",
    description: "Connect current systems with archived UI_BUILD_CONTENT and maintain historical linkage",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["link-archives", "find-archived", "validate-links", "migration-status"],
          description: "Archive linking action"
        },
        currentPath: {
          type: "string",
          description: "Current file or component to link"
        },
        options: {
          type: "object",
          properties: {
            searchArchives: { type: "boolean", description: "Search archived content" },
            includeMetadata: { type: "boolean", description: "Include archive metadata" },
            hashBasedDetection: { type: "boolean", description: "Use hash-based duplicate detection" }
          },
          additionalProperties: false
        }
      },
      required: ["action"],
      additionalProperties: false
    }
  },
  {
    name: "euclid-file-manager",
    description: "Context-aware file management with smart chunking and cross-reference detection",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["smart-chunk", "cross-reference", "contamination-check", "file-health"],
          description: "File management action"
        },
        filePath: {
          type: "string",
          description: "File or directory path to manage"
        },
        options: {
          type: "object",
          properties: {
            chunkSize: { type: "integer", description: "Chunk size for large files" },
            preserveContext: { type: "boolean", description: "Preserve contextual relationships" },
            preventContamination: { type: "boolean", description: "Enable contamination prevention" }
          },
          additionalProperties: false
        }
      },
      required: ["action", "filePath"],
      additionalProperties: false
    }
  },
  {
    name: "dependency-tracker",
    description: "Track component dependencies and identify integration points across the EUCLID ecosystem",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["track-dependencies", "find-integration-points", "circular-check", "dependency-graph"],
          description: "Dependency tracking action"
        },
        startPath: {
          type: "string",
          description: "Starting point for dependency analysis"
        },
        options: {
          type: "object",
          properties: {
            depth: { type: "integer", description: "Maximum dependency depth" },
            includeDevDependencies: { type: "boolean", description: "Include development dependencies" },
            outputFormat: { type: "string", enum: ["json", "mermaid", "tree"], description: "Output format" }
          },
          additionalProperties: false
        }
      },
      required: ["action"],
      additionalProperties: false
    }
  },
  {
    name: "evidence-validator",
    description: "Validate evidence-based operations using GuardedAgentRunner methodology - truth from wiring, not depth",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["validate-evidence", "truth-from-wiring", "guard-check", "methodology-audit"],
          description: "Evidence validation action"
        },
        evidencePath: {
          type: "string",
          description: "Path to evidence or system to validate"
        },
        options: {
          type: "object",
          properties: {
            strictMode: { type: "boolean", description: "Enable strict validation mode" },
            includeProvenance: { type: "boolean", description: "Include evidence provenance" },
            wiringValidation: { type: "boolean", description: "Validate system wiring" }
          },
          additionalProperties: false
        }
      },
      required: ["action"],
      additionalProperties: false
    }
  }
];

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOL_DEFINITIONS
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "curriculum-analyzer":
        return await tools.curriculumAnalyzer.execute(args);
      
      case "component-mapper":
        return await tools.componentMapper.execute(args);
      
      case "pipeline-reconciler":
        return await tools.pipelineReconciler.execute(args);
      
      case "salem-interface":
        return await tools.salemInterface.execute(args);
      
      case "archive-linker":
        return await tools.archiveLinker.execute(args);
      
      case "euclid-file-manager":
        return await tools.fileManager.execute(args);
      
      case "dependency-tracker":
        return await tools.dependencyTracker.execute(args);
      
      case "evidence-validator":
        return await tools.evidenceValidator.execute(args);

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    
    console.error(`Error executing tool ${name}:`, error);
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error.message}`
    );
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("🎨 EUCLID MCP Server started - Salem Drunk Tank interface ready");
  console.error("🔧 Available tools:", TOOL_DEFINITIONS.map(t => t.name).join(", "));
  console.error("📍 Base paths:");
  console.error(`   EUCLID_NORMALIZATION: ${EUCLID_NORMALIZATION_PATH}`);
  console.error(`   PUBLIC: ${PUBLIC_PATH}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Failed to start EUCLID MCP server:", error);
    process.exit(1);
  });
}

export { server, tools, TOOL_DEFINITIONS };