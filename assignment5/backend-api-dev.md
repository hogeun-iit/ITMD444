# Advanced Backend Development
## Final Project: Multi-Layer API Development with Cloud Deployment

### Overview

In this comprehensive assignment, you will develop a sophisticated API system that demonstrates your understanding of modern backend development principles. You will implement both REST and GraphQL APIs, work with databases, integrate third-party services, and deploy your solution to a cloud platform.

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

### Scenario (Sample Only - You are required to identify your own scenario)

Build an e-commerce order management system that allows users to:
- Retrieve all orders for a specific customer
- Get detailed information about a specific order
- Create new orders
- Get Weather information about the customer delivery location (third-party integration)

## Project Phases

### Phase 1: Basic REST API with Database (2 weeks)

#### Requirements:

1. **Database Design and Implementation**:
   - Design and implement a relational or non-relational database with at least three tables (e.g., `customers`, `Products` and `orders`)
   - Implement proper relationships between tables
   - Include appropriate indexes for performance optimization

2. **REST API Development**:
   - Implement the following endpoints:
     - `GET /customers/{customerId}/orders` - Retrieve all orders for a customer
     - `GET /orders/{orderId}` - Get detailed information about a specific order
     - `POST /orders` - Create a new order
     - `PUT /orders/{orderId}` - Update an existing order
     - `DELETE /orders/{orderId}` - Cancel an order
   - Implement proper error handling and status codes
   - Include pagination for endpoints returning multiple items

3. **Authentication and Authorization - Optional**:

4. **Cloud Deployment**:
   - Deploy your application to  Cloud
   - Create GitHub Repo
   - Set up a CI/CD pipeline for automated deployment
   - Configure proper logging and monitoring

5. **Documentation**:
   - Create comprehensive API documentation using Swagger/OpenAPI
   - Include setup instructions for local development and testing

#### Deliverables:
- Source code for the REST API and database access layer
- Database schema
- Deployment scripts or configuration files
- Comprehensive API documentation
- Unit and integration tests (Optional)

### Phase 2: Enhanced REST API with Third-Party Integration (1 week)

#### Requirements:

1. **Third-Party API Integration**:
   - Integrate with a shipping service API (e.g., USPS, FedEx, or a mock shipping API)
   - Integrate with a product recommendation service (e.g., Amazon Product API or a mock recommendation API)

2. **Service Layer Enhancement**:
   - Create a service layer that aggregates data from your database and third-party APIs
   - Implement caching strategies to improve performance (Optional)
   - Add error handling for third-party service failures

3. **New Endpoints**:
   - `GET /orders/{orderId}/tracking` - Get shipping status from third-party shipping API
   - `GET /customers/{customerId}/recommendations` - Get product recommendations based on order history



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
   - Implement the GraphQL schema using appropriate tools (Apollo, Express-GraphQL, etc.)
   - Reuse existing service layer logic
   - Implement proper error handling and validation

3. **Advanced GraphQL Features (Optional)**:
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
- [AWS/Azure/GCP Documentation]

## Submission Timeline

- **Phase 1 Checkpoint**: Week 2
- **Phase 2 Checkpoint**: Week 3
- **Final Submission**: Week 5
- **Presentations**: Week 5
