# Game Tips and Tricks: Community Exchange Platform

## Project Overview

This project is a dynamic, database-driven web application designed to foster a community of gamers who exchange tips, strategies, and tricks co-operatively. Aligned with the 2026 theme of **"Sharing, exchange and building community"**, this platform allows users to support and develop their gaming interests by sharing knowledge for mutual benefit rather than financial gain.

## Group Details

* **Group Name**: Team Awsome
* **Module**: CMP-N204-0 Software Engineering 

**University**: University of Roehampton 


* **Members**:
* Leah Gokani
* Fuad Hasan Noyon
* Migeen Magar
* Keeley Sheridan

## Technology Stack

This application is built using the approved module technology stack:

* **Frontend**: HTML, CSS, JavaScript, and the PUG templating system .

* **Backend**: Node.js and Express.js .

* **Database**: MySQL.

* **DevOps**: Docker for containerization and GitHub Actions for CI/CD .


## Getting Started

### Prerequisites

To run this project locally, you will need:

* [Node.js](https://nodejs.org/en/download/).
* [Docker Desktop](https://docs.docker.com/desktop/windows/install/).

### Installation & Setup

1. **Configure Environment Variables**:
Copy the `env-sample` file to a new file named `.env` in the root directory.
* *Note: Do not commit your `.env` file to the repository for security reasons.*


2. **Launch the Development Environment**:
Run the following command in your terminal to build and start the Docker containers:
```bash
docker-compose up --build

```


3. **Access the Application**:
* **Web Application**: View the site at [http://localhost:3000](http://127.0.0.1:3000/).
* **phpMyAdmin**: Manage the database at [http://localhost:8081](http://127.0.0.1:8081).



## Project Management

We use the **Scrum methodology** to deliver this project iteratively.

* Our features are defined as **User Stories**.
* Our progress is tracked visually using our **GitHub Project Kanban board**.



---

*Last updated for Sprint 2. Further features and documentation will be added as development progresses.*
classDiagram
    class User {
        +int userId
        +string username
        -string password
        +string email
        +register()
        +login()
    }
    class Game {
        +int gameId
        +string title
        +string platform
    }
    class Tip {
        +int tipId
        +string title
        +string content
        +upvote()
    }
    class Comment {
        +int commentId
        +string text
        +postComment()
    }
    User "1" -- "*" Tip : authors
    User "1" -- "*" Comment : writes
    Game "1" -- "*" Tip : categorizes
    Tip "1" -- "*" Comment : contains
