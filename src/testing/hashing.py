# import tkinter as tk
# from tkinter import messagebox
# import hashlib
# import os

# # need to fix this to not encrypt the user names in this instance
# # this needs to be updated to not encrypt the usernames at all in this instance so that way this logins 


# DATA_FILE = 'test.txt'

# def sha256_hash(username, password):
#     combo = (username + password).encode('utf-8')
#     return hashlib.sha256(combo).hexdigest()

# def save_user(username, password):
#     hashed = sha256_hash(username, password)
#     with open(DATA_FILE, 'a') as f:
#         f.write(f"{username}:{hashed}\n")

# def read_users():
#     if not os.path.exists(DATA_FILE):
#         return {}
#     with open(DATA_FILE, 'r') as f:
#         lines = f.readlines()
#     users = {}
#     for line in lines:
#         if ':' in line:
#             user, hashed = line.strip().split(':', 1)
#             users[user] = hashed
#     return users

# def create_user():
#     username = username_entry.get()
#     password = password_entry.get()
#     if not username or not password:
#         messagebox.showerror("Error", "Username and password cannot be empty.")
#         return
#     users = read_users()
#     if username in users:
#         messagebox.showerror("Error", "Username already exists.")
#         return
#     save_user(username, password)
#     messagebox.showinfo("Success", f"User '{username}' created successfully!")

# def verify_user():
#     username = username_entry.get()
#     password = password_entry.get()
#     if not username or not password:
#         messagebox.showerror("Error", "Username and password cannot be empty.")
#         return
#     users = read_users()
#     if username not in users:
#         messagebox.showerror("Error", "Username does not exist.")
#         return
#     hashed_input = sha256_hash(username, password)
#     if users[username] == hashed_input:
#         messagebox.showinfo("Verified", "Password is correct (True).")
#     else:
#         messagebox.showwarning("Failed", "Password is incorrect (False).")

# # GUI Setup
# app = tk.Tk()
# app.title("User Auth System (SHA256)")
# app.geometry("400x200")

# tk.Label(app, text="Username").pack()
# username_entry = tk.Entry(app)
# username_entry.pack()

# tk.Label(app, text="Password").pack()
# password_entry = tk.Entry(app, show='*')
# password_entry.pack()

# tk.Button(app, text="Create User", command=create_user).pack(pady=5)
# tk.Button(app, text="Verify Password", command=verify_user).pack()

# app.mainloop()


# this is the code that has the non hashed username so we can store and implement the actual posts
import tkinter as tk
from tkinter import messagebox
import hashlib
import os

# File to store user data
DATA_FILE = 'test.txt'

# Only hash the password now (not username + password)
def sha256_hash(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def save_user(username, password):
    hashed = sha256_hash(password)
    with open(DATA_FILE, 'a') as f:
        f.write(f"{username}:{hashed}\n")

def read_users():
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, 'r') as f:
        lines = f.readlines()
    users = {}
    for line in lines:
        if ':' in line:
            user, hashed = line.strip().split(':', 1)
            users[user] = hashed
    return users

def create_user():
    username = username_entry.get()
    password = password_entry.get()
    if not username or not password:
        messagebox.showerror("Error", "Username and password cannot be empty.")
        return
    users = read_users()
    if username in users:
        messagebox.showerror("Error", "Username already exists.")
        return
    save_user(username, password)
    messagebox.showinfo("Success", f"User '{username}' created successfully!")

def verify_user():
    username = username_entry.get()
    password = password_entry.get()
    if not username or not password:
        messagebox.showerror("Error", "Username and password cannot be empty.")
        return
    users = read_users()
    if username not in users:
        messagebox.showerror("Error", "Username does not exist.")
        return
    hashed_input = sha256_hash(password)
    if users[username] == hashed_input:
        messagebox.showinfo("Verified", "Password is correct (True).")
    else:
        messagebox.showwarning("Failed", "Password is incorrect (False).")

# GUI Setup
app = tk.Tk()
app.title("User Auth System (SHA256)")
app.geometry("400x200")

tk.Label(app, text="Username").pack()
username_entry = tk.Entry(app)
username_entry.pack()

tk.Label(app, text="Password").pack()
password_entry = tk.Entry(app, show='*')
password_entry.pack()

tk.Button(app, text="Create User", command=create_user).pack(pady=5)
tk.Button(app, text="Verify Password", command=verify_user).pack()

app.mainloop()