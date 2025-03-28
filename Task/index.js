const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 9876;

let windowPrevState = [];
let windowCurrState = new Set();
const WINDOW_SIZE = 10;

const isPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const isFibonacci = (num) =>
 {
  const isPerfectSquare = (x) => Number.isInteger(Math.sqrt(x));
  return isPerfectSquare(5 * num * num + 4) || isPerfectSquare(5 * num * num - 4);
};

const fetchNumbers = async () => {
    try {
      const response = await axios.get("https://www.randomnumberapi.com/api/v1.0/random?min=1&max=100&count=10", { timeout: 500 });
  
      console.log("API Response:", response.data);
  
      if (!Array.isArray(response.data) || response.data.length === 0) {
        console.warn("Received empty response, retrying...");
        return [2, 4, 6, 8]; 
      }
  
      return response.data;
    } catch (error) {
      console.error("Error fetching numbers:", error.message);
      return [2, 4, 6, 8];
    }
  };
const categorizeNumber = (num) =>
 {
  if (isPrime(num)) 
  return "p";
  if (isFibonacci(num)) 
  return "f";
  if (num%2===0)
    return "e";
    return "r";
};

const updateWindow = (numbers) => {
  windowPrevState = Array.from(windowCurrState);
  numbers.forEach((num) => windowCurrState.add(num));

  if (windowCurrState.size > WINDOW_SIZE) {
    windowCurrState = new Set(Array.from(windowCurrState).slice(-WINDOW_SIZE));
  }
};

const calculateAverage = () => {
  if (windowCurrState.size === 0) return "0.00";
  const avg = Array.from(windowCurrState).reduce((sum, num) =>sum+num,0)/windowCurrState.size;
  return avg.toFixed(2);
};

app.get("/numbers", async (req, res) => {
    const numbers = await fetchNumbers();
    console.log("Fetched Numbers:", numbers);
    if (numbers.length === 0) {
      return res.json({
        windowPrevState,
        windowCurrState: Array.from(windowCurrState),
        categorizedNumbers: [],
        Avg: calculateAverage(),
      });
    }
    const categorizedNumbers = numbers.map((num) => ({
      number: num,
      category: categorizeNumber(num),
    }));
    updateWindow(numbers);
    console.log("Updated Window:", windowCurrState);
    res.json({
      windowPrevState,
      windowCurrState: Array.from(windowCurrState),
      categorizedNumbers,
      Avg: calculateAverage(),
    });
  });
  

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});