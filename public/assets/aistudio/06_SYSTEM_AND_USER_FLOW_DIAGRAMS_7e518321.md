# Creative Office OS 2.0 — Product and Data Flow Diagrams

The diagrams are planning models, not implemented or deployed services.

## 1. User value ladder

```mermaid
flowchart TD
    A[First visit] --> B{What do you want?}
    B --> C[Free tools]
    B --> D[Studio-sponsored AI trial]
    B --> E[Human creative request]
    C --> F[Useful export]
    D --> G[Editable AI output]
    F --> H{Need more help?}
    G --> H
    H -->|Keep free| C
    H -->|Small upgrade| I[Paid AI micro kit]
    H -->|Professional finish| E
    I --> J[Verified payment and generation]
    J --> K[Download output]
    K --> E
    E --> L[Brief and approved quote]
    L --> M[Real project workspace]
```

## 2. No-Puter-login AI gateway

```mermaid
flowchart LR
    V[Visitor in Freakin Studio] --> U[Studio UI]
    U --> A[Studio AI API]
    A --> B{Guest quota and budget okay?}
    B -->|No| F[Free local tools or helpful message]
    B -->|Yes| R[Credit reservation and ID]
    R --> P[Server-side Puter provider adapter]
    P --> W[Puter me.puter owner-billed call]
    W --> Q[Validate output, meter and settle]
    Q --> U
    P -->|Unavailable| X[Authorized fallback provider]
    X --> Q
```

Tokens and Puter account credentials never flow into Visitor UI. No API route is an unrestricted anonymous inference proxy.

## 3. Client and human office

```mermaid
flowchart TD
    G[Guest brief] --> A[Verified Studio account when private]
    A --> B[Real request record]
    B --> C[Studio human intake]
    C --> D[Quote and capped work hours]
    D --> E{Client accepts?}
    E -->|No| H[Revise quote or close]
    E -->|Yes| F[Verify advance/payment]
    F --> I[Human assignment]
    I --> J[Real task events + optional SI suggestions]
    J --> K[Draft/proof version]
    K --> L{Client review}
    L -->|Revision| J
    L -->|Approve| M[Human QA and final asset]
    M --> N[Protected delivery and archive]
```

## 4. Separation of roles

```mermaid
flowchart TB
    CLIENT[Client] --> VIEW[View own project / submit brief and revisions]
    STAFF[Human expert] --> PROD[Produce and annotate real artifacts]
    ADMIN[Owner or studio admin] --> CTRL[Assign / approve quote / payment / deadlines]
    SI[SI assistant] --> SUGGEST[Draft suggestions and QA notes]
    SUGGEST --> REVIEW[Human review gate]
    REVIEW --> CTRL
    PROD --> EVENTS[Immutable project events]
    CTRL --> EVENTS
    EVENTS --> VIEW
```

## 5. Proposed two-layer UX

- **Discovery layer:** distinct but accessible “Creative Orbit” where visitors select Free, AI or Human routes.
- **Work layer:** pragmatic controls for money, files, tasks, edits, authorizations and real-time status. No 3D needed in administrative transactions.

## 6. Source-of-truth boundaries

- **Catalog / rates:** approved versioned database data.
- **AI result:** validated provider response with recorded usage and cost.
- **Money:** verified payment provider webhook and immutable ledger.
- **Job progress:** audited project events and task state, never a frontend timer.
- **Private deliverables:** protected storage, signed access, RLS permission checks.
