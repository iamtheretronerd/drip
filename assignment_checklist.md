# Assignment Checklist: HW3 Context Engineering

## Task 1: Set Up Scrum Workflow on GitHub (25%)
*Note: Since this is on GitHub, verify these are fully set up on your repository.*
- [ ] Create a GitHub Project board with columns: `Backlog`, `Sprint Todo`, `In Progress`, `In Review`, `Done`
- [ ] Create milestones for `Sprint 1` and `Sprint 2` with due dates matching your P2 timeline
- [ ] Break your PRD into GitHub Issues (each with an action-oriented title, checklist of acceptance criteria, labels, and milestone assignment)
- [ ] Ensure there are at least 10 issues across the two sprints
- [ ] Assign Sprint 1 issues to the "Sprint Todo" column

## Task 2: Create Rules / Instructions Files (35%)
*Status: Completed evaluating `.antigravityrules` file.*
- [x] Create `.antigravityrules` file in the project root
- [x] **Project Context:** Tech stack, architecture, naming conventions, testing strategy
- [x] **PRD & Design References:** Link to PRD, mockup descriptions, key UI components, user flows
- [x] **Scrum Workflow:** Branch naming, commit messages, PR workflow, GitHub reference formats
- [x] **Do's & Don'ts:** Patterns, dependencies, security/accessibility guidelines

## Task 3: Test Your Rules with a Real Feature (25%)
*Status: Mostly Completed. You have implemented the code in `no_rules` and `with_rules` folders and created `comparison.md`.*
- [x] Pick one feature from Sprint 1 (Issue #8 User Auth)
- [x] Implement without rules (clean start)
- [x] Implement with rules (clean start)
- [ ] **Review `comparison.md` completeness:** 
  - [x] Compare code quality & consistency
  - [x] Compare adherence to naming conventions and architecture
  - [x] Compare quality of tests generated
  - [x] **Added specific sub-section:** In `comparison.md`, explicitly addressed **"How well the AI understood the design/mockup intent"**.

## Task 4: Refine and Document (15%) - ✅ COMPLETED
*Status: All Task 4 documents generated and finalized.*
- [x] **Iterate:** Update your `.antigravityrules` file based on what you learned during Task 3 testing (e.g., if the AI missed a specific testing pattern, add a rule for it).
- [x] **Document Changes:** Write down what worked, what didn't work, and the specific changes you made to the rules file.
- [x] **Reflection Document (1-2 pages):**
  - [x] Explain how your rules file bridges your PRD/mockups to actual implementation.
  - [x] Discuss how the Scrum setup on GitHub helps organize AI-assisted development.
  - [x] Detail what you plan to add or change for Sprint 2.

## Final Deliverables to Submit to Canvas
- [ ] GitHub repository link (Ensure Project board, milestones, issues, and rules file are publicly visible)
- [x] Rules file (`_updated.antigravityrules`) in the project root
- [x] Before/after comparison (Screenshots/code snippets — make sure you take screenshots or clear snippets of the `with_rules` vs `no_rules` code)
- [x] Reflection document (`reflection.md`)
