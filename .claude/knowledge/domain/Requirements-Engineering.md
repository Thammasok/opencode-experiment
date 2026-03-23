# Requirements Engineering (RE) — Process Reference

> "Requirements engineering is the disciplined application of proven principles, methods, tools, and notation to describe a proposed system's intended behaviour and its associated constraints."

Requirements Engineering is the set of activities concerned with identifying, documenting, analysing, validating, and managing the needs and constraints of a system before and during development. Poor or missing requirements are one of the most cited causes of software project failure — getting RE right is the single highest-leverage investment a team can make.

---

## Overview

The RE process is not a single linear step — it is a cycle of interrelated activities that often overlap and repeat throughout a project's lifetime. In traditional (Waterfall) projects RE is front-loaded; in Agile projects it is distributed across every iteration.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   Feasibility → Elicitation → Analysis → Specification  │
│        ↑                                        ↓        │
│    Management  ←←←←←←←←←←← Validation         │
│                                                          │
└──────────────────────────────────────────────────────────┘
        (all activities feed back into each other)
```

---

## Phase 1 — Feasibility Study

Before committing to full elicitation, assess whether the proposed system is worth building.

**Goals:**
- Determine if the system is technically, financially, and operationally viable.
- Confirm that the scope aligns with organisational constraints (budget, schedule, regulation).
- Produce a go/no-go decision that informs further investment.

**Outputs:** Feasibility report, initial scope statement, preliminary stakeholder map.

**Key questions to answer:**
- Can the required functionality be delivered with current or acquirable technology?
- Can the project be completed within the planned budget and schedule?
- Does the system comply with applicable legal and regulatory standards?
- Does the business case justify the cost and risk?

---

## Phase 2 — Requirements Elicitation

Elicitation is the process of discovering requirements from stakeholders, domain knowledge, existing systems, and other sources. It is arguably the hardest phase — stakeholders often cannot fully articulate what they need, and requirements are distributed across many people with conflicting perspectives.

### Common Elicitation Problems

- **Scope problems** — Ill-defined system boundaries; customers specify unnecessary technical detail.
- **Understanding problems** — Stakeholders uncertain about their own needs; communication barriers between business and technical people.
- **Volatility problems** — Requirements change over time, sometimes faster than they can be documented.

### Elicitation Techniques

| Technique | Best For | Notes |
|---|---|---|
| **Interviews** | Deep context, individual stakeholder needs | One-on-one; open or structured; uncovers tacit knowledge |
| **Workshops / JAD sessions** | Cross-functional alignment, conflict resolution | Brings stakeholders together; faster consensus |
| **Observation / Ethnography** | Understanding existing workflows | Reveals undocumented practices and pain points |
| **Surveys / Questionnaires** | Large audiences, quantitative prioritisation | Scalable but shallow; good for validation |
| **Prototyping** | Clarifying vague requirements, early feedback | Stakeholders react to something concrete |
| **Brainstorming** | Generating a wide range of ideas | Best early-stage; combine with filtering |
| **Use Cases / User Stories** | Capturing user-system interactions | Bridges business and technical language |
| **Document Analysis** | Existing systems, legacy specs, standards | Reveals implied constraints and baseline |
| **Focus Groups** | End-user needs and preferences | Moderated group discussion |
| **Role Playing** | Exploring user journeys | Simulates system usage scenarios |
| **Delphi Technique** | Expert consensus under uncertainty | Iterative anonymous expert input |

> Elicitation does **not** produce formal models — it widens domain knowledge and feeds the analysis phase. Combining multiple techniques gives a more complete and reliable picture.

### Stakeholder Identification

Before eliciting, identify all relevant stakeholders:

- **Primary users** — People who directly interact with the system.
- **Secondary users** — Those indirectly affected (managers, support staff).
- **Domain experts** — Subject matter experts who understand the business context.
- **Technical stakeholders** — Architects, developers, operations, security teams.
- **Business stakeholders** — Product owners, executives, regulators, compliance officers.
- **External parties** — Third-party integrators, vendors, auditors.

---

## Phase 3 — Requirements Analysis

Raw elicitation output is messy — contradictory, incomplete, duplicated, and out of scope. Analysis transforms this raw material into a coherent, prioritised, and feasible set of requirements.

### Analysis Activities

**Categorisation** — Classify each requirement as functional, non-functional, business, user, or constraint (see [Types of Requirements](#types-of-requirements) below).

**Conflict resolution** — Identify and negotiate disagreements between stakeholders. The requirements analyst often acts as a mediator; unresolved conflicts must be escalated.

**Prioritisation** — Not all requirements are equally important. Common frameworks:

| Framework | Description |
|---|---|
| **MoSCoW** | Must have / Should have / Could have / Won't have |
| **Kano Model** | Basic needs vs. performance vs. delighters |
| **100-Point Method** | Stakeholders distribute 100 points across requirements |
| **Risk-based** | Prioritise by impact × likelihood of failure |
| **Business value / effort** | Plot on a 2×2 matrix; deliver high value, low effort first |

**Feasibility filtering** — Remove requirements that are technically impossible, out of scope, or economically unjustifiable given current constraints.

**Gap analysis** — Identify what is missing. What scenarios are not yet covered? What edge cases have been overlooked?

**Modelling** — Represent requirements visually to expose relationships and gaps:

- **Use Case Diagrams** — Actor-system interactions (UML)
- **Activity Diagrams** — Business process flows (UML)
- **Entity-Relationship Diagrams (ERD)** — Data structures and relationships
- **Data Flow Diagrams (DFD)** — How data moves through the system
- **State Diagrams** — How the system reacts to events over time
- **Sequence Diagrams** — Interaction ordering between components

---

## Phase 4 — Requirements Specification

Specification is the formal documentation of the analysed requirements. It produces artefacts that act as the contract between stakeholders and the development team.

### Key Documents

**Software Requirements Specification (SRS)**
The master document defining all functional and non-functional requirements. Typically structured as:

1. Introduction — purpose, scope, definitions, acronyms, overview
2. Overall description — product perspective, product functions, user characteristics, constraints
3. Functional requirements — detailed feature-by-feature description
4. Non-functional requirements — performance, security, usability, etc.
5. System constraints — hardware, software, interface, and regulatory constraints
6. Appendices — glossary, models, diagrams

**User Stories (Agile)**
Short, user-centred requirement statements following the template:
> *As a [role], I want [goal] so that [benefit].*

Each story includes acceptance criteria that define when it is "done".

**Use Cases**
Structured descriptions of actor-system interactions including preconditions, main flow, alternative flows, and postconditions.

**Business Requirements Document (BRD)**
Higher-level document capturing organisational goals, business rules, and outcomes the product must achieve.

### Characteristics of a Good Requirement

Every individual requirement should be:

| Quality | Meaning |
|---|---|
| **Complete** | Contains all information needed; no TBDs |
| **Correct** | Accurately reflects stakeholder need |
| **Unambiguous** | Only one possible interpretation |
| **Consistent** | Does not conflict with other requirements |
| **Verifiable** | Can be tested or measured objectively |
| **Traceable** | Has a known source and can be linked to downstream artefacts |
| **Feasible** | Can be implemented within known constraints |
| **Necessary** | Represents a real need, not a nice-to-have disguised as a must |
| **Prioritised** | Has an agreed-upon importance relative to other requirements |

---

## Phase 5 — Requirements Validation

Validation confirms that the documented requirements accurately represent what stakeholders actually need, and that the specification is internally consistent and complete. Errors caught here cost far less to fix than errors found after development begins.

### Validation Checks

- **Correctness** — Do the requirements reflect true stakeholder needs?
- **Completeness** — Have all relevant scenarios and edge cases been covered?
- **Consistency** — Are there any two requirements that contradict each other?
- **Feasibility** — Can all requirements realistically be implemented?
- **Testability** — Can a test be written to verify each requirement?
- **Traceability** — Can every requirement be linked to a business goal and a stakeholder?

### Validation Techniques

**Requirements review / inspection** — A structured walkthrough by stakeholders, analysts, architects, developers, and testers. The author should not be the sole reviewer.

**Prototype review** — A mock-up or working prototype is demonstrated to stakeholders to confirm alignment. Especially valuable for UI-heavy or vague requirements.

**Test case generation** — Writing test cases for a requirement is one of the most reliable ways to detect ambiguity and untestability. If a test cannot be written, the requirement needs revision.

**Acceptance criteria review** — Stakeholders confirm that the defined acceptance criteria would, if passed, actually satisfy their needs.

**Formal methods** — Mathematical proofs of consistency for safety-critical or high-integrity systems (aerospace, medical devices, nuclear).

> The person who wrote the requirements should **not** be the sole person validating them. Independent review consistently catches more defects.

---

## Phase 6 — Requirements Management

Requirements management is the ongoing process of handling changes and maintaining alignment throughout the project lifecycle. Requirements are rarely static — business context changes, stakeholders refine their understanding, and new constraints emerge.

### Core Activities

**Baseline and versioning** — Once a set of requirements is agreed, it is baselined. All subsequent changes go through a formal change control process. Requirements should carry version numbers.

**Change control** — A formal process for requesting, evaluating, approving, and implementing changes:

```
Change Request → Impact Analysis → Approval / Rejection → Update Spec → Re-baseline → Communicate
```

**Impact analysis** — Before approving a change, assess:
- Which other requirements are affected?
- What design, code, and tests must change?
- What is the cost and schedule impact?

**Traceability** — See [Requirements Traceability](#requirements-traceability) below.

**Status tracking** — Each requirement moves through states during the project:

```
Proposed → Analysed → Approved → Implemented → Verified → Released
                            ↓
                        Rejected / Deferred
```

---

## Types of Requirements

### Business Requirements
High-level organisational objectives. Define *why* the system is being built.
> Example: "Reduce customer onboarding time by 40% within 12 months."

### User Requirements
Describe what users need to do with the system. Often expressed as use cases or user stories.
> Example: "Users must be able to reset their password without contacting support."

### Functional Requirements (FR)
Define **what** the system must do — specific behaviours, features, and functions.
> Example: "The system shall send an email notification within 60 seconds of a successful order placement."

### Non-Functional Requirements (NFR) / Quality Attributes
Define **how well** the system must perform. Also called quality attributes or system qualities.

| Category | Examples |
|---|---|
| **Performance** | Response time < 200ms for 95% of requests under 10,000 concurrent users |
| **Scalability** | System must support 5× current load without redesign |
| **Reliability / Availability** | 99.9% uptime; mean time between failures > 720 hours |
| **Security** | All data encrypted at rest (AES-256); OWASP Top 10 compliance |
| **Usability** | New users complete onboarding in under 5 minutes without assistance |
| **Maintainability** | Any module replaceable without changing more than 5% of the codebase |
| **Portability** | Runs on Chrome 120+, Firefox 115+, Safari 17+; iOS 16+ and Android 13+ |
| **Compliance / Regulatory** | Must comply with GDPR, HIPAA, ISO 27001, etc. |
| **Interoperability** | Must integrate with Salesforce CRM via REST API |

> NFRs are often under-specified — they must be **measurable** (SMART: Specific, Measurable, Agreed, Realistic, Time-bound). "The system shall be fast" is not a requirement; "The system shall return search results in under 300ms for 99% of requests" is.

### Constraints
Fixed restrictions that limit design choices — hardware platforms, legacy system interfaces, existing standards, budget, schedule, regulatory mandates.

### Transition Requirements
Temporary requirements that describe what is needed to move from the current state to the future state — data migration, training, cutover procedures.

---

## Requirements Traceability

Traceability is the ability to link every requirement to its origin (backwards) and to every downstream artefact that implements and validates it (forwards).

### Traceability Directions

**Backward traceability** — From requirement back to its source: stakeholder, business goal, regulation, or user story. Answers: *Why does this requirement exist?*

**Forward traceability** — From requirement forward to design, code, test cases, and results. Answers: *Is this requirement implemented and tested?*

**Bidirectional traceability** — Both directions maintained. Provides end-to-end coverage proof and supports impact analysis.

### Requirements Traceability Matrix (RTM)

The RTM is the primary tool for managing traceability — a table linking requirements to all associated artefacts.

**Typical RTM columns:**

| Requirement ID | Description | Source | Priority | Design Ref | Test Case ID | Test Status | Owner |
|---|---|---|---|---|---|---|---|
| FR-001 | User login via email + password | Stakeholder workshop | Must | DS-023 | TC-101, TC-102 | Pass | Dev Team A |
| NFR-005 | Login response < 500ms | Performance SLA | Must | DS-023 | TC-110 | Pass | Dev Team A |
| FR-007 | Export report as CSV | Product Owner | Should | DS-041 | TC-201 | In Progress | Dev Team B |

**Benefits of maintaining an RTM:**
- Proves full test coverage — no requirement goes untested.
- Enables precise impact analysis when requirements change.
- Supports compliance audits in regulated industries (healthcare, aviation, finance).
- Detects "orphan" requirements (defined but never implemented) and "ghost features" (built but not required).

---

## Requirements Engineering in Agile

In Agile, RE is continuous and distributed across sprints rather than performed once upfront.

| Traditional (Waterfall) | Agile |
|---|---|
| Complete specification before development | "Just enough" specification per sprint |
| Requirements frozen after sign-off | Requirements expected to evolve |
| SRS is the primary artefact | Product backlog + user stories + acceptance criteria |
| Formal change control process | Change embraced via backlog grooming |
| RE is a distinct phase | RE woven throughout every iteration |

**Key Agile RE practices:**
- **Backlog refinement** — Ongoing session to clarify, decompose, and prioritise stories before they enter a sprint.
- **Definition of Ready (DoR)** — A story is only pulled into a sprint when requirements are clear enough to implement and test.
- **Acceptance criteria** — Each story has explicit, testable conditions of satisfaction agreed before development begins.
- **Three Amigos** — Developer, tester, and product owner review a story together before implementation to surface ambiguity early.
- **Continuous stakeholder engagement** — Replaces big upfront sign-offs with ongoing collaboration and frequent demos.

---

## Common RE Pitfalls

**Gold plating** — Developers add features not requested by stakeholders. Every line of code without a requirement is waste.

**Requirements creep (scope creep)** — Undisciplined addition of new requirements without going through change control. Managed by maintaining a baseline and enforcing change requests.

**Ambiguous language** — Words like "fast", "user-friendly", "flexible", "reliable" without measurable criteria are not requirements. Every NFR must be quantified.

**Missing stakeholders** — Neglecting operational staff, support teams, security, compliance, or future maintainers leads to requirements gaps discovered late.

**Over-specification** — Specifying the solution (how) instead of the problem (what). Requirements should describe desired behaviour and constraints, not implementation details.

**Skipping validation** — Requirements not reviewed by the right people before development begins. The most expensive bugs are those baked in at the requirements stage.

**No traceability** — Without traceability, impact analysis of changes is guesswork, and test coverage is unverifiable.

---

## Quick Reference

```
Phases:        Feasibility → Elicitation → Analysis →
               Specification → Validation → Management (continuous)

Requirement    Complete · Correct · Unambiguous · Consistent
qualities:     Verifiable · Traceable · Feasible · Prioritised

Types:         Business / User / Functional / Non-Functional /
               Constraints / Transition

NFR must be:   SMART — Specific, Measurable, Agreed, Realistic, Time-bound

Traceability:  Backward (to source) + Forward (to tests/code) = Bidirectional

Key artefacts: SRS · BRD · Use Cases · User Stories · RTM · Prototypes

Prioritisation: MoSCoW · Kano · 100-point · Risk-based · Value/effort matrix
```

---

## Further Reading

- *Software Requirements* (3rd ed.) — Karl Wiegers & Joy Beatty
- *Requirements Engineering: Processes and Techniques* — Kotonya & Sommerville
- *Discovering Requirements* — Alexander & Beus-Dukic
- *User Stories Applied* — Mike Cohn
- [Wikipedia — Requirements Engineering](https://en.wikipedia.org/wiki/Requirements_engineering)
- [Wikipedia — Requirements Elicitation](https://en.wikipedia.org/wiki/Requirements_elicitation)
- IREB (International Requirements Engineering Board) — [ireb.org](https://www.ireb.org)
- IEEE 830 / ISO/IEC/IEEE 29148 — Standard for Software Requirements Specifications
