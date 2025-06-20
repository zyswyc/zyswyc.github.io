import React, { createContext, useContext, useState, useMemo } from "react";

// 数据结构：
// { type: "income"|"expense"|"debt", name, amount, date }

const BillContext = createContext();

export function BillProvider({ children }) {
  const [items, setItems] = useState([
    // 默认示例数据，便于初始展示
    { type: "income", name: "餐补", amount: 20, date: "2025-06-19" },
    { type: "expense", name: "午饭", amount: -20, date: "2025-06-19" },
    { type: "expense", name: "晚饭", amount: -12, date: "2025-06-19" },
    { type: "debt", name: "车贷", amount: 5000, date: "2025-06-20" },
    { type: "debt", name: "信用卡", amount: 500, date: "2025-06-18" }
  ]);

  // 资产与负债动态计算
  const asset = useMemo(
    () =>
      350000 +
      items.reduce(
        (sum, item) =>
          item.type === "income"
            ? sum + Math.abs(item.amount)
            : item.type === "expense"
            ? sum - Math.abs(item.amount)
            : sum,
        0
      ),
    [items]
  );

  const debt = useMemo(() => {
    const v =
      120000 +
      items.reduce(
        (sum, item) =>
          item.type === "debt" && !item.checked ? sum + Math.abs(item.amount) : sum,
        0
      );
    return v;
  }, [items]);

  function addItem(item) {
    setItems((prev) => [...prev, { ...item, checked: false }]);
  }

  function updateDebtChecked({ name, date, checked }) {
    setItems((prev) =>
      prev.map((item) =>
        item.type === "debt" && item.name === name && item.date === date
          ? { ...item, checked }
          : item
      )
    );
  }

  return (
    <BillContext.Provider value={{ items, addItem, asset, debt, updateDebtChecked }}>
      {children}
    </BillContext.Provider>
  );
}

export function useBillData() {
  return useContext(BillContext);
}
