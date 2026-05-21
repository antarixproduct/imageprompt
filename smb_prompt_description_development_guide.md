# SMB Prompt Description SaaS — Development Guide

# MVP Goal

Build a SaaS platform where SMB users:
- fill structured business forms
- receive organized design descriptions
- manually use ChatGPT later for prompt optimization

No AI integration required in MVP.

---

# Recommended Development Order

# Phase 1 — Project Setup

# Frontend Setup

## Create React Project

```bash
npm create vite@latest
```

---

## Install Dependencies

```bash
npm install react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
```

---

# Backend Setup

## Create Express Server

```bash
npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
```

---

# Phase 2 — Database Setup

# MongoDB Atlas

## Create
- Free cluster
- Database user
- Connection string

---

# Phase 3 — Authentication System

# Backend

## Create APIs
- Signup
- Login
- JWT verification

---

# Frontend

## Create Pages
- Login
- Signup
- Protected routes

---

# Phase 4 — Dashboard Structure

# Create Pages

## Dashboard Home
## Create Description
## History
## Business Profiles
## Settings

---

# Recommended Frontend Structure

```text
src/
|
|-- pages/
|-- components/
|-- services/
|-- hooks/
|-- layouts/
|-- utils/
|-- context/
```

---

# Recommended Backend Structure

```text
server/
|
|-- routes/
|-- controllers/
|-- middleware/
|-- models/
|-- services/
|-- utils/
```

---

# Phase 5 — Dynamic Form Engine

This is the main feature.

# Business Type Selector

Example:

```text
Restaurant
Travel Agency
Salon
Coaching Institute
Gym
Fashion Store
```

---

# Conditional Form Rendering

## Example

If:
```text
Restaurant
```

Show:
```text
Cuisine Type
Dining Style
Food Mood
```

If:
```text
Travel Agency
```

Show:
```text
Tour Type
Destination Region
Luxury/Budget
```

---

# Recommended React Components

```text
components/forms/
```

## Suggested Components

```text
BusinessTypeSelector.jsx
SpecialityFields.jsx
PostGoalFields.jsx
PlatformFields.jsx
DesignDirectionFields.jsx
MarketingContentFields.jsx
AdditionalInstructionFields.jsx
```

---

# Phase 6 — Description Builder Logic

# Backend Responsibility

Receive structured JSON.

Example:

```json
{
  "businessType": "Travel Agency",
  "speciality": "Northeast Tours",
  "postType": "Discount Offer",
  "platform": "Instagram",
  "themeColor": "Blue and Orange"
}
```

---

# Description Assembly Logic

## Step 1
Create reusable description templates.

---

## Step 2
Combine form values dynamically.

---

## Step 3
Return structured formatted description.

---

# Output Example

```text
Business Type:
Travel Agency

Speciality:
Adventure Northeast Tours

Theme:
Modern premium adventure

Composition:
70% scenic visuals
30% promotional text

Important Text:
20% OFF Summer Tours

Visual Direction:
Use mountain landscapes and modern typography
```

---

# Phase 7 — History System

Store:
- generated descriptions
- user ID
- business type
- creation date

---

# Phase 8 — Business Profiles

Allow users to save:
- business name
- logo
- colors
- contact information

This reduces repetitive form filling.

---

# MVP UX Principles

# Keep Everything Structured

Use:
- dropdowns
- chips
- toggles
- presets
- conditional fields

Avoid:
- large open text inputs
- complicated manual instructions

---

# Important Product Principle

Users should NOT need:
- prompt knowledge
- design terminology
- AI understanding

Your system should:
- guide users
- simplify inputs
- structure design direction

---

# Suggested UI Flow

```text
Login
    ↓
Dashboard
    ↓
Create Description
    ↓
Select Business Type
    ↓
Dynamic Form
    ↓
Generate Description
    ↓
Copy Description
```

---

# Deployment Guide

# Frontend Deployment

## Vercel

### Steps
1. Push frontend to GitHub
2. Connect GitHub to Vercel
3. Deploy

---

# Backend Deployment

## Railway

### Steps
1. Push backend to GitHub
2. Connect repository to Railway
3. Add environment variables
4. Deploy

---

# Environment Variables

## Backend

```env
MONGODB_URI=
JWT_SECRET=
```

---

# Free Tier Reality

# Fully Possible for MVP

## Vercel
Good for frontend hosting.

## Railway
Good for backend testing.

## MongoDB Atlas
Good free database.

---

# No API Cost Initially

Since:
- no OpenAI integration
- no image generation

You can test with almost zero investment.

---

# Suggested MVP Timeline

## Week 1
Setup + authentication

## Week 2
Dashboard + dynamic forms

## Week 3
Description generation engine

## Week 4
Testing + deployment

---

# Biggest Technical Priority

Your product quality depends on:
- business-specific form logic
- structured input collection
- smart description formatting

Not on AI initially.

---

# Recommended Future Features

## Phase 2
ChatGPT API integration

## Phase 3
AI image generation

## Phase 4
Editable templates

## Phase 5
Direct social media publishing
