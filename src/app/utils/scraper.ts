import { supabase } from "@/lib/supabase";
import { load } from "cheerio";

interface Game {
  date: string;
  opponent: string;
  isHome: boolean;
  timestamp: string;
}

const fetchConfig = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    Referer: "https://www.espn.com",
    "Cache-Control": "no-cache",
    Pragma: "no-cache"
  }
};

export async function updatePredictions() {
  try {
    const { data: lastPrediction, error } = await supabase
      .from("predictions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching last prediction:", error);
    }

    if (!lastPrediction) {
      console.error("No last prediction found");
      return;
    }

    const predictionGameDate = lastPrediction[0].game_date;

    const response = await fetch(
      "https://www.espn.com/nba/player/_/id/3975/stephen-curry",
      fetchConfig
    );

    const data = await response.text();

    const $ = load(data);

    const rows = $("table tbody tr");
    let points = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = $(rows[i]);
      const dateText = row.find("td:nth-child(1)").text().trim();
      const gameDate = new Date(dateText + " 2025");
      if (isNaN(gameDate.getTime())) {
        continue;
      }
      const formattedGameDate = gameDate.toISOString().split("T")[0];

      if (formattedGameDate === predictionGameDate) {
        points = parseInt(row.find("td:nth-child(14)").text().trim());
      }
    }
    if (points === 0) {
      console.error("No points found for the prediction date");
      return;
    }
    await supabase
      .from("predictions")
      .update({
        actual_pts: points
      })
      .eq("player_id", lastPrediction[0].player_id)
      .eq("input_game_date", lastPrediction[0].input_game_date);

    console.log("Scraper: Points:", points);
  } catch (error) {
    console.error("Error fetching last prediction:", error);
  }
}

export async function getNextWarriorsGame(): Promise<Game | null> {
  console.log("=== SCRAPER START ===");
  try {
    console.log("Scraper: Making request to ESPN...");
    console.log(
      "Scraper: Request URL:",
      "https://www.espn.com/nba/team/schedule/_/name/gs/golden-state-warriors"
    );
    console.log("Scraper: Request headers:", fetchConfig.headers);

    const response = await fetch(
      "https://www.espn.com/nba/team/schedule/_/name/gs/golden-state-warriors",
      fetchConfig
    );

    console.log("Scraper: Response status:", response.status);
    console.log(
      "Scraper: Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    console.log("Scraper: Received ESPN response length:", data.length);
    console.log(
      "Scraper: First 100 chars of response:",
      data.substring(0, 100)
    );

    const $ = load(data);
    console.log("Scraper: Loaded data into cheerio");

    const currentDate = new Date();
    console.log("Scraper: Current date:", currentDate);
    let nextGame: Game | null = null;
    let nextGameAfterLastPrediction: Game | null = null;

    // get the last prediction with null game_date
    const { data: lastPrediction, error } = await supabase
      .from("predictions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    const rows = $("table tbody tr");
    console.log("Scraper: Found table rows:", rows.length);

    for (let i = 0; i < rows.length; i++) {
      const row = $(rows[i]);
      const dateText = row.find("td:nth-child(1)").text().trim();
      const opponentCell = row.find("td:nth-child(2)");
      const opponent = opponentCell.text().trim();

      // Look for "ticket" text in the row to identify future games
      const hasTicketLink = row.text().toLowerCase().includes("ticket");
      console.log("Scraper: Processing row:", {
        dateText,
        opponent,
        hasTicketLink,
        fullRowText: row.text().trim()
      });

      // Parse the date text to a Date object
      const gameDate = new Date(dateText);
      console.log(
        "Scraper: Game date:",
        gameDate,
        currentDate,
        isNaN(gameDate.getTime())
      );

      if (
        lastPrediction &&
        !isNaN(gameDate.getTime()) &&
        gameDate > lastPrediction[0].game_date
      ) {
        const isHome = !opponentCell.text().includes("@");

        nextGameAfterLastPrediction = {
          date: gameDate.toDateString(),
          opponent: opponent.replace("@ ", "").replace("vs ", ""), // Clean up opponent name
          isHome: isHome,
          timestamp: gameDate.toISOString()
        };
      }
      if (!isNaN(gameDate.getTime()) && hasTicketLink) {
        // Check if the game is in the future and has a ticket link
        // Determine if it's a home game (no @ symbol in the opponent text)
        const isHome = !opponentCell.text().includes("@");

        nextGame = {
          date: gameDate.toDateString(),
          opponent: opponent.replace("@ ", "").replace("vs ", ""), // Clean up opponent name
          isHome: isHome,
          timestamp: gameDate.toISOString()
        };
        console.log("Scraper: Found next game:", nextGame);
        break; // Break the loop
      }
    }

    if (!nextGame) {
      console.log("Scraper: No next game found in schedule");
      console.log("Scraper: Sample row content:", $(rows[0]).text().trim());
      console.log(
        "Scraper: HTML structure:",
        $("table").html()?.substring(0, 200)
      );
    }

    if (nextGameAfterLastPrediction) {
      console.log("Scraper: Last prediction:", lastPrediction);

      if (error) {
        console.error("Error fetching last prediction:", error);
      }

      if (lastPrediction && lastPrediction[0].game_date === null) {
        console.log("Scraper: Updating prediction with next game:", nextGame);
        // update supabase with the next game

        await supabase
          .from("predictions")
          .update({
            game_date: new Date(nextGameAfterLastPrediction.date + " 2025")
          })
          .eq("player_id", lastPrediction[0].player_id)
          .eq("input_game_date", lastPrediction[0].input_game_date);
      }
    }

    console.log("=== SCRAPER END ===");
    return nextGame;
  } catch (error) {
    console.error("=== SCRAPER ERROR ===");
    console.error("Full error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    throw error;
  }
}

export async function getLastGames(count: number = 5): Promise<Game[]> {
  try {
    const response = await fetch(
      "https://www.espn.com/nba/team/schedule/_/name/gs/golden-state-warriors",
      fetchConfig
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    const $ = load(data);

    const currentDate = new Date();
    const games: Game[] = [];

    $("table tbody tr").each((_, element) => {
      const dateText = $(element).find("td:nth-child(1)").text().trim();
      const opponentCell = $(element).find("td:nth-child(2)");
      const opponent = opponentCell.text().trim();
      const result = $(element).find("td:nth-child(3)").text().trim();

      const gameDate = new Date(dateText);

      // Only get completed games (games with results)
      if (gameDate < currentDate && result !== "") {
        const isHome = !opponentCell.text().includes("@");

        games.push({
          date: gameDate.toDateString(),
          opponent: opponent.replace("@ ", "").replace("vs ", ""),
          isHome: isHome,
          timestamp: gameDate.toISOString()
        });
      }
    });

    // Return the most recent games up to the count specified
    return games.slice(0, count);
  } catch (error) {
    console.error("Error fetching Warriors past games:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch schedule"
    );
  }
}
