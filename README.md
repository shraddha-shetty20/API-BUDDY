# 🚀 API Buddy

A lightweight REST API testing extension for **Visual Studio Code** that allows developers to test APIs directly inside VS Code without switching to external API testing tools.

---

## 📌 Overview

**API Buddy** is a VS Code extension designed to make REST API testing simple and convenient.

Users can select an HTTP method, enter an API URL, add request headers and a request body, and send the request directly from the extension interface.

The response is displayed inside VS Code along with:

- HTTP status
- Response time
- Response headers
- Response body

---

## ✨ Features

- 🚀 Test REST APIs directly inside VS Code
- 🔹 GET requests
- 🔹 POST requests
- 🔹 PUT requests
- 🔹 PATCH requests
- 🔹 DELETE requests
- 📝 Custom request headers
- 📦 JSON request body
- 📊 HTTP response status
- ⏱️ Response time measurement
- 📋 Response headers
- 📄 Response body
- 🧹 Clear request and response data
- 🌙 VS Code-friendly dark UI

---

## 🏗️ Architecture

```mermaid
flowchart TD

    A[Developer] --> B[API Buddy UI]

    B -->|Request Details| C[VS Code Extension]

    C -->|HTTP Request| D[REST API]

    D -->|HTTP Response| C

    C -->|Response Data| B

    B --> E[Status]
    B --> F[Response Time]
    B --> G[Response Headers]
    B --> H[Response Body]

    I[package.json] -->|Extension Configuration| C
🔄 How It Works
1. User Input

The developer enters:

HTTP method
API URL
Request headers
Request body when required
2. UI Communication

The UI collects the request information and sends it to the VS Code extension using the VS Code Webview messaging API.

3. Extension Processing

extension.js receives the request details and processes the API request.

4. API Request

The extension sends the HTTP request to the target REST API.

5. API Response

The API returns the response to the extension.

6. Response Display

The extension sends the response back to the UI.

The UI displays:

Status
Response time
Response headers
Response body
📁 Project Structure
api-buddy/
│
├── extension.js
├── package.json
├── ui.html
├── README.md
└── .gitignore
File Description
File	Description
extension.js	Contains the VS Code extension logic
ui.html	Contains the API Buddy user interface
package.json	Contains extension configuration and metadata
README.md	Project documentation
.gitignore	Specifies files that should not be tracked by Git
🛠️ Technologies Used
Technology	Purpose
HTML	User interface structure
CSS	User interface styling
JavaScript	Application and extension logic
VS Code API	VS Code extension integration
REST API	API communication
Git	Version control
GitHub	Source code management
💻 Requirements

Before running API Buddy, make sure you have:

Visual Studio Code
Node.js
Git
GitHub account
⚙️ Installation
1. Clone the Repository
git clone https://github.com/shraddha-shetty20/API-BUDDY.git
2. Navigate to the Project
cd API-BUDDY
3. Install Dependencies
npm install
4. Open the Project in VS Code
code .
▶️ Run API Buddy in VS Code
Open the project folder in Visual Studio Code.
Open extension.js.
Press:
F5
VS Code will open a new Extension Development Host window.
Open the Command Palette:
Ctrl + Shift + P
Search for:
API Buddy
Select the API Buddy command.

The API Buddy interface will open inside VS Code.

🧪 How to Use API Buddy
Step 1 — Open API Buddy

Launch API Buddy from the VS Code Command Palette.

Step 2 — Select HTTP Method

Choose one of the supported HTTP methods:

GET
POST
PUT
PATCH
DELETE
Step 3 — Enter API URL

Example:

https://jsonplaceholder.typicode.com/posts/1
Step 4 — Add Headers

Example:

{
  "Content-Type": "application/json"
}
Step 5 — Add Request Body

For POST, PUT, and PATCH requests, enter a JSON body.

Example:

{
  "name": "Shraddha",
  "project": "API Buddy"
}
Step 6 — Send Request

Click the:

Send

button.

Step 7 — View Response

The response section displays:

Status
Response Time
Response Headers
Response Body
📡 Example GET Request
Request
GET https://jsonplaceholder.typicode.com/posts/1
Example Response
{
  "userId": 1,
  "id": 1,
  "title": "Example title",
  "body": "Example response"
}
📮 Example POST Request
URL
https://jsonplaceholder.typicode.com/posts
Headers
{
  "Content-Type": "application/json"
}
Request Body
{
  "title": "API Buddy",
  "body": "Testing REST APIs",
  "userId": 1
}
🔐 Request Headers

API Buddy allows users to provide custom HTTP headers.

Example:

{
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}

⚠️ Never commit real API keys, passwords, access tokens, or other secrets to GitHub.

For sensitive information, use environment variables or a secure secret-management approach.

📊 Response Information

API Buddy displays important information about the API response.

Status

Example:

Status: 200
Response Time

Example:

Response Time: 245 ms
Response Headers

Example:

content-type: application/json
content-length: 345
Response Body

The API response body is displayed inside the response panel.

🧩 VS Code Extension Architecture
                    ┌─────────────────────┐
                    │      Developer      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       ui.html       │
                    │      Webview UI     │
                    └──────────┬──────────┘
                               │
                         postMessage()
                               │
                               ▼
                    ┌─────────────────────┐
                    │    extension.js     │
                    │   Extension Logic   │
                    └──────────┬──────────┘
                               │
                         HTTP Request
                               │
                               ▼
                    ┌─────────────────────┐
                    │      REST API       │
                    └──────────┬──────────┘
                               │
                         HTTP Response
                               │
                               ▼
                    ┌─────────────────────┐
                    │    extension.js     │
                    └──────────┬──────────┘
                               │
                         postMessage()
                               │
                               ▼
                    ┌─────────────────────┐
                    │       ui.html       │
                    │  Response Display   │
                    └─────────────────────┘
🔁 Request Flow
User
  │
  ▼
Select HTTP Method
  │
  ▼
Enter API URL
  │
  ▼
Add Headers / Body
  │
  ▼
Click Send
  │
  ▼
ui.html
  │
  ▼
extension.js
  │
  ▼
REST API
  │
  ▼
HTTP Response
  │
  ▼
extension.js
  │
  ▼
ui.html
  │
  ▼
Display Response
📨 Communication Between UI and Extension

API Buddy uses VS Code Webview messaging to communicate between the user interface and the extension.

UI → Extension

The UI sends request information such as:

{
    command: "sendRequest",
    method: "GET",
    url: "https://example.com/api",
    headers: "{}",
    body: ""
}
Extension → UI

The extension sends the API response back to the UI.

Example:

{
    command: "response",
    status: 200,
    responseTime: 245,
    headers: "...",
    data: "..."
}

This communication allows the UI and extension backend to work together.

🧹 Clear Function

The Clear button removes the current request and response information.

It clears:

API URL
Request headers
Request body
Response status
Response time
Response headers
Response body
❌ Error Handling

If an API request fails, API Buddy displays an error message in the response section.

Possible causes include:

Invalid URL
Network error
Server unavailable
Invalid request
Authentication failure
API endpoint error
🌱 Future Enhancements

The project can be extended with:

📑 Saved API requests
📂 Request collections
🔐 Environment variables
🔑 Secure authentication support
🕘 Request history
🎨 Improved UI/UX
📥 Import/export API collections
🔍 JSON response formatting
📊 Response visualization
⚡ Request cancellation
🌐 Proxy support
🧪 Automated API testing
📋 Copy response functionality
💾 Save frequently used requests
🎯 Project Goals

The main goals of API Buddy are:

Make API testing accessible directly inside VS Code.
Reduce the need to switch between development tools.
Provide a simple interface for REST API testing.
Display useful response information clearly.
Build a lightweight and developer-friendly VS Code extension.
Provide a foundation for future API testing features.
📚 Learning Outcomes

This project provides practical experience with:

VS Code Extension Development
Webviews
JavaScript
HTML
CSS
REST APIs
HTTP Methods
HTTP Headers
Request and Response Handling
VS Code Messaging
Git
GitHub
Project Documentation
🔧 Development Workflow

The project follows a simple development workflow:

Write Code
    │
    ▼
Test in VS Code
    │
    ▼
Fix / Improve
    │
    ▼
git add
    │
    ▼
git commit
    │
    ▼
git push
    │
    ▼
GitHub Repository
🌿 Git Workflow

To check the current status:

git status

To add changes:

git add .

To commit changes:

git commit -m "Describe your changes"

To push changes:

git push
🤝 Contributing

Contributions and suggestions are welcome.

Create a Branch
git checkout -b feature/new-feature
Make Changes

Update the project and test your changes.

Commit Changes
git add .
git commit -m "Add new feature"
Push the Branch
git push origin feature/new-feature

Then create a Pull Request on GitHub.

🔒 Security

API Buddy may be used with APIs that require authentication.

Always protect sensitive information such as:

API keys
Access tokens
Passwords
Client secrets
Private credentials

Never store real credentials directly in the source code or commit them to GitHub.

📄 License

This project is currently available for learning and development purposes.

A formal open-source license can be added in a future version.

👩‍💻 Author
Shraddha Shetty

GitHub:

https://github.com/shraddha-shetty20

⭐ Support

If you find API Buddy useful, consider giving the repository a ⭐ on GitHub.

🚀 Project Status

Current Status: Active Development

API Buddy currently supports basic REST API testing with request configuration and response visualization.

Future versions will focus on improving API management, authentication, request history, and developer experience.

❤️ Built With

Built with:

HTML
CSS
JavaScript
Visual Studio Code Extension API
REST APIs
Git
GitHub

🚀 API Buddy — Test APIs without leaving VS Code.
![alt text](<IMAGE.png>)