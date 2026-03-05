Security and secret-remediation steps
===================================

1) Immediate actions (do these now on your machine)

- Remove the service account file from git index and commit:

```bash
git rm --cached real-juris-firebase-adminsdk-fbsvc-8d5e7fef56.json
git commit -m "chore(secrets): remove firebase service account from repo"
```

- Add to `.gitignore` (already added here) and commit:

```bash
echo "real-juris-firebase-adminsdk-fbsvc-8d5e7fef56.json" >> .gitignore
git add .gitignore
git commit -m "chore: ignore firebase service account files"
```

2) Purge the file from Git history (requires force-push)

Options (choose one):

- Using `git filter-repo` (recommended):

```bash
pip install git-filter-repo
git clone --mirror <repo-url> repo.git
cd repo.git
git filter-repo --path real-juris-firebase-adminsdk-fbsvc-8d5e7fef56.json --invert-paths
git push --force
```

- Using BFG (simpler):

```bash
brew install bfg
git clone --mirror <repo-url> repo.git
cd repo.git
bfg --delete-files real-juris-firebase-adminsdk-fbsvc-8d5e7fef56.json
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

3) Rotate credentials

- In Google Cloud Console, delete the exposed service account key and create a new one. Revoke any tokens that may have been generated.
- Rotate any API keys referenced in the repo (`GROQ_API_KEY`, `RESEND_API_KEY`, other provider keys).

4) Replace committed secrets with environment-based injection

- Use `FIREBASE_PRIVATE_KEY` via environment variables or a secrets manager (GCP Secret Manager, HashiCorp Vault, Azure Key Vault). Do not commit JSON files.

5) Follow-up

- Run `git-secrets`, `truffleHog`, or GitHub secret scanning to find other leaks.
- Run `npm audit fix` and then test the app. See `package.json` in `backend/` for dependencies that need attention.

If you want, I can generate the exact `git filter-repo` commands and help you craft a rotation email and CVE-style summary for stakeholders.
