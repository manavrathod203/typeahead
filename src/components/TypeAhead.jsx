import React, { useEffect, useRef, useState } from "react";

const STATUS = {
  LOADING: "LOADING",
  ERROR: "ERROR",
  SUCCESS: "SUCCESS",
};

function TypeAhead() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState(STATUS.LOADING);
  const cache = useRef({});
  // console.log(cache);

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const searchProducts = async () => {
      try {
        setStatus(STATUS.LOADING);
        if (cache.current[query]) {
          console.log("retrive from cache");
          setProducts(cache.current[query]);
          setStatus(STATUS.SUCCESS);
          return;
        }
        console.log("API call");
        const res = await fetch(
          `https://dummyjson.com/products/search?q=${query}&limit=10`,
          { signal }
        );
        const data = await res.json();
        cache.current[query] = data.products;
        setProducts(data.products);
        setStatus(STATUS.SUCCESS);
      } catch (error) {
        if (error.name !== "AbortError") setStatus(STATUS.ERROR);
      }
    };

    // Debouncing - set timeout starts a timer, and useeffect runs on query change.
    // If query is changed before the old timer is expired then it will stop the old timer and have no effect.
    // It will only show effect when timers completes. This is to stop n number of api calls

    const timerID = setTimeout(searchProducts, 1000);
    return () => {
      clearTimeout(timerID);
      abortController.abort();
    };
  }, [query]);

  return (
    <div className="flex flex-col gap-10 text-xl">
      <p className="border-2 border-zinc-500  p-4">
        1. API call (dummyJOSN - product search) <br />
        2. Search based on query <br />
        3. Debouncing - no effect of function call before timer expired <br />
        4. Get results from cache
      </p>
      <div className="">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Enter your query..."
          className="text-black w-96 p-2"
        />
      </div>
      <div className="">
        {status === STATUS.ERROR && (
          <p className="mt-10 font-semibold text-red-500">Error Occured</p>
        )}
        {status === STATUS.LOADING && (
          <p className="mt-10 font-semibold text-blue-500">Loading...</p>
        )}
        {status === STATUS.SUCCESS && (
          <ul className="">
            {products.map((item, index) => (
              <li key={index} className="">
                {item.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TypeAhead;
