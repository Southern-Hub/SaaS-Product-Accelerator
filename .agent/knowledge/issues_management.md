# Issues Management Workflow

## Overview
The `ISSUES.md` file is the central tracking document for all tasks, features, bugs, and technical debt in the SaaS Viability Analyzer project. This knowledge item defines how to properly maintain and update it throughout the development lifecycle.

## File Location
`/Users/david/Projects/SaaSViabilityAnalyser/docs/ISSUES.md`

## When to Update ISSUES.md

### Planning Phase
- **New Feature/Task**: Add checkbox item `[ ]` under appropriate priority section (🔴 High, 🟡 Medium, 🟢 Low)
- **Bug Discovery**: Add under 🐛 Bugs & Issues with severity level (🔴 Critical, 🟡 Important, 🟢 Minor)
- **Technical Debt**: Add under 🛠️ Technical Debt with relevant category

### Execution Phase
- **Starting Work**: Mark item as `[x]` when completed in isolation, or add `(@yourname)` if claiming work
- **Status Updates**: Update related items as work progresses
- **Blocking Issues**: Document blockers inline or create new issue entries

### Completion Phase
- **Mark Complete**: Change `[ ]` to `[x]`
- **Move to Completed**: Cut completed item and paste under ✅ Completed section
- **Add Timestamp**: Include completion timestamp in format: `*Completed: YYYY-MM-DD HH:MM*`
- **Add Details**: Brief description of what was implemented/fixed

### Review Phase
- **Priority Adjustments**: Move items between priority levels as scope changes
- **Update Notes**: Update **Last Updated** timestamp at bottom
- **Archive Old Items**: Consider archiving very old completed items if document gets too long

## Document Structure

### Active Sections
- 🚀 **Features** (High/Medium/Low Priority)
- 🐛 **Bugs & Issues** (Critical/Important/Minor)
- 🛠️ **Technical Debt** (Code Quality/Performance/Infrastructure)
- 📝 **Documentation Needs**
- 💡 **Future Ideas**

### Tracking Section
- ✅ **Completed** (with timestamps and details)
- 📋 **Notes** (metadata: Last Updated, Project Status, Tech Stack)

## Best Practices

1. **Be Specific**: Write clear, actionable task descriptions
2. **Stay Current**: Update within same session when making changes
3. **Group Related Items**: Use sub-bullets for related subtasks
4. **Link to Code**: Reference files/functions when relevant
5. **Estimate Scope**: Use priority levels to indicate urgency and effort
6. **Document Decisions**: Add context for why features were added/rejected

## Example Flow

### Adding a New Feature
```markdown
### 🟡 Medium Priority

- [ ] **User Authentication**
  - [ ] Implement JWT token system
  - [ ] Add login/logout endpoints
  - [ ] Create protected route middleware
```

### During Implementation
```markdown
- [x] **User Authentication** (@david)
  - [x] Implement JWT token system
  - [ ] Add login/logout endpoints
  - [ ] Create protected route middleware
```

### After Completion
```markdown
✅ Completed Section:

- **User Authentication System** - *Completed: 2025-11-20 14:30*
  - Implemented JWT token generation and validation
  - Created /api/auth/login and /api/auth/logout endpoints
  - Added middleware for protected routes in app/api/*/route.ts
  - Integrated with NextAuth.js for session management
```

## Integration with Development Workflow

- **Before starting work**: Check ISSUES.md for priorities and claim items
- **During development**: Update checkboxes as tasks complete
- **After completing work**: Move to Completed section with timestamp
- **Weekly reviews**: Adjust priorities, archive old items, add new tasks
- **Release planning**: Use High Priority items to plan next release scope

## Automation Opportunities
- Consider GitHub Issues integration for public tracking
- Add CI/CD checks to ensure ISSUES.md is updated with PRs
- Create templates for common issue types
