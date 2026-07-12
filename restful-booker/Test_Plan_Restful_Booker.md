# Test Plan — Restful-Booker API

**Document ID:** TP-RESTFUL-BOOKER-2026-001  
**Version:** 1.0  
**Date:** 03 June 2026  
**Prepared by:** QA Lead  
**Based on:** ISTQB Certified Tester Foundation Level & Advanced Level Test Analyst Guidelines

---

## 1. Test Plan Identifier

- **Unique Identifier:** TP-RESTFUL-BOOKER-2026-001
- **System Under Test:** Restful-Booker API (https://restful-booker.herokuapp.com)

| Version | Date        | Author  | Changes         |
|---------|-------------|---------|-----------------|
| 1.0     | 03-Jun-2026 | QA Lead | Initial version |

---

## 2. Introduction

### 2.1 Objectives

This Test Plan defines the scope, approach, resources, and schedule for testing the **Restful-Booker REST API** — a hotel booking management API exposing CRUD operations for bookings, authentication, and a health check endpoint. The goal is to verify that all endpoints conform to their documented contracts, handle valid and invalid inputs correctly, enforce authentication where required, and meet reliability expectations.

### 2.2 Scope

**In Scope:**
- All documented API endpoints (Auth, Booking, Ping)
- Functional correctness of each endpoint (request/response contract)
- Authentication and authorisation enforcement (Cookie token and Basic auth)
- Input validation: field types, required vs. optional fields, date format (CCYY-MM-DD)
- Content-type negotiation (JSON, XML, URL-encoded)
- Error handling for invalid, missing, and malformed inputs
- Response status code verification
- Filter/query-string behaviour on `GET /booking`
- Regression testing after any future change

**Out of Scope:**
- Frontend/UI testing (API-only system)
- Infrastructure / network penetration testing
- Load / soak / stress performance testing (covered separately in a Performance Test Plan)
- Database-level validation (no direct DB access to the hosted Heroku instance)

### 2.3 References

| Ref | Document |
|-----|----------|
| R1  | Restful-Booker API Documentation (restful-booker.herokuapp.com/apidoc) |
| R2  | ISTQB Standard for Test Documentation (IEEE 829 aligned) |
| R3  | ISTQB Foundation Level Syllabus v4.0 |

---

## 3. Test Items

| Item ID | Item                              | Version  |
|---------|-----------------------------------|----------|
| TI-01   | `POST /auth` — CreateToken        | Current  |
| TI-02   | `GET /booking` — GetBookingIds    | Current  |
| TI-03   | `GET /booking/:id` — GetBooking   | Current  |
| TI-04   | `POST /booking` — CreateBooking   | Current  |
| TI-05   | `PUT /booking/:id` — UpdateBooking | Current |
| TI-06   | `PATCH /booking/:id` — PartialUpdateBooking | Current |
| TI-07   | `DELETE /booking/:id` — DeleteBooking | Current |
| TI-08   | `GET /ping` — HealthCheck         | Current  |

---

## 4. Features to be Tested

| Feature ID | Feature                              | Priority | Test Types                              |
|------------|--------------------------------------|----------|-----------------------------------------|
| F01        | Auth token creation                  | High     | Functional, Security, Negative          |
| F02        | Retrieve all booking IDs             | High     | Functional, Negative                    |
| F03        | Filter bookings by name              | Medium   | Functional, Boundary, Negative          |
| F04        | Filter bookings by check-in/out date | Medium   | Functional, Boundary, Negative          |
| F05        | Retrieve single booking (JSON)       | High     | Functional, Contract, Negative          |
| F06        | Retrieve single booking (XML)        | Low      | Functional, Content-Negotiation         |
| F07        | Create booking (JSON)                | High     | Functional, Validation, Negative        |
| F08        | Create booking (XML / URL-encoded)   | Low      | Functional, Content-Negotiation         |
| F09        | Full update booking (PUT)            | High     | Functional, Auth, Validation, Negative  |
| F10        | Partial update booking (PATCH)       | High     | Functional, Auth, Validation, Negative  |
| F11        | Delete booking                       | High     | Functional, Auth, Negative              |
| F12        | Health check / Ping                  | Medium   | Functional, Reliability                 |
| F13        | Authorisation enforcement            | High     | Security, Negative                      |
| F14        | Content-type negotiation (all verbs) | Medium   | Functional, Negative                    |

---

## 5. Features Not to be Tested

- HTTPS/TLS configuration and certificate validation (infrastructure concern)
- Rate limiting / throttling (not documented in the API spec)
- OAuth or third-party SSO flows (not implemented by this API)
- API versioning (single version currently)
- Concurrent / parallel write conflict behaviour (out of scope for this plan)

---

## 6. Approach

### 6.1 Test Strategy

Testing follows a **risk-based approach** prioritised by business impact and likelihood of failure:

1. **Contract Testing** — every response shape and status code is validated against the documented spec.
2. **Functional Testing** — positive and negative paths for each endpoint.
3. **Security / Auth Testing** — confirm protected endpoints (PUT, DELETE) reject unauthenticated requests and accept both auth mechanisms (Cookie token, Basic auth).
4. **Input Validation Testing** — equivalence partitioning and boundary value analysis on all input fields.
5. **Content-Negotiation Testing** — verify JSON, XML, and URL-encoded request/response handling.
6. **Regression Testing** — full suite re-run on any code or environment change.

### 6.2 Test Techniques

| Technique | Applied To |
|-----------|-----------|
| Equivalence Partitioning | All input fields (valid/invalid classes) |
| Boundary Value Analysis | `totalprice` (numeric bounds), date fields |
| Decision Table | Auth method combinations (Cookie vs. Basic vs. none) |
| State Transition | Booking lifecycle: Create → Read → Update → Delete |
| Exploratory Testing | Edge cases not covered by scripted tests |
| Error Guessing | Malformed JSON/XML, wrong content-type, missing required fields |

### 6.3 Test Levels

| Level | Owner | Description |
|-------|-------|-------------|
| Component / API | QA Engineer | Each endpoint tested in isolation |
| Integration | QA Engineer | Auth token used across protected endpoints; booking ID chained through Create → Update → Delete |
| System | QA Lead | End-to-end booking lifecycle flow |
| Acceptance | Product Owner / Stakeholder | UAT sign-off against documented behaviour |

### 6.4 Automation Approach

- Tool: **Postman** collections + **Newman** CLI for CI integration
- All P1/P2 test cases automated; P3 scripted but executed manually
- Automated suite to be run on every deployment to the test environment
- Reporting: Allure or Newman HTML reporter

---

## 7. Item Pass/Fail Criteria

### Entry Criteria (to begin test execution)
- API is deployed and reachable (`GET /ping` returns HTTP 201)
- Valid auth credentials confirmed working
- Test data set seeded (at least 5 existing bookings)
- Postman collection imported and environment variables configured

### Exit Criteria (to conclude testing)
- 100% of High priority (P1) test cases executed
- 100% of P1 test cases passing
- ≥ 95% pass rate for Medium priority (P2) test cases
- Zero open Critical or High severity defects
- All failed P2/P3 cases have accepted risk sign-off or open defects logged

### Pass/Fail Rules per Test Case
- **Pass:** Response status code matches spec, response body matches documented schema, response time < 3 seconds
- **Fail:** Incorrect status code, missing/wrong fields in response body, or timeout > 5 seconds

---

## 8. Suspension Criteria and Resumption Requirements

### Suspension Criteria
- `GET /ping` returns non-201 for > 10 consecutive minutes (environment down)
- More than 40% of test cases blocked by a single environment or auth defect
- Critical security defect found that invalidates the auth mechanism entirely

### Resumption Requirements
- Ping endpoint returns HTTP 201 and smoke test (Create + Get + Delete) passes
- Blocking defect resolved and verified by the raising engineer
- Written confirmation from Test Lead that resumption is approved

---

## 9. Test Deliverables

| Deliverable | Description | Owner |
|-------------|-------------|-------|
| Test Plan (this document) | Scope, approach, schedule | QA Lead |
| Test Cases | Detailed steps, data, expected results for all F01–F14 | QA Engineer |
| Postman Collection | Automated request scripts + test assertions | QA Engineer |
| Requirements Traceability Matrix (RTM) | Maps features to test cases | QA Lead |
| Test Execution Report | Pass/fail summary per cycle | QA Engineer |
| Defect Report | All defects logged with severity, steps to reproduce | QA Engineer |
| Test Summary Report | Final sign-off document | QA Lead |

---

## 10. Test Tasks

| Task | Description | Depends On |
|------|-------------|-----------|
| T01 | Test plan review and sign-off | — |
| T02 | Test environment setup and validation | T01 |
| T03 | Test data preparation (seed bookings) | T02 |
| T04 | Test case design (all features F01–F14) | T01 |
| T05 | Postman collection build and peer review | T04 |
| T06 | Test execution — Cycle 1 (functional) | T02, T03, T05 |
| T07 | Defect logging and triage | T06 |
| T08 | Defect fix verification | T07 |
| T09 | Regression cycle | T08 |
| T10 | Test closure and summary report | T09 |

---

## 11. Environmental Needs

| Component | Details |
|-----------|---------|
| Test Environment | https://restful-booker.herokuapp.com (shared public sandbox) |
| API Client Tool | Postman v11+ |
| CI Runner | Newman CLI via GitHub Actions / Jenkins |
| Defect Tracker | Jira |
| Test Management | TestRail or Zephyr |
| Auth Credentials | Username: `admin` / Password: `password123` (documented defaults) |
| Supported Content Types | `application/json`, `text/xml`, `application/x-www-form-urlencoded` |

**Note:** Because the environment is a shared public instance (Heroku), test data created during runs may be visible to other users. Test data should be cleaned up (DELETE) at the end of each run. No PII or real customer data should be used.

---

## 12. Responsibilities

| Role | Person | Responsibilities |
|------|--------|-----------------|
| QA Lead | TBD | Plan ownership, risk assessment, stakeholder reporting, test closure |
| QA Engineer (API) | TBD | Test case design, Postman automation, execution, defect logging |
| Developer | TBD | Defect investigation and fixing |
| Product Owner | TBD | Requirements clarification, UAT sign-off |

---

## 13. Staffing and Training Needs

- **Team:** 1 QA Lead + 1 QA Engineer (API specialist)
- **Skills Required:** REST API testing, Postman/Newman, JSON/XML, HTTP fundamentals, ISTQB Foundation
- **Training:** None expected; team is experienced with REST API testing

---

## 14. Schedule

| Milestone | Planned Start | Planned End |
|-----------|---------------|-------------|
| Test Plan sign-off | 03-Jun-2026 | 05-Jun-2026 |
| Test case design | 06-Jun-2026 | 10-Jun-2026 |
| Postman collection build | 06-Jun-2026 | 11-Jun-2026 |
| Test Execution — Cycle 1 | 12-Jun-2026 | 18-Jun-2026 |
| Defect fix verification | 19-Jun-2026 | 23-Jun-2026 |
| Regression cycle | 24-Jun-2026 | 26-Jun-2026 |
| Test closure and sign-off | 27-Jun-2026 | 28-Jun-2026 |

---

## 15. Risks and Contingencies

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R01 | Heroku free-tier environment resets/loses data between sessions | High | Medium | Seed test data at the start of every run; add setup/teardown scripts in Postman collection |
| R02 | Shared public environment — test data polluted by other users | High | Medium | Use unique identifiers (e.g. `firstname: "QATest_<timestamp>"`) to namespace test data |
| R03 | Auth token expiry mid-run causing false failures | Medium | High | Refresh token in Postman pre-request script; treat 403 as retriable once |
| R04 | API spec ambiguity (e.g. PATCH doc shows PUT examples) | Medium | Medium | Raise clarification with API owner; document assumed behaviour; flag in RTM |
| R05 | Date field validation behaviour undocumented (accepts invalid dates?) | Medium | Medium | Include boundary and invalid-date tests; log as defect if accepted silently |
| R06 | No documented error response schema (4xx/5xx bodies) | Low | Low | Test and document actual error responses; treat inconsistency as defect |

---

## 16. Test Case Summary (High Level)

The following table maps features to test case IDs. Detailed test cases are maintained in the test management tool.

### F01 — Auth: CreateToken (POST /auth)

| TC ID | Description | Priority | Expected Result |
|-------|-------------|----------|-----------------|
| TC-AUTH-001 | Valid credentials return token | P1 | HTTP 200, `token` field present, non-empty string |
| TC-AUTH-002 | Invalid username returns bad credentials | P1 | HTTP 200, `reason: "Bad credentials"` (API quirk — no 401) |
| TC-AUTH-003 | Invalid password returns bad credentials | P1 | HTTP 200, `reason: "Bad credentials"` |
| TC-AUTH-004 | Missing username field | P2 | Error response indicating missing field |
| TC-AUTH-005 | Missing password field | P2 | Error response indicating missing field |
| TC-AUTH-006 | Empty body / no Content-Type | P2 | HTTP 4xx error response |

### F02/F03/F04 — Booking: GetBookingIds (GET /booking)

| TC ID | Description | Priority | Expected Result |
|-------|-------------|----------|-----------------|
| TC-GBI-001 | Get all booking IDs (no filters) | P1 | HTTP 200, array of `{bookingid: n}` objects |
| TC-GBI-002 | Filter by firstname | P2 | HTTP 200, only bookings with matching firstname |
| TC-GBI-003 | Filter by lastname | P2 | HTTP 200, only bookings with matching lastname |
| TC-GBI-004 | Filter by firstname + lastname | P2 | HTTP 200, bookings matching both |
| TC-GBI-005 | Filter by checkin date (CCYY-MM-DD) | P2 | HTTP 200, bookings with checkin >= date |
| TC-GBI-006 | Filter by checkout date (CCYY-MM-DD) | P2 | HTTP 200, bookings with checkout >= date |
| TC-GBI-007 | Filter by checkin + checkout | P2 | HTTP 200, bookings satisfying both filters |
| TC-GBI-008 | Filter with non-existent name | P2 | HTTP 200, empty array |
| TC-GBI-009 | Invalid date format in filter | P3 | HTTP 4xx or empty result |

### F05/F06 — Booking: GetBooking (GET /booking/:id)

| TC ID | Description | Priority | Expected Result |
|-------|-------------|----------|-----------------|
| TC-GB-001 | Get existing booking — JSON response | P1 | HTTP 200, full booking object with all fields |
| TC-GB-002 | All response fields present and correct types | P1 | `firstname`/`lastname` String, `totalprice` Number, `depositpaid` Boolean, `bookingdates` Object, `checkin`/`checkout` Date, `additionalneeds` String |
| TC-GB-003 | Get existing booking — XML response (`Accept: application/xml`) | P2 | HTTP 200, valid XML booking document |
| TC-GB-004 | Get non-existent booking ID | P1 | HTTP 404 |
| TC-GB-005 | Get booking with non-numeric ID | P2 | HTTP 4xx |
| TC-GB-006 | Get booking with `Accept: application/json` explicit header | P2 | HTTP 200, JSON response |

### F07/F08 — Booking: CreateBooking (POST /booking)

| TC ID | Description | Priority | Expected Result |
|-------|-------------|----------|-----------------|
| TC-CB-001 | Create booking with all fields — JSON | P1 | HTTP 200, response contains `bookingid` and full `booking` object |
| TC-CB-002 | Response `bookingid` is a unique integer | P1 | `bookingid` > 0 and not previously returned |
| TC-CB-003 | Response booking object matches request payload | P1 | All submitted fields reflected in response |
| TC-CB-004 | Create booking without `additionalneeds` (optional field) | P2 | HTTP 200, booking created |
| TC-CB-005 | Create booking — XML content-type | P2 | HTTP 200, valid response |
| TC-CB-006 | Create booking — URL-encoded content-type | P2 | HTTP 200, valid response |
| TC-CB-007 | Missing required field `firstname` | P1 | HTTP 4xx error |
| TC-CB-008 | Missing required field `lastname` | P1 | HTTP 4xx error |
| TC-CB-009 | Missing `totalprice` | P1 | HTTP 4xx error |
| TC-CB-010 | Missing `depositpaid` | P1 | HTTP 4xx error |
| TC-CB-011 | Missing `bookingdates.checkin` | P1 | HTTP 4xx error |
| TC-CB-012 | Missing `bookingdates.checkout` | P1 | HTTP 4xx error |
| TC-CB-013 | `totalprice` as string (wrong type) | P2 | HTTP 4xx or coercion behaviour documented |
| TC-CB-014 | `depositpaid` as string (wrong type) | P2 | HTTP 4xx or coercion behaviour documented |
| TC-CB-015 | `checkin` date in invalid format | P2 | HTTP 4xx |
| TC-CB-016 | `checkout` date before `checkin` date | P2 | HTTP 4xx or documented behaviour |
| TC-CB-017 | `totalprice` as 0 (boundary) | P3 | HTTP 200, booking created |
| TC-CB-018 | `totalprice` as negative number | P3 | HTTP 4xx or documented behaviour |

### F09 — Booking: UpdateBooking (PUT /booking/:id)

| TC ID | Description | Priority | Expected Result |
|-------|-------------|----------|-----------------|
| TC-UB-001 | Full update with Cookie token auth | P1 | HTTP 200, updated booking returned |
| TC-UB-002 | Full update with Basic auth header | P1 | HTTP 200, updated booking returned |
| TC-UB-003 | Updated fields reflected in subsequent GET | P1 | GET returns new values |
| TC-UB-004 | Update without auth (no Cookie, no Authorization) | P1 | HTTP 403 |
| TC-UB-005 | Update with invalid token | P1 | HTTP 403 |
| TC-UB-006 | Update non-existent booking ID | P2 | HTTP 404 or 405 |
| TC-UB-007 | Full update — missing required field in body | P1 | HTTP 4xx (PUT requires full payload) |
| TC-UB-008 | Full update — XML content-type + Basic auth | P2 | HTTP 200, XML booking response |
| TC-UB-009 | Full update — URL-encoded + Basic auth | P2 | HTTP 200, URL-encoded response |

### F10 — Booking: PartialUpdateBooking (PATCH /booking/:id)

| TC ID | Description | Priority | Expected Result |
|-------|-------------|----------|-----------------|
| TC-PUB-001 | Partial update `firstname` only — Cookie auth | P1 | HTTP 200, only `firstname` changed, other fields unchanged |
| TC-PUB-002 | Partial update `lastname` only — Basic auth | P1 | HTTP 200, only `lastname` changed |
| TC-PUB-003 | Partial update `totalprice` and `depositpaid` | P2 | HTTP 200, both fields updated |
| TC-PUB-004 | Partial update `bookingdates` object | P2 | HTTP 200, dates updated |
| TC-PUB-005 | Partial update without auth | P1 | HTTP 403 |
| TC-PUB-006 | Partial update with invalid token | P1 | HTTP 403 |
| TC-PUB-007 | Partial update non-existent ID | P2 | HTTP 404 or 405 |
| TC-PUB-008 | Partial update — empty body | P3 | HTTP 200 (no-op) or HTTP 4xx |

### F11 — Booking: DeleteBooking (DELETE /booking/:id)

| TC ID | Description | Priority | Expected Result |
|-------|-------------|----------|-----------------|
| TC-DB-001 | Delete existing booking — Cookie auth | P1 | HTTP 201, booking no longer retrievable (subsequent GET returns 404) |
| TC-DB-002 | Delete existing booking — Basic auth | P1 | HTTP 201 |
| TC-DB-003 | Delete without auth | P1 | HTTP 403 |
| TC-DB-004 | Delete with invalid token | P1 | HTTP 403 |
| TC-DB-005 | Delete non-existent booking ID | P2 | HTTP 404 or 405 |
| TC-DB-006 | Delete already-deleted booking | P2 | HTTP 404 or 405 |

### F12 — Ping: HealthCheck (GET /ping)

| TC ID | Description | Priority | Expected Result |
|-------|-------------|----------|-----------------|
| TC-PING-001 | Ping returns HTTP 201 Created | P1 | HTTP 201 |
| TC-PING-002 | Response time < 3 seconds | P2 | Latency within threshold |

### F13 — End-to-End Booking Lifecycle

| TC ID | Description | Priority | Expected Result |
|-------|-------------|----------|-----------------|
| TC-E2E-001 | Create → Get → Update → Delete booking | P1 | Each step succeeds; final GET returns 404 |
| TC-E2E-002 | Create → PartialUpdate (name change) → Get (verify name) → Delete | P1 | Name updated correctly; cleanup successful |

---

## 17. Approvals

| Name | Role | Signature / Date |
|------|------|-----------------|
| [Product Owner] | Product Owner | |
| [Dev Lead] | Development Lead | |
| [QA Manager] | QA Manager | |
| [QA Lead] | Test Plan Author | 03-Jun-2026 |

---

*This is a living document. Updates will be versioned in section 1 (Test Plan Identifier) and communicated to all stakeholders.*
