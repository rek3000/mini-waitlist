import { OpenAPIV3 } from '@hono/swagger-ui'

export const swaggerConfig: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Mini Waitlist API',
    version: '1.0.0',
    description: 'API for managing a waitlist with wallet addresses'
  },
  servers: [
    {
      url: 'https://mini-waitlist.{subdomain}.workers.dev',
      variables: {
        subdomain: {
          default: 'your-worker'
        }
      }
    }
  ],
  paths: {
    '/waitlist': {
      get: {
        summary: 'List all waitlist entries',
        description: 'Retrieves all entries in the waitlist with optional pagination',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            description: 'Maximum number of entries to return',
            schema: {
              type: 'integer',
              default: 100
            }
          },
          {
            name: 'cursor',
            in: 'query',
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
                        $ref: '#/components/schemas/WaitlistEntry'
                      }
                    },
                    meta: {
                      $ref: '#/components/schemas/WaitlistMeta'
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        limit: { type: 'integer' },
                        hasMore: { type: 'boolean' },
                        nextCursor: { type: 'string' }
                      }
                    }
                  }
                }
              },
              example: {
                entries: [
                  {
                    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                    position: 1,
                    joinedAt: 1709529600000,
                    email: 'vitalik@ethereum.org'
                  },
                  {
                    walletAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
                    position: 2,
                    joinedAt: 1709529700000
                  }
                ],
                meta: {
                  totalEntries: 2,
                  lastPosition: 2,
                  updatedAt: 1709529700000
                },
                pagination: {
                  limit: 100,
                  hasMore: false
                }
              }
            }
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new waitlist entry',
        description: 'Adds a new wallet address to the waitlist',
        security: [
          {
            ApiKeyAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateWaitlistEntryRequest'
              },
              examples: {
                'New Entry': {
                  value: {
                    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                    email: 'vitalik@ethereum.org'
                  }
                },
                'Without Email': {
                  value: {
                    walletAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Entry created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    entry: {
                      $ref: '#/components/schemas/WaitlistEntry'
                    },
                    meta: {
                      $ref: '#/components/schemas/WaitlistMeta'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '409': {
            description: 'Wallet address already registered',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/waitlist/{walletAddress}': {
      delete: {
        summary: 'Delete a waitlist entry',
        description: 'Removes a wallet address from the waitlist',
        security: [
          {
            ApiKeyAuth: []
          }
        ],
        parameters: [
          {
            name: 'walletAddress',
            in: 'path',
            required: true,
            description: 'Ethereum wallet address',
            schema: {
              type: 'string',
              pattern: '^0x[a-fA-F0-9]{40}$',
            },
            example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
          }
        ],
        responses: {
          '200': {
            description: 'Entry deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    deletedEntry: {
                      $ref: '#/components/schemas/WaitlistEntry'
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '404': {
            description: 'Entry not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key'
      }
    },
    schemas: {
      WaitlistEntry: {
        type: 'object',
        properties: {
          walletAddress: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]{40}$',
            description: 'Ethereum wallet address',
            example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
          },
          position: {
            type: 'integer',
            description: 'Position in the waitlist (1-based)',
            example: 1
          },
          joinedAt: {
            type: 'integer',
            description: 'Timestamp when the user joined the waitlist',
            example: 1709529600000
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Optional email address',
            example: 'vitalik@ethereum.org'
          }
        },
        required: ['walletAddress', 'position', 'joinedAt']
      },
      WaitlistMeta: {
        type: 'object',
        properties: {
          totalEntries: {
            type: 'integer',
            description: 'Total number of entries in the waitlist',
            example: 42
          },
          lastPosition: {
            type: 'integer',
            description: 'The last/highest position number used',
            example: 42
          },
          updatedAt: {
            type: 'integer',
            description: 'Timestamp of the last update',
            example: 1709529600000
          }
        },
        required: ['totalEntries', 'lastPosition', 'updatedAt']
      },
      CreateWaitlistEntryRequest: {
        type: 'object',
        properties: {
          walletAddress: {
            type: 'string',
            pattern: '^0x[a-fA-F0-9]{40}$',
            description: 'Ethereum wallet address',
            example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Optional email address',
            example: 'vitalik@ethereum.org'
          }
        },
        required: ['walletAddress'],
        examples: {
          'With Email': {
            value: {
              walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
              email: 'vitalik@ethereum.org'
            }
          },
          'Without Email': {
            value: {
              walletAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
            }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
            example: 'Wallet address already registered'
          },
          details: {
            type: 'string',
            description: 'Additional error details',
            example: 'The wallet address is already in the waitlist at position 5'
          }
        },
        required: ['error']
      }
    }
  }
} 