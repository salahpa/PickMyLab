# Git & GitHub Setup Guide

## ✅ Initial Setup Complete

Your repository has been initialized and the initial commit has been made.

## 📋 Next Steps: Connect to GitHub

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository name: `tasheel` (or your preferred name)
4. Description: "Tasheel Healthcare Platform - Lab Aggregator Platform"
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

### Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/tasheel.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 3: Verify Connection

```bash
# Check remote
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/tasheel.git (fetch)
# origin  https://github.com/YOUR_USERNAME/tasheel.git (push)
```

## 🔄 Daily Workflow

### Making Changes and Committing

```bash
# 1. Check status
git status

# 2. Add changed files
git add .                    # Add all changes
# OR
git add path/to/file.js      # Add specific file

# 3. Commit changes
git commit -m "Description of changes"

# 4. Push to GitHub
git push
```

### Pulling Latest Changes

```bash
# Pull latest changes from GitHub
git pull

# If you have local changes, you might need to:
git pull --rebase
```

### Creating a New Branch

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Make changes, commit, then push
git push -u origin feature/new-feature
```

### Switching Branches

```bash
# Switch to main branch
git checkout main

# Switch to another branch
git checkout branch-name
```

## 📝 Commit Message Best Practices

Use clear, descriptive commit messages:

```bash
# Good examples:
git commit -m "Add payment gateway integration"
git commit -m "Fix booking status update bug"
git commit -m "Update admin dashboard statistics"
git commit -m "Add phlebotomist assignment feature"

# Bad examples:
git commit -m "fix"
git commit -m "update"
git commit -m "changes"
```

## 🔐 Authentication

### Option 1: HTTPS (Recommended for beginners)

You'll be prompted for username and password/token when pushing.

### Option 2: SSH (Recommended for frequent use)

1. Generate SSH key:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. Add to GitHub:
   - Copy public key: `cat ~/.ssh/id_ed25519.pub`
   - GitHub → Settings → SSH and GPG keys → New SSH key

3. Change remote URL:
```bash
git remote set-url origin git@github.com:YOUR_USERNAME/tasheel.git
```

## 🚨 Common Issues & Solutions

### Issue: "Permission denied"
**Solution**: Check your GitHub credentials or use SSH

### Issue: "Updates were rejected"
**Solution**: Pull first, then push:
```bash
git pull --rebase
git push
```

### Issue: "Merge conflicts"
**Solution**: 
```bash
# See conflicts
git status

# Resolve conflicts in files, then:
git add .
git commit -m "Resolve merge conflicts"
git push
```

## 📚 Useful Git Commands

```bash
# View commit history
git log

# View changes in a file
git diff filename

# Undo changes (before commit)
git checkout -- filename

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View branches
git branch

# Delete branch
git branch -d branch-name
```

## 🎯 Recommended Workflow

1. **Before starting work**: `git pull` to get latest changes
2. **Make changes** to your code
3. **Check status**: `git status`
4. **Add changes**: `git add .`
5. **Commit**: `git commit -m "Description"`
6. **Push**: `git push`
7. **Repeat** as needed

## 📦 What's Already Committed

- ✅ Complete backend structure
- ✅ Complete frontend structure
- ✅ Database schema
- ✅ All documentation files
- ✅ Configuration files
- ✅ .gitignore file

## ⚠️ What's NOT Committed (by design)

- `node_modules/` - Dependencies (install with `npm install`)
- `.env` files - Environment variables (create from examples)
- `uploads/` - User uploaded files
- Build outputs

## 🔧 First Time Setup After Cloning

If someone clones this repository:

```bash
# Backend
cd backend
npm install
cp env.example.txt .env
# Edit .env with your settings

# Frontend
cd frontend
npm install
# Create .env file if needed

# Database
# Run database_schema.sql in PostgreSQL
```

---

**Ready to push to GitHub!** Follow Step 1 and Step 2 above to connect your repository.
