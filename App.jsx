import React from "react";

// 获取本周的起止日期（周一为一周的第一天）
function getWeekRange(date) {
  const day = date.getDay() === 0 ? 7 : date.getDay(); // 周日为7
  const monday = new Date(date);
  monday.setDate(date.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
}

// 获取 yyyy-mm-dd 字符串
function fmt(d) {
  return d.toISOString().split("T")[0];
}

// 获取 MMDD 字符串
function md(d) {
  return `${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

export default function App() {
  // 示例账单数据
  const bills = [
    {
      name: "花呗",
      type: "不分期",
      color: "#67C5FF",
      amount: 1200,
      date: "2025-06-05",
      checked: true,
    },
    {
      name: "白条分期",
      type: "2/15期",
      color: "#B297FF",
      amount: 500,
      date: "2025-06-16",
      checked: true,
    },
    {
      name: "车贷",
      type: "8/36期",
      color: "#FFA940",
      amount: 5000,
      date: "2025-06-20",
      checked: true,
    },
  ];

  // 当前时间
  const now = new Date();
  // 本周起止
  const { monday, sunday } = getWeekRange(now);

  // 本周每天金额统计
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
      };
    });

  // 分账单计入本周
  bills.forEach((b) => {
    weekDays.forEach((w) => {
      if (b.date === w.date) w.amount += b.amount;
    });
  });

  // 最大金额用于柱状高度映射
  const maxAmount = Math.max(...weekDays.map((w) => w.amount), 1);
  // 总金额
  const total = weekDays.reduce((s, w) => s + w.amount, 0);

  // 虚线位置
  const todayIdx = (() => {
    const d = now.getDay();
    return d === 0 ? 6 : d - 1;
  })();

  // 日期范围
  const dateRange = `${md(monday)}~${md(sunday)}`;

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
            {weekDays.map((w, idx) => (
              <div
                className="bar"
                key={idx}
                style={{
                  left: `calc(${(idx / 7) * 100}% + 7%)`,
                  height: `${w.amount ? (w.amount / maxAmount) * 90 + 10 : 0}%`,
                  background: w.amount ? "#e8707b55" : "#f1f1f1",
                }}
              >
                {w.amount > 0 && (
                  <span className="bar-label">¥{w.amount.toFixed(2)}</span>
                )}
              </div>
            ))}
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
      <div className="month-section">
        <div className="month-header">
          <span>2025-06</span>
          <span className="month-amount">6,700.00</span>
        </div>
        <div className="bill-list">
          {bills.map((bill, idx) => (
            <div className="bill-item" key={idx}>
              <span
                className="bill-dot"
                style={{ background: bill.color }}
              ></span>
              <span className="bill-name">{bill.name}</span>
              <span className="bill-type">{bill.type}</span>
              <span className="bill-amount">{bill.amount.toLocaleString()}</span>
              <span className="bill-date">{bill.date}</span>
              {bill.checked && <span className="bill-checked">✔️</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="month-section">
        <div className="month-header">
          <span>2025-07</span>
          <span className="month-amount">5,500.00</span>
        </div>
      </div>
      <div className="month-section">
        <div className="month-header">
          <span>2025-08</span>
          <span className="month-amount">5,500.00</span>
        </div>
      </div>
      {/* 底部菜单栏 */}
      <div className="tab-bar">
        <div className="tab-item">
          <span className="icon">💳</span>
          <span>账单</span>
        </div>
        <div className="tab-item tab-center">
          <span className="icon">➕</span>
        </div>
        <div className="tab-item">
          <span className="icon">📅</span>
          <span>还款日历</span>
        </div>
      </div>
    </div>
  );
}
