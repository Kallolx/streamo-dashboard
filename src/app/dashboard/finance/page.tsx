"use client";

import { useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import Link from "next/link";

export default function FinancePage() {
  const [timeframe, setTimeframe] = useState<"monthly" | "quarterly" | "annually">("monthly");
  
  return (
    <DashboardLayout 
      title="Finance" 
      subtitle="Manage your financial data"
    >
      <div className="bg-[#161A1F] rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-semibold">Financial Overview</h2>
          <div className="mt-3 sm:mt-0 flex gap-2 bg-gray-800 rounded-lg p-1">
            <button 
              className={`px-4 py-1.5 rounded-md text-sm font-medium ${timeframe === "monthly" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
              onClick={() => setTimeframe("monthly")}
            >
              Monthly
            </button>
            <button 
              className={`px-4 py-1.5 rounded-md text-sm font-medium ${timeframe === "quarterly" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
              onClick={() => setTimeframe("quarterly")}
            >
              Quarterly
            </button>
            <button 
              className={`px-4 py-1.5 rounded-md text-sm font-medium ${timeframe === "annually" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
              onClick={() => setTimeframe("annually")}
            >
              Annually
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-5 rounded-lg transition-all hover:translate-y-[-4px]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium">Total Revenue</h3>
              <div className="bg-green-500/20 text-green-500 text-xs font-medium px-2 py-1 rounded-md">+12%</div>
            </div>
            <p className="text-3xl font-bold text-white">$14,582.23</p>
            <p className="text-sm text-gray-400 mt-2">Period: Apr 1 - Apr 30, 2023</p>
          </div>
          
          <div className="bg-gray-800 p-5 rounded-lg transition-all hover:translate-y-[-4px]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium">Pending Payouts</h3>
              <div className="bg-yellow-500/20 text-yellow-500 text-xs font-medium px-2 py-1 rounded-md">Processing</div>
            </div>
            <p className="text-3xl font-bold text-white">$2,341.88</p>
            <p className="text-sm text-gray-400 mt-2">Expected on May 15, 2023</p>
          </div>
          
          <div className="bg-gray-800 p-5 rounded-lg transition-all hover:translate-y-[-4px]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium">Royalty Rate</h3>
              <div className="bg-blue-500/20 text-blue-500 text-xs font-medium px-2 py-1 rounded-md">Above Avg</div>
            </div>
            <p className="text-3xl font-bold text-white">72%</p>
            <p className="text-sm text-gray-400 mt-2">Industry average: 65%</p>
          </div>
        </div>
        
        <div className="bg-gray-800 p-5 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Revenue History</h3>
            <button className="text-sm font-medium text-purple-500 hover:text-purple-400">
              Download Report
            </button>
          </div>
          <div className="h-64 w-full flex items-center justify-center border border-gray-700 rounded-lg mb-6">
            <p className="text-gray-400">Revenue chart placeholder</p>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Jan</span>
            <span>Mar</span>
            <span>Jun</span>
            <span>Sep</span>
            <span>Dec</span>
          </div>
        </div>
      </div>

      <div className="bg-[#161A1F] rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Link href="#" className="text-sm font-medium text-purple-500 hover:text-purple-400">
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3 font-medium text-gray-400">Platform</th>
                <th className="pb-3 font-medium text-gray-400">Date</th>
                <th className="pb-3 font-medium text-gray-400">Amount</th>
                <th className="pb-3 font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { platform: "Spotify", date: "Apr 28, 2023", amount: "$1,245.33", status: "Completed" },
                { platform: "Apple Music", date: "Apr 25, 2023", amount: "$946.21", status: "Completed" },
                { platform: "Amazon Music", date: "Apr 22, 2023", amount: "$372.88", status: "Completed" },
                { platform: "YouTube Music", date: "Apr 18, 2023", amount: "$512.45", status: "Processing" },
                { platform: "TikTok", date: "Apr 15, 2023", amount: "$124.99", status: "Processing" }
              ].map((transaction, index) => (
                <tr key={index} className="border-b border-gray-700 last:border-b-0">
                  <td className="py-4">{transaction.platform}</td>
                  <td className="py-4 text-gray-400">{transaction.date}</td>
                  <td className="py-4 font-medium">{transaction.amount}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      transaction.status === "Completed" 
                        ? "bg-green-500/20 text-green-500" 
                        : "bg-yellow-500/20 text-yellow-500"
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
} 