# TooliQ - AI Gradient Generator

An intuitive web-based application for web designers to generate custom gradients using AI, with export options in high-resolution formats (PNG and JPEG, 4K to 8K quality).

## Features

### 🎨 Gradient Generation
- Generate gradients based on user input (prompts, color preferences, themes, or keywords)
- AI-assisted recommendations for gradient styles using Azure OpenAI
- Random gradient suggestions
- Predefined gradient templates (Sunset, Ocean, Forest)

### 🎛️ Customization
- Live preview with real-time adjustments
- Support for linear, radial, and conic gradients
- Adjustable gradient orientation and direction
- Color stop customization with position controls

### 📁 Export Options
- Export gradients in high-quality PNG or JPEG formats
- Support for 4K (3840×2160) and 8K (7680×4320) resolutions
- Copy CSS code for web integration
- Professional-quality exports for design work

### 👤 User Features (Coming Soon)
- User accounts with Neon.tech database storage
- Save favorite gradients
- Gradient history management

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Language**: TypeScript
- **Export**: html2canvas for high-resolution image generation

### Backend
- **Framework**: Next.js API Routes
- **AI**: Azure OpenAI for intelligent gradient recommendations
- **Database**: Neon.tech (PostgreSQL) for user data and gradient storage

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Azure OpenAI API access
- Neon.tech database (optional, for user features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tars
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name

# Neon Database Configuration (optional)
DATABASE_URL=your_neon_database_url

# NextAuth Configuration (optional, for user auth)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Basic Gradient Generation
1. **AI Generation**: Enter a descriptive prompt (e.g., "sunset over mountains") and click "Generate with AI"
2. **Quick Actions**: Use predefined gradients or generate random gradients
3. **Manual Customization**: Adjust gradient type, direction, and color stops

### Customization Controls
- **Type**: Choose between linear, radial, or conic gradients
- **Direction**: Adjust angle for linear gradients (0-360°)
- **Color Stops**: Add/modify colors and their positions

### Export Options
1. Choose resolution (4K or 8K)
2. Select format (PNG or JPEG)
3. Click export to download high-resolution image
4. Use "Copy CSS" to get the gradient code for web development

## API Endpoints

### POST `/api/generate-gradient`
Generate AI-powered gradients based on text prompts.

**Request Body:**
```json
{
  "prompt": "describe your gradient"
}
```

**Response:**
```json
{
  "type": "linear",
  "direction": 45,
  "stops": [
    { "color": "#ff6b6b", "position": 0 },
    { "color": "#feca57", "position": 100 }
  ]
}
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate-gradient/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── slider.tsx
└── lib/
    └── utils.ts
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

- [ ] User authentication and accounts
- [ ] Gradient history and favorites
- [ ] Advanced AI prompting with style preferences
- [ ] Gradient animation support
- [ ] Team collaboration features
- [ ] API for third-party integrations
- [ ] Mobile app version

## Support

For support, please open an issue on GitHub or contact [support@tooliq.com](mailto:support@tooliq.com).
