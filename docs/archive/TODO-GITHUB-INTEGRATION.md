# TODO & GitHub Issues Integration Guide

This guide explains how to use the TODO.md file and GitHub Issues integration for project management.

## 📋 Overview

Your project now has:
- **TODO.md** - Centralized task tracking file
- **GitHub Issue Templates** - Structured issue creation
- **Automated Workflows** - Sync between TODO and Issues
- **Management Scripts** - CLI tools for TODO management

## 🚀 Quick Start

### 1. Using TODO.md

The TODO.md file contains all project tasks organized by priority and category:

```bash
# View all TODO items
node scripts/todo-manager.js list

# Mark an item as completed
node scripts/todo-manager.js check "Google OAuth"

# Add a new item
node scripts/todo-manager.js add "High Priority" "New feature description"
```

### 2. Creating GitHub Issues

#### Manual Issue Creation
1. Go to your GitHub repository
2. Click "Issues" → "New Issue"
3. Choose from templates:
   - **🐛 Bug Report** - For reporting bugs
   - **✨ Feature Request** - For new features
   - **📋 Task/Todo** - For development tasks

#### Automated Issue Creation from TODO
1. Go to Actions tab in your GitHub repository
2. Run "📋 TODO to Issues" workflow
3. Select which TODO section to process
4. Issues will be created automatically with proper labels

## 🔧 Available Tools

### TODO Manager Script

```bash
# List all items with progress
node scripts/todo-manager.js list

# Mark items as completed
node scripts/todo-manager.js check "search term"

# Mark items as incomplete  
node scripts/todo-manager.js uncheck "search term"

# Add new items
node scripts/todo-manager.js add "Category Name" "Task description"

# Show help
node scripts/todo-manager.js help
```

### GitHub Issue Templates

**🐛 Bug Report** (`bug_report.yml`)
- Structured bug reporting with environment details
- Auto-labels: `bug`, `needs-triage`

**✨ Feature Request** (`feature_request.yml`)
- Feature requests with priority and user type
- Auto-labels: `enhancement`, `needs-triage`

**📋 Task/Todo** (`task.yml`)
- Development tasks with complexity estimation
- Auto-labels: `task`, `needs-triage`

### Automated Workflows

**📋 TODO to Issues** (`todo-to-issues.yml`)
- Converts TODO items to GitHub Issues
- Runs manually with section selection
- Creates properly labeled and formatted issues

**🚀 Project Automation** (`project-automation.yml`)
- Auto-labels issues based on content
- Auto-assigns reviewers for PRs
- Updates TODO when issues are closed

## 📊 Project Management Workflow

### 1. Planning Phase
1. Add tasks to TODO.md in appropriate priority sections
2. Use TODO Manager script for quick updates
3. Run GitHub workflow to create issues for a sprint

### 2. Development Phase
1. Pick issues from GitHub Issues board
2. Create feature branches for each issue
3. Reference issue numbers in commits (`#123`)

### 3. Completion Phase
1. Close issues when work is complete
2. Update TODO.md with ✅ status
3. Use automation workflow suggestions

## 🏷️ Labels & Organization

### Automatic Labels
- **Priority**: `high-priority`, `medium-priority`, `low-priority`
- **Type**: `bug`, `enhancement`, `task`, `feature`
- **Component**: `authentication`, `database`, `ui/ux`, `backend`, `deployment`
- **Status**: `needs-triage`, `in-progress`, `blocked`

### Manual Labels
- `good-first-issue` - For newcomers
- `help-wanted` - Community contributions welcome
- `documentation` - Documentation updates
- `testing` - Testing-related work

## 📈 Tracking Progress

### TODO.md Progress
```bash
# Check current progress
node scripts/todo-manager.js list
```

### GitHub Issues Progress
- Use GitHub Projects board
- Filter by labels and milestones
- Track completion percentage

## 🔄 Sync Workflow

### TODO → Issues
1. Update TODO.md with new tasks
2. Run "TODO to Issues" GitHub Action
3. Issues created with proper labeling

### Issues → TODO
1. Work on GitHub Issues
2. Close issues when complete
3. Update TODO.md with ✅ status
4. Automation suggests TODO updates

## 🛠️ Customization

### Adding New TODO Categories
1. Edit TODO.md structure
2. Update `scripts/todo-manager.js` category detection
3. Update `.github/workflows/todo-to-issues.yml` section parsing

### Custom Issue Templates
1. Add new `.yml` files to `.github/ISSUE_TEMPLATE/`
2. Follow existing template structure
3. Update `.github/ISSUE_TEMPLATE/config.yml`

### Custom Automation
1. Edit `.github/workflows/project-automation.yml`
2. Add new label rules or automation
3. Test with repository events

## 📝 Best Practices

### TODO.md Management
- Keep items concise but descriptive
- Use consistent formatting
- Group related tasks together
- Regular review and cleanup

### GitHub Issues
- Use descriptive titles
- Add appropriate labels
- Reference related issues
- Update progress regularly

### Integration
- Link issues to TODO items
- Keep both systems in sync
- Use automation where possible
- Regular maintenance

## 🚨 Troubleshooting

### Common Issues

**TODO Manager Script Errors**
```bash
# Check if TODO.md exists and is readable
ls -la TODO.md

# Run with node directly
node scripts/todo-manager.js help
```

**GitHub Actions Not Running**
- Check repository permissions
- Verify workflow file syntax
- Check Actions tab for error logs

**Labels Not Applied**
- Check workflow permissions
- Verify label names match configuration
- Manual label creation may be needed

## 📚 Resources

- [TODO.md](../TODO.md) - Main task tracking file
- [GitHub Issues](../../issues) - Project issues board
- [GitHub Actions](../../actions) - Automation workflows
- [TODO Manager Script](../scripts/todo-manager.js) - CLI tool

---

*Last updated: 2025-08-13*