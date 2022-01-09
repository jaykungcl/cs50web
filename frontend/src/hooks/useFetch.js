import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export const useFetch = (url, method = "GET") => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [options, setOptions] = useState(null);

  const csrftoken = Cookies.get("csrftoken");

  const postData = (postData) => {
    setOptions({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(postData),
    });
  };

  // const putData = (putData) => {
  //     setOptions({
  //         method: 'PUT',
  //         headers: {
  //             'Content-Type': 'application/json',
  //             'X-CSRFToken': csrftoken
  //         },
  //         body: JSON.stringify(putData)
  //     })
  // }

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async (fetchOptions) => {
      setError(null);
      setIsPending(true);

      try {
        console.log(options);
        console.log("in usefetch");
        const res = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        const data = await res.json();
        console.log(data);

        setIsPending(false);
        setData(data);
        setError(null);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("the fetch was aborted");
        } else {
          setIsPending(false);
          setError("Could not fetch the data");
        }
      }
    };

    if (method === "GET") {
      fetchData();
    }
    if (method === "POST" && options) {
      fetchData(options);
      setMethod("GET");
    }

    return () => controller.abort();
  }, [url, method, options]);

  return { error, isPending, data, postData };
};
