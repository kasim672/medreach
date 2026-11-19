"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { productApi } from "../lib/productApi";
import CareerAvailability from "./CareerAvailability";

export default function PublishedCareerRoles() {
  const [search, setSearch] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [filters, setFilters] = useState({ q: "", employmentType: "" });
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({ status: "loading", data: [], hasMore: false });
  useEffect(() => {
    const controller = new AbortController();
    setResult({ status: "loading", data: [], hasMore: false });
    const query = new URLSearchParams({ view: "summary", page: String(page), limit: "12" });
    if (filters.q) query.set("q", filters.q);
    if (filters.employmentType) query.set("employmentType", filters.employmentType);
    productApi(`/api/jobs?${query}`, { signal: controller.signal, cache: "no-store" })
      .then(value => { if (!controller.signal.aborted) setResult({ status: "success", data: value.data || [], hasMore: value.pagination?.hasMore === true }); })
      .catch(() => { if (!controller.signal.aborted) setResult({ status: "error", data: [], hasMore: false }); });
    return () => controller.abort();
  }, [filters, page, revision]);
  return <section className="parity-mb-5" aria-labelledby="published-career-roles">
    <div className="parity-flex parity-between parity-gap-3 parity-wrap parity-mb-3">
      <div><h2 id="published-career-roles">Open roles</h2><p className="parity-muted parity-mb-0">Published opportunities with employer-reported position counts.</p></div>
      <Link className="parity-action parity-action-outline-primary parity-start-self" href="/provider/jobs">Manage provider roles</Link>
    </div>
    <form className="surface parity-mb-3" onSubmit={event => { event.preventDefault(); setPage(1); setFilters({ q: search.trim(), employmentType }); }}>
      <div className="parity-grid parity-grid-gap parity-end-items">
        <div className="parity-span-half-medium"><label className="parity-field-label" htmlFor="career-role-search">Search roles or locations</label><input id="career-role-search" className="parity-field" maxLength={80} value={search} onChange={event => setSearch(event.target.value)} placeholder="Nurse, pathology, Andheri…" /></div>
        <div className="parity-span-quarter"><label className="parity-field-label" htmlFor="career-employment-type">Employment type</label><select id="career-employment-type" className="parity-field" value={employmentType} onChange={event => setEmploymentType(event.target.value)}><option value="">All types</option><option value="full_time">Full time</option><option value="part_time">Part time</option><option value="contract">Contract</option><option value="internship">Internship</option></select></div>
        <div className="parity-span-quarter parity-flex parity-wrap parity-gap-2"><button className="parity-action parity-action-primary" type="submit">Find roles</button><button className="parity-action parity-action-outline" type="button" onClick={() => setRevision(value => value + 1)}>Refresh roles</button></div>
      </div>
    </form>
    {result.status === "loading" && <p role="status">Loading published roles…</p>}
    {result.status === "error" && <p role="alert">Roles could not be loaded. <button type="button" className="parity-action parity-action-outline" onClick={() => setRevision(value => value + 1)}>Retry roles</button></p>}
    {result.status === "success" && result.data.length === 0 && <div className="surface"><p className="parity-mb-0">No published roles match this search. General expressions of interest are available below; they are not advertised vacancies.</p></div>}
    <div className="parity-grid parity-grid-gap">{result.data.map(job => <div className="parity-span-half-medium parity-span-third-wide" key={job._id}><article className="surface parity-full-height parity-flex parity-column">
      <h3 className="parity-heading-5">{job.title}</h3><p>{job.organizationName || job.hospital?.name || job.provider?.name || "Healthcare provider"}</p>
      <p className="parity-muted">{job.location || "Location not reported"} · {job.employmentType?.replaceAll("_", " ")}</p>
      <CareerAvailability job={job} />
      {job.salaryText && <p>{job.salaryText}</p>}
      {job.deadline && <p>Apply by {new Date(job.deadline).toLocaleDateString("en-IN")}</p>}
      <Link className="parity-action parity-action-outline-primary parity-mt-auto parity-start-self" href={`/jobs/${encodeURIComponent(job._id)}`}>{job.availability?.acceptingApplications === false ? "View role — applications closed" : "View role and apply"}</Link>
    </article></div>)}</div>
    {result.status === "success" && (page > 1 || result.hasMore) && <nav className="parity-flex parity-center-items parity-gap-3 parity-mt-3" aria-label="Published role pages"><button className="parity-action parity-action-outline" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Previous roles</button><span>Page {page}</span><button className="parity-action parity-action-outline" disabled={!result.hasMore} onClick={() => setPage(value => value + 1)}>Next roles</button></nav>}
  </section>;
}
