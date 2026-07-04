# Beginner-Friendly AWS Deployment Guide

This guide is designed for developers who are new to AWS. We will deploy the React frontend and Spring Boot backend using AWS's modern, developer-friendly services: **AWS Amplify** (for the frontend) and **AWS App Runner** (for the backend container).

---

## Architecture Overview

```mermaid
graph TD
    User([Browser Client]) -->|HTTPS| Frontend[AWS Amplify - React SPA]
    User -->|API Requests| Backend[AWS App Runner - Spring Boot]
    Backend -->|Data Queries| Database[(AWS RDS - PostgreSQL)]
    Backend -->|Caching| Redis[(Redis Cloud or AWS ElastiCache)]
```

---

## Step 1: Setup AWS RDS (PostgreSQL Database)

AWS RDS (Relational Database Service) provides a managed database:

1. Log in to the [AWS Management Console](https://console.aws.amazon.com).
2. In the search bar at the top, search for **RDS** and click on it.
3. In the RDS Dashboard, click **Create database**.
4. Configure the settings:
   - **Choose a database creation method**: `Standard create`
   - **Engine options**: `PostgreSQL`
   - **Templates**: Select **Free tier** *(Crucial to avoid charges!)*
   - **DB instance identifier**: `lms-db`
   - **Master username**: `postgres`
   - **Master password**: *Choose a secure password and save it*
   - **Instance configuration**: Keep defaults (`db.t3.micro` or `db.t4g.micro`).
   - **Storage**: Keep defaults (20 GiB gp3).
   - **Connectivity**: 
     - **Public access**: Select **Yes** *(Allows you to inspect or connect to the database from your local machine during development).*
     - **VPC security group**: Select **Create new**, name it `lms-db-sg`.
5. Scroll to the bottom and click **Create database**. This takes about 5 minutes to provision.
6. Once active, click on `lms-db` and copy the **Endpoint** (e.g., `lms-db.xxxxxx.us-east-1.rds.amazonaws.com`) and **Port** (`5432`).

### 🔓 Allow Connection Traffic (Security Group Setup)
By default, AWS blocks all external connections to the database. We need to allow it:
1. Under **Connectivity & security**, click the security group link under **VPC security groups** (`lms-db-sg`).
2. Select the group, go to the **Inbound rules** tab, and click **Edit inbound rules**.
3. Add a new rule:
   - **Type**: `PostgreSQL`
   - **Source**: Select `Anywhere-IPv4` (`0.0.0.0/0`) or enter your IP address.
   - Click **Save rules**.

---

## Step 2: Setup Redis Cache

AWS offers ElastiCache, but it is **not free** and is complex to configure inside private VPCs. For a novice, we recommend using **Redis Cloud**'s free tier, which connects seamlessly over the public internet:

1. Create a free account at [Redis Cloud Console](https://app.redislabs.com/).
2. Select the free tier subscription, choose a region close to your AWS region (e.g., AWS us-east-1), and create a database named `lms-redis`.
3. Copy the **Public Endpoint** and **Password**.
4. Combine them into the connection string:
   `redis://default:<password>@<public_endpoint>`
   *(e.g., `redis://default:mySecret123@redis-123.c3.us-east-1-1.ec2.redislabs.com:12345`)*

---

## Step 3: Deploy the Backend (AWS App Runner)

AWS App Runner is the easiest way to deploy containerized APIs. It connects to your GitHub repository, builds the Docker image, and hosts it with SSL automatically.

1. In the AWS console, search for **App Runner** and click it.
2. Click **Create an App Runner service**.
3. Configure the source:
   - **Repository type**: `Source code repository`
   - **Provider**: Select `GitHub` and link your account.
   - **Repository**: Choose your `Xebia-LMS` repository.
   - **Branch**: Choose `main` (or your active branch).
   - **Deployment settings**: Select **Automatic** *(This creates an automatic CI/CD pipeline! Every time you push to GitHub, AWS will build and deploy it).*
4. Configure the build:
   - **Configuration file**: Select **Configure all settings here**.
   - **Runtime**: Select **Docker**.
   - **Port**: `8082`.
5. Configure the service settings:
   - **Service name**: `lms-backend`.
   - **Environment variables**: Add the following keys and values:
     - `SPRING_PROFILES_ACTIVE` = `postgres`
     - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://<YOUR_RDS_ENDPOINT>:5432/postgres` (replace `<YOUR_RDS_ENDPOINT>` with the RDS endpoint copied in Step 1)
     - `SPRING_DATASOURCE_USERNAME` = `postgres`
     - `SPRING_DATASOURCE_PASSWORD` = `<YOUR_RDS_PASSWORD>`
     - `REDIS_URL` = `<YOUR_REDIS_CLOUD_URL>`
     - `CLOUDINARY_CLOUD_NAME` = `dnplvm1es`
     - `CLOUDINARY_API_KEY` = `658889419438443`
     - `CLOUDINARY_API_SECRET` = `<YOUR_CLOUDINARY_SECRET>`
6. Click **Next**, review the settings, and click **Create & deploy**.
7. App Runner will compile and run the backend Dockerfile. Once successful, copy the service **Default domain** URL (e.g., `https://xxxxxx.us-east-1.awsapprunner.com`).

---

## Step 4: Deploy the React Frontend (AWS Amplify)

AWS Amplify is the easiest tool to host frontend Single Page Applications (React, Vite, Next). It has built-in hosting, global CDN, and automated deployments.

1. Search for **AWS Amplify** in the AWS console and click it.
2. Under **Host your web app**, click **Get started**.
3. Select **GitHub** and authorize access.
4. Select your repository `Xebia-LMS` and branch `main`.
5. Configure the build settings:
   - Amplify will auto-detect the project structure. Since the frontend is in a subdirectory (`frontend`), click **Edit** on the build settings YAML and ensure the root directory is set correctly:
     ```yaml
     version: 1
     applications:
       - frontend:
           src: frontend
     ```
6. Add the API URL Environment Variable so React can communicate with AWS App Runner:
   - Under **Advanced settings**, click **Add environment variable**.
   - **Key**: `VITE_API_URL`
   - **Value**: `https://xxxxxx.us-east-1.awsapprunner.com/api` *(Paste your App Runner default domain here, making sure to append `/api` at the end)*
7. Click **Save and deploy**.
8. Amplify will build the React code and host it. Once finished, click the provided domain link to launch the live application!

---

## Summary of Automatic CI/CD Pipelines

You do not need to configure complex YAML pipelines (like Jenkins or GitHub Actions) because **AWS Amplify** and **AWS App Runner** provide automated pipelines by default:
*   **Backend Code Push**: Pushing code changes to GitHub triggers AWS App Runner to automatically build the Docker container and update the backend endpoint with zero downtime.
*   **Frontend Code Push**: Pushing frontend changes triggers AWS Amplify to build the static React package and distribute it across the global CDN instantly.
