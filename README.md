# Asset Management System

A full-stack cloud-native asset management application built with AWS Amplify Gen 2 and Vue 3.

## 🚀 Features

- **Authentication**: Secure sign up/sign in with Amazon Cognito
- **Asset Management**: Create, view, and delete assets with metadata
- **Image Upload**: Upload and store images in Amazon S3
- **Activity Logging**: Track all asset operations in DynamoDB
- **Responsive UI**: Modern interface with Element Plus and Headless UI
- **State Management**: Centralized state with Pinia
- **Type Safety**: Full TypeScript support

## 🏗️ Architecture

### Backend (AWS Amplify Gen 2)
- **Authentication**: Amazon Cognito
- **API**: AWS AppSync (GraphQL) + Lambda functions
- **Database**: 
  - Amazon RDS MySQL (via Sequelize) - Asset metadata
  - Amazon DynamoDB - Tags, status, activity logs
- **Storage**: Amazon S3 - Image uploads

### Frontend (Vue 3)
- **Framework**: Vue 3 with Composition API
- **State Management**: Pinia
- **UI Libraries**: Element Plus + Headless UI
- **Type Safety**: TypeScript
- **Build Tool**: Vite

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Detailed implementation guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment instructions
- **[VUE_CONCEPTS.md](./VUE_CONCEPTS.md)** - Vue 3 concepts reference

## 🎯 Vue 3 Concepts Demonstrated

This project showcases all major Vue 3 concepts:

✅ Component-based architecture  
✅ Templates and directives (v-if, v-else, v-for, v-model)  
✅ Conditional rendering  
✅ Event handling (@click, custom events)  
✅ Forms and two-way data binding  
✅ State management (Pinia)  
✅ Component communication (props and emits)  
✅ Slots for reusable layouts  
✅ Lifecycle hooks (onMounted)  
✅ User confirmations and dialogs  
✅ Element Plus integration  
✅ Headless UI integration  

See [VUE_CONCEPTS.md](./VUE_CONCEPTS.md) for detailed examples.

## 🚦 Quick Start

```bash
# Install dependencies
npm install

# Start Amplify sandbox (deploys backend to AWS)
npx ampx sandbox

# In a new terminal, start dev server
npm run dev
```

Open http://localhost:5173 and sign up!

See [QUICKSTART.md](./QUICKSTART.md) for detailed instructions.

## 📁 Project Structure

```
├── amplify/                    # Backend configuration
│   ├── auth/                   # Cognito authentication
│   ├── data/                   # DynamoDB schema (AppSync)
│   ├── storage/                # S3 storage configuration
│   ├── functions/              # Lambda functions + RDS
│   └── backend.ts              # Backend definition
│
├── src/
│   ├── components/             # Vue components
│   │   ├── assets/             # Asset management components
│   │   ├── common/             # Shared components (dialogs, etc.)
│   │   └── layout/             # Layout components (slots)
│   ├── stores/                 # Pinia stores
│   │   ├── assetStore.ts       # Asset state management
│   │   └── authStore.ts        # Auth state management
│   ├── services/               # API service layer
│   ├── views/                  # Page views
│   ├── App.vue                 # Root component
│   └── main.ts                 # App entry point
│
└── docs/                       # Documentation
```

## 🛠️ Tech Stack

**Frontend:**
- Vue 3 (Composition API)
- TypeScript
- Pinia (State Management)
- Element Plus (UI Components)
- Headless UI (Accessible Components)
- Vite (Build Tool)

**Backend:**
- AWS Amplify Gen 2
- Amazon Cognito (Auth)
- AWS AppSync (GraphQL API)
- Amazon DynamoDB (NoSQL Database)
- Amazon RDS MySQL (Relational Database)
- AWS Lambda (Serverless Functions)
- Amazon S3 (Object Storage)
- Sequelize (ORM)

## 📋 Requirements Met

### Functional Requirements
✅ User authentication (sign up, sign in, sign out)  
✅ Create assets with name, description, category  
✅ Image upload to S3  
✅ View asset list and details  
✅ Delete assets with confirmation  
✅ RDS for asset metadata (via Sequelize)  
✅ DynamoDB for tags, status, logs (via AppSync)  
✅ Lambda for business logic  

### Technical Requirements
✅ AWS Amplify Gen 2 backend  
✅ Vue 3 Composition API  
✅ Pinia state management  
✅ GraphQL for data operations  
✅ Security best practices  
✅ Error handling and loading states  
✅ Modular code structure  

## 🔐 Security Features

- Owner-based authorization for DynamoDB
- Path-based S3 access control
- Cognito user authentication
- Environment variables for sensitive data
- Input validation on forms
- SQL injection prevention via Sequelize ORM

## 🚀 Deployment

For production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

Quick deploy:
```bash
npx ampx pipeline-deploy --branch main
```

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Build
npm run build
```

## 📝 License

This library is licensed under the MIT-0 License. See the LICENSE file.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## 📧 Support

For issues and questions, please open a GitHub issue.
