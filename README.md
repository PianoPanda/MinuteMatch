# MinuteMatch
Repository for CS320 

# notes for how to add to the repository

On github UI, create pull request, assign reviewer, create

to review: open pull request, click files, approve changes(approve selection must be clicked iin check marks below), finally approve

create environment: `conda create --name minutematch python=3.12.4`
activate environment: `conda activate minutematch`
deactivate environment: `conda deactivate`

Rebase a branch on main:
-`git fetch origin`
-`git checkout your-branch-name`
-`git rebase origin/main`

If conflicted files appear:
-If conflicts arise, Git will pause the rebase process and indicate the conflicting files.
-Resolve the conflicts manually by editing the files.
-`git add <conflicted-file>`
-`git rebase continue`

-` git push origin your-branch-name --force` (if necessary)