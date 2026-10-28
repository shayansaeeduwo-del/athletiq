# AthletiQ

An AI planner for student-athletes. Tell it your program, your sport, and what matters most this term, and it builds a personalized weekly schedule that balances training, classes, and study.

> Status: in development. Auth, onboarding, and AI schedule generation are working; a beta for student-athletes at Western University is next.

<!-- Add 2–3 screenshots here: onboarding, goal weighting, home calendar -->

## Features

- **Sign-up and login** with email confirmation through a deep link (`athletiq://`), then routing that sends new users to onboarding and returning users to their dashboard
- **Four-step onboarding**: welcome, academic profile, athletic profile, and goal weighting. Drafts save on-device so nothing is lost if the app closes.
- **AI schedule generation**: onboarding data is sent to the Claude API, which returns a colour-coded weekly schedule as JSON
- **Home calendar** with a 7-day strip and an hourly grid from 6 am to 11 pm
- **Secure data**: every table is protected by Supabase row-level security, so users can only read and write their own rows

## Tech stack

| Layer | Tools |
|---|---|
| App | React Native, Expo, Expo Router, TypeScript |
| Local storage | AsyncStorage (onboarding drafts) |
| Backend | Supabase: PostgreSQL, Auth, row-level security |
| AI | Anthropic Claude API |

## Project structure

```
app/
  (tabs)/          Home and tab screens
  onboarding/      Four-step onboarding flow
  login.tsx        Login screen
  signup.tsx       Sign-up screen
components/        Shared UI and onboarding components
constants/         Theme and AthletiQ design tokens
lib/
  supabase.js      Supabase client
  onboarding-data.ts  Draft saving and final upsert
  post-auth-route.ts  Decides where users land after sign-in
  auth-deeplink.ts    Handles the email confirmation link
supabase/
  migrations/      Database schema and policies
```

## Database

| Table | Holds |
|---|---|
| `profiles` | User profile |
| `athlete_onboarding` | Academic and athletic answers, goal weights |
| `schedules` | Generated weekly schedules |
| `performance_logs` | Training and performance entries |

## Run it locally

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/shayansaeeduwo-del/athletiq.git
   cd athletiq
   npm install
   ```
2. Create a `.env` file in the project root:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
3. Run the SQL in `supabase/migrations/` in your Supabase project's SQL Editor.
4. Start the app and scan the QR code with Expo Go:
   ```bash
   npx expo start
   ```

## Roadmap

- [ ] Move the Claude API call into a Supabase Edge Function so the API key stays on the server
- [ ] Performance tracker screen
- [ ] Settings and profile screen
- [ ] Nearby opportunities: tournaments and events matched to each athlete
- [ ] Beta release to student-athletes

## Author

Built by [Shayan Saeed](https://shayansaeeduwo-del.github.io), computer science student at Western University.
