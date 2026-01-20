# Quick Git Commands Reference

## 🚀 Connect to GitHub (First Time)

```bash
# 1. Create repository on GitHub.com first, then:

# 2. Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/tasheel.git

# 3. Push to GitHub
git push -u origin main
```

## 📤 Daily Workflow (Push Changes)

```bash
# 1. Check what changed
git status

# 2. Add all changes
git add .

# 3. Commit with message
git commit -m "Your commit message here"

# 4. Push to GitHub
git push
```

## 📥 Get Latest Changes (Pull)

```bash
# Pull latest from GitHub
git pull
```

## 🔍 Check Status

```bash
# See what files changed
git status

# See commit history
git log --oneline
```

## 🌿 Branch Management

```bash
# Create new branch
git checkout -b feature/new-feature

# Switch to main branch
git checkout main

# List all branches
git branch
```

---

**For detailed instructions, see GIT_SETUP.md**
