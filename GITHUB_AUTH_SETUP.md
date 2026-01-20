# GitHub Authentication Setup

## Option 1: Personal Access Token (Recommended)

### Step 1: Create Personal Access Token

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "Tasheel Project"
4. Select scopes: Check `repo` (full control of private repositories)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Use Token to Push

When prompted for password, use the token instead:

```bash
git push -u origin main
```

- Username: `salahpa`
- Password: `[paste your token here]`

### Step 3: Save Credentials (Optional)

To avoid entering token every time:

```bash
# macOS Keychain (recommended)
git config --global credential.helper osxkeychain

# Then push again
git push -u origin main
```

---

## Option 2: SSH (More Secure)

### Step 1: Generate SSH Key

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter to accept default location
# Press Enter twice for no passphrase (or set one)
```

### Step 2: Add SSH Key to GitHub

```bash
# Copy your public key
cat ~/.ssh/id_ed25519.pub
```

1. Copy the entire output
2. Go to GitHub.com → Settings → SSH and GPG keys
3. Click "New SSH key"
4. Paste the key and save

### Step 3: Change Remote to SSH

```bash
git remote set-url origin git@github.com:salahpa/PickMyLab.git
git push -u origin main
```

---

## Option 3: GitHub CLI (Easiest)

### Install GitHub CLI

```bash
# macOS
brew install gh

# Or download from: https://cli.github.com/
```

### Authenticate

```bash
gh auth login
# Follow the prompts
```

### Then Push

```bash
git push -u origin main
```

---

## Quick Fix: Use Token Now

If you already have a token, just run:

```bash
git push -u origin main
```

When prompted:
- Username: `salahpa`
- Password: `[your personal access token]`

---

## Verify Connection

After successful push:

```bash
git remote -v
# Should show your GitHub URL

git log --oneline
# Should show your commits
```
