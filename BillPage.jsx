import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBillData } from "./BillContext.jsx";

// 日期格式化
function fmtDate(d) {
  if (!d) return "";
  const now = new Date();
  const date = new Date(d);
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday =
    date.toDateString() ===
    new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
  return (
    d +
    (isToday ? " 今天" : isYesterday ? " 昨天" : "")
  );
}

// 按日期分组
function groupByDate(items) {
  const groups = {};
  items.forEach((item) => {
    if (!groups[item.date]) groups[item.date] = [];
    groups[item.date].push(item);
  });
  return groups;
}

export default function BillPage() {
  const [hoverIdx, setHoverIdx] = useState(null);
  const navigate = useNavigate();
  const { items } = useBillData();

  // 只显示收入/支出数据
  const billItems = items.filter(
    (item) => item.type === "income" || item.type === "expense"
  );

  // 当前年月
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // 当月天数
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 初始化每一天
  const daily = Array(daysInMonth)
    .fill(0)
    .map((_, i) => ({
      day: i + 1,
      income: 0,
      expense: 0,
      date: `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
    }));

  // 聚合每天的收入/支出
  billItems.forEach((item) => {
    const d = new Date(item.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const idx = d.getDate() - 1;
      if (item.type === "income") daily[idx].income += Math.abs(item.amount);
      if (item.type === "expense") daily[idx].expense += Math.abs(item.amount);
    }
  });

  // 动态计算Y轴最大值（收入/支出最大值中取较大者，向上取整到10/50/100/1000）
  const maxValue = Math.max(
    ...daily.map((d) => Math.max(d.income, d.expense)),
    10
  );
  // 计算合适的Y轴刻度
  function getNiceMax(v) {
    if (v <= 10) return 10;
    if (v <= 50) return 50;
    if (v <= 100) return 100;
    if (v <= 500) return 500;
    if (v <= 1000) return 1000;
    if (v <= 5000) return 5000;
    if (v <= 10000) return 10000;
    return Math.ceil(v / 10000) * 10000;
  }
  const yMax = getNiceMax(maxValue);
  const yTicks = [yMax, yMax / 2, 0];

  // 按日期分组并排序
  const byDate = groupByDate(billItems);
  const dateKeys = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  // SVG尺寸
  const barWidth = 8;
  const barGap = 6;
  const chartHeight = 120;

  // 分为上半月、下半月
  const daily1 = daily.slice(0, 15); // 1~15
  const daily2 = daily.slice(15);    // 16~daysInMonth
  const chartWidth1 = (barWidth * 2 + barGap) * daily1.length + 40;
  const chartWidth2 = (barWidth * 2 + barGap) * daily2.length + 40;

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: 14, marginTop: 12 }}>
        <div style={{ fontWeight: 500, fontSize: 18, textAlign: "center", marginBottom: 6 }}>
          日收支统计
        </div>
        {/* 上半月 */}
        <div style={{ width: "100%", overflowX: "auto", position: "relative", marginBottom: 8 }}>
          <svg width={chartWidth1} height={chartHeight + 30} style={{ display: "block" }}>
            {/* Y轴刻度线与标签 */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <text x="0" y={chartHeight - (tick / yMax) * chartHeight + 16} fontSize="13" fill="#bbb">{tick}</text>
                <line
                  x1={30}
                  y1={chartHeight - (tick / yMax) * chartHeight + 10}
                  x2={chartWidth1 - 10}
                  y2={chartHeight - (tick / yMax) * chartHeight + 10}
                  stroke="#eee"
                />
              </g>
            ))}
            {/* 柱状条 */}
            {daily1.map((d, i) => {
              const x = 30 + i * (barWidth * 2 + barGap);
              const hIncome = (d.income / yMax) * chartHeight;
              const hExpense = (d.expense / yMax) * chartHeight;
              return (
                <g key={i}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  style={{ cursor: d.income || d.expense ? "pointer" : "default" }}
                >
                  {/* 支出：浅红色 */}
                  <rect x={x} y={chartHeight - hExpense + 10} width={barWidth} height={hExpense} fill="#e8707b55" rx="2" />
                  {/* 收入：灰色 */}
                  <rect x={x + barWidth} y={chartHeight - hIncome + 10} width={barWidth} height={hIncome} fill="#888" rx="2" />
                  {/* X轴日期：奇数日和最后一天显示 */}
                  {(d.day % 2 === 1 || d.day === 15) && (
                    <text x={x + barWidth} y={chartHeight + 22} fontSize="12" fill="#bbb" textAnchor="middle">
                      {String(d.day).padStart(2, "0")}
                    </text>
                  )}
                  {/* 悬浮气泡 */}
                  {hoverIdx === i && (d.income > 0 || d.expense > 0) && (
                    <foreignObject x={x - 24} y={chartHeight - 43} width="68" height="40">
                      <div style={{
                        background: "#222",
                        color: "#fff",
                        borderRadius: 6,
                        padding: "2px 6px",
                        fontSize: 11,
                        lineHeight: "1.3",
                        minWidth: 0,
                        minHeight: 0,
                        width: "max-content",
                        pointerEvents: "none",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start"
                      }}>
                        <div>{d.date}</div>
                        <div>收入 ¥{d.income.toFixed(2)}</div>
                        <div>支出 ¥{d.expense.toFixed(2)}</div>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        {/* 下半月 */}
        <div style={{ width: "100%", overflowX: "auto", position: "relative" }}>
          <svg width={chartWidth2} height={chartHeight + 30} style={{ display: "block" }}>
            {/* Y轴刻度线与标签 */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <text x="0" y={chartHeight - (tick / yMax) * chartHeight + 16} fontSize="13" fill="#bbb">{tick}</text>
                <line
                  x1={30}
                  y1={chartHeight - (tick / yMax) * chartHeight + 10}
                  x2={chartWidth2 - 10}
                  y2={chartHeight - (tick / yMax) * chartHeight + 10}
                  stroke="#eee"
                />
              </g>
            ))}
            {/* 柱状条 */}
            {daily2.map((d, i) => {
              const x = 30 + i * (barWidth * 2 + barGap);
              const hIncome = (d.income / yMax) * chartHeight;
              const hExpense = (d.expense / yMax) * chartHeight;
              const realDay = d.day;
              return (
                <g key={i}
                  onMouseEnter={() => setHoverIdx(i + 15)}
                  onMouseLeave={() => setHoverIdx(null)}
                  style={{ cursor: d.income || d.expense ? "pointer" : "default" }}
                >
                  {/* 支出：浅红色 */}
                  <rect x={x} y={chartHeight - hExpense + 10} width={barWidth} height={hExpense} fill="#e8707b55" rx="2" />
                  {/* 收入：灰色 */}
                  <rect x={x + barWidth} y={chartHeight - hIncome + 10} width={barWidth} height={hIncome} fill="#888" rx="2" />
                  {/* X轴日期：奇数日和最后一天显示 */}
                  {(realDay % 2 === 1 || realDay === daysInMonth) && (
                    <text x={x + barWidth} y={chartHeight + 22} fontSize="12" fill="#bbb" textAnchor="middle">
                      {String(realDay).padStart(2, "0")}
                    </text>
                  )}
                  {/* 悬浮气泡 */}
                  {hoverIdx === i + 15 && (d.income > 0 || d.expense > 0) && (
                    <foreignObject x={x - 24} y={chartHeight - 43} width="68" height="40">
                      <div style={{
                        background: "#222",
                        color: "#fff",
                        borderRadius: 6,
                        padding: "2px 6px",
                        fontSize: 11,
                        lineHeight: "1.3",
                        minWidth: 0,
                        minHeight: 0,
                        width: "max-content",
                        pointerEvents: "none",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start"
                      }}>
                        <div>{d.date}</div>
                        <div>收入 ¥{d.income.toFixed(2)}</div>
                        <div>支出 ¥{d.expense.toFixed(2)}</div>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      {/* 明细列表 */}
      <div>
        {dateKeys.map((date, idx) => {
          const day = byDate[date];
          const income = day.filter((item) => item.type === "income").reduce((s, i) => s + Math.abs(i.amount), 0);
          const expense = day.filter((item) => item.type === "expense").reduce((s, i) => s + Math.abs(i.amount), 0);
          return (
            <div className="month-section" key={idx} style={{ marginBottom: 10 }}>
              <div className="month-header" style={{ fontSize: 16, fontWeight: 500, color: "#222" }}>
                {fmtDate(date)}
                <span style={{ marginLeft: "auto", color: "#aaa", fontWeight: 400, fontSize: 15 }}>
                  收:¥{income.toFixed(2)} 支:¥{expense.toFixed(2)}
                </span>
              </div>
              <div className="bill-list">
                {day.map((item, i) => (
                  <div className="bill-item" key={i} style={{ color: item.amount < 0 ? "#e8707b" : "#222" }}>
                    <span style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      background: "#e8707b",
                      borderRadius: "50%",
                      marginRight: 8
                    }}></span>
                    <span style={{ minWidth: 44, display: "inline-block" }}>{item.name}</span>
                    <span style={{
                      marginLeft: "auto",
                      color: item.amount < 0 ? "#e8707b" : "#222",
                      fontWeight: 500,
                      fontSize: 15
                    }}>
                      {item.amount < 0 ? `-¥${Math.abs(item.amount).toFixed(2)}` : `¥${item.amount.toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* 底部tab栏 */}
      <div className="tab-bar">
        <div className="tab-item active" style={{ color: "#e8707b" }}>
          <span className="icon">💳</span>
          <span>账单</span>
        </div>
        <div
          className="tab-item tab-center"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/add")}
        >
          <span className="icon">➕</span>
        </div>
        <div
          className="tab-item"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <span className="icon">📅</span>
          <span>还款日历</span>
        </div>
      </div>
    </div>
  );
}
