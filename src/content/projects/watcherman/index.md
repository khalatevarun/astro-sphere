---
title: "Watcherman"
summary: "A real-time website monitoring dashboard built with Next.js, NodeJS and Supabase. Track uptime, latency, and performance metrics for multiple websites with customizable monitoring intervals and data visualization."
date: "15 Nov 2022"
draft: false
tags:
- Reactjs
- Tailwind
- Nodejs
- PostgreSQL

demoUrl: https://watcherman.vercel.app
repoUrl: https://github.com/khalatevarun/watcherman
---

## Features

- **Real-time Monitoring**: Track website status and performance in real-time
- **Custom Monitoring Intervals**: Set different monitoring frequencies for each website
- **Interactive Dashboard**: View detailed performance metrics and status history
- **Data Visualization**: 
  - Real-time latency graphs
  - Status indicators with color coding
  - Historical performance data
- **Data Export**: Export monitoring data in CSV format with flexible date range selection
- **Status Classifications**:
  - UP: Website is responding normally
  - DOWN: Website is not accessible
  - DELAYED: Response time consistently exceeding threshold
  - PENDING: Initial monitoring state

## Tech Stack

- **Frontend**: Next.js with React
- **Backend**: Supabase
- **Database**: PostgreSQL (via Supabase)
- **Charts**: Recharts
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Date Handling**: date-fns
