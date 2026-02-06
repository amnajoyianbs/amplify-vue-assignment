# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Vue 3)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Components  │  │    Pinia     │  │   Services   │          │
│  │              │  │    Stores    │  │              │          │
│  │ - AssetForm  │  │ - assetStore │  │ - assetSvc   │          │
│  │ - AssetList  │  │ - authStore  │  │              │          │
│  │ - Layouts    │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                    AWS Amplify SDK
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                    AWS Amplify Gen 2                             │
│                            │                                     │
│  ┌─────────────────────────┼─────────────────────────────────┐  │
│  │                    Authentication                          │  │
│  │              Amazon Cognito User Pool                      │  │
│  │         (Email/Password, JWT Tokens)                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                            │                                     │
│  ┌─────────────────────────┴─────────────────────────────────┐  │
│  │                      API Layer                            │  │
│  │                                                            │  │
│  │  ┌──────────────────┐         ┌──────────────────┐       │  │
│  │  │   AWS AppSync    │         │   AWS Lambda     │       │  │
│  │  │   (GraphQL)      │         │   Functions      │       │  │
│  │  │                  │         │                  │       │  │
│  │  │ - AssetInfo      │         │ - asset-handler  │       │  │
│  │  │ - AssetLog       │         │ - asset-api      │       │  │
│  │  │ - Subscriptions  │         │   (REST API)     │       │  │
│  │  └────────┬─────────┘         └────────┬─────────┘       │  │
│  │           │                            │                  │  │
│  └───────────┼────────────────────────────┼──────────────────┘  │
│              │                            │                     │
│  ┌───────────┼────────────────────────────┼──────────────────┐  │
│  │           │        Data Layer          │                  │  │
│  │           │                            │                  │  │
│  │  ┌────────▼────────┐         ┌────────▼────────┐         │  │
│  │  │   DynamoDB      │         │   RDS MySQL     │         │  │
│  │  │                 │         │                 │         │  │
│  │  │ - AssetInfo     │         │ - Assets Table  │         │  │
│  │  │   (tags,status) │         │   (metadata)    │         │  │
│  │  │ - AssetLog      │         │                 │         │  │
│  │  │   (activity)    │         │   Sequelize ORM │         │  │
│  │  └─────────────────┘         └─────────────────┘         │  │
│  │                                                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                            │                                     │
│  ┌─────────────────────────┴─────────────────────────────────┐  │
│  │                    Storage Layer                          │  │
│  │                                                            │  │
│  │                    Amazon S3                              │  │
│  │              (Asset Images)                               │  │
│  │         Path: assets/{userId}/{filename}                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. User Authentication Flow

```
┌──────┐     Sign Up/In      ┌──────────┐      Validate       ┌──────────┐
│ User │ ──────────────────> │   Vue    │ ─────────────────> │ Cognito  │
└──────┘                     │   App    │                     │          │
   ▲                         └──────────┘                     └──────────┘
   │                              │                                 │
   │         JWT Token            │                                 │
   └──────────────────────────────┘                                 │
                                                                     │
                                  Store in                           │
                                  authStore                          │
                                     │                               │
                                     ▼                               │
                              ┌──────────┐                          │
                              │  Pinia   │ <────────────────────────┘
                              │  Store   │      User Info
                              └──────────┘
```

### 2. Create Asset Flow

```
┌──────┐   Fill Form    ┌──────────────┐   Submit    ┌──────────────┐
│ User │ ────────────> │  AssetForm   │ ──────────> │ assetStore   │
└──────┘               │  Component   │             │   (Pinia)    │
                       └──────────────┘             └──────────────┘
                                                            │
                        ┌───────────────────────────────────┤
                        │                                   │
                        ▼                                   ▼
                ┌───────────────┐                  ┌───────────────┐
                │  Upload Image │                  │  Create Asset │
                │   to S3       │                  │   in RDS      │
                └───────┬───────┘                  └───────┬───────┘
                        │                                  │
                        │                                  │
                        ▼                                  ▼
                ┌───────────────┐                  ┌───────────────┐
                │   S3 Bucket   │                  │    Lambda     │
                │               │                  │   Function    │
                │ Returns URL   │                  │               │
                └───────┬───────┘                  └───────┬───────┘
                        │                                  │
                        │                                  ▼
                        │                          ┌───────────────┐
                        │                          │  RDS MySQL    │
                        │                          │               │
                        │                          │ INSERT Asset  │
                        │                          └───────┬───────┘
                        │                                  │
                        └──────────────┬───────────────────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │ Create AssetInfo│
                              │   in DynamoDB   │
                              │  (via AppSync)  │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │  Create Log    │
                              │   in DynamoDB  │
                              │  (via AppSync) │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │ Update UI      │
                              │ Show Success   │
                              └────────────────┘
```

### 3. View Assets Flow

```
┌──────┐   Load Page    ┌──────────────────┐   onMounted   ┌──────────────┐
│ User │ ────────────> │ AssetManagement  │ ────────────> │ assetStore   │
└──────┘               │     View         │               │              │
                       └──────────────────┘               └──────┬───────┘
                                                                  │
                                                                  │ fetchAssets()
                                                                  │
                                                                  ▼
                                                          ┌───────────────┐
                                                          │    Lambda     │
                                                          │   Function    │
                                                          └───────┬───────┘
                                                                  │
                                                                  │ Query
                                                                  │
                                                                  ▼
                                                          ┌───────────────┐
                                                          │  RDS MySQL    │
                                                          │               │
                                                          │ SELECT Assets │
                                                          │ WHERE userId  │
                                                          └───────┬───────┘
                                                                  │
                                                                  │ Return Data
                                                                  │
                       ┌──────────────────┐                      │
                       │   AssetList      │ <────────────────────┘
                       │   Component      │
                       │                  │
                       │ - Loading State  │
                       │ - Empty State    │
                       │ - Grid Display   │
                       └──────────────────┘
```

### 4. Delete Asset Flow

```
┌──────┐   Click Delete  ┌──────────────┐   Emit Event   ┌──────────────────┐
│ User │ ──────────────> │  AssetList   │ ────────────> │ AssetManagement  │
└──────┘                 │  Component   │               │      View        │
                         └──────────────┘               └────────┬─────────┘
                                                                  │
                                                                  │ Show Dialog
                                                                  │
                                                                  ▼
                                                         ┌────────────────┐
                                                         │ ConfirmDialog  │
                                                         │  (Headless UI) │
                                                         └────────┬───────┘
                                                                  │
                                                                  │ Confirm
                                                                  │
                                                                  ▼
                                                         ┌────────────────┐
                                                         │  assetStore    │
                                                         │  deleteAsset() │
                                                         └────────┬───────┘
                                                                  │
                                                                  ▼
                                                         ┌────────────────┐
                                                         │    Lambda      │
                                                         │   Function     │
                                                         └────────┬───────┘
                                                                  │
                                                                  ▼
                                                         ┌────────────────┐
                                                         │  RDS MySQL     │
                                                         │                │
                                                         │ DELETE Asset   │
                                                         └────────┬───────┘
                                                                  │
                                                                  ▼
                                                         ┌────────────────┐
                                                         │  Create Log    │
                                                         │  in DynamoDB   │
                                                         └────────┬───────┘
                                                                  │
                                                                  ▼
                                                         ┌────────────────┐
                                                         │  Update UI     │
                                                         │  Show Success  │
                                                         └────────────────┘
```

## Component Hierarchy

```
App.vue
└── Authenticator (AWS Amplify UI)
    └── AssetManagement.vue
        ├── AppLayout (Slot-based)
        │   ├── Header Slot
        │   │   └── User Info + Sign Out Button
        │   └── Default Slot
        │       └── Main Content
        │
        ├── Stats Section
        │   ├── Card (Total Assets)
        │   └── Card (Active Assets)
        │
        ├── Actions Bar
        │   └── Create Button
        │
        ├── AssetList
        │   └── Card (for each asset)
        │       ├── Header Slot (Name + Category)
        │       ├── Body (Image + Description)
        │       └── Footer Slot (Action Buttons)
        │
        ├── Create Dialog (Element Plus)
        │   └── AssetForm
        │       ├── Text Inputs (v-model)
        │       ├── Select (v-model)
        │       ├── Upload Component
        │       └── Radio Group (v-model)
        │
        ├── View Dialog (Element Plus)
        │   └── Asset Details Display
        │
        └── ConfirmDialog (Headless UI)
            └── Delete Confirmation
```

## State Management Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Pinia Stores                         │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │              authStore                         │    │
│  │                                                 │    │
│  │  State:                                        │    │
│  │  - user: User | null                           │    │
│  │  - isAuthenticated: boolean                    │    │
│  │  - loading: boolean                            │    │
│  │                                                 │    │
│  │  Computed:                                     │    │
│  │  - userId: string | null                       │    │
│  │  - userEmail: string | null                    │    │
│  │                                                 │    │
│  │  Actions:                                      │    │
│  │  - checkAuth()                                 │    │
│  │  - signOut()                                   │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │              assetStore                        │    │
│  │                                                 │    │
│  │  State:                                        │    │
│  │  - assets: Asset[]                             │    │
│  │  - currentAsset: Asset | null                  │    │
│  │  - loading: boolean                            │    │
│  │  - error: string | null                        │    │
│  │                                                 │    │
│  │  Computed:                                     │    │
│  │  - assetCount: number                          │    │
│  │  - activeAssets: Asset[]                       │    │
│  │                                                 │    │
│  │  Actions:                                      │    │
│  │  - fetchAssets(userId, filters?)               │    │
│  │  - getAsset(assetId)                           │    │
│  │  - createAsset(data)                           │    │
│  │  - updateAsset(id, updates)                    │    │
│  │  - deleteAsset(assetId)                        │    │
│  │  - uploadAssetImage(file, assetId)             │    │
│  │  - createAssetInfo(info)                       │    │
│  │  - createAssetLog(logData)                     │    │
│  │  - clearError()                                │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Security Layers                       │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Authentication (Cognito)               │    │
│  │  - Email/Password                              │    │
│  │  - JWT Tokens                                  │    │
│  │  - Token Refresh                               │    │
│  └────────────────────────────────────────────────┘    │
│                        │                                │
│                        ▼                                │
│  ┌────────────────────────────────────────────────┐    │
│  │         Authorization                          │    │
│  │                                                 │    │
│  │  DynamoDB (AppSync):                           │    │
│  │  - Owner-based rules                           │    │
│  │  - Authenticated read                          │    │
│  │                                                 │    │
│  │  S3:                                           │    │
│  │  - Path-based access                           │    │
│  │  - assets/{identity_id}/*                      │    │
│  │                                                 │    │
│  │  Lambda:                                       │    │
│  │  - Extract userId from JWT                     │    │
│  │  - Filter by userId                            │    │
│  └────────────────────────────────────────────────┘    │
│                        │                                │
│                        ▼                                │
│  ┌────────────────────────────────────────────────┐    │
│  │         Data Protection                        │    │
│  │  - SQL Injection Prevention (Sequelize)        │    │
│  │  - Input Validation (Forms)                    │    │
│  │  - Environment Variables (Secrets)             │    │
│  │  - HTTPS Only                                  │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   AWS Cloud                             │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Frontend (Amplify Hosting)             │    │
│  │  - CloudFront CDN                              │    │
│  │  - S3 Static Hosting                           │    │
│  │  - SSL Certificate                             │    │
│  │  - Custom Domain                               │    │
│  └────────────────────────────────────────────────┘    │
│                        │                                │
│                        ▼                                │
│  ┌────────────────────────────────────────────────┐    │
│  │         Backend Services                       │    │
│  │                                                 │    │
│  │  ┌──────────────┐  ┌──────────────┐           │    │
│  │  │   Cognito    │  │   AppSync    │           │    │
│  │  │  User Pool   │  │   GraphQL    │           │    │
│  │  └──────────────┘  └──────────────┘           │    │
│  │                                                 │    │
│  │  ┌──────────────┐  ┌──────────────┐           │    │
│  │  │   Lambda     │  │  DynamoDB    │           │    │
│  │  │  Functions   │  │   Tables     │           │    │
│  │  └──────────────┘  └──────────────┘           │    │
│  │                                                 │    │
│  │  ┌──────────────┐  ┌──────────────┐           │    │
│  │  │  RDS MySQL   │  │  S3 Bucket   │           │    │
│  │  │   (VPC)      │  │   (Images)   │           │    │
│  │  └──────────────┘  └──────────────┘           │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Monitoring & Logging                   │    │
│  │  - CloudWatch Logs                             │    │
│  │  - CloudWatch Metrics                          │    │
│  │  - X-Ray Tracing                               │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | Vue 3 | UI framework with Composition API |
| **State Management** | Pinia | Centralized state management |
| **UI Components** | Element Plus | Primary UI component library |
| **Accessible Components** | Headless UI | Accessible modal dialogs |
| **Type Safety** | TypeScript | Static type checking |
| **Build Tool** | Vite | Fast development and build |
| **Authentication** | Amazon Cognito | User authentication & authorization |
| **GraphQL API** | AWS AppSync | Real-time GraphQL API |
| **NoSQL Database** | Amazon DynamoDB | Tags, status, activity logs |
| **Relational Database** | Amazon RDS MySQL | Asset metadata |
| **ORM** | Sequelize | Database abstraction |
| **Serverless Functions** | AWS Lambda | Business logic |
| **Object Storage** | Amazon S3 | Image storage |
| **Backend Framework** | AWS Amplify Gen 2 | Backend infrastructure |
| **Hosting** | AWS Amplify Hosting | Frontend deployment |
| **CDN** | Amazon CloudFront | Content delivery |

## Performance Considerations

- **Frontend**: Code splitting, lazy loading, optimized builds
- **Backend**: Lambda cold start optimization, connection pooling
- **Database**: Indexed queries, efficient data models
- **Storage**: CDN for images, optimized image sizes
- **API**: GraphQL for efficient data fetching, REST for CRUD operations
