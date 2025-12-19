"use client";

import { useEffect, useState } from "react";

type Shelter = {
  id: number;
  name: string;
  address: string;
  capacity: number;
  occupancy: number;
  status: "OPEN" | "CLOSED";
};

export default function Home() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const res = await fetch("http://localhost:8080/health");
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const data = await res.json();
        setShelters(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          避難所一覧
        </h1>
        
        {loading ? (
          <p className="text-center text-gray-500">読み込み中...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {shelters.map((shelter) => (
              <div
                key={shelter.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4"
                style={{
                  borderLeftColor: shelter.status === "OPEN" ? "#10B981" : "#9CA3AF"
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {shelter.name}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      shelter.status === "OPEN"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {shelter.status === "OPEN" ? "開設中" : "閉鎖中"}
                  </span>
                </div>

                <p className="text-gray-600 mb-2"> {shelter.address}</p>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1 text-gray-700">
                    <span>混雑状況</span>
                    <span>
                      {shelter.occupancy} / {shelter.capacity} 人
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          (shelter.occupancy / shelter.capacity) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}