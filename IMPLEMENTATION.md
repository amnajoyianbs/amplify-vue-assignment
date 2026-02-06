# Asset Management System - Implementation Guide

## Overview
Full-stack asset management application built with AWS Amplify Gen 2 and Vue 3, demonstrating cloud-native architecture and modern frontend patterns.

## Architecture

### Backend (AWS Amplify Gen 2)

#### 1. **Authentication** (`amplify/auth/resource.ts`)
- Amazon Cognito for user authentication
- Email-based login
- Secure user sessions

#### 2. **Data Layer** (`amplify/data/resource.ts`)
- **DynamoDB via AppSync GraphQL**:
  - `AssetInfo`: Stores tags, status, notes
  - `AssetLog`: Activity logs (created, updated, deleted, viewed)
- Authorization: Owner-based access control

#### 3. **Storage** (`amplify/storage/resource.ts`)
- **Amazon S3** for image uploads
- Path-based access control: `assets/{entity_id}/*`
- Authenticated users can read, owners can write/delete

#### 4. **Lambda Functions** (`amplify/functions/asset-handler/`)
- **RDS MySQL via Sequelize**:
  - Asset metadata (name, description, category, imageUrl)
  - CRUD operations
- Actions: create, list, get, update, delete

### Frontend (Vue 3 + Composition API)

#### State Management (Pinia)
- **assetStore**: Asset CRUD, image upload, DynamoDB operations
- **authStore**: Authentication state, user info

#### Components

**Layout Components (Slots)**:
- `AppLayout.vue`: Header, main, footer slots
- `Card.vue`: Reusable card with header/body/footer slots

**Asset Components**:
- `AssetForm.vue`: Create/edit form with validation
  - Demonstrates: v-model, @input, custom events, props/emits
- `AssetList.vue`: Grid display with loading/empty states
  - Demonstrates: v-if/v-else, v-for, conditional rendering

**Common Components**:
- `ConfirmDialog.vue`: Headless UI modal for confirmations

**Views**:
- `AssetManagement.vue`: Main view with lifecycle hooks (onMounted)

## Vue 3 Concepts Demonstrated

### 1. Component Architecture
- Modular, reusable components
- Clear separation of concerns
- Layout components with slots

### 2. Templates & Directives
- `v-if`, `v-else-if`, `v-else`: Conditional rendering
- `v-for`: List rendering with keys
- `v-model`: Two-way data binding
- `@click`, `@submit`: Event handling
- `:class`, `:style`: Dynamic attributes

### 3. Component Communication
- **Props**: Parent → Child data flow
- **Emits**: Child → Parent events
- **Slots**: Content projection

### 4. State Management
- Pinia stores for global state
- Reactive state with `ref()` and `reactive()`
- Computed properties

### 5. Lifecycle Hooks
- `onMounted`: Data fetching on component mount

### 6. Forms & Validation
- Element Plus form validation
- File upload handling
- Custom validation rules

### 7. UI Libraries
- **Element Plus**: Primary UI components (forms, buttons, dialogs)
- **Headless UI**: Accessible modal dialogs

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env` file:
```
DB_HOST=your-rds-endpoint
DB_NAME=assetdb
DB_USER=your-db-user
DB_PASSWORD=your-db-password
```

### 3. Deploy Backend
```bash
npx ampx sandbox
```

### 4. Run Development Server
```bash
npm run dev
```

## Features Implemented

### Authentication
- ✅ Sign up, sign in, sign out
- ✅ Protected routes (authenticated only)
- ✅ User session management

### Asset Management
- ✅ Create asset with name, description, category
- ✅ Image upload to S3
- ✅ View asset list (grid layout)
- ✅ View asset details
- ✅ Delete asset with confirmation

### Data Storage
- ✅ RDS MySQL: Asset metadata via Sequelize
- ✅ DynamoDB: Tags, status, logs via AppSync
- ✅ S3: Image storage

### API Layer
- ✅ GraphQL (AppSync) for DynamoDB
- ✅ Lambda for RDS operations

### Frontend Features
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states
- ✅ Confirmation dialogs
- ✅ Form validation
- ✅ Responsive design

## File Structure

```
src/
├── components/
│   ├── assets/
│   │   ├── AssetForm.vue       # Create/edit form
│   │   └── AssetList.vue       # Asset grid display
│   ├── common/
│   │   └── ConfirmDialog.vue   # Headless UI modal
│   └── layout/
│       ├── AppLayout.vue       # Main layout with slots
│       └── Card.vue            # Reusable card component
├── stores/
│   ├── assetStore.ts           # Asset state management
│   └── authStore.ts            # Auth state management
├── views/
│   └── AssetManagement.vue     # Main view
├── App.vue                     # Root component
└── main.ts                     # App entry point

amplify/
├── auth/
│   └── resource.ts             # Cognito config
├── data/
│   └── resource.ts             # DynamoDB schema
├── storage/
│   └── resource.ts             # S3 config
├── functions/
│   └── asset-handler/          # Lambda + RDS
└── backend.ts                  # Backend definition
```

## Next Steps

### To Complete RDS Integration:
1. Set up RDS MySQL instance in AWS
2. Configure VPC and security groups
3. Update Lambda environment variables
4. Connect Lambda to RDS via VPC

### To Enhance:
1. Add search and filtering
2. Implement asset editing
3. Add pagination
4. Export asset reports
5. Add asset categories management
6. Implement role-based access control

## Security Best Practices
- Owner-based authorization for DynamoDB
- Path-based S3 access control
- Cognito user authentication
- Environment variables for sensitive data
- Input validation on forms
- SQL injection prevention via Sequelize ORM
