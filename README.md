# Curry Predictor 🏀

An AI-powered web application that predicts Stephen Curry's performance in upcoming NBA games. Built with Next.js and modern web technologies.

## Features

- **Real-time Predictions**: Get AI-powered predictions for Stephen Curry's points in upcoming games
- **Past Performance Analysis**: View historical predictions and their accuracy
- **Model Performance Metrics**: Track the model's accuracy using MSE, MAE, and R-Squared metrics
- **Beautiful UI**: Modern, responsive design with glass-morphism effects
- **Live Schedule Integration**: Automatically fetches and displays upcoming Warriors games

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Animations**: Framer Motion
- **Database**: Supabase
- **Data Sources**: ESPN NBA Schedule API
- **Backend Model**: Custom LSTM Neural Network built with PyTorch and Hugging Face

## Getting Started

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up your environment variables:
   Create a `.env.local` file with the following variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## How It Works

The application uses a custom-built LSTM (Long Short-Term Memory) Neural Network, implemented with PyTorch and Hugging Face, to predict Stephen Curry's performance in upcoming games. The model takes into account various factors including:

- Historical performance data
- Game schedule and opponent information
- Home/Away game status
- Recent team performance
- Sequential patterns in scoring trends

The LSTM architecture is particularly well-suited for this task as it can capture long-term dependencies and patterns in Curry's performance over time. The model is trained on historical game data and fine-tuned using Hugging Face's transformers library for optimal performance.

The predictions are displayed alongside actual performance data for past games, allowing you to track the model's accuracy over time through various metrics including Mean Squared Error (MSE), Mean Absolute Error (MAE), and R-Squared values.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
