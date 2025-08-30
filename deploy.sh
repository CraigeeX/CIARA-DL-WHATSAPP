#!/bin/bash

# CIARA-IV MINI Quick Deploy Script
# Created by CraigeeX

echo "🤖 CIARA-IV MINI WhatsApp Bot Deployment"
echo "Created by CraigeeX - ciara.info.inc@gmail.com"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16+ first.${NC}"
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js version must be 16 or higher. Current: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚙️  Creating .env file...${NC}"
    cp .env.example .env
    
    echo -e "${BLUE}📝 Please edit .env file with your credentials:${NC}"
    echo "   - SESSION_ID: Your MEGA session ID (CIARA-IV~xxxxx)"
    echo "   - GEMINI_API_KEY: Your Google Gemini AI API key"
    echo "   - OWNER_NUMBER: Your WhatsApp number"
    echo ""
    echo -e "${YELLOW}⏸️  Edit .env file and run this script again.${NC}"
    exit 0
fi

# Validate environment variables
echo -e "${YELLOW}🔍 Validating environment variables...${NC}"

source .env

if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_gemini_api_key_here" ]; then
    echo -e "${RED}❌ GEMINI_API_KEY not set in .env file${NC}"
    echo "Get your API key from: https://makersuite.google.com/app/apikey"
    exit 1
fi

if [ -z "$OWNER_NUMBER" ]; then
    echo -e "${RED}❌ OWNER_NUMBER not set in .env file${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables validated${NC}"

# Create sessions directory
mkdir -p sessions
echo -e "${GREEN}✅ Sessions directory created${NC}"

# Start the bot
echo -e "${BLUE}🚀 Starting CIARA-IV MINI...${NC}"
echo "   Bot will start in 3 seconds..."
echo "   Press Ctrl+C to stop the bot"
echo ""

sleep 3

# Start with proper logging
npm start

echo -e "${YELLOW}👋 CIARA-IV MINI stopped${NC}"
echo -e "${BLUE}💬 Need help? Contact: ciara.info.inc@gmail.com${NC}"
