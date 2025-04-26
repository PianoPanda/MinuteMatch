# MinuteMatch
Repository for CS320 

# notes for how to add to the repository

On github UI, create pull request, assign reviewer, create

to review: open pull request, click files, approve changes(approve selection must be clicked iin check marks below), finally approve

## install into set up

To run any code we need to cd src/MinuteMatch/src

- npm node.js
- npm install react-autosuggest
- npm nodemon
- npm install
- npm install express pg
- installed Dompurify

-Install Supabase: `npm install @supabase/supabase-js`
-to run code: `npm run dev` in one terminal and `node supabase.js` to run the server

LAST RESORT: 
Merges poconnor into your current branch (sgzhang).
If any files conflict, Git will automatically resolve the conflict by keeping poconnor's version (-X theirs).
`git checkout sgzhang`
`git merge -s recursive -X theirs origin/poconnor`