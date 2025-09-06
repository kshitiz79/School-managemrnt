// Mock Gateway Adapters with Success/Failure Simulation

class MockGatewayAdapter {
  constructor(name, successRate = 0.85) {
    this.name = name
    this.successRate = successRate
    this.rateLimits = {
      requests: 0,
      limit: 100,
      resetTime: Date.now() + 3600000, // 1 hour
    }
  }

  async send(message) {
    // Simulate rate limiting
    if (this.rateLimits.requests >= this.rateLimits.limit) {
      if (Date.now() < this.rateLimits.resetTime) {
        throw new Error(
          `Rate limit exceeded. Try again after ${new Date(this.rateLimits.resetTime).toLocaleTimeString()}`,
        )
      } else {
        // Reset rate limit
        this.rateLimits.requests = 0
        this.rateLimits.resetTime = Date.now() + 3600000
      }
    }

    this.rateLimits.requests++

    // Simulate network delay
    await this.delay(Math.random() * 2000 + 500)

    // Simulate success/failure based on success rate
    const isSuccess = Math.random() < this.successRate

    if (isSuccess) {
      return this.generateSuccessResponse(message)
    } else {
      throw new Error(this.generateErrorMessage())
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  generateSuccessResponse(message) {
    return {
      messageId: `${this.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent',
      timestamp: new Date().toISOString(),
      gateway: this.name,
      recipient: message.recipient,
      cost: this.calculateCost(message),
    }
  }

  generateErrorMessage() {
    const errors = [
      'Network timeout',
      'Invalid recipient number',
      'Message content blocked',
      'Gateway temporarily unavailable',
      'Insufficient credits',
      'Rate limit exceeded',
    ]
    return errors[Math.floor(Math.random() * errors.length)]
  }

  calculateCost(message) {
    // Mock cost calculation
    return Math.random() * 0.1 + 0.01
  }

  getRateLimitInfo() {
    return {
      remaining: this.rateLimits.limit - this.rateLimits.requests,
      limit: this.rateLimits.limit,
      resetTime: this.rateLimits.resetTime,
    }
  }
}

class WhatsAppGateway extends MockGatewayAdapter {
  constructor() {
    super('WhatsApp', 0.9)
    this.rateLimits.limit = 50 // Lower limit for WhatsApp
  }

  async send(message) {
    // WhatsApp specific validations
    if (message.content.length > 1600) {
      throw new Error('Message too long for WhatsApp (max 1600 characters)')
    }

    if (!this.isValidWhatsAppNumber(message.recipient)) {
      throw new Error('Invalid WhatsApp number format')
    }

    return super.send(message)
  }

  isValidWhatsAppNumber(number) {
    // Simple validation for demo
    return /^\+?[1-9]\d{1,14}$/.test(number.replace(/\s/g, ''))
  }

  generateSuccessResponse(message) {
    const response = super.generateSuccessResponse(message)
    return {
      ...response,
      deliveryStatus: Math.random() > 0.3 ? 'delivered' : 'pending',
      readStatus: Math.random() > 0.6 ? 'read' : 'unread',
    }
  }
}

class SMSGateway extends MockGatewayAdapter {
  constructor() {
    super('SMS', 0.95)
    this.rateLimits.limit = 200
  }

  async send(message) {
    // SMS specific validations
    if (message.content.length > 160) {
      // Split into multiple SMS
      const parts = Math.ceil(message.content.length / 160)
      message.parts = parts
      message.cost = this.calculateCost(message) * parts
    }

    if (!this.isValidPhoneNumber(message.recipient)) {
      throw new Error('Invalid phone number format')
    }

    return super.send(message)
  }

  isValidPhoneNumber(number) {
    return /^\+?[1-9]\d{1,14}$/.test(number.replace(/\s/g, ''))
  }

  calculateCost(message) {
    const baseCost = 0.05
    const parts = message.parts || 1
    return baseCost * parts
  }
}

class EmailGateway extends MockGatewayAdapter {
  constructor() {
    super('Email', 0.98)
    this.rateLimits.limit = 500
  }

  async send(message) {
    // Email specific validations
    if (!this.isValidEmail(message.recipient)) {
      throw new Error('Invalid email address format')
    }

    if (!message.subject) {
      throw new Error('Email subject is required')
    }

    return super.send(message)
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  generateSuccessResponse(message) {
    const response = super.generateSuccessResponse(message)
    return {
      ...response,
      deliveryStatus: Math.random() > 0.1 ? 'delivered' : 'bounced',
      openStatus: Math.random() > 0.4 ? 'opened' : 'unopened',
    }
  }

  calculateCost(message) {
    // Email is typically cheaper
    return 0.001
  }
}

// Gateway Manager
class GatewayManager {
  constructor() {
    this.gateways = {
      whatsapp: new WhatsAppGateway(),
      sms: new SMSGateway(),
      email: new EmailGateway(),
    }
  }

  async sendMessage(type, message) {
    const gateway = this.gateways[type]
    if (!gateway) {
      throw new Error(`Unsupported gateway type: ${type}`)
    }

    try {
      const result = await gateway.send(message)

      // Log the message
      this.logMessage(type, message, result, 'success')

      return result
    } catch (error) {
      // Log the error
      this.logMessage(type, message, null, 'failed', error.message)
      throw error
    }
  }

  async sendBulkMessages(type, messages) {
    const results = []
    const gateway = this.gateways[type]

    if (!gateway) {
      throw new Error(`Unsupported gateway type: ${type}`)
    }

    for (const message of messages) {
      try {
        // Add delay between messages to simulate real-world behavior
        if (results.length > 0) {
          await gateway.delay(100 + Math.random() * 200)
        }

        const result = await this.sendMessage(type, message)
        results.push({ ...result, status: 'success' })
      } catch (error) {
        results.push({
          recipient: message.recipient,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString(),
        })
      }
    }

    return {
      total: messages.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      results,
    }
  }

  logMessage(type, message, result, status, error = null) {
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      recipient: message.recipient,
      recipientName: message.recipientName || 'Unknown',
      subject: message.subject,
      content: message.content,
      status,
      result,
      error,
      timestamp: new Date().toISOString(),
      gateway: type,
    }

    // In a real application, this would be saved to a database
    console.log('Message Log:', logEntry)

    // Store in localStorage for demo purposes
    const logs = JSON.parse(localStorage.getItem('communicationLogs') || '[]')
    logs.unshift(logEntry)

    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.splice(1000)
    }

    localStorage.setItem('communicationLogs', JSON.stringify(logs))
  }

  getGatewayStatus() {
    return Object.entries(this.gateways).map(([type, gateway]) => ({
      type,
      name: gateway.name,
      status: 'active',
      successRate: gateway.successRate,
      rateLimitInfo: gateway.getRateLimitInfo(),
      lastUsed: new Date().toISOString(),
    }))
  }

  async testGateway(type) {
    const testMessage = {
      recipient: type === 'email' ? 'test@example.com' : '+1234567890',
      recipientName: 'Test User',
      subject: 'Test Message',
      content: 'This is a test message to verify gateway connectivity.',
    }

    try {
      const result = await this.sendMessage(type, testMessage)
      return {
        success: true,
        message: 'Gateway test successful',
        result,
      }
    } catch (error) {
      return {
        success: false,
        message: 'Gateway test failed',
        error: error.message,
      }
    }
  }
}

// Export singleton instance
export const gatewayManager = new GatewayManager()

// Export individual gateways for testing
export { WhatsAppGateway, SMSGateway, EmailGateway }
