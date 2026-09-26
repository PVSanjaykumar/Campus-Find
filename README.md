# CampusFind

CampusFind is a MERN-based campus Lost & Found platform designed to help students report lost and found items, discover potential matches, and securely complete the item return process.

## Features

- Student registration and login
- Secure JWT-based authentication
- Forgot and reset password functionality
- Report lost items
- Report found items
- Upload images with reports
- Search and filter reported items
- Admin approval and rejection of reports
- Intelligent Lost ↔ Found matching
- Automatic email notifications when a match is found
- Student match acceptance and rejection
- Secure contact sharing after match acceptance
- Found-student handover confirmation
- Lost-student receipt confirmation
- Automatic completion of the return process
- Admin match monitoring

## Tech Stack

### Frontend
- React.js
- React Router
- Axios
- HTML
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Nodemailer
- Multer

## How Matching Works

CampusFind uses a **100-point matching system** to identify potential Lost and Found matches.

| Matching Criteria | Points |
|---|---:|
| Item Type | 25 |
| Company | 20 |
| Location | 25 |
| Color | 20 |
| Item Name | 10 |
| **Total** | **100** |

A Lost and Found report is considered a match when the **match score is 75 or above**.

The item-name matching also supports minor spelling differences to handle cases such as:

```text
HP Omnibook
HP Ominbook
