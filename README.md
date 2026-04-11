# Scalable Task API

Scalable Task API is a production-oriented backend system designed to handle high traffic and concurrent users using modern cloud architecture principles.

The project focuses on performance, scalability, and real-world deployment strategies using Docker and AWS.

---

## Objectives

- Build a scalable REST API using Django and Django REST Framework  
- Support high concurrent users (10k – 50k+)  
- Implement horizontal scaling with load balancing  
- Deploy on AWS with Auto Scaling  
- Perform real-world load testing  

---

## Architecture Overview

The system follows a scalable architecture:

Client --> Load Balancer --> Nginx --> Django API --> PostgreSQL  
                                     |  
                                   Redis  

---

## Tech Stack

- Backend: Django + Django REST Framework  
- Database: PostgreSQL  
- Cache: Redis  
- Reverse Proxy: Nginx  
- Containerization: Docker  
- Cloud: AWS (EC2, Load Balancer, Auto Scaling)  

---

## Features

- JWT Authentication (Access + Refresh)
- Task Management (CRUD)
- Dashboard (basic analytics)
- Scalable architecture (multi-instance backend)
- Load testing support (k6 / Locust)

---

## Performance Goals

- < 300ms response time  
- Up to 50,000 concurrent users  
- High availability (99.9%)  

---

## Load Testing

The system is designed to be tested using:

- k6
- Locust

Simulating thousands of virtual users to validate performance and scalability.

---

## Deployment

Deployed on AWS using:

- EC2 instances  
- Application Load Balancer  
- Auto Scaling Groups  

---

## Project Structure

- backend/--> Django API  
- frontend/--> Templates (Django-based UI)  
- docker/--> Docker & Nginx configs  
- scripts/--> automation scripts  

---

## Purpose

This project is designed as a learning and professional engineering project to master:

- Backend architecture  
- Cloud deployment  
- System scalability  
- Performance optimization  

---

## Author

Built as part of an advanced software engineering learning path focused on scalable systems and cloud infrastructure.