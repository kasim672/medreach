"use client";

import { useEffect, useState } from "react";
import { productApi } from "./productApi";

export function useHospitalOptions(setForm, setError) {
  const [hospitals, setHospitals] = useState([]);
  const [hospitalPage, setHospitalPage] = useState(null);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const selected = new URLSearchParams(window.location.search).get("hospital");
    const filter = selected ? `&id=${encodeURIComponent(selected)}` : "";
    productApi(`/api/hospitals?view=options&limit=12${filter}`, { signal: controller.signal })
      .then(({ data = [], nextPage }) => {
        if (controller.signal.aborted) return;
        setHospitals(data);
        setHospitalPage(selected ? 1 : nextPage);
        setForm((current) => {
          const match = data.find((hospital) => hospital.slug === current.hospitalId);
          return match ? { ...current, hospitalId: match._id } : current;
        });
      })
      .catch((error) => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [setForm, setError]);

  async function loadMoreHospitals() {
    if (!hospitalPage || loadingHospitals) return;
    setLoadingHospitals(true);
    try {
      const { data = [], nextPage } = await productApi(`/api/hospitals?view=options&limit=12&page=${hospitalPage}`);
      setHospitals((previous) => Array.from(new Map([...previous, ...data].map((hospital) => [hospital._id, hospital])).values()));
      setHospitalPage(nextPage);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingHospitals(false);
    }
  }

  return { hospitals, hospitalPage, loadingHospitals, loadMoreHospitals };
}
