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
## innstall into set uo

To run any code we need to cd src/MinuteMatch/src

- npm node.js
- npm nodemon
- npm install
- npm install express pg
- installed Dompurify

## Database outline 
Names for databases:

categories
CREATE TABLE categories (
    name TEXT PRIMARY KEY NOT NULL
);


group
CREATE TABLE "group" (
    groupid SERIAL PRIMARY KEY,                            -- Auto-incrementing GroupID
    groupname VARCHAR(255) NOT NULL,                        -- Group name with a max length of 255 characters
    categories TEXT[] DEFAULT '{}',                         -- Categories stored as a text array (can store multiple categories)
    members INTEGER[] DEFAULT '{}',           -- Array of UserIDs (will need a Foreign Key referencing User table)
    groupposts INTEGER[] DEFAULT '{}'        -- Array of PostIDs (will need a Foreign Key referencing Posts table)
);

posts
CREATE TABLE Posts (
    PostID SERIAL PRIMARY KEY,  
    UserID INTEGER,  
    ServiceType BOOLEAN, 
	groupID INTEGER,
	category TEXT[], 
    Text TEXT,
    Picture BYTEA,
    PostComments TEXT[],  
    Flagged BOOLEAN DEFAULT FALSE,  
    HelperList INTEGER[],  
    StatusComplete BOOLEAN DEFAULT FALSE, 
    TimeStamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);

user
CREATE TABLE "user" (
    UserID SERIAL PRIMARY KEY,                           -- Auto-incrementing UserID
    Username VARCHAR(255) NOT NULL,                       -- Username with a max length of 255 characters
    Email VARCHAR(255) UNIQUE NOT NULL,                   -- Email, which must be unique and not null
    Password VARCHAR(255) NOT NULL,                       -- Password, with a max length of 255 characters
    Ranking INT DEFAULT 0,                                -- Helpfulness score as an integer (default is 0)
    Verified BOOLEAN DEFAULT FALSE,                       -- Boolean to indicate if the user is verified
    Reviews JSONB DEFAULT '[]',                           -- Reviews stored as a JSONB array of ratings with categories
    Groups VARCHAR[] DEFAULT '{}',                        -- Groups as an array of text (can store multiple groups the user belongs to)
    Last_active TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,    -- Timestamp for last activity, default is current timestamp
    Flagged BOOLEAN DEFAULT FALSE                        -- Flagged as a boolean (default is FALSE)
);
