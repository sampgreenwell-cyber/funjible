# NewsAccess - Pay-Per-Article Platform

A revolutionary platform that allows users to purchase individual news articles without committing to monthly subscriptions.

## Features

- **Pay-Per-Article**: Purchase individual articles for $0.25-$1.50
- **Digital Wallet**: Pre-fund your account for instant purchases
- **Publisher Integration**: API-based integration with major news publishers
- **Analytics**: Track your reading habits and spending
- **Flexible Options**: Choose between per-article, weekly passes, or monthly subscriptions

## Architecture

- **Backend**: Node.js with Express and TypeScript
- **Database**: MongoDB for data persistence
- **Cache**: Redis for session management
- **Payment**: Stripe integration for payment processing
- **Authentication**: JWT-based authentication
- **Containerization**: Docker and Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Installation

1. Clone the repository
```bash
git clone https://github.com/sampgreenwell-cyber/funjible.git
cd funjible
```

2. Create environment file
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the application
```bash
docker-compose up -d
```

4. Access the application
- API: http://localhost:3000
- Health check: http://localhost:3000/health

## API Documentation

### Authentication

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Articles

#### Purchase Article
```bash
POST /api/articles/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "articleId": "article_123",
  "publisherId": "nyt",
  "amount": 0.75
}
```

### Wallet

#### Add Funds
```bash
POST /api/wallet/fund
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 10.00,
  "paymentMethodId": "pm_123456"
}
```

## Development

### Local Development
```bash
npm install
npm run dev
```

### Run Tests
```bash
npm test
```

### Build
```bash
npm run build
```

## Project Structure
```
newsaccess/
├── src/
│   ├── controllers/    # Route controllers
│   ├── models/        # Database models
│   ├── services/      # Business logic
│   ├── middleware/    # Express middleware
│   ├── routes/        # API routes
│   ├── config/        # Configuration
│   └── utils/         # Utility functions
├── docs/              # Documentation
├── scripts/           # Helper scripts
├── nginx/             # Nginx configuration
└── logs/              # Application logs
```

## Environment Variables

Key environment variables (see `.env.example` for full list):

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection URL
- `JWT_SECRET` - Secret for JWT tokens
- `STRIPE_SECRET_KEY` - Stripe API key

## Deployment

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, open an issue on GitHub or contact the team.
```

### 3. `.gitignore` (update if needed)
```
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build output
dist/
build/

# Environment
.env
.env.local
.env.production

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Misc
*.pem
*.key
.cache/
```

### 4. `LICENSE`
```
MIT License

Copyright (c) 2024 NewsAccess

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.