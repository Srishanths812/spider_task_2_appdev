import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

function Charts({result,myName}){
  const [memberChart,setMemberChart]=useState(null);
  const [categoryChart,setCategoryChart]=useState(null);
  function capitalize(word){
    return word.charAt(0).toUpperCase()+word.slice(1);
  }
  function CategoryTotals(expenses) {
    const totals = {};
    expenses.forEach(exp => {
      const cat = exp.category;
      const cost = exp.cost;
      if (!totals[cat]) totals[cat] = 0;
      totals[cat] += cost;
    });
    return totals;
  }
  useEffect(() => {
    if (!result||!result.members||!result.expenses)return;
    const memberLabels=result.members.map(member=>
      member.username===myName?'You':capitalize(member.username)
    );
    const memberAmounts = result.members.map(member=>member.amount);
    setMemberChart({
      labels: memberLabels,
      datasets:[
        {
          label:'Amount',
          data:memberAmounts,
          backgroundColor: [
            '#60a5fa', '#f87171', '#fbbf24',
            '#34d399', '#a78bfa', '#fb7185', '#22d3ee'
          ],
          borderWidth:1,
        },
      ],
    });
    const totals=CategoryTotals(result.expenses);
    const catLabels=Object.keys(totals);
    const catData=Object.values(totals);

    setCategoryChart({
      labels: catLabels,
      datasets: [
        {
          label: '₹ Spent',
          data: catData,
          backgroundColor: [
            '#f87171', '#60a5fa', '#34d399',
            '#fbbf24', '#a78bfa', '#fb7185', '#22d3ee'
          ],
          borderWidth: 1,
        },
      ],
    });
  }, [result, myName]);
  if (!memberChart || !categoryChart) return <div className="p-4">Loading charts...</div>;
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
      <div className="bg-white p-4 rounded-xl shadow border">
        <h2 className="text-xl font-bold mb-4 text-center text-black underline">Member Amounts</h2>
        <Doughnut data={memberChart} />
      </div>
      <div className="bg-white p-4 rounded-xl shadow border">
        <h2 className="text-xl font-bold mb-4 text-center text-black underline">Spending by Category</h2>
        <Doughnut data={categoryChart} />
      </div>
    </div>
  );
}

export default Charts;
