# Test-Driven Development (TDD)

> "TDD encourages simple designs and inspires confidence." — Kent Beck

Test-Driven Development is a software development practice where you write an automated, failing test **before** writing any production code. The test defines desired behaviour; you then write only enough code to make it pass, and finally clean up the code — without breaking the test. This loop repeats for every new behaviour, building a fully-tested codebase incrementally.

---

## History

- **1994** — Kent Beck develops SUnit, a Smalltalk testing framework, laying the groundwork for test-first practices.
- **1999** — TDD emerges as a core discipline within Beck's Extreme Programming (XP) methodology.
- **2002** — Beck formalises TDD in *Test-Driven Development by Example* (Addison-Wesley), the canonical reference.
- **2000s** — The xUnit family (JUnit, NUnit, etc.) becomes the standard toolchain; TDD spreads beyond XP into mainstream Agile.
- **Today** — TDD principles extend across the full testing pyramid: unit, integration, API, acceptance, and end-to-end testing.

---

## Core Concepts

### The Three Rules (Uncle Bob)

1. You may not write production code unless it is to make a failing unit test pass.
2. You may not write more of a unit test than is sufficient to fail (including failing to compile).
3. You may not write more production code than is sufficient to make the currently failing test pass.

### Guiding Principles

- **Test-first** — Write the test before any implementation. This forces you to clarify what success looks like upfront.
- **Small increments** — Build each feature in focused, testable steps rather than large, risky batches.
- **Continuous validation** — Every change is immediately validated against the full test suite.
- **Design through testing** — Tests guide how code is structured. Testable code tends to be more modular and decoupled.
- **KISS** (Keep It Simple, Stupid) — Write only the code needed to pass the current test.
- **YAGNI** (You Aren't Gonna Need It) — Do not add functionality until a test requires it.
- **No code without a test** — No production code goes untested; every line exists to satisfy a requirement expressed as a test.
- **Eliminate duplication** — Refactoring targets redundant logic in both production and test code.

---

## The Red–Green–Refactor Cycle

The heartbeat of TDD. Each cycle typically takes minutes, providing a fast, continuous feedback loop.

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   🔴 RED        Write a failing test            │
│        ↓                                        │
│   🟢 GREEN      Write minimal code to pass      │
│        ↓                                        │
│   🔵 REFACTOR   Clean up; keep tests green      │
│        ↓                                        │
│   (repeat for next behaviour)                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Step-by-Step

**1. List scenarios**
Before writing any test, list the behaviours and edge cases the feature must handle — basic case, error conditions, boundary values, etc. Derived from use cases, user stories, or acceptance criteria.

**2. 🔴 Write a failing test (Red)**
Pick one item from the list. Write an automated test that would pass if that behaviour is met. The test must fail initially — this confirms the test harness is working and that the feature is not already implemented by accident. The test may not even compile yet; that is expected.

**3. Run all tests — confirm the new test fails**
Validate the failure is for the expected reason, not due to a test bug or misconfiguration.

**4. 🟢 Write the simplest code that passes (Green)**
Write only enough code to make the failing test pass. Inelegant code and hard-coding are acceptable at this stage. No extra functionality beyond what the test requires.

**5. Run all tests — confirm all pass**
If any tests fail, make only minimal changes to restore them to green.

**6. 🔵 Refactor**
Clean up both production code and test code while keeping all tests green after each change. Typical refactoring moves:
- Remove hard-coded test data from production code
- Extract duplicate logic into shared methods/functions
- Rename identifiers to be self-documenting
- Split large methods into smaller, focused ones
- Reorganise class/module structure for clarity

**7. Repeat**
Return to step 2 with the next item on the list until all scenarios are covered.

> Small tests and frequent commits are key. If new code breaks tests, revert rather than debug excessively.

---

## What to Test

TDD relies primarily on **unit tests** for the rapid red-green-refactor cycle:

- A **unit** is typically a class or a group of related functions (a module).
- Unit tests avoid process boundaries, network calls, and external dependencies — keeping execution fast and failures easy to pinpoint.
- When code depends on external systems, use **test doubles** (mocks, stubs, fakes, spies) to keep unit tests isolated.
- **Integration tests** verify interactions between components but run less frequently due to their slower speed.
- Test doubles do not prove the connection to real external components — supplement with integration tests at appropriate levels.
- Do not write tests so granular that they effectively test a third-party library rather than your own code.

### Testing at Every Level

| Level | Scope | TDD Variant |
|---|---|---|
| Unit | Single class / function | Classic TDD |
| Integration | Component interactions | TDD with real dependencies |
| API / Contract | Service interfaces | Contract-first TDD |
| Acceptance | Full feature from user perspective | ATDD (Acceptance TDD) |
| End-to-End | Entire system workflow | BDD / ATDD |

---

## Benefits

**Code quality** — Thinking about tests first forces consideration of edge cases and design before implementation begins.

**Defect prevention** — Bugs are caught at the moment they are introduced, not weeks later during integration or QA.

**Living documentation** — The test suite is an always-accurate, executable specification of the system's intended behaviour.

**Safe refactoring** — A comprehensive suite of passing tests provides the safety net needed to restructure code confidently.

**Simpler design** — Writing only the code needed to pass tests naturally prevents over-engineering and unnecessary complexity.

**Faster debugging** — When a test fails, the failure is pinpointed immediately to a small, recent change rather than a large codebase.

**Developer confidence** — Receiving expected results at each small step reinforces the mental model of the code and sustains productivity.

**CI/CD compatibility** — TDD's automated tests integrate directly into continuous integration pipelines, providing instant feedback on every commit.

---

## Common Challenges

**Initial slowdown** — Writing tests first takes more time upfront. The payoff comes later through reduced debugging and rework.

**Test maintenance** — Tests must be kept up to date as code evolves. Poorly structured tests become a maintenance burden.

**Overtesting implementation details** — Tests should verify *behaviour*, not internal implementation. Brittle tests break on refactors that change nothing observable.

**Insufficient coverage** — Unit tests alone do not catch integration failures. TDD should be complemented with higher-level tests.

**Testing private methods** — If you feel the need to test private internals directly, it usually signals the need for a design change (extract a class or function) rather than a testing workaround.

**Not suited for all contexts** — Rapid prototypes, exploratory spikes, and heavily UI-driven work can be awkward to TDD. Recognise when a pragmatic exception is warranted.

---

## TDD vs. Related Approaches

| | TDD | BDD | ATDD | Traditional |
|---|---|---|---|---|
| **Who writes tests** | Developers | Devs + testers | Devs + testers + business | Testers (after dev) |
| **Language** | Code (xUnit, etc.) | Business-readable (Gherkin) | Business-readable | Code / manual |
| **Focus** | Technical correctness | User behaviour | Acceptance criteria | Defect detection |
| **When tests are written** | Before code | Before code | Before code | After code |
| **Primary test level** | Unit | Integration / E2E | Acceptance | Any |

**BDD (Behaviour-Driven Development)** extends TDD upward: tests are expressed in plain language (e.g. Gherkin `Given / When / Then`) and bridge the gap between technical and non-technical stakeholders. Tools: Cucumber, SpecFlow, Behave.

**ATDD (Acceptance Test-Driven Development)** applies test-first thinking at the acceptance level, involving developers, testers, and product owners in defining executable acceptance criteria before implementation ("Three Amigos" sessions).

---

## TDD and Agile / CI-CD

TDD fits naturally within Agile because both emphasise iteration, fast feedback, and working software. Practically:

- Each sprint story or user story is broken into small, testable behaviours — each driven by a red-green-refactor cycle.
- TDD test suites run automatically in **CI pipelines** on every push, catching regressions immediately.
- Comprehensive test coverage gives teams confidence to deploy frequently — enabling true **continuous delivery**.
- TDD aligns with the shift-left principle: quality is built in from the first line of code, not inspected in at the end.

---

## Quick Reference

```
Cycle:     Red → Green → Refactor → Repeat

Rules:     1. No production code without a failing test
           2. No more test than needed to fail
           3. No more code than needed to pass

Mindset:   Test-first · KISS · YAGNI · No duplication

Test types: Unit (primary) + Integration + Acceptance

Key tool:  xUnit family (JUnit, NUnit, pytest, Jest, RSpec, …)
           Test doubles: mocks, stubs, fakes, spies
```

---

## Further Reading

- *Test-Driven Development by Example* — Kent Beck (2002)
- *Clean Code* — Robert C. Martin (Chapter 9: Unit Tests)
- *Growing Object-Oriented Software, Guided by Tests* — Freeman & Pryce
- [Wikipedia — Test-driven development](https://en.wikipedia.org/wiki/Test-driven_development)
- [Kent Beck's Canon TDD](https://tidyfirst.substack.com/p/canon-tdd)
