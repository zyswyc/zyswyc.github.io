import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import BillPage from "./BillPage";
import AddPage from "./AddPage";
import { useBillData } from "./BillContext.jsx";

// 首页内容（还款日历）
function HomePage() {
  const { items, updateDebtChecked } = useBillData();

  function getWeekRange(date) {
    const day = date.getDay() === 0 ? 7 : date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - day + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { monday, sunday };
  }
  function fmt(d) {
    return d.toISOString().split("T")[0];
  }
  function md(d) {
    return `${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  }

  // 仅用 context 中的负债/待还款数据
  const bills = items.filter((item) => item.type === "debt");
  const now = new Date();
  const { monday, sunday } = getWeekRange(now);
  const weekDays = Array(7)
    .fill(0)
    .map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        label: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"][i],
        date: fmt(d),
        md: md(d),
        amount: 0,
        items: [],
      };
    });
  // 统计本周每天的负债
  bills.forEach((b) => {
    weekDays.forEach((w) => {
      if (b.date === w.date) {
        w.amount += b.amount;
        w.items.push(b);
      }
    });
  });
  const maxAmount = Math.max(...weekDays.map((w) => w.amount), 1);
  const total = weekDays.reduce((s, w) => s + w.amount, 0);
  const todayIdx = (() => {
    const d = now.getDay();
    return d === 0 ? 6 : d - 1;
  })();
  const dateRange = `${md(monday)}~${md(sunday)}`;

  const navigate = useNavigate();
  const location = useLocation();

  // 按月分组
  function groupByMonth(items) {
    const groups = {};
    items.forEach((item) => {
      const m = item.date.slice(0, 7);
      if (!groups[m]) groups[m] = [];
      groups[m].push(item);
    });
    return groups;
  }
  const byMonth = groupByMonth(bills);
  const monthKeys = Object.keys(byMonth).sort((a, b) => a.localeCompare(b));

  return (
    <div className="container">
      {/* 顶部待还款区域 */}
      <div className="card top-section">
        <div className="top-header">
          <div>
            <div className="title">本周待还款</div>
            <div className="subtitle">总计：¥{total.toLocaleString()}</div>
          </div>
          <div className="date-range">{dateRange}</div>
        </div>
        {/* 图表区域 */}
        <div className="chart-placeholder">
          <div className="chart-bar">
            {weekDays.map((w, idx) => {
              // 若本日所有账单都已还款，则条柱为浅灰色
              const allChecked = w.items.length > 0 && w.items.every(b => b.checked);
              return (
                <div
                  className="bar"
                  key={idx}
                  style={{
                    left: `calc(${(idx / 7) * 100}% + 7%)`,
                    height: `${w.amount ? (w.amount / maxAmount) * 90 + 10 : 0}%`,
                    background: w.amount
                      ? allChecked
                        ? "#ddd"
                        : "#e8707b55"
                      : "#f1f1f1",
                  }}
                >
                  {w.amount > 0 && (
                    <span className="bar-label">¥{w.amount.toFixed(2)}</span>
                  )}
                </div>
              );
            })}
            {/* 虚线指示当前日 */}
            <div
              className="dashed-line"
              style={{ left: `calc(${(todayIdx / 7) * 100}% + 7%)` }}
            ></div>
            {/* 周标签 */}
            <div className="week-labels">
              {weekDays.map((w, idx) => (
                <span key={idx}>{w.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* 账单分月列表 */}
      {monthKeys.map((m, i) => (
        <div className="month-section" key={m}>
          <div className="month-header">
            <span>{m}</span>
            <span className="month-amount">
              {byMonth[m].reduce((s, b) => s + b.amount, 0).toLocaleString()}
            </span>
          </div>
          <div className="bill-list">
            {byMonth[m]
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((bill, idx) => (
                <div className="bill-item" key={idx}>
                <span
                  className="bill-dot"
                  style={{ background: "#FFA940" }}
                ></span>
                <span className="bill-name">{bill.name}</span>
                <span className="bill-type">待还</span>
                <span className="bill-amount">{bill.amount.toLocaleString()}</span>
                <span className="bill-date">{bill.date}</span>
                <input
                  type="checkbox"
                  checked={!!bill.checked}
                  style={{ width: 18, height: 18, marginLeft: 8, accentColor: "#e8707b" }}
                  onChange={e =>
                    updateDebtChecked({
                      name: bill.name,
                      date: bill.date,
                      checked: e.target.checked,
                    })
                  }
                  title="已还款"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* 底部菜单栏 */}
      <div className="tab-bar">
        <div
          className="tab-item"
          style={{ color: location.pathname === "/bill" ? "#e8707b" : "#888", cursor: "pointer" }}
          onClick={() => navigate("/bill")}
        >
          <span className="icon">💳</span>
          <span>账单</span>
        </div>
        <div
          className={`tab-item tab-center${location.pathname === "/add" ? " active" : ""}`}
          style={{
            background: location.pathname === "/add" ? "#e8707b" : "",
            color: location.pathname === "/add" ? "#fff" : "",
            cursor: "pointer"
          }}
          onClick={() => navigate("/add")}
        >
          <span className="icon">➕</span>
        </div>
        <div
          className="tab-item"
          style={{ color: location.pathname === "/" ? "#e8707b" : "#888", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <span className="icon">📅</span>
          <span>还款日历</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/bill" element={<BillPage />} />
      <Route path="/add" element={<AddPage />} />
    </Routes>
  );
}
