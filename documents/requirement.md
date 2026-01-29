# Project Requirements: Startup Benefits Platform

## 1. Business Context
* [cite_start]**Objective**: Build a platform providing exclusive deals on SaaS products (cloud, marketing, analytics, productivity) for early-stage teams[cite: 4, 10].
* [cite_start]**Target Users**: Startup founders, early-stage teams, and indie hackers[cite: 5, 6, 7, 8].
* [cite_start]**Problem Statement**: Bridging the gap for startups that cannot afford premium SaaS tools through exclusive, sometimes restricted, deals[cite: 10, 11].

---

## 2. Technical Constraints (Strict)

### Frontend
* [cite_start]**Framework**: Next.js only using the App Router[cite: 14].
* [cite_start]**Language**: TypeScript[cite: 15].
* [cite_start]**Styling**: Any modern solution (Tailwind CSS, CSS Modules, etc.)[cite: 16].
* [cite_start]**Animations**: High-quality animations are mandatory[cite: 17, 41].
* [cite_start]**Restriction**: Standalone React applications are not allowed; all work must be within Next.js[cite: 19].

### Backend
* [cite_start]**Runtime/Framework**: Node.js and Express.js[cite: 21, 22].
* [cite_start]**Database**: MongoDB with Mongoose[cite: 23].
* [cite_start]**API Style**: REST APIs[cite: 24].
* [cite_start]**Authentication**: JWT-based[cite: 25, 90].
* [cite_start]**Strict Prohibitions**: No GraphQL, Firebase, Supabase, or serverless abstractions[cite: 26].

---

## 3. Core Application Flow
1. [cite_start]**Authentication**: User registers and logs in[cite: 28].
2. [cite_start]**Discovery**: User browses available deals[cite: 29].
3. [cite_start]**Access Control**: Certain deals are locked and require verification[cite: 30, 47].
4. [cite_start]**Action**: User claims an eligible deal[cite: 31].
5. [cite_start]**Tracking**: Claimed deals appear in a user dashboard with status tracking[cite: 32].

---

## 4. Mandatory Pages & UI Features

### Landing Page
* [cite_start]**Layout**: Premium SaaS-style[cite: 37].
* [cite_start]**Content**: Clear value proposition and a Call-to-Action (CTA)[cite: 38, 40].
* [cite_start]**Motion**: Mandatory animated hero section[cite: 39, 41].

### Deals Listing Page
* [cite_start]**Features**: Search functionality and filters for category and access level (locked/unlocked).
* [cite_start]**UX**: Smooth transitions between UI states[cite: 46].
* [cite_start]**Visuals**: Locked deals must be visually restricted with clear communication on why access is limited[cite: 47].

### Deal Details Page
* [cite_start]**Content**: Full description, partner info, and eligibility conditions[cite: 49, 50, 51].
* [cite_start]**Interaction**: Actionable "Claim" button[cite: 52].

### User Dashboard
* [cite_start]**Profile**: Display user profile information[cite: 54].
* [cite_start]**History**: List of claimed deals[cite: 55].
* [cite_start]**Status**: Track claim status (e.g., pending, approved).

---

## 5. Animation & Motion Design
* [cite_start]**Required**: Page transitions, micro-interactions (hover, feedback), loading/skeleton screens, and smooth layout transitions[cite: 60, 61, 62, 63].
* **High-Value Options (Implement at least one)**:
    * [cite_start]3D hero/element via Three.js[cite: 66].
    * [cite_start]Scroll-based storytelling[cite: 67].
    * [cite_start]Interactive cards with depth/tilt[cite: 68].
    * [cite_start]Motion-driven onboarding flows[cite: 69].
* [cite_start]**Constraint**: Overuse of motion is considered a negative signal; it must enhance usability[cite: 70].

---

## 6. Backend Requirements
* [cite_start]**Entities**: User, Deal, and Claim[cite: 75, 76, 77].
* **Responsibilities**:
    * [cite_start]Design schema fields, relationships, and indexes[cite: 79, 80, 81].
    * [cite_start]Implement validation rules and error handling[cite: 82, 95].
    * [cite_start]Secure protected routes with JWT[cite: 90].
    * [cite_start]Prevent unverified users from claiming locked deals[cite: 90].

---

## 7. Submission & README Requirements
* [cite_start]**Documentation**: A mandatory README.md must explain the end-to-end flow, auth strategy, claim logic, frontend/backend interaction, limitations, and production improvements[cite: 99, 100, 101, 102, 103, 104, 105].
* [cite_start]**Originality**: Use of AI-generated code or copied external solutions is strictly prohibited and results in disqualification[cite: 125, 126, 132].