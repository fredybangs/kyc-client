# QCell KYC Client App

## Overview

The **QCell KYC Client App** is a mobile application developed using **React Native (Expo)** for QCell agents to manage Know Your Customer (KYC) applications. This app allows agents to create, submit, and track KYC applications for QCell customers. It integrates with the Odoo-based backend, enabling seamless data synchronization and role-based access to KYC records.

## Features

- **User Authentication**: Secure login and logout functionality.
- **KYC Application Creation**: Agents can create new KYC applications by inputting customer details and uploading required documents.
- **Document Upload**: Supports uploading of customer ID, proof of address, and selfie images via the mobile device.
- **KYC Application Management**: Allows agents to view, update, and track the status of KYC applications.
- **Role-Based Access**: Permissions based on user roles (Creator, Verifier, Admin).
- **Push Notifications**: Real-time updates for KYC application status (planned feature).

## Requirements

- **Expo CLI** (to run the app)
- **Node.js**
- **API URL**: Access to the Odoo backend API for KYC

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/fredybangs/kyc-client.git
   cd kyc-client
