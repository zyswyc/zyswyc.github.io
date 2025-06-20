import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBillData } from "./BillContext.jsx";

export default function AddPage() {
  const navigate = useNavigate();
  const { addItem, asset, debt } = useBillData();

  // 三组表单状态
  const [income, setIncome] = useState({ name: "", amount: "", date: "" });
  const [expense, setExpense] = useState({ name: "", amount: "", date: "" });
  const [debtForm, setDebtForm] = useState({
    name: "",
    amount: "",
    date: "",
    periodType: "未分期", // 未分期/分x期
    periods: 1,
    cycle: "每月", // 每年/每月/每周
    day: "", // 还款日（如15/6-15/星期三等）
  });

  // 通用表单处理
  function handleChange(e, setter) {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  }
  // 添加收入
  function handleAddIncome() {
    if (!income.name || !income.amount || !income.date) return;
    addItem({ type: "income", name: income.name, amount: Number(income.amount), date: income.date });
    setIncome({ name: "", amount: "", date: "" });
  }
  // 添加支出
  function handleAddExpense() {
    if (!expense.name || !expense.amount || !expense.date) return;
    addItem({ type: "expense", name: expense.name, amount: -Math.abs(Number(expense.amount)), date: expense.date });
    setExpense({ name: "", amount: "", date: "" });
  }
  // 周期性还款计划生成
  function genPeriodDates(form) {
    const result = [];
    const now = new Date(form.date || new Date());
    if (form.periodType === "未分期") {
      result.push(form.date);
    } else {
      let n = parseInt(form.periods);
      for (let i = 0; i < n; i++) {
        let d = new Date(now);
        if (form.cycle === "每月") d.setMonth(now.getMonth() + i);
        else if (form.cycle === "每年") d.setFullYear(now.getFullYear() + i);
        else if (form.cycle === "每周") d.setDate(now.getDate() + i * 7);
        result.push(d.toISOString().slice(0, 10));
      }
    }
    return result;
  }
  // 添加负债
  function handleAddDebt() {
    if (!debtForm.name || !debtForm.amount || !debtForm.date) return;
    const dates = genPeriodDates(debtForm);
    dates.forEach((date) => {
      addItem({
        type: "debt",
        name: debtForm.name + (debtForm.periodType === "未分期" ? "" : ` (${date})`),
        amount: Number(debtForm.amount),
        date,
      });
    });
    setDebtForm({
      name: "",
      amount: "",
      date: "",
      periodType: "未分期",
      periods: 1,
      cycle: "每月",
      day: "",
    });
  }

  return (
    <div className="container">
      {/* 资产负债卡片 */}
      <div className="card" style={{ marginBottom: 16, marginTop: 14, display: "flex", justifyContent: "space-between" }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 17, color: "#333", marginBottom: 8 }}>总资产</div>
          <div style={{ fontWeight: 500, fontSize: 20, color: "#222" }}>¥{asset.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 17, color: "#333", marginBottom: 8 }}>总负债</div>
          <div style={{ fontWeight: 500, fontSize: 20, color: "#e8707b" }}>¥{debt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </div>
      {/* 收入/资产 */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 14 }}>收入/资产</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <input className="input input-lg" name="name" placeholder="收入名称" value={income.name} onChange={e => handleChange(e, setIncome)} />
          <input className="input input-lg" name="amount" placeholder="金额" type="number" value={income.amount} onChange={e => handleChange(e, setIncome)} />
          <input className="input input-lg input-wide" name="date" placeholder="日期" type="date" value={income.date} onChange={e => handleChange(e, setIncome)} />
        </div>
        <div style={{ marginBottom: 7, fontSize: 13, color: "#888", marginLeft: 4 }}>请输入收入名称、金额和对应入账日期</div>
        <div style={{ marginTop: 2 }}>
          <button className="add-btn add-btn-block" onClick={handleAddIncome}>添加</button>
        </div>
      </div>
      {/* 支出 */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 14 }}>支出</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <input className="input input-lg" name="name" placeholder="支出名称" value={expense.name} onChange={e => handleChange(e, setExpense)} />
          <input className="input input-lg" name="amount" placeholder="金额" type="number" value={expense.amount} onChange={e => handleChange(e, setExpense)} />
          <input className="input input-lg input-wide" name="date" placeholder="日期" type="date" value={expense.date} onChange={e => handleChange(e, setExpense)} />
        </div>
        <div style={{ marginBottom: 7, fontSize: 13, color: "#888", marginLeft: 4 }}>请输入支出名称、金额和支出日期</div>
        <div style={{ marginTop: 2 }}>
          <button className="add-btn add-btn-block" onClick={handleAddExpense}>添加</button>
        </div>
      </div>
      {/* 负债/待还款 */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 14 }}>负债/待还款</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <input className="input input-lg" name="name" placeholder="待还款名称" value={debtForm.name} onChange={e => handleChange(e, setDebtForm)} />
          <input className="input input-lg" name="amount" placeholder="金额" type="number" value={debtForm.amount} onChange={e => handleChange(e, setDebtForm)} />
          <input className="input input-lg input-wide" name="date" placeholder="首期日期" type="date" value={debtForm.date} onChange={e => handleChange(e, setDebtForm)} />
          <select className="input input-lg input-wide" name="periodType" value={debtForm.periodType} onChange={e => handleChange(e, setDebtForm)}>
            <option value="未分期">未分期</option>
            <option value="分期">分期</option>
          </select>
        </div>
        {debtForm.periodType === "分期" && (
          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <input className="input input-lg" name="periods" type="number" min="1" placeholder="期数" value={debtForm.periods} onChange={e => handleChange(e, setDebtForm)} style={{ width: 90 }} />
            <select className="input input-lg input-wide" name="cycle" value={debtForm.cycle} onChange={e => handleChange(e, setDebtForm)}>
              <option value="每月">每月</option>
              <option value="每年">每年</option>
              <option value="每周">每周</option>
            </select>
          </div>
        )}
        <div style={{ fontSize: 13, color: "#888", marginLeft: 4, marginBottom: 7 }}>
          {debtForm.periodType === "未分期"
            ? "请输入待还款名称、金额、首期日期"
            : `从首期日期起，${debtForm.cycle}还，共${debtForm.periods}期`}
        </div>
        <div style={{ marginTop: 2 }}>
          <button className="add-btn add-btn-block" onClick={handleAddDebt}>添加</button>
        </div>
      </div>
      {/* 底部tab栏 */}
      <div className="tab-bar">
        <div className="tab-item" onClick={() => navigate("/bill")}>
          <span className="icon">💳</span>
          <span>账单</span>
        </div>
        <div className="tab-item tab-center active" style={{ background: "#e8707b", color: "#fff" }}>
          <span className="icon">➕</span>
        </div>
        <div className="tab-item" onClick={() => navigate("/")}>
          <span className="icon">📅</span>
          <span>还款日历</span>
        </div>
      </div>
    </div>
  );
}
