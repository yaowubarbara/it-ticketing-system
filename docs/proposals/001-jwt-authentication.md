# Proposal 001: JWT Authentication

## Status
Proposed

## Problem Statement

All API endpoints currently use `AllowAny` permission (DRF default). Any client can create, modify, or delete tickets, employees, and knowledge base articles without authentication. This is a critical security gap for any production deployment.

## Proposed Solution

Use `djangorestframework-simplejwt` for token-based authentication.

### Why JWT?
- Stateless: no server-side session storage needed
- Works well with React SPAs (token stored in memory/httpOnly cookie)
- Standard approach for DRF APIs
- Compatible with future microservices architecture

### Dependencies
```
djangorestframework-simplejwt>=5.3.0
```

## Migration Strategy

### Phase 1: Add Auth Infrastructure (non-breaking)
- Install `djangorestframework-simplejwt`
- Add token endpoints: `/api/token/` and `/api/token/refresh/`
- Link `Employee` model to Django `User` model (OneToOneField)
- Create management command to create initial admin user
- **No permission changes** — all views remain `AllowAny`

### Phase 2: Per-View Permissions
- Add `IsAuthenticated` to write endpoints (POST, PATCH, DELETE)
- Keep read endpoints (GET) as `AllowAny` for now
- Affected views:
  - `TicketListCreateView.perform_create` — require auth
  - `assign_ticket`, `resolve_ticket`, `close_ticket` — require auth
  - `KnowledgeBaseListCreateView.perform_create` — require auth
  - `EmployeeListCreateView` POST — require auth
- Update tests to include authentication headers

### Phase 3: Full Authentication
- Set `DEFAULT_PERMISSION_CLASSES` to `IsAuthenticated` in settings
- Add role-based permissions:
  - `employee` role: create tickets, view own tickets
  - `it_staff` role: assign/resolve tickets, manage knowledge base
  - `admin` role: full access
- Add token refresh logic to React frontend (Axios interceptor)

## Employee-User Model Linking

### Option A: OneToOneField (Recommended)
```python
# Employee model addition
user = models.OneToOneField(
    User, on_delete=models.SET_NULL,
    null=True, blank=True,
    related_name='employee_profile'
)
```
- Pros: Simple, preserves existing Employee model
- Cons: Two models to manage

### Option B: Custom User Model
```python
class Employee(AbstractUser):
    employee_id = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=100)
    # ...
```
- Pros: Single model
- Cons: Requires migration reset, more complex

**Recommendation**: Option A — lower risk, no migration issues.

## Frontend Changes

### Token Storage
- Store access token in memory (JavaScript variable)
- Store refresh token in httpOnly cookie (if possible) or localStorage
- Never store tokens in sessionStorage

### Axios Interceptor
```javascript
// Add to services/api.js
api.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      // If refresh fails, redirect to login
    }
    return Promise.reject(error);
  }
);
```

### New Components Needed
- `LoginPage.jsx` — email/password login form
- Auth context provider for token state management
- Protected route wrapper component

## Impact on Tests

- All view tests that make POST/PATCH/DELETE requests need auth headers
- Add `authenticated_client` fixture to conftest.py:
```python
@pytest.fixture
def authenticated_client(db):
    from django.contrib.auth.models import User
    user = User.objects.create_user('testuser', 'test@example.com', 'testpass')
    client = APIClient()
    client.force_authenticate(user=user)
    return client
```

## Risks

- **Breaking change**: Phase 2 and 3 will break any unauthenticated API consumers
- **Migration complexity**: Linking Employee to User requires data migration for existing employees
- **Frontend effort**: Login page, token management, and protected routes are significant work

## Timeline Recommendation

1. Phase 1 can be implemented independently as it's non-breaking
2. Phase 2 should be coordinated with frontend changes
3. Phase 3 requires full frontend auth implementation first
