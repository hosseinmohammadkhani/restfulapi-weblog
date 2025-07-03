## Weblog API
![Static Badge](https://img.shields.io/badge/npm-10.5.0-green) ![Static Badge](https://img.shields.io/badge/express-4.18.2-green) ![Static Badge](https://img.shields.io/badge/mongoose-5.13.23-green)


## Project description
Weblog API is a lightweight RESTful backend service that allows users to create, read, update, and delete blog posts, as well as manage their user profiles (name, email, and avatar). Built to demonstrate core backend concepts including JWT authentication, data validation, and file storage integration.
This sample project provides a clean and intuitive interface for powering any blogging frontend. Whether you’re learning how to structure a Node.js/Express server or need a starting point for your own content platform, Weblog API has you covered.

## Dashboard endpoints
| Endpoint | Method | Description | Authentication required |
|----------|----------|----------|----------|
| /create-post   | POST | Create post   | ✅   |
| /edit-post/:id   | PUT  | Edit post using its unique id   | ✅   |
| /delete-post/:id   | DELETE  | Delete post using its unique id   | ✅   |
| /messages/:id   | GET  | Retreive received messages of the user   | ✅   |
| /edit-profile/:username   | PUT   | Edit profile of the unique user   | ✅   |

## Home endpoints
| Endpoint | Method | Description | Authentication required |
|----------|----------|----------|----------|
| /   | GET | Get all of the public posts in the main page   | ❌   |
| /post/:id   | GET  | Show single post   | ❌   |
| /delete-comment/:commentId  | DELETE  | Delete the comment (Only if you posted the comment or you are the author)   | ✅   |
| /contact-us  | POST  | Contact admins of the website   | ❌   |

## Users endpoints
| Endpoint | Method | Description | Authentication required |
|----------|----------|----------|----------|
| /register | POST | Submit information to receive email verification URL!   | ❌   |
| /register/:token  | POST  | Create profile after you received an email containing email verification link   | ❌   |
| /login  | POST  | Login (using JWT authentication)   | ❌   |
| /forget-password  | POST  | Submit an email to receive forget password link   | ❌   |
| /reset-password/:token  | POST   | Enter new password using this route containing token   | ❌   |
| /message/:username  | POST  | Send message to the user by its unique username   | ❌   |

## Installation

1-Clone the repository
```bash
git clone https://github.com/hosseinmohammadkhani/restfulapi-weblog.git
cd restfulapi-weblog
```

2-Install dependencies
```bash
npm install
```

3-Edit environment variables
```bash
cd ./configs
```

4-Run the API
```bash
npm run dev
```
