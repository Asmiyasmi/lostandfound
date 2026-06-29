# Campus Lost & Found Portal

A modern web application that simplifies the process of reporting, searching, and recovering lost items within a college campus. The platform provides a centralized system where students can report lost belongings, submit found items, and connect with one another securely to facilitate item recovery.

---

# Overview

The Campus Lost & Found Portal replaces the traditional notice board or word-of-mouth approach with a digital platform that is accessible from any device. Students can quickly report missing or found items, upload images, browse listings, and contact the respective owner or finder.

The system is designed with a responsive interface, secure authentication, real-time database synchronization, and cloud image storage to provide a seamless user experience.

---

# Problem Statement

Managing lost and found items on campus is often unorganized. Students typically rely on social media groups, classroom announcements, or physical notice boards, making it difficult to recover belongings.

This project solves these problems by providing:

- A centralized reporting system
- Organized item listings
- Secure student authentication
- Image-based identification
- Easy communication between users

---

# Objectives

- Digitize the campus lost and found process.
- Reduce the time required to recover lost items.
- Maintain an organized database of reported items.
- Allow students to upload images for easier identification.
- Ensure only authenticated students can use the system.
- Provide administrators with moderation capabilities.

---

# Target Users

- College Students
- Faculty Members (optional)
- College Administration

---

# Technology Stack

Frontend
- React
- Vite
- JavaScript
- HTML5
- CSS3

Backend & Services
- Firebase Authentication
- Cloud Firestore
- Firebase Storage

Libraries
- GSAP (Animations)
- Lucide React (Icons)

---

# Authentication System

Students create an account using:

- Full Name
- Email Address
- Password
- Phone Number
- Class
- KTU ID

After registration:

- Firebase Authentication creates the account.
- A user profile is stored in Firestore.
- The student is redirected to the dashboard.

Only authenticated users can report or manage items.

---

# User Workflow

## Step 1

Student signs up.

↓

## Step 2

Student logs into the portal.

↓

## Step 3

Dashboard is displayed.

↓

## Step 4

Student chooses one of two options:

- Report Lost Item
- Report Found Item

↓

## Step 5

The student fills in the required information and uploads an image.

↓

## Step 6

The item is stored in Firestore while its image is uploaded to Firebase Storage.

↓

## Step 7

Other students can browse, search, and filter all reported items.

↓

## Step 8

When the correct owner or finder is identified, they can contact each other using the provided contact details.

---

# Main Features

## User Registration

- Secure authentication
- Student profile creation
- Protected routes

---

## Student Profile

Stores:

- Name
- Class
- KTU ID
- Phone Number
- Email Address

---

## Report Lost Item

Students provide:

- Item Name
- Category
- Description
- Date Lost
- Location Lost
- Upload Image
- Contact Details

---

## Report Found Item

Students provide:

- Item Name
- Category
- Description
- Date Found
- Location Found
- Upload Image
- Contact Details

---

## Image Upload

Images can be uploaded from:

- Camera
- Gallery

Images are securely stored using Firebase Storage.

---

## Browse Items

Users can:

- View all lost items
- View all found items
- Open item details
- View uploaded images

---

## Search Functionality

Students can search using:

- Item Name
- Category
- Description
- Location

---

## Filters

Items can be filtered by:

- Lost
- Found
- Category
- Date

---

## Responsive Design

Works on:

- Desktop
- Tablet
- Mobile

---

# Admin Module

The administrator dashboard is available separately at:

/admin

The admin portal is intentionally separated from the student interface.

Administrator capabilities include:

- View all users
- View all reported items
- Delete spam or invalid reports
- Moderate listings
- Monitor platform activity

Students cannot access administrative functions.

---

# Database Structure

Users Collection

Contains:

- UID
- Name
- Email
- Phone
- Class
- KTU ID
- Profile Creation Date

---

Items Collection

Contains:

- Item ID
- Report Type (Lost / Found)
- Item Name
- Description
- Category
- Location
- Date
- Image URL
- User ID
- Status
- Timestamp

---

# Firebase Services Used

## Firebase Authentication

Handles:

- Registration
- Login
- Session Management

---

## Cloud Firestore

Stores:

- User Profiles
- Lost Items
- Found Items

---

## Firebase Storage

Stores:

- Uploaded item images

---

# Security

- Authenticated access
- Protected routes
- Firebase Authentication
- Secure cloud storage
- Firestore security rules
- User-specific ownership of reports

---

# User Experience

The application focuses on:

- Simple navigation
- Fast loading
- Responsive layouts
- Minimal learning curve
- Clean modern interface
- Smooth animations

---

# Project Flow

Student

↓

Login / Register

↓

Dashboard

↓

Report Lost OR Report Found

↓

Upload Image

↓

Save to Firebase

↓

Visible to All Students

↓

Search & Browse

↓

Contact Owner/Finder

↓

Item Recovered

---

# Folder Structure

src/
│
├── components/
├── pages/
├── layouts/
├── hooks/
├── services/
├── firebase/
├── assets/
├── utils/
├── context/
└── App.jsx

---

# Future Improvements

- AI-based image matching
- QR code support
- Push notifications
- Email notifications
- Claim verification workflow
- Chat between users
- Admin analytics dashboard
- Item status tracking
- Advanced search filters
- Dark mode
- Progressive Web App (PWA)
- Multi-campus support

---

# Benefits

- Saves time searching for lost items.
- Centralizes all lost and found reports.
- Encourages community participation.
- Makes item recovery easier through images.
- Provides secure student authentication.
- Offers an organized and scalable solution for educational institutions.

---

# Conclusion

The Campus Lost & Found Portal is a secure, user-friendly, and scalable web application designed to improve the way lost and found items are managed within a college campus. By integrating Firebase Authentication, Cloud Firestore, and Firebase Storage with a modern React frontend, the platform provides students with an efficient way to report, search, and recover lost belongings while giving administrators the tools needed to maintain a reliable and organized system.
## 🎥 Demo Video

[![Watch the Demo](https://raw.githubusercontent.com/Asmiyasmi/lostandfound/new/main/assets/demo-thumbnail.png)](https://drive.google.com/file/d/1hQa71lc7I5Z4SYp4PnQ61PDMY8dbcli6/view?usp=sharing)
