import { useState, useEffect } from "react";
import { API_URL } from "../config/api";

export default function useFetch<T = any>(endpoint: string, options: RequestInit = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!endpoint) return;
    try {
      setLoading(true);
      setError(null);

      const url = `${API_URL}${endpoint}`;
      console.log("📡 Fetching:", url);

      const response = await fetch(url, options);
      if (!response.ok) {
        const text = await response.text();
        console.warn("❌ Fetch failed:", response.status, response.statusText, text);
        setError(`Request failed (${response.status})`);
        return;
      }

      const json = await response.json();
      setData(json);
      console.log("✅ Success:", url);
    } catch (err: any) {
      console.error("⚠️ Fetch error:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData };
}