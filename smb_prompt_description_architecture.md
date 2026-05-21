# SMB Prompt Description SaaS — Architecture Plan

# Product Definition

A React-based SaaS platform that helps SMBs generate structured design descriptions for AI-generated social media posts.

The platform does NOT:
- generate AI prompts automatically
- connect directly to ChatGPT
- generate images

Instead, it:
- collects structured marketing inputs
- organizes design direction
- creates detailed prompt descriptions

Users manually:
1. Copy description from the platform
2. Paste into ChatGPT
3. Get refined AI prompt
4. Paste into image AI tools

---

# Actual Workflow

```text
User fills business form
        ↓
Platform generates structured design description
        ↓
User copies description
        ↓
User pastes into ChatGPT
        ↓
ChatGPT creates polished image prompt
        ↓
User pastes prompt into image AI tool
        ↓
Social media design generated
```

---

# Main MVP Goal

Help SMBs:
- avoid prompt-writing confusion
- structure marketing information properly
- improve AI-generated design quality
- get better first-attempt results

---

# High-Level Architecture

```text
Frontend (React + Vercel)
        |
        v
Backend API (Node.js + Express on Railway)
        |
        v
MongoDB Atlas
```

No AI integration required.

---

# Tech Stack

## Frontend
- React
- Vite
- TailwindCSS
- Axios
- React Router

Deployment:
- Vercel Free Tier

---

## Backend
- Node.js
- Express.js

Deployment:
- Railway Free Tier

---

## Database
- MongoDB Atlas Free Tier

---

# Core SaaS Modules

# 1. Authentication Module

## Features
- Signup
- Login
- JWT authentication

---

# 2. Business Profile Module

Purpose:
Store reusable SMB information.

## Fields

```json
{
  "businessName": "",
  "businessType": "",
  "speciality": "",
  "brandColors": [],
  "contactNumber": "",
  "logoUrl": ""
}
```

---

# 3. Dynamic Form Engine

Main SaaS feature.

## Responsibilities
- Show fields based on business type
- Show marketing-specific options
- Collect design direction inputs

---

# 4. Description Builder Engine

Purpose:
Convert form data into structured design descriptions.

---

# Description Structure

## Section 1 — Business Context
## Section 2 — Marketing Goal
## Section 3 — Platform Type
## Section 4 — Visual Direction
## Section 5 — Typography Style
## Section 6 — Layout Ratio
## Section 7 — Important Text
## Section 8 — CTA Instructions

---

# 5. Prompt History Module

Store generated descriptions.

## Fields

```json
{
  "userId": "",
  "businessType": "",
  "postType": "",
  "platform": "",
  "generatedDescription": "",
  "createdAt": ""
}
```

---

# Frontend Pages

## Public
- Landing Page
- Login
- Signup

## Dashboard
- Dashboard Home
- Create Description
- Description History
- Business Profiles
- Settings

---

# Dynamic Form Logic

# Business Type → Controls

## Restaurant
- Cuisine Type
- Dining Style
- Food Mood

## Travel Agency
- Tour Type
- Region
- Budget/Luxury

## Coaching Institute
- Course Type
- Scholarship
- Admission Season

---

# Form Sections

# Step 1 — Business Information

## Fields
- Business Name
- Business Type
- Speciality

---

# Step 2 — Post Goal

## Fields
- Offer
- Festival Wish
- New Product
- Admission Open
- Event Promotion
- Awareness

---

# Step 3 — Platform Selection

## Fields
- Instagram Post
- Instagram Story
- Facebook Post
- WhatsApp Status
- LinkedIn

---

# Step 4 — Design Direction

## Fields
- Theme Color
- Design Style
- Modern / Premium / Traditional
- Text vs Graphic Ratio

---

# Step 5 — Marketing Content

## Fields
- Headline
- Subheadline
- Offer Details
- CTA
- Contact Information

---

# Step 6 — Additional Instructions

## Fields
- Important things to highlight
- Things to avoid
- Preferred style references

---

# Output Example

```text
Business Type:
Travel Agency

Speciality:
Northeast Tours

Platform:
Instagram Post

Design Style:
Modern adventure theme

Color Theme:
Blue and orange

Composition:
70% scenic visuals
30% promotional text

Visual Direction:
Use mountain landscapes and premium travel aesthetics

Important Text:
20% OFF Northeast Tours

CTA:
Book Now
```

---

# API Structure

# Auth APIs

```text
POST /api/auth/signup
POST /api/auth/login
```

---

# Description APIs

```text
POST /api/descriptions/create
GET /api/descriptions/history
```

---

# Business Profile APIs

```text
POST /api/business/create
GET /api/business/list
```

---

# Database Collections

## users
## businessProfiles
## descriptionHistories

---

# Suggested MVP Features

## Must Have
- Authentication
- Dynamic forms
- Description generation
- Copy button
- History storage
- Mobile responsive dashboard

---

# Avoid in MVP

## Do NOT build initially
- AI integrations
- ChatGPT API
- Image generation
- Canva editor
- Auto-posting
- Team features
- Payment system

---

# Free Tier Feasibility

Yes.

You can fully test the MVP with free tiers.

## Frontend
Vercel free hosting

## Backend
Railway free credits

## Database
MongoDB Atlas free cluster

---

# Main Advantage of This MVP

- Zero AI cost
- Faster development
- Easier validation
- Lower complexity
- Better focus on user experience

---

# Future Scaling Plan

## Phase 2
Direct ChatGPT API integration

## Phase 3
Image generation integration

## Phase 4
Template editing

## Phase 5
Auto social posting
