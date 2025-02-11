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
        description: 'Retrieves all wallet addresses and their allocations',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Number of entries to return (default: 1000)',
            schema: {
              type: 'integer',
              example: 1000
            }
          },
          {
            name: 'cursor',
            in: 'query',
            required: false,
            description: 'Cursor for pagination',
            schema: {
              type: 'string'
            }
          }
        ],
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
                          allocation: {
                            type: 'number',
                            example: 1000
                          }
                        }
                      }
                    },
                    total: {
                      type: 'number',
                      example: 42
                    },
                    hasMore: {
                      type: 'boolean',
                      description: 'Indicates if there are more entries available'
                    },
                    nextCursor: {
                      type: 'string',
                      nullable: true,
                      description: 'Cursor for the next set of entries'
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
                  },
                  allocation: {
                    type: 'number',
                    example: 1000
                  }
                },
                required: ['walletAddress', 'allocation']
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
                        type: 'string'
                      },
                      allocation: {
                        type: 'number'
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
                            allocation: { type: 'number' }
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
            },
            '400': {
              description: 'No file provided'
            },
            '500': {
              description: 'Failed to process bulk addition'
            }
          }
        }
      }
    },
    '/waitlist/{walletAddress}': {
      get: {
        summary: 'Check wallet status',
        description: 'Check if a specific wallet address is in the waitlist',
        parameters: [
          {
            name: 'walletAddress',
            in: 'path',
            required: true,
            description: 'Wallet address to check',
            schema: {
              type: 'string',
              pattern: '^0x[a-fA-F0-9]{40}$',
              example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Wallet check result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    allocation: {
                      type: 'number',
                      description: 'Allocation amount if exists'
                    }
                  }
                },
                examples: {
                  'Found': {
                    value: {
                      allocation: 1000
                    }
                  },
                  'Not Found': {
                    value: {
                      allocation: 0
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid wallet address format'
          }
        }
      }
    }
  }
}; 