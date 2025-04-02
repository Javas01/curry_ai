"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface Game {
  date: string;
  opponent: string;
  isHome: boolean;
  timestamp: string;
}

interface Prediction {
  player_id: string;
  input_game_date: string;
  game_date: string;
  predicted_pts: number;
  actual_pts: number;
  created_at: string;
  updated_at: string;
}

function calculateMSE(predictions: Prediction[]) {
  const validPredictions = predictions.filter((p) => p.actual_pts != null);
  if (validPredictions.length === 0) return 0;

  const sumSquaredErrors = validPredictions.reduce((sum, prediction) => {
    return sum + Math.pow(prediction.actual_pts - prediction.predicted_pts, 2);
  }, 0);

  return (sumSquaredErrors / validPredictions.length).toFixed(2);
}

function calculateMAE(predictions: Prediction[]) {
  const validPredictions = predictions.filter((p) => p.actual_pts != null);
  if (validPredictions.length === 0) return 0;

  const sumAbsoluteErrors = validPredictions.reduce((sum, prediction) => {
    return sum + Math.abs(prediction.actual_pts - prediction.predicted_pts);
  }, 0);

  return (sumAbsoluteErrors / validPredictions.length).toFixed(2);
}

function calculateRSquared(predictions: Prediction[]) {
  const validPredictions = predictions.filter((p) => p.actual_pts != null);
  if (validPredictions.length === 0) return 0;

  const yTrue = validPredictions.map((p) => p.actual_pts);
  const yPred = validPredictions.map((p) => p.predicted_pts);

  if (yTrue.length !== yPred.length)
    throw new Error("Arrays must be the same length");
  const n = yTrue.length;
  const mean = yTrue.reduce((acc, val) => acc + val, 0) / n;

  let ssRes = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    ssRes += Math.pow(yTrue[i] - yPred[i], 2);
    ssTot += Math.pow(yTrue[i] - mean, 2);
  }

  return (1 - ssRes / ssTot).toFixed(2);
}

export default function Home() {
  const [pastPredictions, setPastPredictions] = useState<Prediction[]>([]);
  const [nextPrediction, setNextPrediction] = useState<Prediction | null>(null);
  const [nextGame, setNextGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch predictions
        const { data: pastData, error: pastError } = await supabase
          .from("predictions")
          .select("*")
          .order("input_game_date", { ascending: false });

        if (pastError) throw pastError;

        const { data: nextData, error: nextError } = await supabase
          .from("predictions")
          .select("*")
          .is("actual_pts", null)
          .order("input_game_date", { ascending: true })
          .limit(1)
          .single();

        if (nextError) throw nextError;

        // Fetch next game data from our API route
        const scheduleResponse = await fetch("/api/schedule");
        const scheduleData = await scheduleResponse.json();

        if (!scheduleResponse.ok) {
          throw new Error(scheduleData.error || "Failed to fetch schedule");
        }

        setPastPredictions(pastData?.slice(1) || []);
        setNextPrediction(nextData);
        setNextGame(scheduleData.nextGame);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading predictions...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white flex items-center justify-center">
        <div className="text-xl text-red-300">Error: {error}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 text-white">
            Curry Predictor
          </h1>
          <p className="text-xl text-blue-100">
            AI-powered Stephen Curry performance predictions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Next Game Prediction Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel"
          >
            <h2 className="text-2xl font-bold mb-4 text-white">
              Next Game Prediction
            </h2>
            {nextPrediction ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Points:</span>
                  <span className="text-2xl font-bold text-green-300">
                    {nextPrediction.predicted_pts}
                  </span>
                </div>
                {nextGame && (
                  <div className="text-sm text-blue-100 space-y-2">
                    <div>
                      Game Date:{" "}
                      {new Date(nextGame.timestamp).toLocaleDateString()}
                    </div>
                    <div>
                      {nextGame.isHome ? "vs" : "@"} {nextGame.opponent}
                    </div>
                  </div>
                )}
                <div className="relative w-full h-48 mt-4">
                  <Image
                    src="/images/image.png"
                    alt="Game prediction visualization"
                    fill
                    style={{ objectFit: "contain" }}
                    priority
                  />
                </div>
              </div>
            ) : (
              <div className="text-blue-100">No upcoming predictions</div>
            )}
          </motion.div>

          {/* Past Predictions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel"
          >
            <h2 className="text-2xl font-bold mb-4 text-white">
              Past Predictions
            </h2>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {pastPredictions.map((prediction, index) => (
                <div key={index} className="border-b border-white/30 pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-blue-100">
                      {
                        new Date(prediction.game_date)
                          .toISOString()
                          .split("T")[0]
                      }
                    </span>
                    <span
                      className={`text-sm ${
                        Math.abs(
                          prediction.actual_pts - prediction.predicted_pts
                        ) <= 10
                          ? "text-green-300"
                          : Math.abs(
                              prediction.actual_pts - prediction.predicted_pts
                            ) <= 15
                          ? "text-yellow-300"
                          : "text-red-300"
                      }`}
                    >
                      Difference:{" "}
                      {Math.abs(
                        prediction.actual_pts - prediction.predicted_pts
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-blue-100">Predicted</span>
                      <div className="flex justify-between text-white">
                        <span>PTS: {prediction.predicted_pts.toFixed(2)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-green-100">Actual</span>
                      <div className="flex justify-between text-white">
                        <span>PTS: {prediction.actual_pts.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 glass-panel"
        >
          <h2 className="text-2xl font-bold mb-4 text-white">
            Model Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-300">
                {calculateMSE(pastPredictions)}
              </div>
              <div className="text-sm text-blue-100">MSE Loss</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-300">
                {calculateMAE(pastPredictions)}
              </div>
              <div className="text-sm text-blue-100">MAE Loss</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-300">
                {calculateRSquared(pastPredictions)}
              </div>
              <div className="text-sm text-blue-100">R-Squared</div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
