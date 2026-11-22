import { useState } from "react";

export default function Counter({ step = 1 }) {
  const [count, setCount] = useState(0);

  return (
    <p>
      Счётчик (+{step}): {count}{" "}
      <button type="button" onClick={() => setCount((previous) => previous + step)}>
        Увеличить
      </button>
    </p>
  );
}
