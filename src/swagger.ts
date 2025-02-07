import { OpenAPIV3 } from '@hono/swagger-ui'

export const swaggerConfig: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Simple Waitlist API',
    version: '1.0.0',
    description: 'Simple API for managing a waitlist with wallet addresses'
  },
  paths: {
    '/waitlist': {
      get: {
        summary: 'Get all waitlist entries',
        description: 'Retrieves all wallet addresses and their join timestamps',
        responses: {
          '200': {
            description: 'List of waitlist entries',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    entries: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          walletAddress: {
                            type: 'string',
                            example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                          },
                          joinedAt: {
                            type: 'number',
                            example: 1709529600000
                          }
                        }
                      }
                    },
                    total: {
                      type: 'number',
                      example: 42
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Add wallet to waitlist',
        description: 'Adds a new wallet address to the waitlist',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  walletAddress: {
                    type: 'string',
                    pattern: '^0x[a-fA-F0-9]{40}$',
                    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                  }
                },
                required: ['walletAddress']
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Wallet added successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    walletAddress: {
                      type: 'string',
                      example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
                    },
                    joinedAt: {
                      type: 'number',
                      example: 1709529600000
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid wallet address format'
          },
          '409': {
            description: 'Wallet already registered'
          }
        }
      }
    },
    '/waitlist/bulk': {
      post: {
        summary: 'Bulk add wallets to waitlist',
        description: 'Add multiple wallet addresses from a text file (CSV or newline separated)',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Text file containing wallet addresses'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Bulk addition results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    successful: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          walletAddress: { type: 'string' },
                          joinedAt: { type: 'number' }
                        }
                      }
                    },
                    failed: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          walletAddress: { type: 'string' },
                          reason: { type: 'string' }
                        }
                      }
                    },
                    summary: {
                      type: 'object',
                      properties: {
                        total: { type: 'number' },
                        succeeded: { type: 'number' },
                        failed: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}; 