# Advanced Backend Development
## Final Project: Multi-Layer API Development with Cloud Deployment

### Overview

In this comprehensive assignment, you will develop a sophisticated API system that demonstrates your understanding of modern backend development principles. You will implement both REST and GraphQL APIs, work with databases, integrate third-party services, and deploy your solution to a cloud platform.  (Node + TypeScript + Prisma + PostgreSQL)

The project is structured in three progressive phases:
1. Basic REST API with Database Integration
2. Enhanced REST API with Third-Party Service Integration
3. GraphQL API Implementation

### Learning Objectives

- Design and implement RESTful APIs following best practices
- Work with databases to persist and retrieve data
- Integrate with third-party APIs to enhance functionality
- Implement a GraphQL API to provide flexible data querying
- Deploy and manage applications in cloud environments
- Document APIs effectively for consumer understanding

### Scenario (TubeDeck)

Build **TubeDeck**, an intelligent YouTube knowledge resurfacing platform that allows users to:
- Save YouTube videos into categorized **Decks** and retrieve them per user
- Inspect saved **Videos** with metadata from the **YouTube Data API**
- Progress toward **transcripts/captions** and **AI-generated digests** (OpenAI) for structured learning notes

## Project Phases

### Phase 1: Basic REST API with Database (2 weeks)

#### Requirements:

1. **Database Design and Implementation**:
   - Design and implement a relational database with **four tables** for TubeDeck. Model:
     - **`users`** — an account holder (unique login identifier such as email, display name, timestamps).
     - **`decks`** — named collections of saved videos for learning (e.g., topic labels like “Backend” or “AI”); each deck is owned by exactly one user (`user_id` foreign key).
     - **`videos`** — one row per saved YouTube import: which deck it lives in (`deck_id`), stable **YouTube video id**, cached title/channel/thumbnail/duration/published time, flags such as **archived**, and a **transcript/analysis pipeline status** (e.g., metadata-only vs. transcript ready).
     - **`video_analyses`** — one digest record per video at most: fields you will fill in later phases (summary, key takeaways, etc.), linked by **`video_id`** unique foreign key.
   - Enforce these relationships in the schema: **one user → many decks**; **one deck → many videos**; **one video → zero or one video_analysis**. Deck rows must not reference users that do not exist; video rows must not reference decks that do not exist.
   - Add indexes and uniqueness rules your queries need: unique user email (or equivalent); index on `deck.user_id`; index on filters you use (e.g., `video.archived`); **unique (`deck_id`, youtube_video_id`)** so the same clip is not duplicated in the same deck.

2. **REST API Development**:
   - Use **resource-oriented paths** tied to TubeDeck entities (`users`, `videos`), not legacy “customers/orders” naming.
     - `GET /users/{userId}/videos` — List **saved videos** for that user (e.g., across decks; filters such as non-archived per your rules); **paginated**
     - `GET /videos/{videoId}` — Full detail for one **video** (metadata, deck context, linked **video_analysis** when present)
     - `POST /videos` — Create a **video** by saving a **YouTube URL** into a **deck** (request body includes `userId`, `deckId`, and `youtubeUrl` / equivalent per your OpenAPI schema)
     - `PUT /videos/{videoId}` — Partial update of a **video** (e.g., transcript pipeline status, moving to another deck, archive flag)
     - `DELETE /videos/{videoId}` — Hard-delete the **video** per your documented policy (correct HTTP status codes, including idempotent behavior if documented)
   - Implement proper error handling and status codes
   - Include pagination for endpoints returning multiple items

3. **Authentication and Authorization**:
   - Implement authentication and authorization using Session/Cookie

4. **Cloud Deployment**:
   - Deploy your application to a cloud provider (**Render**; align with CI/CD above)
   - Create GitHub Repo
   - Set up a CI/CD pipeline for automated deployment (Use Render)
   - Configure proper logging and monitoring

5. **Documentation**:
   - Create comprehensive API documentation using Swagger/OpenAPI
   - Include setup instructions for local development and testing

#### Deliverables:
- Source code for the REST API and database access layer
- Database schema
- Deployment scripts or configuration files
- Comprehensive API documentation
- Unit and integration tests

### Phase 2: Enhanced REST API with Third-Party Integration (1 week)

#### Requirements:

1. **Third-Party API Integration**:
   - **YouTube Data API v3** for metadata, thumbnails, channel info (handle quota and failures).
   - **Transcript/caption** retrieval and/or a documented path when captions are unavailable.
   - **OpenAI** for digest fields tied to **video_analysis**, with secrets only in environment variables.

2. **Service Layer Enhancement**:
   - Aggregate database rows and third-party responses in a clear **service layer**
   - Implement caching strategies to improve performance (In-memory Cache)
   - Add error handling for third-party failures (timeouts, retries, fallbacks)

3. **New Endpoints** (names stay RESTful and video-centric):
   - `GET /videos/{videoId}/pipeline` — Status of transcript/analysis/third-party work for that **video** (not shipping): e.g., stages, timestamps, last error, external job ids — define the response shape in OpenAPI.
   - `GET /users/{userId}/recommendations` — **PRD-aligned “recommendations” (resurfacing only):**
     - **Out of scope:** recommending **new** videos from YouTube’s global catalog (explicit TubeDeck non-goal). Only return candidates from this user’s **already saved** videos.
     - **Queue Engine:** each deck owns a queue; order “what to review next” using **FIFO rotation** (*Viewed* → tail; *Skip* → middle insertion; *Pin* → front; *Favorite* → weighted boost; *Archive* → removed). Optionally mirror dashboard intent (e.g., **today’s review**).
     - **Digest tie-in:** when present on **video_analysis**, may include **`recommendedDeck`** (AI output suggesting which **existing user deck** fits the clip—not third-party discovery).

#### Deliverables:
- Updated source code with third-party integrations
- Documentation for new endpoints
- Diagram showing the architecture with third-party integrations

### Phase 3: GraphQL API Implementation (2 weeks)

#### Requirements:

1. **GraphQL Schema Design**:
   - Design a GraphQL schema that covers all functionality from the REST API
   - Include proper types, queries, mutations, and relationships

2. **GraphQL API Implementation**:
   - Implement the GraphQL schema using appropriate tools (Apollo)
   - Reuse existing service layer logic
   - Implement proper error handling and validation

3. **Advanced GraphQL Features**:
   - Implement pagination using cursor-based approach
   - Add filtering and sorting capabilities
   - Implement data loader patterns for efficient data fetching

4. **Cloud Deployment Update**:
   - Deploy the GraphQL API alongside the REST API
   - Configure proper routing and load balancing
   - Ensure consistent security measures

#### Deliverables:
- Source code for the GraphQL API
- GraphQL schema documentation
- Example GraphQL queries and mutations
- Performance comparison between REST and GraphQL APIs

## Submission Requirements

### Final Deliverables

1. **Source Code**:
   - Well-organized and documented codebase
   - README with setup instructions
   - Environment configuration templates

2. **Documentation**:
   - Comprehensive API documentation (both REST and GraphQL)
   - System architecture diagram
   - Database schema diagram
   - Deployment instructions

3. **Demonstration**:
   - Live demo URL for the deployed application
   - Demo script showcasing all implemented features
   - Collection of example API calls (Postman collection or equivalent)

4. **Report**:
   - Design decisions and justifications
   - Challenges encountered and solutions implemented
   - Performance analysis and optimization strategies
   - Security considerations and implementations
   - Future improvements

## Evaluation Rubric

### Phase 1: Basic REST API with Database (35 points)

| Criterion | Excellent (5) | Satisfactory (3-4) | Needs Improvement (1-2) | Points |
|-----------|---------------|-------------------|------------------------|--------|
| Database Design | Database schema follows normalization principles with appropriate relationships, constraints, and indexes | Database schema has proper relationships but lacks some optimization features | Database schema has structural issues or improper relationships | /5 |
| REST API Implementation | All endpoints work correctly with proper status codes, error handling, and follow REST principles | Most endpoints work correctly with minor issues in error handling or REST compliance | Significant issues with endpoint functionality or REST compliance | /5 |
| Code Quality & Organization | Well-structured code with clear separation of concerns, following best practices and patterns | Reasonably organized code with some architectural issues | Poorly organized code with significant architectural flaws | /5 |
| Authentication & Security | Robust authentication system with proper authorization, input validation, and security measures | Authentication works but has minor security issues | Authentication has significant security vulnerabilities | /5 |
| Cloud Deployment | Successfully deployed with CI/CD pipeline, proper configuration, and monitoring | Deployed successfully but lacks some operational features | Deployment issues or significant configuration problems | /5 |
| Testing | Comprehensive unit and integration tests with high code coverage | Basic tests covering main functionality | Minimal or no testing | /5 |
| Documentation | Comprehensive, clear documentation with examples and setup instructions | Adequate documentation with some gaps | Poor or minimal documentation | /5 |

### Phase 2: Enhanced REST API with Third-Party Integration (30 points)

| Criterion | Excellent (5) | Satisfactory (3-4) | Needs Improvement (1-2) | Points |
|-----------|---------------|-------------------|------------------------|--------|
| Third-Party Integration | Seamless integration with proper error handling, retry logic, and fallback mechanisms | Working integration with basic error handling | Integration has significant issues or failures | /5 |
| Service Layer Design | Well-designed service layer with clean abstractions, proper separation of concerns, and efficient caching | Functional service layer with some architectural issues | Poorly designed service layer with significant issues | /5 |
| New Endpoint Implementation | New endpoints work perfectly and provide valuable aggregated data | New endpoints work with minor issues | New endpoints have significant functionality problems | /5 |
| Error Handling & Resilience | Robust error handling with proper user feedback and system resilience | Basic error handling with some resilience issues | Poor error handling or system easily fails | /5 |
| Performance Optimization | Effective caching strategies and performance optimizations with measurable results | Some optimization attempts with moderate results | Little to no performance optimization | /5 |
| Cloud Configuration Enhancements | Properly configured security, monitoring, and scaling features | Basic cloud configuration with some missing features | Minimal or problematic cloud configuration | /5 |

### Phase 3: GraphQL API Implementation (35 points)

| Criterion | Excellent (5) | Satisfactory (3-4) | Needs Improvement (1-2) | Points |
|-----------|---------------|-------------------|------------------------|--------|
| GraphQL Schema Design | Well-designed schema that properly models the domain with appropriate types and relationships | Functional schema with minor design issues | Poorly designed schema with significant issues | /5 |
| Query & Mutation Implementation | All queries and mutations work correctly with proper validation and error handling | Most queries and mutations work with minor issues | Significant issues with query/mutation functionality | /5 |
| Advanced GraphQL Features | Successfully implemented pagination, filtering, and data loaders for efficiency | Implemented some advanced features with minor issues | Few or no advanced features implemented | /5 |
| Code Reuse & Architecture | Excellent reuse of existing service layer with clean GraphQL-specific abstractions | Some code reuse with architectural inconsistencies | Poor code reuse with significant duplication | /5 |
| Performance Comparison | Thorough analysis of REST vs GraphQL performance with insightful conclusions | Basic performance comparison with some analysis | Minimal or no performance comparison | /5 |
| GraphQL Documentation | Comprehensive schema documentation with example queries and descriptions | Basic schema documentation with some examples | Minimal or no GraphQL documentation | /5 |
| Final System Integration | Complete system with seamless integration between all components | Working system with minor integration issues | System has significant integration problems | /5 |

### Total Points: 100

#### Grading Scale:
- A: 90-100
- B: 80-89
- C: 70-79
- D: 60-69
- F: Below 60

## Academic Integrity

This assignment must be completed individually or in approved teams. All code must be original or properly attributed. The use of AI coding assistants is permitted for reference and learning, but the final submission must demonstrate your understanding and ability to explain all aspects of the implementation.

## Resources

- [RESTful API Best Practices](https://restfulapi.net/)
- [GraphQL Documentation](https://graphql.org/learn/)
- [JWT Authentication Tutorial](https://jwt.io/introduction/)
- [Database Design Principles](https://www.ntu.edu.sg/home/ehchua/programming/sql/Relational_Database_Design.html)
