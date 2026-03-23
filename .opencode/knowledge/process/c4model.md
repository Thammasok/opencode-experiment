# C4 Model — Diagrams Reference

> Source: [c4model.com/diagrams](https://c4model.com/diagrams)

The C4 model provides a set of hierarchical diagrams for visualising software architecture at different levels of abstraction. Diagrams are divided into **static structure diagrams** (the core four) and **supporting diagrams**.

---

## Static Structure Diagrams

The C4 model is named after its four core static structure diagrams: **C**ontext, **C**ontainers, **C**omponents, and **C**ode. Each level zooms in further, allowing different stories to be told to different audiences.

> You don't need to use all 4 levels — the System Context and Container diagrams are sufficient for most teams.

---

### 1. System Context Diagram

**Scope:** A single software system.

A high-level, big-picture view showing the system as a box in the centre, surrounded by users and the external systems it interacts with. Detail is intentionally minimal — the focus is on **people** (actors, roles, personas) and **software systems**, not on technologies or protocols.

**Primary elements:** The software system in scope.

**Supporting elements:** People and external software systems directly connected to it.

**Audience:** Everybody — both technical and non-technical, inside and outside the team.

**Recommended?** ✅ Yes — recommended for all software development teams.

---

### 2. Container Diagram

**Scope:** A single software system.

Zooms into the system boundary to show the high-level shape of the software architecture. A *container* in C4 is any separately runnable/deployable unit — a web app, mobile app, desktop app, database, file system, serverless function, message queue, etc.

Shows major technology choices and how containers communicate with one another.

**Primary elements:** Containers within the software system in scope.

**Supporting elements:** People and software systems directly connected to those containers.

**Audience:** Technical people inside and outside the team — architects, developers, and operations/support staff.

**Recommended?** ✅ Yes — recommended for all software development teams.

> **Note:** This diagram intentionally omits deployment details (clustering, load balancers, replication, failover) as these vary across environments. Use a [Deployment Diagram](#deployment-diagram) for that.

---

### 3. Component Diagram

**Scope:** A single container.

Zooms into a container to show its internal components — their responsibilities and technology/implementation details.

**Primary elements:** Components within the container in scope.

**Supporting elements:** Other containers (within the same software system) plus people and software systems directly connected to the components.

**Audience:** Software architects and developers.

**Recommended?** ⚠️ Optional — only create if it adds value. Consider automating generation for long-lived documentation.

---

### 4. Code Diagram

**Scope:** A single component.

The most granular level — shows how a component is implemented as code, using UML class diagrams, entity-relationship diagrams, or similar.

**Primary elements:** Code elements (classes, interfaces, objects, functions, database tables, etc.) within the component in scope.

**Audience:** Software architects and developers.

**Recommended?** ❌ No — especially for long-lived documentation. Most IDEs can generate this on demand. Use only for the most important or complex components.

---

## Supporting Diagrams

In addition to the four core diagrams, C4 includes three supplementary diagram types.

---

### System Landscape Diagram

**Scope:** An enterprise / organisation / department.

A map of all software systems within a chosen scope, showing how they relate to one another. Think of it as a system context diagram without focus on a single system — useful when you are responsible for a portfolio of software systems.

**Primary elements:** People and software systems related to the chosen scope.

**Audience:** Technical and non-technical people, inside and outside the software development team.

**Recommended?** ✅ Yes — particularly for larger organisations. Serves as a bridge into enterprise architecture.

---

### Dynamic Diagram

**Scope:** A particular feature, story, or use case.

Shows how elements in the static model collaborate at runtime to implement a specific behaviour. Based on the UML communication diagram (formerly "collaboration diagram"). Supports both **collaboration style** (free-form layout with numbered interactions) and **sequence style** (sequential flow).

**Primary and supporting elements:** Your choice — software systems, containers, or components, depending on what level of detail is needed.

**Audience:** Technical and non-technical people, inside and outside the software development team.

**Recommended?** ⚠️ Use sparingly — best for interesting/recurring patterns or features with a complicated set of interactions.

> The collaboration and sequence styles convey the same information in different layouts — use whichever suits your audience.

---

### Deployment Diagram

**Scope:** One or more software systems within a single deployment environment (e.g. production, staging, development).

Illustrates how software system and container instances are deployed onto infrastructure. Based on a UML deployment diagram.

Key concepts:
- **Deployment node** — where an instance runs: physical server, VM, IaaS/PaaS, Docker container, execution environment (e.g. JEE server, IIS), etc. Nodes can be nested.
- **Infrastructure node** — DNS services, load balancers, firewalls, etc.
- Cloud provider icons (AWS, Azure, GCP, etc.) can complement the diagram — include them in the diagram key.

**Primary and supporting elements:** Deployment nodes, software system instances, container instances, and infrastructure nodes.

**Audience:** Technical people inside and outside the team — architects, developers, infrastructure architects, and operations/support staff.

**Recommended?** ✅ Yes.

---

## Quick Reference

| Diagram | Scope | Audience | Recommended |
|---|---|---|---|
| System Context | Single software system | Everyone | ✅ Yes |
| Container | Single software system | Technical | ✅ Yes |
| Component | Single container | Architects & developers | ⚠️ Optional |
| Code | Single component | Architects & developers | ❌ No |
| System Landscape | Enterprise / organisation | Everyone | ✅ Yes (larger orgs) |
| Dynamic | Feature / use case | Everyone | ⚠️ Use sparingly |
| Deployment | Deployment environment | Technical | ✅ Yes |

---

## Further Reading

- [c4model.com](https://c4model.com/) — official site
- [Interactive example](https://c4model.com/example)
- [Notation guide](https://c4model.com/diagrams/notation)
- [Review checklist](https://c4model.com/diagrams/checklist)
- [The C4 Model book (O'Reilly)](https://www.oreilly.com/library/view/the-c4-model/9798341660113/)
