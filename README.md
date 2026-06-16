# TrustPulse

A real-time Identity Trust and Risk Scoring dashboard built for the PSB Hackathon Series 2026, hosted by Bank of Baroda in collaboration with IIT Gandhinagar, under the guidance of DFS, Ministry of Finance.

The theme this year is **Identity Trust, Protection & Safety** which falls under the Cybersecurity and Fraud domain. This prototype demonstrates how a Zero Trust approach can be applied to digital banking sessions.

## What it does

The dashboard simulates a live banking session and continuously monitors behavioral signals to compute a risk score between 0 and 100.

If the score is between 0 and 30, the session is considered safe. Between 31 and 60 it flags a warning. Above 61 it triggers a high risk alert and prompts step-up authentication.

The whole thing runs on simulated data in the frontend, no backend needed for the prototype.

## Screenshots

![Dashboard](screenshots/dashboard.png)

![Step-up Auth](screenshots/otp-modal.png)

## Features

**Live Risk Gauge**
Shows the current risk score as a semicircular meter. Color changes from green to yellow to red depending on the score. Updates every few seconds with slight randomness to simulate a real session.

**Behavioral Signals**
Five signals are monitored in real time: typing speed anomaly, device fingerprint (trusted vs new), login location (usual vs new), transaction pattern, and session duration.

**Risk Event Log**
A live feed that logs events like "New device detected, risk +20" or "Session verified, risk normalized". New entries slide in automatically.

**Step-up Authentication**
When the risk score crosses 70, a popup appears asking for OTP verification. You can type 123456 as the demo OTP to verify and bring the score back down.

**User Trust Profile**
Shows basic user info: name, account ID, trust level (Trusted / Under Review / Flagged), and a live session timer.

## Tech Stack

- React + Vite
- Recharts for the gauge and area chart
- Plain CSS (no Tailwind, no UI library)
- Google Fonts (Inter, JetBrains Mono)

## Running locally

```bash
git clone https://github.com/smit208/trustpulse.git
cd trustpulse
npm install
npm run dev
```

Then open http://localhost:5174

## Notes

This is a frontend-only prototype. All the data is simulated using timers and random values. In a real system, the behavioral signals would come from actual telemetry like keystroke dynamics, device attestation APIs, and transaction history.

The design uses Bank of Baroda orange as the accent color and follows a dark theme to match a professional banking security tool.
